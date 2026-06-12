/**
 * Database Connection Configuration
 * Configura la conexión a MySQL con pool de conexiones
 * Utiliza variables de entorno para seguridad
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Crear pool de conexiones MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'NBADB',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

/**
 * Prueba la conexión a la base de datos
 * Se ejecuta al iniciar el servidor
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error.message);
    return false;
  }
}

/**
 * Obtiene una conexión del pool
 * @returns {Promise<Connection>} Conexión a la base de datos
 */
export async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Error obteniendo conexión:', error);
    throw error;
  }
}

/**
 * Ejecuta una consulta en la base de datos
 * @param {string} query - Consulta SQL
 * @param {Array} values - Parámetros para la consulta
 * @returns {Promise<Array>} Resultados de la consulta
 */
export async function executeQuery(query, values = []) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(query, values);
    return results;
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * Ejecuta una consulta y retorna una sola fila
 * @param {string} query - Consulta SQL
 * @param {Array} values - Parámetros para la consulta
 * @returns {Promise<Object>} Primera fila de resultados
 */
export async function executeQueryOne(query, values = []) {
  const results = await executeQuery(query, values);
  return results.length > 0 ? results[0] : null;
}

/**
 * Cierra el pool de conexiones
 */
export async function closePool() {
  try {
    await pool.end();
    console.log('Pool de conexiones cerrado');
  } catch (error) {
    console.error('Error cerrando pool:', error);
  }
}

export default pool;
