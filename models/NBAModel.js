/**
 * NBA Backend Models
 * Modelos de acceso a datos
 * ✅ CORREGIDO: Clasificaciones incluye ConferenciaID y DivisionID
 */

import { executeQuery, executeQueryOne } from '../config/db.js';

// ============================================================
// EQUIPOS MODEL
// ============================================================

export const EquiposModel = {
  async getAll() {
    const query = 'SELECT * FROM Equipos ORDER BY Nombre ASC';
    return await executeQuery(query);
  },

  async getById(id) {
    const query = 'SELECT * FROM Equipos WHERE EquipoID = ?';
    return await executeQueryOne(query, [id]);
  },

  async getByConferencia(conferenciaId) {
    const query = 'SELECT * FROM Equipos WHERE ConferenciaID = ? ORDER BY Nombre ASC';
    return await executeQuery(query, [conferenciaId]);
  },

  async getByDivision(divisionId) {
    const query = 'SELECT * FROM Equipos WHERE DivisionID = ? ORDER BY Nombre ASC';
    return await executeQuery(query, [divisionId]);
  },

  async create(data) {
    const query = `
      INSERT INTO Equipos (Nombre, Abreviatura, Ciudad, DivisionID, ConferenciaID, Estado)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await executeQuery(query, [
      data.nombre,
      data.abreviatura,
      data.ciudad,
      data.divisionId,
      data.conferenciaId,
      data.estado || 'Activo'
    ]);
    return result.insertId;
  },

  async update(id, data) {
    const query = `
      UPDATE Equipos
      SET Nombre = ?, Abreviatura = ?, Ciudad = ?, DivisionID = ?, ConferenciaID = ?, Estado = ?
      WHERE EquipoID = ?
    `;
    await executeQuery(query, [
      data.nombre,
      data.abreviatura,
      data.ciudad,
      data.divisionId,
      data.conferenciaId,
      data.estado,
      id
    ]);
    return true;
  },

  async delete(id) {
    const query = 'DELETE FROM Equipos WHERE EquipoID = ?';
    await executeQuery(query, [id]);
    return true;
  }
};

// ============================================================
// ARENAS MODEL
// ============================================================

export const ArenasModel = {
  async getAll() {
    const query = 'SELECT * FROM Arenas ORDER BY Nombre ASC';
    return await executeQuery(query);
  },

  async getById(id) {
    const query = 'SELECT * FROM Arenas WHERE ArenaID = ?';
    return await executeQueryOne(query, [id]);
  },

  async getByCity(city) {
    const query = 'SELECT * FROM Arenas WHERE Ciudad = ? ORDER BY Nombre ASC';
    return await executeQuery(query, [city]);
  },

  async create(data) {
    const query = `
      INSERT INTO Arenas (Nombre, Ciudad, Capacidad, Estado)
      VALUES (?, ?, ?, ?)
    `;
    const result = await executeQuery(query, [
      data.nombre,
      data.ciudad,
      data.capacidad || 0,
      data.estado || 'Abierta'
    ]);
    return result.insertId;
  },

  async update(id, data) {
    const query = `
      UPDATE Arenas
      SET Nombre = ?, Ciudad = ?, Capacidad = ?, Estado = ?
      WHERE ArenaID = ?
    `;
    await executeQuery(query, [
      data.nombre,
      data.ciudad,
      data.capacidad,
      data.estado,
      id
    ]);
    return true;
  },

  async delete(id) {
    const query = 'DELETE FROM Arenas WHERE ArenaID = ?';
    await executeQuery(query, [id]);
    return true;
  }
};

// ============================================================
// TEMPORADAS MODEL
// ============================================================

export const TemporadasModel = {
  async getAll() {
    const query = 'SELECT * FROM Temporadas ORDER BY AnoInicio DESC';
    return await executeQuery(query);
  },

  async getById(id) {
    const query = 'SELECT * FROM Temporadas WHERE TemporadaID = ?';
    return await executeQueryOne(query, [id]);
  },

  async getByNombre(nombre) {
    const query = 'SELECT * FROM Temporadas WHERE Nombre = ?';
    return await executeQueryOne(query, [nombre]);
  },

  async create(data) {
    const query = `
      INSERT INTO Temporadas (Nombre, AnoInicio, AnoFin, Campeon, Subcampeon, MejorEquipo, Estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await executeQuery(query, [
      data.nombre,
      data.anoInicio,
      data.anoFin,
      data.campeon || null,
      data.subcampeon || null,
      data.mejorEquipo || null,
      data.estado || 'Completada'
    ]);
    return result.insertId;
  },

  async update(id, data) {
    const query = `
      UPDATE Temporadas
      SET Nombre = ?, AnoInicio = ?, AnoFin = ?, Campeon = ?, Subcampeon = ?, MejorEquipo = ?, Estado = ?
      WHERE TemporadaID = ?
    `;
    await executeQuery(query, [
      data.nombre,
      data.anoInicio,
      data.anoFin,
      data.campeon,
      data.subcampeon,
      data.mejorEquipo,
      data.estado,
      id
    ]);
    return true;
  },

  async delete(id) {
    const query = 'DELETE FROM Temporadas WHERE TemporadaID = ?';
    await executeQuery(query, [id]);
    return true;
  }
};

// ============================================================
// PARTIDOS MODEL
// ============================================================

export const PartidosModel = {
  async getAll(limit = 1000) {
    const safeLimit = Math.max(1, Math.min(10000, parseInt(limit, 10) || 1000));
    const query = `
      SELECT p.*, 
             el.Nombre as EquipoLocal, 
             ev.Nombre as EquipoVisitante,
             a.Nombre as Arena
      FROM Partidos p
      LEFT JOIN Equipos el ON p.EquipoLocalID = el.EquipoID
      LEFT JOIN Equipos ev ON p.EquipoVisitanteID = ev.EquipoID
      LEFT JOIN Arenas a ON p.ArenaID = a.ArenaID
      ORDER BY p.Fecha DESC
      LIMIT ${safeLimit}
    `;
    return await executeQuery(query);
  },

  async getById(id) {
    const query = `
      SELECT p.*, 
             el.Nombre as EquipoLocal, 
             ev.Nombre as EquipoVisitante,
             a.Nombre as Arena
      FROM Partidos p
      LEFT JOIN Equipos el ON p.EquipoLocalID = el.EquipoID
      LEFT JOIN Equipos ev ON p.EquipoVisitanteID = ev.EquipoID
      LEFT JOIN Arenas a ON p.ArenaID = a.ArenaID
      WHERE p.PartidoID = ?
    `;
    return await executeQueryOne(query, [id]);
  },

  async getByTemporada(temporadaId) {
    const query = `
      SELECT p.*, 
             el.Nombre as EquipoLocal, 
             ev.Nombre as EquipoVisitante,
             a.Nombre as Arena
      FROM Partidos p
      LEFT JOIN Equipos el ON p.EquipoLocalID = el.EquipoID
      LEFT JOIN Equipos ev ON p.EquipoVisitanteID = ev.EquipoID
      LEFT JOIN Arenas a ON p.ArenaID = a.ArenaID
      WHERE p.TemporadaID = ?
      ORDER BY p.Fecha DESC
    `;
    return await executeQuery(query, [temporadaId]);
  },

  async create(data) {
    const query = `
      INSERT INTO Partidos (Fecha, Hora, EquipoLocalID, EquipoVisitanteID, ArenaID, PuntosLocal, PuntosVisitante, Estado, TemporadaID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await executeQuery(query, [
      data.fecha,
      data.hora || null,
      data.equipoLocalId,
      data.equipoVisitanteId,
      data.arenaId || null,
      data.puntosLocal || 0,
      data.puntosVisitante || 0,
      data.estado || 'Programado',
      data.temporadaId
    ]);
    return result.insertId;
  }
};

// ============================================================
// CLASIFICACIONES MODEL - ✅ CORREGIDO: Incluye ConferenciaID y DivisionID
// ============================================================

export const ClasificacionesModel = {
  async getByTemporada(temporadaId) {
    const query = `
      SELECT 
        e.EquipoID,
        e.Nombre,
        e.Abreviatura,
        e.ConferenciaID,
        e.DivisionID,
        COUNT(CASE WHEN (p.EquipoLocalID = e.EquipoID AND p.PuntosLocal > p.PuntosVisitante) 
                    OR (p.EquipoVisitanteID = e.EquipoID AND p.PuntosVisitante > p.PuntosLocal) THEN 1 END) as Victorias,
        COUNT(CASE WHEN (p.EquipoLocalID = e.EquipoID AND p.PuntosLocal < p.PuntosVisitante) 
                    OR (p.EquipoVisitanteID = e.EquipoID AND p.PuntosVisitante < p.PuntosLocal) THEN 1 END) as Derrotas,
        ROUND(AVG(CASE WHEN p.EquipoLocalID = e.EquipoID THEN p.PuntosLocal 
                       WHEN p.EquipoVisitanteID = e.EquipoID THEN p.PuntosVisitante END), 2) as PPG
      FROM Equipos e
      LEFT JOIN Partidos p ON (p.EquipoLocalID = e.EquipoID OR p.EquipoVisitanteID = e.EquipoID) AND p.TemporadaID = ?
      GROUP BY e.EquipoID, e.Nombre, e.Abreviatura, e.ConferenciaID, e.DivisionID
      ORDER BY Victorias DESC
    `;
    return await executeQuery(query, [temporadaId]);
  }
};

// ============================================================
// RANKING MODEL
// ============================================================

export const RankingModel = {
  async getByTemporada(temporadaId) {
    const query = `
      SELECT 
        ROW_NUMBER() OVER (ORDER BY ROUND(AVG(CASE WHEN p.EquipoLocalID = e.EquipoID THEN p.PuntosLocal 
                                                      WHEN p.EquipoVisitanteID = e.EquipoID THEN p.PuntosVisitante END), 2) DESC) as Posicion,
        e.EquipoID,
        e.Nombre as Equipo,
        e.Abreviatura,
        e.ConferenciaID,
        ROUND(AVG(CASE WHEN p.EquipoLocalID = e.EquipoID THEN p.PuntosLocal 
                       WHEN p.EquipoVisitanteID = e.EquipoID THEN p.PuntosVisitante END), 2) as Puntos
      FROM Equipos e
      LEFT JOIN Partidos p ON (p.EquipoLocalID = e.EquipoID OR p.EquipoVisitanteID = e.EquipoID) AND p.TemporadaID = ?
      GROUP BY e.EquipoID, e.Nombre, e.Abreviatura, e.ConferenciaID
      ORDER BY Puntos DESC
      LIMIT 15
    `;
    return await executeQuery(query, [temporadaId]);
  }
};

// ============================================================
// PREDICCIONES MODEL
// ============================================================

export const PrediccionesModel = {
  async getAll() {
    const query = `
      SELECT 
        pr.PrediccionID,
        pr.PartidoID,
        pr.Confianza,
        pr.Resultado,
        pr.EsCorrecta,
        pr.FechaCreacion,
        ef.Nombre as EquipoFavorito,
        ef.Abreviatura as FavoritoAbr,
        el.Nombre as EquipoLocal,
        ev.Nombre as EquipoVisitante,
        p.Fecha as FechaPartido,
        p.PuntosLocal,
        p.PuntosVisitante,
        p.Estado,
        p.TemporadaID
      FROM Predicciones pr
      LEFT JOIN Partidos p ON pr.PartidoID = p.PartidoID
      LEFT JOIN Equipos ef ON pr.EquipoFavoritoID = ef.EquipoID
      LEFT JOIN Equipos el ON p.EquipoLocalID = el.EquipoID
      LEFT JOIN Equipos ev ON p.EquipoVisitanteID = ev.EquipoID
      ORDER BY pr.FechaCreacion DESC
      LIMIT 200
    `;
    return await executeQuery(query);
  },

  async getById(id) {
    const query = `
      SELECT 
        pr.PrediccionID,
        pr.PartidoID,
        pr.Confianza,
        pr.Resultado,
        pr.EsCorrecta,
        pr.FechaCreacion,
        ef.Nombre as EquipoFavorito,
        el.Nombre as EquipoLocal,
        ev.Nombre as EquipoVisitante,
        p.Fecha as FechaPartido,
        p.PuntosLocal,
        p.PuntosVisitante,
        p.Estado
      FROM Predicciones pr
      LEFT JOIN Partidos p ON pr.PartidoID = p.PartidoID
      LEFT JOIN Equipos ef ON pr.EquipoFavoritoID = ef.EquipoID
      LEFT JOIN Equipos el ON p.EquipoLocalID = el.EquipoID
      LEFT JOIN Equipos ev ON p.EquipoVisitanteID = ev.EquipoID
      WHERE pr.PrediccionID = ?
    `;
    return await executeQueryOne(query, [id]);
  }
};

export default {
  EquiposModel,
  ArenasModel,
  TemporadasModel,
  PartidosModel,
  ClasificacionesModel,
  RankingModel,
  PrediccionesModel
};
