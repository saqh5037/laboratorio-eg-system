import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import QRCode from 'qrcode';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

// Pool de conexiones a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Registrar helpers de Handlebars
handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

/**
 * Genera un PDF de resultados de laboratorio usando Puppeteer y HTML templates
 * Este generador replica EXACTAMENTE el formato de Labsis original
 */
export async function generarPDFResultados(orden, resultados, estadisticas) {
  try {
    logger.info(`[PDF Labsis] Iniciando generación de PDF para orden ${orden.numero}`);

    // Cargar template HTML (nuevo template que replica Labsis)
    const templatePath = join(__dirname, '../templates/resultados_labsis.html');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);

    // Preparar datos para el template (con consultas a DB real)
    const datos = await prepararDatosConDB(orden, resultados);

    // Renderizar HTML con datos
    const html = template(datos);
    logger.info(`[PDF Labsis] HTML renderizado (${html.length} caracteres)`);

    // Guardar HTML para debug
    if (process.env.NODE_ENV === 'development') {
      try {
        await fs.writeFile(`/tmp/pdf-labsis-${orden.numero}.html`, html);
        logger.info(`[PDF Labsis] HTML guardado en /tmp/pdf-labsis-${orden.numero}.html`);
      } catch (e) {
        logger.warn('[PDF Labsis] No se pudo guardar HTML de debug:', e.message);
      }
    }

    // Generar PDF con Puppeteer
    logger.info('[PDF Labsis] Lanzando navegador Puppeteer...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });

      const pdfBuffer = await page.pdf({
        format: 'Letter',
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false
      });

      logger.info(`[PDF Labsis] PDF generado exitosamente para orden ${orden.numero} (${pdfBuffer.length} bytes)`);

      if (pdfBuffer.length < 100) {
        throw new Error('PDF generado es inválido');
      }

      return pdfBuffer;
    } finally {
      await browser.close();
    }
  } catch (error) {
    logger.error('[PDF Labsis] Error al generar PDF:', error);
    throw error;
  }
}

/**
 * Prepara los datos consultando la base de datos de Labsis
 */
async function prepararDatosConDB(orden, resultados) {
  // Calcular edad
  const fechaNacimiento = new Date(orden.fecha_nacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = fechaNacimiento.getMonth();
  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fechaNacimiento.getDate())) {
    edad--;
  }

  // Sexo en texto
  const sexoTexto = orden.sexo === 'M' ? 'Masculino' : 'Femenino';

  // Fecha y hora actual (fecha de impresión)
  const ahora = new Date();
  const fechaActual = ahora.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const horaActual = ahora.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Fecha de registro de la orden
  const fechaReg = new Date(orden.fecha);
  const fechaRegistro = fechaReg.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) + ' ' + fechaReg.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Obtener logo del laboratorio desde DB
  const logoBase64 = await obtenerLogoLaboratorio();

  // Generar QR code con URL al portal de resultados (igual que Labsis)
  const portalUrl = process.env.PORTAL_URL || 'http://localhost:5173';
  const qrData = `${portalUrl}?orden=${orden.numero}&cedula=${orden.ci_paciente}`;
  const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
    width: 200,
    margin: 0,
    errorCorrectionLevel: 'M'
  });

  // Agrupar resultados por área
  const areasProcesadas = await agruparYProcesarResultados(resultados);

  return {
    orden: {
      ...orden,
      procedencia: orden.procedencia || 'AMBULATORIO'
    },
    edad,
    sexoTexto,
    fechaActual,
    horaActual,
    fechaRegistro,
    logoBase64,
    qrCodeDataUrl,
    areas: areasProcesadas,
    paginaActual: 1,
    totalPaginas: 1
  };
}

/**
 * Obtiene el logo del laboratorio desde la base de datos
 */
async function obtenerLogoLaboratorio() {
  try {
    // Consultar el OID del logo
    const result = await pool.query('SELECT logo FROM laboratorio WHERE id = 1');

    if (!result.rows[0] || !result.rows[0].logo) {
      logger.warn('[PDF Labsis] No se encontró logo en la base de datos');
      return null;
    }

    const logoOID = result.rows[0].logo;

    // Exportar el logo a un archivo temporal
    const tempPath = `/tmp/logo-${Date.now()}.png`;
    await pool.query(`SELECT lo_export($1, $2)`, [logoOID, tempPath]);

    // Leer el archivo y convertirlo a base64
    const logoBuffer = await fs.readFile(tempPath);
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

    // Eliminar archivo temporal
    await fs.unlink(tempPath).catch(() => {});

    return logoBase64;
  } catch (error) {
    logger.error('[PDF Labsis] Error al obtener logo:', error);
    return null;
  }
}

/**
 * Obtiene la firma de un bioanalista desde la base de datos
 */
async function obtenerFirmaBioanalista(bioanalistaId) {
  try {
    const result = await pool.query('SELECT firma FROM bioanalista WHERE id = $1', [bioanalistaId]);

    if (!result.rows[0] || !result.rows[0].firma) {
      return null;
    }

    const firmaOID = result.rows[0].firma;

    // Exportar la firma a un archivo temporal
    const tempPath = `/tmp/firma-${bioanalistaId}-${Date.now()}.png`;
    await pool.query(`SELECT lo_export($1, $2)`, [firmaOID, tempPath]);

    // Leer el archivo y convertirlo a base64
    const firmaBuffer = await fs.readFile(tempPath);
    const firmaBase64 = `data:image/png;base64,${firmaBuffer.toString('base64')}`;

    // Eliminar archivo temporal
    await fs.unlink(tempPath).catch(() => {});

    return firmaBase64;
  } catch (error) {
    logger.error(`[PDF Labsis] Error al obtener firma del bioanalista ${bioanalistaId}:`, error);
    return null;
  }
}

/**
 * Agrupa resultados por área y obtiene bioanalistas responsables
 * Sigue la lógica de Labsis: primero pruebas agrupadas, luego pruebas individuales
 */
async function agruparYProcesarResultados(resultados) {
  // Agrupar por área
  const areasMapa = {};

  for (const resultado of resultados) {
    const areaNombre = resultado.area_nombre;

    if (!areasMapa[areaNombre]) {
      areasMapa[areaNombre] = {
        nombre: areaNombre,
        pruebasAgrupadas: {}, // Pruebas que pertenecen a un grupo
        pruebasIndividuales: [], // Pruebas sin grupo o con tipo GPR
        observaciones: null,
        bioanalista: null,
        bioanalistaValidador: null, // Bioanalista que validó (real)
        esQuimica: areaNombre.toUpperCase() === 'QUÍMICA',
        esBacteriologia: areaNombre.toUpperCase() === 'BACTERIOLOGÍA'
      };
    }

    // Capturar el bioanalista que validó (usar el primero que aparezca validado)
    if (resultado.validado && resultado.validado_por_id && !areasMapa[areaNombre].bioanalistaValidador) {
      logger.info(`[PDF Labsis] Bioanalista validador capturado: ${resultado.validado_por_nombre} ${resultado.validado_por_apellido} (ID: ${resultado.validado_por_id})`);
      areasMapa[areaNombre].bioanalistaValidador = {
        id: resultado.validado_por_id,
        nombre: resultado.validado_por_nombre,
        apellido: resultado.validado_por_apellido,
        cdb: resultado.validado_por_cdb,
        mpps: resultado.validado_por_mpps
      };
    }

    // Formatear resultado según el formato de la prueba
    const formato = resultado.formato || '#.##';
    const resultadoFormateado = formatearResultadoConFormato(resultado, formato);

    const pruebaFormateada = {
      prueba_nombre: resultado.prueba_nombre ? resultado.prueba_nombre.toUpperCase() : '',
      resultado: resultadoFormateado.resultado,
      unidad: resultado.unidad || '',
      valorReferencia: formatearValorReferencial(resultado),
      interpretacion: obtenerInterpretacion(resultado),
      verificado: resultado.validado || false,
      multiLinea: resultadoFormateado.multiLinea,
      valorReferenciaMultiLinea: resultado.valor_texto && resultado.valor_texto.length > 50
    };

    // Determinar si la prueba pertenece a un grupo (siguiendo lógica de Labsis)
    const tieneGrupo = resultado.grupo_prueba_id &&
                       resultado.tipo_grupo_codigo &&
                       !['GPR', 'DIN', 'BAC'].includes(resultado.tipo_grupo_codigo);

    if (tieneGrupo) {
      // Prueba agrupada
      const grupoId = resultado.grupo_prueba_id;
      if (!areasMapa[areaNombre].pruebasAgrupadas[grupoId]) {
        areasMapa[areaNombre].pruebasAgrupadas[grupoId] = {
          nombre: resultado.grupo_prueba_nombre,
          orden: resultado.grupo_orden || 0,
          pruebas: []
        };
      }
      areasMapa[areaNombre].pruebasAgrupadas[grupoId].pruebas.push(pruebaFormateada);
    } else {
      // Prueba individual
      areasMapa[areaNombre].pruebasIndividuales.push(pruebaFormateada);
    }
  }

  // Convertir a array y procesar cada área
  const areasArray = Object.values(areasMapa);

  for (const area of areasArray) {
    // Convertir grupos a array y ordenar
    const grupos = Object.values(area.pruebasAgrupadas).sort((a, b) => a.orden - b.orden);

    // Crear estructura de estudios para el template
    area.estudios = [];

    // Primero agregar grupos de pruebas
    for (const grupo of grupos) {
      area.estudios.push({
        titulo: grupo.nombre ? grupo.nombre.toUpperCase() : null,
        pruebas: grupo.pruebas,
        esGrupo: true
      });
    }

    // Luego agregar pruebas individuales (si hay)
    if (area.pruebasIndividuales.length > 0) {
      area.estudios.push({
        titulo: null,
        pruebas: area.pruebasIndividuales,
        esGrupo: false
      });
    }

    // Usar el bioanalista que validó (REAL) en lugar de mapping por defecto
    let bioanalista = area.bioanalistaValidador;

    // Si no hay bioanalista validador, intentar obtener uno por defecto del área
    if (!bioanalista) {
      const bioanalistaArea = await obtenerBioanalistaArea(area.nombre);
      if (bioanalistaArea) {
        bioanalista = bioanalistaArea;
      }
    }

    if (bioanalista) {
      // Determinar título basado en nombres comunes
      const nombreCompleto = `${bioanalista.nombre} ${bioanalista.apellido}`.toUpperCase();
      const esFemenino = nombreCompleto.includes('MARIA') || nombreCompleto.includes('ANNA') ||
                        nombreCompleto.includes('CARMEN') || nombreCompleto.includes('ELIZABETH') ||
                        nombreCompleto.includes('DELIMAR') || nombreCompleto.includes('MADELEINE') ||
                        nombreCompleto.includes('VANESSA') || nombreCompleto.includes('OMAIRA') ||
                        nombreCompleto.includes('TERESA') || nombreCompleto.includes('CORINA') ||
                        nombreCompleto.includes('DORIS');

      area.bioanalista = {
        titulo: esFemenino ? 'Lcda.' : 'Dr.',
        nombre: bioanalista.nombre,
        apellido: bioanalista.apellido,
        cdb: bioanalista.cdb,
        mpps: bioanalista.mpps,
        firmaBase64: await obtenerFirmaBioanalista(bioanalista.id)
      };
    }

    // Limpiar propiedades auxiliares
    delete area.pruebasAgrupadas;
    delete area.pruebasIndividuales;
  }

  return areasArray;
}

/**
 * Obtiene la interpretación del resultado (normal, alto, bajo)
 */
function obtenerInterpretacion(resultado) {
  if (resultado.interpretacion_valor && resultado.interpretacion_valor !== 'sin_rango') {
    return resultado.interpretacion_valor;
  }
  return null;
}

/**
 * Obtiene el bioanalista responsable de un área
 */
async function obtenerBioanalistaArea(areaNombre) {
  try {
    logger.info(`[PDF Labsis] Buscando bioanalista para área: "${areaNombre}"`);

    // Primero intentar obtener bioanalista asignado directamente al área
    const resultArea = await pool.query(`
      SELECT b.id, b.nombre, b.apellido, b.cdb, b.mpps
      FROM area a
      INNER JOIN bioanalista b ON a.bioanalista_id = b.id
      WHERE UPPER(a.area) = UPPER($1)
    `, [areaNombre]);

    if (resultArea.rows.length > 0) {
      logger.info(`[PDF Labsis] Bioanalista encontrado en área: ${resultArea.rows[0].nombre} ${resultArea.rows[0].apellido}`);
      return resultArea.rows[0];
    }

    logger.info(`[PDF Labsis] No hay bioanalista asignado al área, usando mapping por defecto`);

    // Si no hay bioanalista asignado, usar bioanalistas por defecto según área
    const bioanalistasDefaultMapping = {
      'HEMATOLOGÍA': 'OMAIRA LUGO',
      'QUÍMICA': 'TERESA DI CIACCIO',
      'UROANÁLISIS': 'MARI CARMEN RAMOS',
      'BACTERIOLOGÍA': 'CORINA SAPENE',
      'COPROANÁLISIS': 'DORIS KAHI',
      'SEROLOGÍA': 'TERESA DI CIACCIO',
      'VSG': 'OMAIRA LUGO'
    };

    const nombreBioanalista = bioanalistasDefaultMapping[areaNombre.toUpperCase()];
    logger.info(`[PDF Labsis] Nombre mapeado: "${nombreBioanalista}" para área "${areaNombre.toUpperCase()}"`);

    if (nombreBioanalista) {
      // Query using CONCAT to match full name
      const resultBio = await pool.query(`
        SELECT b.id, b.nombre, b.apellido, b.cdb, b.mpps
        FROM bioanalista b
        WHERE UPPER(CONCAT(b.nombre, ' ', b.apellido)) = UPPER($1)
      `, [nombreBioanalista]);

      if (resultBio.rows.length > 0) {
        logger.info(`[PDF Labsis] Bioanalista encontrado por mapping: ${resultBio.rows[0].nombre} ${resultBio.rows[0].apellido}`);
        return resultBio.rows[0];
      }

      logger.warn(`[PDF Labsis] No se encontró bioanalista con nombre "${nombreBioanalista}"`);
    } else {
      logger.warn(`[PDF Labsis] No hay mapping para área "${areaNombre.toUpperCase()}"`);
    }

    // Si aún no se encuentra, retornar null (sin firma)
    return null;
  } catch (error) {
    logger.error(`[PDF Labsis] Error al obtener bioanalista para área ${areaNombre}:`, error);
    return null;
  }
}

/**
 * Formatea un resultado según el formato definido en la prueba
 */
function formatearResultadoConFormato(resultado, formato) {
  // Si es resultado alfanumérico, retornarlo directamente
  if (resultado.resultado_alpha) {
    return {
      resultado: resultado.resultado_alpha,
      multiLinea: resultado.resultado_alpha.includes('\n')
    };
  }

  // Si es resultado numérico, aplicar formato
  if (resultado.resultado_numerico !== null && resultado.resultado_numerico !== undefined) {
    const num = parseFloat(resultado.resultado_numerico);

    // Parsear formato (ej: "0.##", "#.#", "0.00")
    if (formato.includes('.')) {
      const decimales = (formato.split('.')[1].match(/#/g) || []).length;
      if (decimales === 0 || formato.includes('0.00')) {
        return { resultado: num.toFixed(formato.includes('0.00') ? 2 : 1), multiLinea: false };
      }
      // Para formato con # mostrar decimales solo si existen
      return { resultado: num % 1 === 0 ? num.toString() : num.toFixed(decimales), multiLinea: false };
    }

    return { resultado: num.toString(), multiLinea: false };
  }

  return { resultado: '', multiLinea: false };
}

/**
 * Formatea el valor referencial de una prueba
 */
function formatearValorReferencial(resultado) {
  if (resultado.valor_desde && resultado.valor_hasta) {
    const desde = parseFloat(resultado.valor_desde);
    const hasta = parseFloat(resultado.valor_hasta);
    const desdeStr = desde % 1 === 0 ? desde.toString() : desde.toFixed(1);
    const hastaStr = hasta % 1 === 0 ? hasta.toString() : hasta.toFixed(1);
    return `${desdeStr} - ${hastaStr}`;
  }

  if (resultado.valor_texto) {
    return resultado.valor_texto;
  }

  return '';
}

export default { generarPDFResultados };
