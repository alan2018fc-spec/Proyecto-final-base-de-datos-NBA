/**
 * NBA Routes - COMPLETAMENTE CORREGIDO
 * Define todas las rutas de la API
 * ✅ CORREGIDO: Importación de controladores nombrados agregada
 */

import express from 'express';
import {
  EquiposController,
  ArenasController,
  TemporadasController,
  PartidosController,
  ClasificacionController,
  RankingController,
  PrediccionesController
} from '../controllers/NBAController.js';

const router = express.Router();

// ============================================================
// RUTAS DE TEMPORADAS
// ============================================================

/**
 * GET /api/v1/temporadas
 * Obtiene todas las temporadas disponibles
 */
router.get('/temporadas', TemporadasController.getAll);

/**
 * GET /api/v1/temporadas/:id
 * Obtiene una temporada específica por ID
 */
router.get('/temporadas/:id', TemporadasController.getById);

/**
 * POST /api/v1/temporadas
 * Crea una nueva temporada
 */
router.post('/temporadas', TemporadasController.create);

/**
 * PUT /api/v1/temporadas/:id
 * Actualiza una temporada
 */
router.put('/temporadas/:id', TemporadasController.update);

/**
 * DELETE /api/v1/temporadas/:id
 * Elimina una temporada
 */
router.delete('/temporadas/:id', TemporadasController.delete);

// ============================================================
// RUTAS DE EQUIPOS
// ============================================================

/**
 * GET /api/v1/equipos
 * Obtiene todos los equipos
 */
router.get('/equipos', EquiposController.getAll);

/**
 * GET /api/v1/equipos/:id
 * Obtiene un equipo específico por ID
 */
router.get('/equipos/:id', EquiposController.getById);

/**
 * GET /api/v1/equipos/conferencia/:conferenciaId
 * Obtiene equipos de una conferencia específica
 */
router.get('/equipos/conferencia/:conferenciaId', EquiposController.getByConferencia);

/**
 * GET /api/v1/equipos/division/:divisionId
 * Obtiene equipos de una división específica
 */
router.get('/equipos/division/:divisionId', EquiposController.getByDivision);

/**
 * POST /api/v1/equipos
 * Crea un nuevo equipo
 */
router.post('/equipos', EquiposController.create);

/**
 * PUT /api/v1/equipos/:id
 * Actualiza un equipo
 */
router.put('/equipos/:id', EquiposController.update);

/**
 * DELETE /api/v1/equipos/:id
 * Elimina un equipo
 */
router.delete('/equipos/:id', EquiposController.delete);

// ============================================================
// RUTAS DE ARENAS
// ============================================================

/**
 * GET /api/v1/arenas
 * Obtiene todas las arenas
 */
router.get('/arenas', ArenasController.getAll);

/**
 * GET /api/v1/arenas/:id
 * Obtiene una arena específica por ID
 */
router.get('/arenas/:id', ArenasController.getById);

/**
 * GET /api/v1/arenas/ciudad/:city
 * Obtiene arenas de una ciudad específica
 */
router.get('/arenas/ciudad/:city', ArenasController.getByCity);

/**
 * POST /api/v1/arenas
 * Crea una nueva arena
 */
router.post('/arenas', ArenasController.create);

/**
 * PUT /api/v1/arenas/:id
 * Actualiza una arena
 */
router.put('/arenas/:id', ArenasController.update);

/**
 * DELETE /api/v1/arenas/:id
 * Elimina una arena
 */
router.delete('/arenas/:id', ArenasController.delete);

// ============================================================
// RUTAS DE PARTIDOS
// ============================================================

/**
 * GET /api/v1/partidos
 * Obtiene todos los partidos
 * Query params: limit, offset, temporada, fecha
 */
router.get('/partidos', PartidosController.getAll);

/**
 * GET /api/v1/partidos/:id
 * Obtiene un partido específico por ID
 */
router.get('/partidos/:id', PartidosController.getById);

/**
 * GET /api/v1/partidos/temporada/:temporadaId
 * Obtiene partidos de una temporada específica
 */
router.get('/partidos/temporada/:temporadaId', PartidosController.getByTemporada);

/**
 * POST /api/v1/partidos
 * Crea un nuevo partido
 */
router.post('/partidos', PartidosController.create);

// ============================================================
// RUTAS DE CLASIFICACIÓN
// ============================================================

/**
 * GET /api/v1/clasificacion/:temporadaId
 * Obtiene la clasificación de una temporada específica
 */
router.get('/clasificacion/:temporadaId', ClasificacionController.getByTemporada);

// ============================================================
// RUTAS DE RANKING
// ============================================================

/**
 * GET /api/v1/ranking/:temporadaId
 * Obtiene el ranking de una temporada específica
 */
router.get('/ranking/:temporadaId', RankingController.getByTemporada);

// ============================================================
// RUTAS DE PREDICCIONES
// ============================================================

/**
 * GET /api/v1/predicciones
 * Obtiene todas las predicciones
 */
router.get('/predicciones', PrediccionesController.getAll);

/**
 * GET /api/v1/predicciones/:id
 * Obtiene una predicción específica por ID
 */
router.get('/predicciones/:id', PrediccionesController.getById);

// ============================================================
// HEALTH CHECK
// ============================================================

/**
 * GET /api/v1/health
 * Verifica el estado de la API
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'NBA Analytics API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
