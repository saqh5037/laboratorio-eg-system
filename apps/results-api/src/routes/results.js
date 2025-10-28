import express from 'express';
import { verificarPaciente, generarToken, requireAuth } from '../services/auth.js';
import { Orden } from '../models/orden.js';
import { Resultado } from '../models/resultado.js';
import { generarPDFResultados } from '../services/pdfGeneratorLabsis.js';
import logger from '../config/logger.js';

const router = express.Router();

/**
 * POST /api/auth/verify
 * Verificar código de lealtad y fecha de nacimiento
 */
router.post('/auth/verify', async (req, res) => {
  try {
    const { codigo_lealtad, fecha_nacimiento } = req.body;

    // Validar campos requeridos
    if (!codigo_lealtad || !fecha_nacimiento) {
      return res.status(400).json({
        success: false,
        error: 'Código de lealtad y fecha de nacimiento son requeridos',
      });
    }

    // Verificar paciente
    const paciente = await verificarPaciente(codigo_lealtad, fecha_nacimiento);

    if (!paciente) {
      return res.status(401).json({
        success: false,
        error: 'Código de lealtad o fecha de nacimiento inválidos',
      });
    }

    // Generar token
    const token = generarToken(paciente);

    res.json({
      success: true,
      data: {
        token,
        paciente: {
          nombre: `${paciente.nombre} ${paciente.apellido}`,
          ci_paciente: paciente.ci_paciente,
        },
      },
    });
  } catch (error) {
    if (error.message === 'RATE_LIMIT_EXCEEDED') {
      return res.status(429).json({
        success: false,
        error: 'Demasiados intentos. Por favor, intente más tarde.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }

    logger.error('Error en /auth/verify:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
});

/**
 * GET /api/resultados/ordenes
 * Obtener todas las órdenes del paciente autenticado
 */
router.get('/resultados/ordenes', requireAuth, async (req, res) => {
  try {
    const { ci_paciente } = req.paciente;

    const ordenes = await Orden.findByCodigoLealtad(ci_paciente);

    res.json({
      success: true,
      data: {
        total: ordenes.length,
        ordenes,
      },
    });
  } catch (error) {
    logger.error('Error en /resultados/ordenes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener órdenes',
    });
  }
});

/**
 * GET /api/resultados/orden/:numero
 * Obtener resultados completos de una orden específica
 */
router.get('/resultados/orden/:numero', requireAuth, async (req, res) => {
  try {
    const { numero } = req.params;
    const { ci_paciente } = req.paciente;

    // Verificar que la orden pertenece al paciente
    const perteneceAlPaciente = await Orden.verificarPropiedad(numero, ci_paciente);

    if (!perteneceAlPaciente) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permiso para acceder a esta orden',
      });
    }

    // Obtener detalles de la orden
    const orden = await Orden.findByNumero(numero, ci_paciente);

    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada',
      });
    }

    // Obtener resultados
    const resultados = await Resultado.findByOrden(numero);

    // Obtener estadísticas
    const estadisticas = await Resultado.getEstadisticas(numero);

    res.json({
      success: true,
      data: {
        orden,
        resultados: resultados.resultados,
        resultados_por_area: resultados.porArea,
        estadisticas,
      },
    });
  } catch (error) {
    logger.error('Error en /resultados/orden/:numero:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener resultados',
    });
  }
});

/**
 * GET /api/resultados/orden/:numero/pdf
 * Descargar PDF de resultados de una orden específica
 */
router.get('/resultados/orden/:numero/pdf', requireAuth, async (req, res) => {
  try {
    const { numero } = req.params;
    const { ci_paciente } = req.paciente;

    // Verificar que la orden pertenece al paciente
    const perteneceAlPaciente = await Orden.verificarPropiedad(numero, ci_paciente);

    if (!perteneceAlPaciente) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permiso para acceder a esta orden',
      });
    }

    // Obtener detalles de la orden
    const orden = await Orden.findByNumero(numero, ci_paciente);

    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada',
      });
    }

    // Obtener resultados
    const resultados = await Resultado.findByOrden(numero);

    // Obtener estadísticas
    const estadisticas = await Resultado.getEstadisticas(numero);

    // Generar PDF
    const pdfBuffer = await generarPDFResultados(orden, resultados.resultados, estadisticas);

    // Enviar PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Resultados_${numero}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer, 'binary');

    logger.info(`PDF generado para orden ${numero}`);
  } catch (error) {
    logger.error('Error en /resultados/orden/:numero/pdf:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar PDF',
    });
  }
});

/**
 * GET /api/resultados/historico/:prueba_id/:paciente_ci
 * Obtener histórico de resultados de una prueba específica para un paciente
 */
router.get('/resultados/historico/:prueba_id/:paciente_ci', requireAuth, async (req, res) => {
  try {
    const { prueba_id, paciente_ci } = req.params;
    const { limit = 10 } = req.query;
    const { ci_paciente: ci_paciente_auth } = req.paciente;

    // Validar que el paciente autenticado solo pueda ver su propio histórico
    if (ci_paciente_auth !== paciente_ci) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permiso para acceder al histórico de este paciente',
      });
    }

    // Validar parámetros
    if (!prueba_id || isNaN(parseInt(prueba_id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de prueba inválido',
      });
    }

    // Obtener histórico
    const historico = await Resultado.findHistorico(
      parseInt(prueba_id),
      paciente_ci,
      parseInt(limit)
    );

    if (!historico.prueba) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró histórico para esta prueba',
      });
    }

    res.json({
      success: true,
      data: historico,
    });

    logger.info(`Histórico obtenido: prueba ${prueba_id}, paciente ${paciente_ci}, ${historico.total} resultados`);
  } catch (error) {
    logger.error('Error en /resultados/historico/:prueba_id/:paciente_ci:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener histórico de resultados',
    });
  }
});

/**
 * GET /api/resultados/historico-multiple/:paciente_ci
 * Obtener histórico de múltiples pruebas para comparación
 */
router.get('/resultados/historico-multiple/:paciente_ci', requireAuth, async (req, res) => {
  try {
    const { paciente_ci } = req.params;
    const { prueba_ids, limit = 10, fecha_desde, fecha_hasta } = req.query;
    const { ci_paciente: ci_paciente_auth } = req.paciente;

    // Validar que el paciente autenticado solo pueda ver su propio histórico
    if (ci_paciente_auth !== paciente_ci) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permiso para acceder al histórico de este paciente',
      });
    }

    // Validar parámetros
    if (!prueba_ids) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el parámetro prueba_ids',
      });
    }

    // Convertir prueba_ids a array si es string
    const pruebaIdsArray = Array.isArray(prueba_ids)
      ? prueba_ids.map(id => parseInt(id))
      : prueba_ids.split(',').map(id => parseInt(id));

    // Validar que todos sean números válidos
    if (pruebaIdsArray.some(id => isNaN(id))) {
      return res.status(400).json({
        success: false,
        error: 'IDs de pruebas inválidos',
      });
    }

    const historicos = await Resultado.findHistoricoMultiple(
      pruebaIdsArray,
      paciente_ci,
      parseInt(limit),
      fecha_desde || null,
      fecha_hasta || null
    );

    res.json({
      success: true,
      data: {
        total: historicos.length,
        pruebas: historicos
      },
    });

    logger.info(`Histórico múltiple obtenido: ${pruebaIdsArray.length} pruebas, paciente ${paciente_ci}`);
  } catch (error) {
    logger.error('Error en /resultados/historico-multiple/:paciente_ci:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener histórico múltiple de resultados',
    });
  }
});

/**
 * GET /api/resultados/heatmap/:paciente_ci
 * Obtener datos para heat map de histórico
 */
router.get('/resultados/heatmap/:paciente_ci', requireAuth, async (req, res) => {
  try {
    const { paciente_ci } = req.params;
    const { limit = 10, fecha_desde, fecha_hasta } = req.query;
    const { ci_paciente: ci_paciente_auth } = req.paciente;

    // Validar que el paciente autenticado solo pueda ver su propio histórico
    if (ci_paciente_auth !== paciente_ci) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permiso para acceder al histórico de este paciente',
      });
    }

    const heatmapData = await Resultado.findHeatMapData(
      paciente_ci,
      parseInt(limit),
      fecha_desde || null,
      fecha_hasta || null
    );

    res.json({
      success: true,
      data: heatmapData,
    });

    logger.info(`Heat map data obtenido para paciente ${paciente_ci}: ${heatmapData.ordenes.length} órdenes, ${heatmapData.pruebas.length} pruebas`);
  } catch (error) {
    logger.error('Error en /resultados/heatmap/:paciente_ci:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener datos de heat map',
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
/**
 * GET /api/resultados/formatos
 * Obtener todos los formatos de pruebas para cache en frontend
 */
router.get('/resultados/formatos', async (req, res) => {
  try {
    const formatos = await Resultado.findAllFormatos();

    res.json({
      success: true,
      data: formatos,
      cache: {
        maxAge: 3600, // 1 hora en segundos
        staleWhileRevalidate: 86400, // 24 horas
      }
    });
  } catch (error) {
    logger.error('Error al obtener formatos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener formatos de pruebas',
    });
  }
});

router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'results-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
