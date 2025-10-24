import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import logger from '../config/logger.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Genera un PDF de resultados de laboratorio con el formato exacto de EG
 */
export async function generarPDFResultados(orden, resultados, estadisticas) {
  return new Promise((resolve, reject) => {
    try {
      logger.info(`[PDF] Iniciando generación de PDF para orden ${orden.numero}`);

      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 40, right: 40 }
      });

      const chunks = [];
      doc.on('data', (chunk) => {
        chunks.push(chunk);
        logger.info(`[PDF] Chunk recibido: ${chunk.length} bytes`);
      });
      doc.on('end', () => {
        logger.info(`[PDF] Documento finalizado, total chunks: ${chunks.length}`);
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', (error) => {
        logger.error('[PDF] Error en documento:', error);
        reject(error);
      });

      // Agrupar resultados por área
      const resultadosPorArea = resultados.reduce((acc, r) => {
        if (!acc[r.area_nombre]) acc[r.area_nombre] = [];
        acc[r.area_nombre].push(r);
        return acc;
      }, {});

      let paginaActual = 1;
      const totalPaginas = Object.keys(resultadosPorArea).length;

      // Generar una página por cada área
      logger.info(`[PDF] Áreas a procesar: ${Object.keys(resultadosPorArea).join(', ')}`);

      // Generar todas las páginas (necesitamos usar async/await para los QR codes)
      const generarPaginas = async () => {
        for (const [area, pruebas] of Object.entries(resultadosPorArea)) {
          const areaIndex = Object.keys(resultadosPorArea).indexOf(area);
          logger.info(`[PDF] Procesando área ${area} (${areaIndex + 1}/${totalPaginas})`);

          if (areaIndex > 0) doc.addPage();

          dibujarEncabezado(doc, orden);
          dibujarInfoPaciente(doc, orden);
          dibujarTablaResultados(doc, area, pruebas, orden);
          await dibujarPiePagina(doc, paginaActual, totalPaginas, orden.numero);

          paginaActual++;
        }

        logger.info('[PDF] Finalizando documento...');
        doc.end();
        logger.info('[PDF] doc.end() llamado');
      };

      // Ejecutar generación de páginas
      generarPaginas().catch(reject);
    } catch (error) {
      logger.error('Error al generar PDF:', error);
      reject(error);
    }
  });
}

function dibujarEncabezado(doc, orden) {
  // Cargar el logo PNG
  const logoPath = join(__dirname, '../../assets/logoEG.png');

  try {
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 35, { width: 100, height: 50 });
    }
  } catch (error) {
    logger.warn('No se pudo cargar el logo:', error.message);
  }

  // Encabezado principal (arriba a la izquierda, debajo del logo)
  doc.fontSize(9)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text('LABORATORIO CLINICO MICROBIOLÓGICO ELIZABETH', 40, 90, { width: 280 })
     .text('GUTIERREZ', 40, 102, { width: 280 });

  doc.fontSize(8)
     .font('Helvetica')
     .text('Av. Libertador Edf. Majestic Piso 1 Ofc. 18', 40, 118)
     .text(' 762.05.61 763.59.09 763.66.28', 40, 130)
     .text(' Rif. J-40233378-1', 40, 142);

  // Encabezado duplicado (arriba a la derecha del logo)
  doc.fontSize(9)
     .font('Helvetica-Bold')
     .text('LABORATORIO CLINICO MICROBIOLÓGICO ELIZABETH', 300, 40, { width: 270 })
     .text('GUTIERREZ', 300, 52, { width: 270 });

  doc.fontSize(8)
     .font('Helvetica')
     .text('Av. Libertador Edf. Majestic Piso 1 Ofc. 18', 300, 68)
     .text(' 762.05.61 763.59.09 763.66.28', 300, 80)
     .text(' Rif. J-40233378-1', 300, 92);

  // Fecha y Orden (esquina superior derecha)
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

  doc.fontSize(9)
     .font('Helvetica-Bold')
     .text('Fecha:', 480, 40, { width: 100, align: 'left' });
  doc.font('Helvetica')
     .fontSize(8)
     .text(fechaFormateada, 480, 52)
     .text(horaFormateada, 480, 64);

  doc.font('Helvetica-Bold')
     .fontSize(9)
     .text('Orden:', 480, 80);
  doc.font('Helvetica')
     .fontSize(8)
     .text(orden.numero, 480, 92);

  // Línea separadora horizontal gruesa
  doc.moveTo(40, 160)
     .lineTo(572, 160)
     .lineWidth(1.5)
     .stroke();
}

function dibujarInfoPaciente(doc, orden) {
  const y = 170;

  // Calcular edad
  const fechaNacimiento = new Date(orden.fecha_nacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = fechaNacimiento.getMonth();
  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fechaNacimiento.getDate())) {
    edad--;
  }

  const sexoTexto = orden.sexo === 'M' ? 'Masculino' : orden.sexo === 'F' ? 'Femenino' : orden.sexo;

  // Formatear fecha de registro
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

  doc.fontSize(8);

  // Primera línea: Paciente, Sexo, Edad, Teléfono
  let xPos = 40;
  doc.font('Helvetica-Bold').text('Paciente:', xPos, y, { continued: false });
  xPos += doc.widthOfString('Paciente:') + 2;

  doc.font('Helvetica').text(` ${orden.nombre} ${orden.apellido}`, 40, y, { continued: false });

  // Sexo en la misma línea
  doc.font('Helvetica-Bold').text('Sexo:', 280, y, { continued: false });
  doc.font('Helvetica').text(` ${sexoTexto}`, 305, y, { continued: false });

  // Edad
  doc.font('Helvetica-Bold').text('Edad:', 365, y, { continued: false });
  doc.font('Helvetica').text(` ${edad} años`, 390, y, { continued: false });

  // Teléfono
  doc.font('Helvetica-Bold').text('Teléfono:', 460, y, { continued: false });
  doc.font('Helvetica').text(` ${orden.telefono || ''}`, 500, y, { continued: false });

  // Segunda línea: Cédula, Fecha Registro, Méd. Remitente
  const y2 = y + 12;
  doc.font('Helvetica-Bold').text('Cédula:', 40, y2, { continued: false });
  doc.font('Helvetica').text(` ${orden.ci_paciente}`, 40, y2, { continued: false });

  doc.font('Helvetica-Bold').text('Fecha Registro:', 140, y2, { continued: false });
  doc.font('Helvetica').text(` ${fechaRegistroFormateada}`, 210, y2, { continued: false });

  doc.font('Helvetica-Bold').text('Méd. Remitente:', 400, y2, { continued: false });
  doc.font('Helvetica').text(` ${orden.medico_nombre || ''}`, 475, y2, { continued: false });

  // Tercera línea: Procedencia
  const y3 = y2 + 12;
  doc.font('Helvetica-Bold').text('Procedencia:', 40, y3, { continued: false });
  doc.font('Helvetica').text(' Exonerado', 105, y3, { continued: false });

  // Línea separadora horizontal gruesa
  doc.moveTo(40, y3 + 18)
     .lineTo(572, y3 + 18)
     .lineWidth(1.5)
     .stroke();
}

function dibujarTablaResultados(doc, area, pruebas, orden) {
  let y = 220;

  // Título del área
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(area.toUpperCase(), 40, y);

  y += 18;

  // Encabezados de tabla con fondo gris
  doc.rect(40, y, 532, 15)
     .fillAndStroke('#D3D3D3', '#000000');

  doc.fillColor('#000000')
     .fontSize(8)
     .font('Helvetica-Bold')
     .text('PRUEBA', 42, y + 4, { width: 250 })
     .text('RESULTADO', 295, y + 4, { width: 80 })
     .text('UNIDAD', 378, y + 4, { width: 80 })
     .text('VAL. REFERENCIA', 460, y + 4, { width: 110, align: 'right' });

  y += 15;

  // Determinar si es área de QUÍMICA (usa líneas punteadas)
  const esQuimica = area.toUpperCase() === 'QUÍMICA';

  // Agrupar por estudio si es necesario
  const estudios = agruparPorEstudio(pruebas);

  // Dibujar resultados
  estudios.forEach(({ estudio, pruebas: pruebasEstudio }) => {
    // Si hay nombre de estudio y más de una prueba, mostrar subtítulo
    if (estudio && pruebasEstudio.length > 1) {
      y = verificarEspacioPagina(doc, y, 15);
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(estudio.toUpperCase(), 40, y);
      y += 12;
    }

    // Dibujar cada prueba
    pruebasEstudio.forEach(prueba => {
      y = verificarEspacioPagina(doc, y, 12);

      const valor = formatearValor(prueba.resultado_numerico, prueba.resultado_alpha);
      const unidad = prueba.unidad || '';
      const valorRef = formatearValorReferencia(prueba);

      if (esQuimica) {
        // Formato especial para QUÍMICA con líneas punteadas
        const nombrePrueba = prueba.prueba_nombre.toUpperCase();

        // Nombre de la prueba
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#000000')
           .text(nombrePrueba, 42, y, { continued: false });

        // Calcular posición para línea punteada
        const anchoNombre = doc.widthOfString(nombrePrueba);
        const xInicio = 42 + anchoNombre + 3;
        const xFin = 285;

        // Dibujar línea punteada (más visible)
        doc.save();
        doc.strokeColor('#000000');
        doc.lineWidth(0.5);
        doc.dash(2, { space: 1 });
        doc.moveTo(xInicio, y + 7)
           .lineTo(xFin, y + 7)
           .stroke();
        doc.undash();
        doc.restore();

        // Resultado, unidad y valor de referencia
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#000000')
           .text(valor, 295, y, { width: 80, continued: false })
           .text(unidad, 378, y, { width: 80, continued: false })
           .text(valorRef, 460, y, { width: 110, align: 'left', continued: false });

      } else {
        // Formato normal para HEMATOLOGÍA y UROANÁLISIS
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#000000')
           .text(prueba.prueba_nombre, 42, y, { width: 250 })
           .text(valor, 295, y, { width: 80 })
           .text(unidad, 378, y, { width: 80 })
           .text(valorRef, 460, y, { width: 110, align: 'left' });
      }

      y += 11;
    });
  });

  // Espacio para la firma del bioanalista
  y += 40;
  y = verificarEspacioPagina(doc, y, 60);

  // Espacio para firma (puede personalizarse según el área)
  const firmantes = {
    'HEMATOLOGÍA': { nombre: 'Lcda. OMAIRA LUGO', numeros: ['N° 1811', 'N° 4389'] },
    'QUÍMICA': { nombre: 'Lcda. TERESA DI CIACCIO', numeros: ['N° 2251', 'N° 6633'] },
    'UROANÁLISIS': { nombre: 'Lcda. MARI CARMEN RAMOS', numeros: ['N° 3836', 'N° 14217'] }
  };

  const firmante = firmantes[area.toUpperCase()] || { nombre: 'Lcda. [NOMBRE]', numeros: ['N° XXXX'] };

  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#000000')
     .text(firmante.nombre, 450, y, { align: 'right' });

  firmante.numeros.forEach((num, idx) => {
    doc.text(num, 450, y + 10 + (idx * 10), { align: 'right' });
  });
}

function agruparPorEstudio(pruebas) {
  // Detectar estudios comunes basándonos en patrones
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

  // Primero, intentar agrupar por estudios conocidos
  Object.entries(estudiosConocidos).forEach(([estudio, nombresPruebas]) => {
    const pruebasDelEstudio = pruebas.filter(p => {
      const nombrePrueba = p.prueba_nombre.toUpperCase();
      return nombresPruebas.some(np => nombrePrueba.includes(np) || np.includes(nombrePrueba));
    });

    if (pruebasDelEstudio.length > 0) {
      grupos.push({ estudio, pruebas: pruebasDelEstudio });
      pruebasDelEstudio.forEach(p => pruebasUsadas.add(p.prueba_orden_id));
    }
  });

  // Luego, agregar pruebas individuales que no fueron agrupadas
  const pruebasIndividuales = pruebas.filter(p => !pruebasUsadas.has(p.prueba_orden_id));
  if (pruebasIndividuales.length > 0) {
    grupos.push({ estudio: null, pruebas: pruebasIndividuales });
  }

  return grupos;
}

function formatearValor(numerico, alpha) {
  if (numerico !== null && numerico !== undefined) {
    // Formatear números con 1 decimal, sin decimales si es entero
    const num = parseFloat(numerico);
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  }
  return alpha || '';
}

function formatearValorReferencia(prueba) {
  if (prueba.valor_desde && prueba.valor_hasta) {
    // Formatear valores de referencia con 1 decimal
    const desde = parseFloat(prueba.valor_desde);
    const hasta = parseFloat(prueba.valor_hasta);
    const desdeStr = desde % 1 === 0 ? desde.toString() : desde.toFixed(1);
    const hastaStr = hasta % 1 === 0 ? hasta.toString() : hasta.toFixed(1);
    return `${desdeStr} - ${hastaStr}`;
  }
  if (prueba.valor_texto) {
    return prueba.valor_texto;
  }
  return '';
}

function verificarEspacioPagina(doc, y, altoNecesario) {
  // Dejar espacio para el footer (unos 100px desde el fondo)
  if (y + altoNecesario > 650) {
    doc.addPage();
    return 100; // Nueva posición Y después del encabezado
  }
  return y;
}

async function dibujarPiePagina(doc, paginaActual, totalPaginas, numeroOrden) {
  const footerY = 720;

  // Línea separadora superior del footer
  doc.moveTo(40, footerY)
     .lineTo(572, footerY)
     .lineWidth(1)
     .stroke();

  // Generar QR code en la esquina inferior izquierda
  try {
    const qrDataUrl = await QRCode.toDataURL(`${numeroOrden}`, {
      width: 80,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    doc.image(qrBuffer, 40, footerY + 5, { width: 60, height: 60 });
  } catch (error) {
    logger.error('Error generando QR:', error);
  }

  // Información del laboratorio en el centro del footer
  doc.fontSize(7)
     .font('Helvetica')
     .fillColor('#000000')
     .text(
       'LABORATORIO CLINICO MICROBIOLÓGICO ELIZABETH GUTIERREZ Av. Libertador Edf. Majestic Piso 1 Ofc. 18',
       110,
       footerY + 15,
       { width: 400, align: 'center' }
     );

  doc.text('762.05.61 763.59.09 763.66.28', 110, footerY + 28, { width: 400, align: 'center' });
  doc.text('Rif. J-40233378-1', 110, footerY + 41, { width: 400, align: 'center' });

  // Número de página en la esquina inferior derecha
  doc.fontSize(8)
     .font('Helvetica')
     .text(`${paginaActual} de ${totalPaginas}`, 520, footerY + 50, { width: 50, align: 'right' });
}

export default { generarPDFResultados };
