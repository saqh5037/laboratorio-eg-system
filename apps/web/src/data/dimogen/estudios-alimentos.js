/**
 * Catálogo de estudios de Microbiología de Alimentos - DIMOGEN
 * Datos extraídos de catálogo oficial 2025
 * Certificación: ISO 9001:2015 avalada por Global Standards
 */

export const estudiosAlimentos = [
  {
    codigo: 'OMA01',
    nombre: 'Organismos Mesofílicos Aerobios',
    descripcion: 'Evaluar la calidad microbiológica de alimentos, agua y otros productos. Ayuda a identificar posibles problemas de higiene, contaminación y deterioro de los productos.',
    normativa: 'NOM-092-SSA1-1994',
    tipoMuestra: ['Agua', 'Alimento', 'Superficies vivas e inertes', 'Placas ambientales'],
    temperaturaTransporte: {
      perecederos: '≤10°C',
      congelados: '≤0°C',
      noPerecederos: 'Temperatura ambiente',
      aguas: '≤10°C',
      superficies: '≤10°C',
    },
    tiempoEntrega: '5 días hábiles',
    precio: 363.66,
  },
  {
    codigo: 'HOL02',
    nombre: 'Hongos y Levaduras',
    descripcion: 'Indicadores de prácticas sanitarias inadecuadas o de materia prima de baja calidad. Productores de toxinas que causan enfermedades en humanos.',
    normativa: 'NOM-111-SSA1-1994',
    tipoMuestra: ['Agua', 'Alimento', 'Superficies vivas e inertes', 'Placas ambientales'],
    temperaturaTransporte: {
      perecederos: '≤10°C',
      congelados: '≤0°C',
      noPerecederos: 'Temperatura ambiente',
      aguas: '≤10°C',
      superficies: '≤10°C',
    },
    tiempoEntrega: '8 días hábiles',
    precio: 363.66,
  },
  {
    codigo: 'COL03',
    nombre: 'Coliformes Totales (Vaciado en placa)',
    descripcion: 'Indicador de prácticas higiénicas inadecuadas, mala higiene en la manipulación o procesamiento, limpieza inadecuada o condiciones insalubres.',
    normativa: 'NOM-113-SSA1-1994',
    tipoMuestra: ['Agua', 'Alimento', 'Superficies vivas e inertes'],
    temperaturaTransporte: {
      perecederos: '≤10°C',
      congelados: '≤0°C',
      noPerecederos: 'Temperatura ambiente',
      aguas: '≤10°C',
      superficies: '≤10°C',
    },
    tiempoEntrega: '3 días hábiles',
    precio: 363.66,
  },
  {
    codigo: 'SAL04',
    nombre: 'Detección de Salmonella Spp.',
    descripcion: 'Los análisis de Salmonella son necesarios ya que la salmonelosis es una enfermedad transmitida por consumo de alimentos o contacto con alimentos crudos contaminados que causa diarrea, fiebre y dolor abdominal.',
    normativa: 'NOM-210-SSA1-2014',
    tipoMuestra: ['Alimentos', 'Materia prima', 'Agua para uso y consumo humano', 'Superficies vivas e inertes'],
    temperaturaTransporte: {
      perecederos: '≤10°C',
      congelados: '≤0°C',
      noPerecederos: 'Temperatura ambiente',
      aguas: '≤10°C',
      superficies: '≤10°C',
    },
    tiempoEntrega: '10 días hábiles',
    precio: 818.23,
    destacado: true,
  },
  {
    codigo: 'SAU05',
    nombre: 'Determinación de Staphylococcus aureus',
    descripcion: 'S. aureus es una bacteria que puede causar intoxicación alimentaria, especialmente cuando se multiplica en alimentos que no se almacenan adecuadamente o se manipulan con malas prácticas de higiene.',
    normativa: 'NOM-210-SSA1-2014',
    tipoMuestra: ['Alimentos', 'Materia prima', 'Superficies vivas e inertes'],
    temperaturaTransporte: {
      perecederos: '≤10°C',
      congelados: '≤0°C',
      noPerecederos: 'Temperatura ambiente',
      aguas: '≤10°C',
      superficies: '≤10°C',
    },
    tiempoEntrega: '10 días hábiles',
    precio: 1054.61,
    destacado: true,
  },
  {
    codigo: 'NMP06',
    nombre: 'Coliformes Totales, Fecales y E. coli (NMP)',
    descripcion: 'El grupo coliforme se usa como indicador de la calidad sanitaria del agua o de las condiciones sanitarias en el proceso de alimentos. La presencia de E. coli puede causar enfermedades graves en humanos.',
    normativa: 'NOM-210-SSA1-2014',
    tipoMuestra: ['Agua', 'Hielo', 'Alimentos'],
    temperaturaTransporte: {
      perecederos: '≤10°C',
      congelados: '≤0°C',
      noPerecederos: 'Temperatura ambiente',
      aguas: '≤10°C',
      superficies: '≤10°C',
    },
    tiempoEntrega: '10 días hábiles',
    precio: 606.00,
  },
];

export const paquetesAlimentos = [
  {
    codigo: 'PAQ01',
    nombre: 'Paquete I',
    descripcion: 'Paquete básico de análisis microbiológico',
    incluye: [
      'Organismos Mesofílicos Aerobios',
      'Hongos y Levaduras',
      'Coliformes Totales (Vaciado en placa)',
    ],
    tiempoEntrega: '8 días hábiles',
    precio: 969.76,
    ahorro: 20,
  },
  {
    codigo: 'PAQ02',
    nombre: 'Paquete II',
    descripcion: 'Paquete completo de análisis microbiológico',
    incluye: [
      'Organismos Mesofílicos Aerobios',
      'Hongos y Levaduras',
      'Coliformes Totales (Vaciado en placa)',
      'Salmonella Spp',
      'Staphylococcus aureus',
    ],
    tiempoEntrega: '10 días hábiles',
    precio: 2303.18,
    ahorro: 25,
    destacado: true,
  },
];

export const sectoresAtendidos = [
  {
    nombre: 'Industria Alimentaria',
    descripcion: 'Procesadoras, empacadoras y distribuidoras de alimentos',
    icon: 'factory',
  },
  {
    nombre: 'Hoteles y Restaurantes',
    descripcion: 'Cocinas, buffets y servicios de alimentos',
    icon: 'hotel',
  },
  {
    nombre: 'Hospitales',
    descripcion: 'Servicios de nutrición y cocinas hospitalarias',
    icon: 'hospital',
  },
  {
    nombre: 'Fábricas',
    descripcion: 'Plantas de producción y manufactura de alimentos',
    icon: 'building',
  },
  {
    nombre: 'Plazas Comerciales',
    descripcion: 'Áreas de comida y restaurantes en centros comerciales',
    icon: 'shopping',
  },
  {
    nombre: 'Escuelas',
    descripcion: 'Comedores escolares y servicios de alimentación',
    icon: 'school',
  },
];

export const informacionMuestras = {
  cantidadMinima: {
    agua: '200 ml en envases estériles',
    alimentos: '200 g o ml del producto',
    desinfectantes: '200 ml del producto por cada microorganismo',
    otros: 'Consultar con el laboratorio',
  },
  criteriosRechazo: [
    'Muestra insuficiente',
    'Medios de transporte y materiales distintos a los indicados',
    'Conservación y transporte incorrectos',
    'Muestra derramada o rota del envase',
    'Contaminación obvia de la muestra',
  ],
  nota: 'Los productos con presentación comercial deben ser analizados en sus envases originales',
};
