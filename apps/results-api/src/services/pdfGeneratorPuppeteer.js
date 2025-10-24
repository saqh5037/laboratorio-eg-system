import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import QRCode from 'qrcode';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Registrar helpers de Handlebars
handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

/**
 * Genera un PDF de resultados de laboratorio usando Puppeteer y HTML templates
 */
export async function generarPDFResultados(orden, resultados, estadisticas) {
  try {
    logger.info(`[PDF Puppeteer] Iniciando generación de PDF para orden ${orden.numero}`);

    // Cargar template HTML
    const templatePath = join(__dirname, '../templates/resultados.html');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);

    // Preparar datos para el template
    const datos = await prepararDatos(orden, resultados);

    // Renderizar HTML con datos
    const html = template(datos);
    logger.info(`[PDF Puppeteer] HTML renderizado (${html.length} caracteres)`);

    // Guardar HTML para debug (opcional)
    if (process.env.NODE_ENV === 'development') {
      try {
        await fs.writeFile(`/tmp/pdf-debug-${orden.numero}.html`, html);
        logger.info(`[PDF Puppeteer] HTML guardado en /tmp/pdf-debug-${orden.numero}.html`);
      } catch (e) {
        logger.warn('[PDF Puppeteer] No se pudo guardar HTML de debug:', e.message);
      }
    }

    // Generar PDF con Puppeteer
    logger.info('[PDF Puppeteer] Lanzando navegador Puppeteer...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      logger.info('[PDF Puppeteer] Navegador lanzado, creando página...');
      const page = await browser.newPage();

      logger.info('[PDF Puppeteer] Estableciendo contenido HTML...');
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });

      logger.info('[PDF Puppeteer] Generando PDF...');
      const pdfBuffer = await page.pdf({
        format: 'Letter',
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false
      });

      logger.info(`[PDF Puppeteer] PDF generado exitosamente para orden ${orden.numero} (${pdfBuffer.length} bytes)`);

      // Verificar que el PDF tiene contenido válido
      if (pdfBuffer.length < 100) {
        logger.error('[PDF Puppeteer] PDF generado parece estar vacío o corrupto');
        throw new Error('PDF generado es inválido');
      }

      return pdfBuffer;
    } finally {
      await browser.close();
    }
  } catch (error) {
    logger.error('[PDF Puppeteer] Error al generar PDF:', error);
    throw error;
  }
}

/**
 * Prepara los datos para el template HTML
 */
async function prepararDatos(orden, resultados) {
  // Calcular edad
  const fechaNacimiento = new Date(orden.fecha_nacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = fechaNacimiento.getMonth();
  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fechaNacimiento.getDate())) {
    edad--;
  }

  // Formatear sexo
  const sexoTexto = orden.sexo === 'M' ? 'Masculino' : orden.sexo === 'F' ? 'Femenino' : orden.sexo;

  // Formatear fechas
  const fechaActual = new Date();
  const fechaFormateada = fechaActual.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const horaFormateada = fechaActual.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).toUpperCase();

  const fechaRegistro = new Date(orden.fecha);
  const fechaRegistroFormateada = fechaRegistro.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) + ' ' + fechaRegistro.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).toUpperCase();

  // Generar QR code
  const qrCodeDataUrl = await QRCode.toDataURL(`${orden.numero}`, {
    width: 100,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  // Cargar logo como base64 (si existe)
  let logoBase64 = null;
  try {
    const logoPath = join(__dirname, '../../assets/logoEG.png');
    const logoBuffer = await fs.readFile(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch (error) {
    logger.warn('[PDF Puppeteer] No se pudo cargar el logo:', error.message);
  }

  // Agrupar resultados por área
  const resultadosPorArea = resultados.reduce((acc, r) => {
    if (!acc[r.area_nombre]) acc[r.area_nombre] = [];
    acc[r.area_nombre].push(r);
    return acc;
  }, {});

  // Procesar áreas
  const areas = Object.entries(resultadosPorArea).map(([areaNombre, pruebas]) => {
    const esQuimica = areaNombre.toUpperCase() === 'QUÍMICA';
    const estudios = agruparPorEstudio(pruebas, esQuimica);

    // Determinar firmante según área
    const firmantes = {
      'HEMATOLOGÍA': { nombre: 'Lcda. OMAIRA LUGO', numeros: ['N° 1811', 'N° 4389'] },
      'QUÍMICA': { nombre: 'Lcda. TERESA DI CIACCIO', numeros: ['N° 2251', 'N° 6633'] },
      'UROANÁLISIS': { nombre: 'Lcda. MARI CARMEN RAMOS', numeros: ['N° 3836', 'N° 14217'] }
    };
    const firmante = firmantes[areaNombre.toUpperCase()] || { nombre: 'Lcda. [NOMBRE]', numeros: ['N° XXXX'] };

    return {
      nombre: areaNombre.toUpperCase(),
      estudios,
      esQuimica,
      firmante
    };
  });

  return {
    orden,
    edad,
    sexoTexto,
    fechaActual: fechaFormateada,
    horaActual: horaFormateada,
    fechaRegistro: fechaRegistroFormateada,
    qrCodeDataUrl,
    logoBase64,
    areas,
    paginaActual: 1,
    totalPaginas: 1  // Siempre 1 página ahora
  };
}

/**
 * Agrupa pruebas por estudio
 */
function agruparPorEstudio(pruebas, esQuimica) {
  const estudiosConocidos = {
    'HEMATOLOGÍA COMPLETA': [
      'GLÓBULOS BLANCOS', 'NEUTRÓFILOS', 'LINFOCITOS', 'MONOCITOS', 'EOSINÓFILOS', 'BASÓFILOS',
      'GLÓBULOS ROJOS', 'HEMOGLOBINA', 'HEMATOCRITO', 'VCM', 'HCM', 'CHCM', 'RDW',
      'PLAQUETAS', 'VPM', 'PDW', 'PLAQUETOCRITO', 'P-LCR', 'P-LCC'
    ],
    'EXÁMEN FÍSICO ORINA': ['ASPECTO ORINA', 'COLOR ORINA', 'DENSIDAD', 'PH ORINA', 'REACCION'],
    'EXÁMEN QUÍMICO DE ORINA': [
      'PROTEÍNAS ORINA', 'HEMOGLOBINA ORINA', 'CUERPOS CETÓNICOS', 'GLUCOSA ORINA',
      'UROBILINÓGENO', 'NITRITOS ORINA', 'BILIRRUBINA', 'ESTERASA LEUCOCITARIA'
    ],
    'EXÁMEN MICROSCÓPICO ORINA (SEDIMENTO)': [
      'LEUCOCITOS', 'HEMATIES', 'MUCINA', 'CRISTALES', 'CELULAS EPITELIALES', 'CELULAS REDONDAS'
    ]
  };

  const grupos = [];
  const pruebasUsadas = new Set();

  // Intentar agrupar por estudios conocidos
  Object.entries(estudiosConocidos).forEach(([estudio, nombresPruebas]) => {
    const pruebasDelEstudio = pruebas.filter(p => {
      const nombrePrueba = p.prueba_nombre.toUpperCase();
      return nombresPruebas.some(np => nombrePrueba.includes(np) || np.includes(nombrePrueba));
    });

    if (pruebasDelEstudio.length > 0) {
      grupos.push({
        titulo: pruebasDelEstudio.length > 1 ? estudio : null,
        pruebas: pruebasDelEstudio.map(formatearPrueba),
        esQuimica
      });
      pruebasDelEstudio.forEach(p => pruebasUsadas.add(p.prueba_orden_id));
    }
  });

  // Agregar pruebas individuales
  const pruebasIndividuales = pruebas.filter(p => !pruebasUsadas.has(p.prueba_orden_id));
  if (pruebasIndividuales.length > 0) {
    grupos.push({
      titulo: null,
      pruebas: pruebasIndividuales.map(formatearPrueba),
      esQuimica
    });
  }

  return grupos;
}

/**
 * Formatea una prueba para el template
 */
function formatearPrueba(prueba) {
  // Formatear resultado
  let resultado;
  if (prueba.resultado_numerico !== null && prueba.resultado_numerico !== undefined) {
    const num = parseFloat(prueba.resultado_numerico);
    resultado = num % 1 === 0 ? num.toString() : num.toFixed(1);
  } else {
    resultado = prueba.resultado_alpha || '';
  }

  // Formatear valor de referencia
  let valorReferencia = '';
  if (prueba.valor_desde && prueba.valor_hasta) {
    const desde = parseFloat(prueba.valor_desde);
    const hasta = parseFloat(prueba.valor_hasta);
    const desdeStr = desde % 1 === 0 ? desde.toString() : desde.toFixed(1);
    const hastaStr = hasta % 1 === 0 ? hasta.toString() : hasta.toFixed(1);
    valorReferencia = `${desdeStr} - ${hastaStr}`;
  } else if (prueba.valor_texto) {
    valorReferencia = prueba.valor_texto;
  }

  // Calcular interpretación si hay valores de referencia numéricos
  let interpretacion = null;
  if (prueba.resultado_numerico !== null && prueba.resultado_numerico !== undefined &&
      prueba.valor_desde && prueba.valor_hasta) {
    const valorNum = parseFloat(prueba.resultado_numerico);
    const desde = parseFloat(prueba.valor_desde);
    const hasta = parseFloat(prueba.valor_hasta);

    if (valorNum < desde) {
      interpretacion = 'bajo';
    } else if (valorNum > hasta) {
      interpretacion = 'alto';
    } else {
      interpretacion = 'normal';
    }
  }

  return {
    prueba_nombre: prueba.prueba_nombre.toUpperCase(),
    resultado,
    unidad: prueba.unidad || '',
    valorReferencia,
    interpretacion
  };
}

export default { generarPDFResultados };
