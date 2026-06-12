/**
 * NBA Backend Controllers
 * Controladores para todos los endpoints de la API
 * ✅ CORREGIDO: Importación de Models agregada
 */

import * as Models from '../models/NBAModel.js';

// ============================================================
// UTILIDADES DE RESPUESTA
// ============================================================

function sendResponse(res, statusCode, data, message = '') {
  res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data
  });
}

function sendError(res, statusCode, message = '') {
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    data: null
  });
}

// ============================================================
// EQUIPOS CONTROLLER
// ============================================================

export const EquiposController = {
  // GET /equipos
  async getAll(req, res) {
    try {
      const equipos = await Models.EquiposModel.getAll();
      sendResponse(res, 200, equipos, 'Equipos obtenidos correctamente');
    } catch (error) {
      console.error('Error en getAll:', error);
      sendError(res, 500, 'Error al obtener equipos');
    }
  },

  // GET /equipos/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      if (!id) return sendError(res, 400, 'ID de equipo requerido');

      const equipo = await Models.EquiposModel.getById(id);
      if (!equipo) return sendError(res, 404, 'Equipo no encontrado');

      sendResponse(res, 200, equipo, 'Equipo obtenido correctamente');
    } catch (error) {
      console.error('Error en getById:', error);
      sendError(res, 500, 'Error al obtener equipo');
    }
  },

  // GET /equipos/conferencia/:conferenciaId
  async getByConferencia(req, res) {
    try {
      const { conferenciaId } = req.params;
      if (!conferenciaId) return sendError(res, 400, 'ID de conferencia requerido');

      const equipos = await Models.EquiposModel.getByConferencia(conferenciaId);
      sendResponse(res, 200, equipos, 'Equipos obtenidos correctamente');
    } catch (error) {
      console.error('Error en getByConferencia:', error);
      sendError(res, 500, 'Error al obtener equipos');
    }
  },

  // GET /equipos/division/:divisionId
  async getByDivision(req, res) {
    try {
      const { divisionId } = req.params;
      if (!divisionId) return sendError(res, 400, 'ID de división requerido');

      const equipos = await Models.EquiposModel.getByDivision(divisionId);
      sendResponse(res, 200, equipos, 'Equipos obtenidos correctamente');
    } catch (error) {
      console.error('Error en getByDivision:', error);
      sendError(res, 500, 'Error al obtener equipos');
    }
  },

  // POST /equipos
  async create(req, res) {
    try {
      const { nombre, abreviatura, ciudad, divisionId, conferenciaId } = req.body;

      if (!nombre || !abreviatura || !ciudad || !divisionId || !conferenciaId) {
        return sendError(res, 400, 'Faltan campos requeridos');
      }

      const id = await Models.EquiposModel.create({
        nombre,
        abreviatura,
        ciudad,
        divisionId,
        conferenciaId
      });

      sendResponse(res, 201, { id }, 'Equipo creado correctamente');
    } catch (error) {
      console.error('Error en create:', error);
      sendError(res, 500, 'Error al crear equipo');
    }
  },

  // PUT /equipos/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, abreviatura, ciudad, divisionId, conferenciaId, estado } = req.body;

      if (!id) return sendError(res, 400, 'ID de equipo requerido');

      await Models.EquiposModel.update(id, {
        nombre,
        abreviatura,
        ciudad,
        divisionId,
        conferenciaId,
        estado
      });

      sendResponse(res, 200, { id }, 'Equipo actualizado correctamente');
    } catch (error) {
      console.error('Error en update:', error);
      sendError(res, 500, 'Error al actualizar equipo');
    }
  },

  // DELETE /equipos/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      if (!id) return sendError(res, 400, 'ID de equipo requerido');

      await Models.EquiposModel.delete(id);
      sendResponse(res, 200, { id }, 'Equipo eliminado correctamente');
    } catch (error) {
      console.error('Error en delete:', error);
      sendError(res, 500, 'Error al eliminar equipo');
    }
  }
};

// ============================================================
// ARENAS CONTROLLER
// ============================================================

export const ArenasController = {
  // GET /arenas
  async getAll(req, res) {
    try {
      const arenas = await Models.ArenasModel.getAll();
      sendResponse(res, 200, arenas, 'Arenas obtenidas correctamente');
    } catch (error) {
      console.error('Error en getAll:', error);
      sendError(res, 500, 'Error al obtener arenas');
    }
  },

  // GET /arenas/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      if (!id) return sendError(res, 400, 'ID de arena requerido');

      const arena = await Models.ArenasModel.getById(id);
      if (!arena) return sendError(res, 404, 'Arena no encontrada');

      sendResponse(res, 200, arena, 'Arena obtenida correctamente');
    } catch (error) {
      console.error('Error en getById:', error);
      sendError(res, 500, 'Error al obtener arena');
    }
  },

  // GET /arenas/ciudad/:city
  async getByCity(req, res) {
    try {
      const { city } = req.params;
      if (!city) return sendError(res, 400, 'Ciudad requerida');

      const arenas = await Models.ArenasModel.getByCity(city);
      sendResponse(res, 200, arenas, 'Arenas obtenidas correctamente');
    } catch (error) {
      console.error('Error en getByCity:', error);
      sendError(res, 500, 'Error al obtener arenas');
    }
  },

  // POST /arenas
  async create(req, res) {
    try {
      const { nombre, ciudad, capacidad } = req.body;

      if (!nombre || !ciudad) {
        return sendError(res, 400, 'Faltan campos requeridos');
      }

      const id = await Models.ArenasModel.create({
        nombre,
        ciudad,
        capacidad
      });

      sendResponse(res, 201, { id }, 'Arena creada correctamente');
    } catch (error) {
      console.error('Error en create:', error);
      sendError(res, 500, 'Error al crear arena');
    }
  },

  // PUT /arenas/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, ciudad, capacidad, estado } = req.body;

      if (!id) return sendError(res, 400, 'ID de arena requerido');

      await Models.ArenasModel.update(id, {
        nombre,
        ciudad,
        capacidad,
        estado
      });

      sendResponse(res, 200, { id }, 'Arena actualizada correctamente');
    } catch (error) {
      console.error('Error en update:', error);
      sendError(res, 500, 'Error al actualizar arena');
    }
  },

  // DELETE /arenas/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      if (!id) return sendError(res, 400, 'ID de arena requerido');

      await Models.ArenasModel.delete(id);
      sendResponse(res, 200, { id }, 'Arena eliminada correctamente');
    } catch (error) {
      console.error('Error en delete:', error);
      sendError(res, 500, 'Error al eliminar arena');
    }
  }
};

// ============================================================
// TEMPORADAS CONTROLLER
// ============================================================

export const TemporadasController = {
  // GET /temporadas
  async getAll(req, res) {
    try {
      const temporadas = await Models.TemporadasModel.getAll();
      sendResponse(res, 200, temporadas, 'Temporadas obtenidas correctamente');
    } catch (error) {
      console.error('Error en getAll:', error);
      sendError(res, 500, 'Error al obtener temporadas');
    }
  },

  // GET /temporadas/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      if (!id) return sendError(res, 400, 'ID de temporada requerido');

      const temporada = await Models.TemporadasModel.getById(id);
      if (!temporada) return sendError(res, 404, 'Temporada no encontrada');

      sendResponse(res, 200, temporada, 'Temporada obtenida correctamente');
    } catch (error) {
      console.error('Error en getById:', error);
      sendError(res, 500, 'Error al obtener temporada');
    }
  },

  // POST /temporadas
  async create(req, res) {
    try {
      const { nombre, anoInicio, anoFin, campeon, subcampeon, mejorEquipo, estado } = req.body;

      if (!nombre || !anoInicio || !anoFin) {
        return sendError(res, 400, 'Faltan campos requeridos');
      }

      const id = await Models.TemporadasModel.create({
        nombre,
        anoInicio,
        anoFin,
        campeon,
        subcampeon,
        mejorEquipo,
        estado
      });

      sendResponse(res, 201, { id }, 'Temporada creada correctamente');
    } catch (error) {
      console.error('Error en create:', error);
      sendError(res, 500, 'Error al crear temporada');
    }
  },

  // PUT /temporadas/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, anoInicio, anoFin, campeon, subcampeon, mejorEquipo, estado } = req.body;

      if (!id) return sendError(res, 400, 'ID de temporada requerido');

      await Models.TemporadasModel.update(id, {
        nombre,
        anoInicio,
        anoFin,
        campeon,
        subcampeon,
        mejorEquipo,
        estado
      });

      sendResponse(res, 200, { id }, 'Temporada actualizada correctamente');
    } catch (error) {
      console.error('Error en update:', error);
      sendError(res, 500, 'Error al actualizar temporada');
    }
  },

  // DELETE /temporadas/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      if (!id) return sendError(res, 400, 'ID de temporada requerido');

      await Models.TemporadasModel.delete(id);
      sendResponse(res, 200, { id }, 'Temporada eliminada correctamente');
    } catch (error) {
      console.error('Error en delete:', error);
      sendError(res, 500, 'Error al eliminar temporada');
    }
  }
};

// ============================================================
// PARTIDOS CONTROLLER
// ============================================================

export const PartidosController = {
  // GET /partidos
  async getAll(req, res) {
    try {
      const limit = req.query.limit || 1000;
      const partidos = await Models.PartidosModel.getAll(limit);
      sendResponse(res, 200, partidos, 'Partidos obtenidos correctamente');
    } catch (error) {
      console.error('Error en getAll:', error);
      sendError(res, 500, 'Error al obtener partidos');
    }
  },

  // GET /partidos/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      if (!id) return sendError(res, 400, 'ID de partido requerido');

      const partido = await Models.PartidosModel.getById(id);
      if (!partido) return sendError(res, 404, 'Partido no encontrado');

      sendResponse(res, 200, partido, 'Partido obtenido correctamente');
    } catch (error) {
      console.error('Error en getById:', error);
      sendError(res, 500, 'Error al obtener partido');
    }
  },

  // GET /partidos/temporada/:temporadaId
  async getByTemporada(req, res) {
    try {
      const { temporadaId } = req.params;
      if (!temporadaId) return sendError(res, 400, 'ID de temporada requerido');

      const partidos = await Models.PartidosModel.getByTemporada(temporadaId);
      sendResponse(res, 200, partidos, 'Partidos obtenidos correctamente');
    } catch (error) {
      console.error('Error en getByTemporada:', error);
      sendError(res, 500, 'Error al obtener partidos');
    }
  },

  // POST /partidos
  async create(req, res) {
    try {
      const { fecha, hora, equipoLocalId, equipoVisitanteId, arenaId, puntosLocal, puntosVisitante, temporadaId } = req.body;

      if (!fecha || !equipoLocalId || !equipoVisitanteId || !temporadaId) {
        return sendError(res, 400, 'Faltan campos requeridos');
      }

      const id = await Models.PartidosModel.create({
        fecha,
        hora,
        equipoLocalId,
        equipoVisitanteId,
        arenaId,
        puntosLocal,
        puntosVisitante,
        temporadaId
      });

      sendResponse(res, 201, { id }, 'Partido creado correctamente');
    } catch (error) {
      console.error('Error en create:', error);
      sendError(res, 500, 'Error al crear partido');
    }
  }
};

// ============================================================
// CLASIFICACION CONTROLLER
// ============================================================

export const ClasificacionController = {
  // GET /clasificacion/:temporadaId
  async getByTemporada(req, res) {
    try {
      const { temporadaId } = req.params;
      if (!temporadaId) return sendError(res, 400, 'ID de temporada requerido');

      const clasificacion = await Models.ClasificacionesModel.getByTemporada(temporadaId);
      sendResponse(res, 200, clasificacion, 'Clasificación obtenida correctamente');
    } catch (error) {
      console.error('Error en getByTemporada:', error);
      sendError(res, 500, 'Error al obtener clasificación');
    }
  }
};

// ============================================================
// RANKING CONTROLLER
// ============================================================

export const RankingController = {
  // GET /ranking/:temporadaId
  async getByTemporada(req, res) {
    try {
      const { temporadaId } = req.params;
      if (!temporadaId) return sendError(res, 400, 'ID de temporada requerido');

      const ranking = await Models.RankingModel.getByTemporada(temporadaId);
      sendResponse(res, 200, ranking, 'Ranking obtenido correctamente');
    } catch (error) {
      console.error('Error en getByTemporada:', error);
      sendError(res, 500, 'Error al obtener ranking');
    }
  }
};

// ============================================================
// PREDICCIONES CONTROLLER
// ============================================================

export const PrediccionesController = {
  // GET /predicciones
  async getAll(req, res) {
    try {
      const predicciones = await Models.PrediccionesModel.getAll();
      sendResponse(res, 200, predicciones, 'Predicciones obtenidas correctamente');
    } catch (error) {
      console.error('Error en getAll:', error);
      sendError(res, 500, 'Error al obtener predicciones');
    }
  },

  // GET /predicciones/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      if (!id) return sendError(res, 400, 'ID de predicción requerido');

      const prediccion = await Models.PrediccionesModel.getById(id);
      if (!prediccion) return sendError(res, 404, 'Predicción no encontrada');

      sendResponse(res, 200, prediccion, 'Predicción obtenida correctamente');
    } catch (error) {
      console.error('Error en getById:', error);
      sendError(res, 500, 'Error al obtener predicción');
    }
  }
};

export default {
  EquiposController,
  ArenasController,
  TemporadasController,
  PartidosController,
  ClasificacionController,
  RankingController,
  PrediccionesController
};
