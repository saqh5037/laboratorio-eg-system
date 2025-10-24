import { Resultado } from './src/models/resultado.js';
import { Orden } from './src/models/orden.js';
import { generarPDFResultados } from './src/services/pdfGeneratorPuppeteer.js';
import fs from 'fs/promises';

async function diagnosticarPDF() {
  try {
    console.log('🔍 Obteniendo orden 2510210001 de la base de datos...');

    // Obtener orden real
    const orden = await Orden.findOne({
      where: { numero: '2510210001' }
    });

    if (!orden) {
      console.error('❌ Orden no encontrada');
      process.exit(1);
    }

    console.log('✅ Orden encontrada:', {
      numero: orden.numero,
      nombre: orden.nombre,
      apellido: orden.apellido,
      ci_paciente: orden.ci_paciente
    });

    // Obtener resultados
    const resultados = await Resultado.findAll({
      where: { orden_numero: '2510210001' },
      order: [['area_nombre', 'ASC']]
    });

    console.log(`✅ Resultados encontrados: ${resultados.length}`);
    console.log('Áreas:', [...new Set(resultados.map(r => r.area_nombre))]);

    // Generar PDF
    console.log('\n📄 Generando PDF...');
    const pdfBuffer = await generarPDFResultados(orden.toJSON(), resultados.map(r => r.toJSON()), {});

    console.log('✅ PDF generado');
    console.log('📊 Tamaño:', pdfBuffer.length, 'bytes');

    // Verificar encabezado
    const header = pdfBuffer.toString('ascii', 0, 8);
    console.log('📋 Encabezado:', header);

    if (!header.startsWith('%PDF')) {
      console.error('❌ PDF no tiene encabezado válido!');
      console.log('Primeros 100 bytes:', pdfBuffer.slice(0, 100).toString('utf-8'));
      process.exit(1);
    }

    // Guardar PDF
    await fs.writeFile('/tmp/diagnostico-resultado.pdf', pdfBuffer);
    console.log('✅ PDF guardado en /tmp/diagnostico-resultado.pdf');

    // Intentar abrir el PDF
    console.log('\n🚀 Abriendo PDF...');
    const { exec } = await import('child_process');
    exec('open /tmp/diagnostico-resultado.pdf', (error) => {
      if (error) {
        console.error('❌ Error al abrir PDF:', error);
      } else {
        console.log('✅ PDF abierto exitosamente');
      }
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

diagnosticarPDF();
