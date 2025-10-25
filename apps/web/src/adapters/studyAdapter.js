/**
 * Adaptador para convertir datos entre backend (PostgreSQL) y frontend
 * Maneja la conversión bidireccional de estructuras de datos
 */

export class StudyAdapter {
  /**
   * Convierte un estudio del backend al formato del frontend
   */
  static fromBackend(backendStudy) {
    if (!backendStudy) return null;

    return {
      // IDs y códigos
      id: backendStudy.id,
      codigo: backendStudy.codigo,
      nomenclatura: backendStudy.nomenclatura,
      
      // Información básica
      nombre: backendStudy.nombre,
      nombre_completo: backendStudy.nombre_completo,
      descripcion: backendStudy.descripcion || '',
      
      // Categorización
      area: backendStudy.area?.nombre || backendStudy.area_nombre || 'General',
      areaId: backendStudy.area_id,
      areaColor: this.getColorForArea(backendStudy.area?.nombre || backendStudy.area_nombre),
      areaIcon: this.getIconForArea(backendStudy.area?.nombre || backendStudy.area_nombre),
      
      // Precio
      precio: parseFloat(backendStudy.precio || 0),
      precioFormateado: this.formatPrice(backendStudy.precio),
      
      // Tiempos
      tiempoEntrega: backendStudy.tiempo_entrega || '24-48 horas',
      diasProcesamiento: backendStudy.dias_procesamiento || 2,
      
      // Preparación
      preparacion: backendStudy.preparacion || 'No requiere preparación especial',
      ayuno: backendStudy.ayuno || false,
      indicaciones: backendStudy.indicaciones || [],
      
      // Muestra
      tipoMuestra: backendStudy.tipo_muestra?.nombre || backendStudy.tipo_muestra_nombre || 'Sangre',
      tipoContenedor: backendStudy.tipo_contenedor?.nombre || backendStudy.tipo_contenedor_nombre || 'Tubo estándar',
      volumenMinimo: backendStudy.volumen_minimo,

      // Ficha Técnica - Días de proceso
      diasProceso: this.formatDiasProceso(backendStudy),

      // Ficha Técnica - Valores Referenciales
      valoresReferenciales: this.formatValoresReferenciales(backendStudy.valores_referenciales),

      // Ficha Técnica - Información adicional
      metodologia: backendStudy.metodologia,
      valoresNormales: backendStudy.valores_normales,
      infoTomaMuestra: backendStudy.info_toma_muestra,
      criteriosRechazo: backendStudy.criterios_rechazo,
      diasEstabilidad: backendStudy.dias_estabilidad,

      // Metadatos
      activo: backendStudy.activa !== false,
      reportable: backendStudy.reportable !== false,
      popular: backendStudy.popular || false,
      
      // Tags para búsqueda
      tags: this.extractTags(backendStudy),
      
      // Campos adicionales para compatibilidad con directorio
      requirements: backendStudy.preparacion,
      fasting: backendStudy.ayuno,
      price: parseFloat(backendStudy.precio || 0),
      deliveryTime: backendStudy.tiempo_entrega,
      sampleType: backendStudy.tipo_muestra?.nombre || 'Sangre'
    };
  }

  /**
   * Convierte un estudio del formato estático (directorio) al formato unificado
   */
  static fromStatic(staticStudy) {
    if (!staticStudy) return null;

    return {
      // Mantener todos los campos originales
      ...staticStudy,
      
      // Normalizar campos
      id: staticStudy.id,
      codigo: staticStudy.code || staticStudy.codigo || staticStudy.id,
      nombre: staticStudy.name || staticStudy.nombre,
      area: staticStudy.area || 'General',
      areaColor: this.getColorForArea(staticStudy.area),
      areaIcon: this.getIconForArea(staticStudy.area),
      precio: staticStudy.price || staticStudy.precio || 0,
      precioFormateado: this.formatPrice(staticStudy.price || staticStudy.precio),
      tiempoEntrega: staticStudy.tiempoEntrega || staticStudy.deliveryTime || '24-48 horas',
      preparacion: staticStudy.preparacion || staticStudy.requirements || 'Sin preparación',
      ayuno: staticStudy.fasting || staticStudy.ayuno || false,
      tipoMuestra: staticStudy.sampleType || staticStudy.tipoMuestra || 'Sangre',
      descripcion: staticStudy.description || staticStudy.descripcion || '',
      tags: staticStudy.tags || [],
      popular: staticStudy.popular || false,
      activo: true,
      reportable: true
    };
  }

  /**
   * Convierte un grupo/perfil del backend
   */
  static fromBackendGroup(backendGroup) {
    if (!backendGroup) return null;

    return {
      id: backendGroup.id,
      codigo: backendGroup.codigo,
      nombre: backendGroup.nombre,
      descripcion: backendGroup.descripcion,
      area: backendGroup.area?.nombre || 'Perfiles',
      areaId: backendGroup.area_id,
      precio: parseFloat(backendGroup.precio || 0),
      precioFormateado: this.formatPrice(backendGroup.precio),
      tiempoEntrega: backendGroup.tiempo_entrega || '48-72 horas',
      pruebas: backendGroup.pruebas || [],
      pruebasCount: backendGroup.pruebas?.length || 0,
      esGrupo: true,
      parentId: backendGroup.parent_id,
      activo: backendGroup.activa !== false,
      tags: ['perfil', 'grupo', ...(backendGroup.tags || [])]
    };
  }

  /**
   * Prepara un estudio para agregar al carrito
   */
  static toCart(study) {
    return {
      id: study.id,
      codigo: study.codigo,
      nombre: study.nombre,
      area: study.area,
      precio: study.precio || study.price || 0,
      cantidad: 1,
      tipoMuestra: study.tipoMuestra || study.sampleType,
      tiempoEntrega: study.tiempoEntrega || study.deliveryTime,
      esGrupo: study.esGrupo || false
    };
  }

  /**
   * Prepara datos para enviar al backend
   */
  static toBackend(frontendStudy) {
    return {
      codigo: frontendStudy.codigo,
      nombre: frontendStudy.nombre,
      descripcion: frontendStudy.descripcion,
      area_id: frontendStudy.areaId,
      precio: frontendStudy.precio,
      tiempo_entrega: frontendStudy.tiempoEntrega,
      preparacion: frontendStudy.preparacion,
      ayuno: frontendStudy.ayuno,
      tipo_muestra_id: frontendStudy.tipoMuestraId,
      tipo_contenedor_id: frontendStudy.tipoContenedorId,
      activa: frontendStudy.activo,
      reportable: frontendStudy.reportable
    };
  }

  /**
   * Formatea los días de proceso en un array de códigos de días
   */
  static formatDiasProceso(estudio) {
    const dias = [];
    if (estudio.lunes) dias.push('L');
    if (estudio.martes) dias.push('M');
    if (estudio.miercoles) dias.push('X');
    if (estudio.jueves) dias.push('J');
    if (estudio.viernes) dias.push('V');
    if (estudio.sabado) dias.push('S');
    if (estudio.domingo) dias.push('D');
    return dias;
  }

  /**
   * Formatea los valores referenciales del formato backend al frontend
   */
  static formatValoresReferenciales(valoresDB) {
    if (!valoresDB || valoresDB.length === 0) return [];

    return valoresDB.map(vr => {
      // Formatear rango de edad
      let rangoEdad = '';
      if (vr.edad_desde === 0 && vr.edad_hasta === 120) {
        rangoEdad = 'Todas las edades';
      } else {
        const unidad = vr.unidad_tiempo || 'años';
        rangoEdad = `${vr.edad_desde}-${vr.edad_hasta} ${unidad.toLowerCase()}`;
      }

      // Formatear sexo
      let sexo = 'Ambos';
      if (vr.sexo === 'M') sexo = 'Masculino';
      else if (vr.sexo === 'F') sexo = 'Femenino';

      return {
        id: vr.id,
        rangoEdad,
        edadDesde: vr.edad_desde,
        edadHasta: vr.edad_hasta,
        unidadTiempo: vr.unidad_tiempo,
        sexo,
        sexoCodigo: vr.sexo || null,
        valorMin: vr.valor_desde,
        valorMax: vr.valor_hasta,
        comentario: vr.comentario || '',
        esPanico: vr.panico || false,
        esEmbarazo: vr.embarazo || false
      };
    });
  }

  /**
   * Extrae tags de un estudio para mejorar la búsqueda
   */
  static extractTags(study) {
    const tags = [];
    
    // Tags básicos
    if (study.tags) tags.push(...study.tags);
    
    // Tags del área
    if (study.area?.nombre) {
      tags.push(study.area.nombre.toLowerCase());
    }
    
    // Tags de muestra
    if (study.tipo_muestra?.nombre) {
      tags.push(study.tipo_muestra.nombre.toLowerCase());
    }
    
    // Tags de preparación
    if (study.ayuno) tags.push('ayuno', 'fasting');
    if (study.urgente) tags.push('urgente', 'urgencia');
    
    // Tags de código
    if (study.codigo) tags.push(study.codigo.toLowerCase());
    if (study.nomenclatura) tags.push(study.nomenclatura.toLowerCase());
    
    // Eliminar duplicados
    return [...new Set(tags)];
  }

  /**
   * Obtiene el icono para un área específica
   */
  static getIconForArea(area) {
    const iconMap = {
      'Hematología': '🩸',
      'Química': '🧪',
      'Química Clínica': '⚗️',
      'Microbiología': '🦠',
      'Inmunología': '🛡️',
      'Inmunoquímica': '🧬',
      'Orina': '💧',
      'Uroanálisis': '💧',
      'Hormonas': '⚗️',
      'Endocrinología': '🔬',
      'Alergias': '🤧',
      'Parasitología': '🔬',
      'Heces': '🧫',
      'Perfiles': '📋',
      'Grupos': '📊',
      'Marcadores Tumorales': '🎯',
      'Drogas': '💊',
      'Genética': '🧬',
      'Molecular': '🔬'
    };
    
    return iconMap[area] || '🔬';
  }

  /**
   * Obtiene el color asociado a un área
   */
  static getColorForArea(area) {
    const colorMap = {
      'Hematología': 'red',
      'Química': 'blue',
      'Química Clínica': 'indigo',
      'Microbiología': 'green',
      'Inmunología': 'purple',
      'Inmunoquímica': 'violet',
      'Orina': 'yellow',
      'Uroanálisis': 'amber',
      'Hormonas': 'pink',
      'Endocrinología': 'rose',
      'Alergias': 'orange',
      'Parasitología': 'teal',
      'Heces': 'brown',
      'Perfiles': 'slate',
      'Grupos': 'gray',
      'Marcadores Tumorales': 'red',
      'Drogas': 'cyan',
      'Genética': 'purple',
      'Molecular': 'indigo'
    };
    
    return colorMap[area] || 'gray';
  }

  /**
   * Formatea el precio para mostrar
   */
  static formatPrice(price) {
    const numPrice = parseFloat(price) || 0;
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numPrice);
  }

  /**
   * Convierte una lista de estudios
   */
  static fromBackendList(backendStudies = []) {
    return backendStudies.map(study => this.fromBackend(study)).filter(Boolean);
  }

  /**
   * Convierte una lista de estudios estáticos
   */
  static fromStaticList(staticStudies = []) {
    return staticStudies.map(study => this.fromStatic(study)).filter(Boolean);
  }

  /**
   * Combina datos del backend con datos estáticos (para modo offline)
   */
  static merge(backendData, staticData) {
    const merged = new Map();
    
    // Primero agregar datos estáticos
    staticData.forEach(item => {
      const adapted = this.fromStatic(item);
      merged.set(adapted.codigo || adapted.id, adapted);
    });
    
    // Sobrescribir con datos del backend (más actualizados)
    backendData.forEach(item => {
      const adapted = this.fromBackend(item);
      merged.set(adapted.codigo || adapted.id, adapted);
    });
    
    return Array.from(merged.values());
  }
}

export default StudyAdapter;