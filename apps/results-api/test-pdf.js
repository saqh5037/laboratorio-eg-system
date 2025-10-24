import { generarPDFResultados } from './src/services/pdfGeneratorPuppeteer.js';
import fs from 'fs/promises';

// Test data
const ordenTest = {
  numero: '2510210001',
  nombre: 'SAMUEL',
  apellido: 'QUIROZ',
  ci_paciente: 'V-17063454',
  sexo: 'M',
  fecha_nacimiento: '1990-01-15',
  telefono: '0414-5551234',
  fecha: '2025-10-21T10:30:00',
  medico_nombre: 'Dr. PEREZ'
};

const resultadosTest = [
  // QUÍMICA - con algunos valores fuera de rango
  {
    prueba_nombre: 'GLUCOSA',
    area_nombre: 'QUÍMICA',
    resultado_numerico: 150,
    resultado_alpha: null,
    unidad: 'mg/dL',
    valor_desde: 70,
    valor_hasta: 110,
    valor_texto: null,
    prueba_orden_id: 1
  },
  {
    prueba_nombre: 'CREATININA',
    area_nombre: 'QUÍMICA',
    resultado_numerico: 0.9,
    resultado_alpha: null,
    unidad: 'mg/dL',
    valor_desde: 0.7,
    valor_hasta: 1.3,
    valor_texto: null,
    prueba_orden_id: 2
  },
  {
    prueba_nombre: 'UREA',
    area_nombre: 'QUÍMICA',
    resultado_numerico: 25,
    resultado_alpha: null,
    unidad: 'mg/dL',
    valor_desde: 15,
    valor_hasta: 45,
    valor_texto: null,
    prueba_orden_id: 3
  },
  {
    prueba_nombre: 'COLESTEROL TOTAL',
    area_nombre: 'QUÍMICA',
    resultado_numerico: 220,
    resultado_alpha: null,
    unidad: 'mg/dL',
    valor_desde: 0,
    valor_hasta: 200,
    valor_texto: null,
    prueba_orden_id: 4
  },
  // HEMATOLOGÍA
  {
    prueba_nombre: 'GLÓBULOS BLANCOS',
    area_nombre: 'HEMATOLOGÍA',
    resultado_numerico: 7500,
    resultado_alpha: null,
    unidad: '/mm³',
    valor_desde: 4000,
    valor_hasta: 11000,
    valor_texto: null,
    prueba_orden_id: 5
  },
  {
    prueba_nombre: 'HEMOGLOBINA',
    area_nombre: 'HEMATOLOGÍA',
    resultado_numerico: 14.5,
    resultado_alpha: null,
    unidad: 'g/dL',
    valor_desde: 13.5,
    valor_hasta: 17.5,
    valor_texto: null,
    prueba_orden_id: 6
  },
  {
    prueba_nombre: 'HEMATOCRITO',
    area_nombre: 'HEMATOLOGÍA',
    resultado_numerico: 42,
    resultado_alpha: null,
    unidad: '%',
    valor_desde: 40,
    valor_hasta: 54,
    valor_texto: null,
    prueba_orden_id: 7
  },
  {
    prueba_nombre: 'PLAQUETAS',
    area_nombre: 'HEMATOLOGÍA',
    resultado_numerico: 180000,
    resultado_alpha: null,
    unidad: '/mm³',
    valor_desde: 150000,
    valor_hasta: 400000,
    valor_texto: null,
    prueba_orden_id: 8
  },
  // UROANÁLISIS - con valores alfanuméricos
  {
    prueba_nombre: 'COLOR ORINA',
    area_nombre: 'UROANÁLISIS',
    resultado_numerico: null,
    resultado_alpha: 'AMARILLO',
    unidad: '',
    valor_desde: null,
    valor_hasta: null,
    valor_texto: 'AMARILLO',
    prueba_orden_id: 9
  },
  {
    prueba_nombre: 'ASPECTO ORINA',
    area_nombre: 'UROANÁLISIS',
    resultado_numerico: null,
    resultado_alpha: 'CLARO',
    unidad: '',
    valor_desde: null,
    valor_hasta: null,
    valor_texto: 'CLARO',
    prueba_orden_id: 10
  },
  {
    prueba_nombre: 'PH ORINA',
    area_nombre: 'UROANÁLISIS',
    resultado_numerico: 6.0,
    resultado_alpha: null,
    unidad: '',
    valor_desde: 5.0,
    valor_hasta: 7.0,
    valor_texto: null,
    prueba_orden_id: 11
  },
  {
    prueba_nombre: 'GLUCOSA ORINA',
    area_nombre: 'UROANÁLISIS',
    resultado_numerico: null,
    resultado_alpha: 'NEGATIVO',
    unidad: '',
    valor_desde: null,
    valor_hasta: null,
    valor_texto: 'NEGATIVO',
    prueba_orden_id: 12
  }
];

async function testPDF() {
  try {
    console.log('Generando PDF de prueba...');
    const pdfBuffer = await generarPDFResultados(ordenTest, resultadosTest, {});

    // Guardar PDF
    await fs.writeFile('/tmp/test-resultado.pdf', pdfBuffer);
    console.log('✅ PDF generado exitosamente en /tmp/test-resultado.pdf');
    console.log('📊 Tamaño del PDF:', pdfBuffer.length, 'bytes');

    // Verificar que no esté vacío
    if (pdfBuffer.length < 100) {
      console.error('❌ El PDF parece estar vacío o corrupto');
    }

    // Verificar que comience con %PDF
    const header = pdfBuffer.toString('ascii', 0, 4);
    if (header === '%PDF') {
      console.log('✅ PDF tiene encabezado válido');
    } else {
      console.error('❌ PDF no tiene encabezado válido:', header);
    }
  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    process.exit(1);
  }
}

testPDF();
