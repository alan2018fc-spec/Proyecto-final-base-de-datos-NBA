/**
 * NBA Analytics Pro - Backend Server
 * ✅ Sirve el frontend automáticamente
 * ✅ CORS configurado correctamente
 * ✅ Rutas API funcionando
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './config/db.js';
import NBARoutes from './routes/NBARoutes.js';

// Configurar variables de entorno
dotenv.config();

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5010;

// ============================================================
// MIDDLEWARES
// ============================================================

// CORS - permitir todas las conexiones
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'nbadb_frontend')));

// ============================================================
// RUTAS API
// ============================================================

app.use('/api/v1', NBARoutes);

// ============================================================
// RUTA DE SALUD
// ============================================================

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'NBA Analytics Pro Backend - Funcionando correctamente',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ============================================================
// RUTAS DEL FRONTEND (SPA-like)
// ============================================================

const frontendPages = ['equipos', 'partidos', 'clasificacion', 'estadisticas', 'predicciones', 'historial', 'temporadas'];

frontendPages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'nbadb_frontend', `${page}.html`));
    });
});

// Ruta raíz -> index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'nbadb_frontend', 'index.html'));
});

// ============================================================
// MANEJO DE ERRORES
// ============================================================

app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: err.message
    });
});

// 404 - Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.originalUrl}`
    });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

async function startServer() {
    try {
        // Probar conexión a la base de datos
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.warn('⚠️ No se pudo conectar a la base de datos. El servidor iniciará de todos modos.');
        }

        app.listen(PORT, () => {
            console.log('');
            console.log('╔════════════════════════════════════════════════════════╗');
            console.log('║       🏀 NBA ANALYTICS PRO - SERVIDOR INICIADO 🏀      ║');
            console.log('╠════════════════════════════════════════════════════════╣');
            console.log(`║ Puerto:        ${PORT}                                    ║`);
            console.log(`║ Base de Datos: ${dbConnected ? '✅ Conectada' : '❌ No conectada'}                    ║`);
            console.log('╠════════════════════════════════════════════════════════╣');
            console.log('║ URLs Disponibles:                                      ║');
            console.log(`║  • Frontend:  http://localhost:${PORT}                    ║`);
            console.log(`║  • API:       http://localhost:${PORT}/api/v1              ║`);
            console.log(`║  • Health:    http://localhost:${PORT}/health              ║`);
            console.log('╚════════════════════════════════════════════════════════╝');
            console.log('');
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();
