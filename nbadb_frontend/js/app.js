/**
 * NBA Analytics Pro - app.js UNIFICADO Y COMPLETAMENTE FUNCIONAL
 * ✅ Soporta TODAS las páginas: dashboard, equipos, partidos, clasificacion, estadisticas, predicciones, historial, temporadas
 * ✅ IDs correctos alineados con el HTML real
 * ✅ Filtros funcionales en todas las páginas
 * ✅ Gráficas, tablas y cards funcionando
 */

const API_BASE_URL = 'http://localhost:5010/api/v1';
const CACHE_DURATION = 5 * 60 * 1000;

let cache = {
    equipos: null,
    arenas: null,
    temporadas: null,
    partidos: null,
    clasificacion: null,
    predicciones: null,
    rankings: null,
    timestamps: {}
};

let filterState = {
    temporada: null,
    conferencia: null,
    division: null,
    equipo: null,
    fechaInicio: null,
    fechaFin: null,
    ppgMin: 0,
    ppgMax: 150,
    confianzaMin: 0
};

let darkMode = localStorage.getItem('darkMode') === 'true';

// ============================================================
// MAPA DE LOGOS OFICIALES NBA
// ============================================================
const TEAM_LOGOS = {
    'Atlanta Hawks': 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png',
    'Boston Celtics': 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    'Brooklyn Nets': 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png',
    'Charlotte Hornets': 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png',
    'Chicago Bulls': 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    'Cleveland Cavaliers': 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png',
    'Dallas Mavericks': 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
    'Denver Nuggets': 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
    'Detroit Pistons': 'https://a.espncdn.com/i/teamlogos/nba/500/det.png',
    'Golden State Warriors': 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png',
    'Houston Rockets': 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png',
    'Indiana Pacers': 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png',
    'LA Clippers': 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png',
    'Los Angeles Lakers': 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
    'Memphis Grizzlies': 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png',
    'Miami Heat': 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
    'Milwaukee Bucks': 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png',
    'Minnesota Timberwolves': 'https://a.espncdn.com/i/teamlogos/nba/500/min.png',
    'New Orleans Pelicans': 'https://a.espncdn.com/i/teamlogos/nba/500/no.png',
    'New York Knicks': 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png',
    'Oklahoma City Thunder': 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png',
    'Orlando Magic': 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png',
    'Philadelphia 76ers': 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png',
    'Phoenix Suns': 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png',
    'Portland Trail Blazers': 'https://a.espncdn.com/i/teamlogos/nba/500/por.png',
    'Sacramento Kings': 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png',
    'San Antonio Spurs': 'https://a.espncdn.com/i/teamlogos/nba/500/sa.png',
    'Toronto Raptors': 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png',
    'Utah Jazz': 'https://a.espncdn.com/i/teamlogos/nba/500/utah.png',
    'Washington Wizards': 'https://a.espncdn.com/i/teamlogos/nba/500/wsh.png'
};

function getTeamLogo(teamName) {
    return TEAM_LOGOS[teamName] || 'https://a.espncdn.com/i/teamlogos/nba/500/nba.png';
}

// ============================================================
// UTILIDADES DE API
// ============================================================

async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const result = await response.json();
        return result.data || result;
    } catch (error) {
        console.error(`Error en API call ${endpoint}:`, error);
        return null;
    }
}

async function getCachedData(key, endpoint) {
    const now = Date.now();
    const cached = cache[key];
    const timestamp = cache.timestamps[key];
    if (cached && timestamp && (now - timestamp) < CACHE_DURATION) {
        return cached;
    }
    const data = await apiCall(endpoint);
    if (data) {
        cache[key] = data;
        cache.timestamps[key] = now;
    }
    return data || [];
}

// ============================================================
// UTILIDADES DE UI
// ============================================================

function formatDate(date) {
    if (!date) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('es-ES', options);
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${message}</span>`;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 25px;
        border-radius: 10px; color: white; font-weight: bold; z-index: 10000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? 'linear-gradient(135deg, #00D9FF, #B537F2)' :
                     type === 'error' ? 'linear-gradient(135deg, #FF006E, #FF4444)' :
                     'linear-gradient(135deg, #667eea, #764ba2)'};
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================================
// GRÁFICAS (Chart.js)
// ============================================================

let chartInstances = {};

function createChart(canvasId, type, labels, datasets, titles) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const colors = ['#00D9FF', '#FF006E', '#B537F2', '#FFD700', '#00FF88'];
    const bgColors = [
        'rgba(0, 217, 255, 0.15)',
        'rgba(255, 0, 110, 0.15)',
        'rgba(181, 55, 242, 0.15)',
        'rgba(255, 215, 0, 0.15)',
        'rgba(0, 255, 136, 0.15)'
    ];

    try {
        chartInstances[canvasId] = new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: datasets.map((data, idx) => ({
                    label: Array.isArray(titles) ? titles[idx] : titles,
                    data: data,
                    borderColor: colors[idx % 5],
                    backgroundColor: bgColors[idx % 5],
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top', labels: { color: '#ffffff' } }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#aaaaaa' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { ticks: { color: '#aaaaaa' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });
    } catch (error) {
        console.error(`Error creando gráfica ${canvasId}:`, error);
    }
}

// ============================================================
// DARK MODE
// ============================================================

function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) toggle.textContent = darkMode ? '☀️' : '🌙';
}

function initDarkMode() {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
        toggle.textContent = darkMode ? '☀️' : '🌙';
        toggle.addEventListener('click', toggleDarkMode);
    }
}

// ============================================================
// AUTOCOMPLETE SEARCH
// ============================================================

let allEquipos = [];

async function initAutocomplete() {
    try {
        allEquipos = await getCachedData('equipos', '/equipos');
        const searchInputs = document.querySelectorAll('[data-autocomplete="equipo"]');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => showAutocompleteOptions(e.target, allEquipos));
            input.addEventListener('blur', () => {
                setTimeout(() => {
                    const dropdown = input.nextElementSibling;
                    if (dropdown && dropdown.classList.contains('autocomplete-dropdown')) {
                        dropdown.style.display = 'none';
                    }
                }, 200);
            });
        });
    } catch (error) {
        console.error('Error inicializando autocomplete:', error);
    }
}

function showAutocompleteOptions(input, options) {
    const searchTerm = input.value.toLowerCase();
    let dropdown = input.nextElementSibling;
    if (!dropdown || !dropdown.classList.contains('autocomplete-dropdown')) {
        dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        input.parentNode.insertBefore(dropdown, input.nextSibling);
    }
    if (searchTerm.length === 0) { dropdown.style.display = 'none'; return; }
    const filtered = options.filter(opt => opt.Nombre.toLowerCase().includes(searchTerm));
    if (filtered.length === 0) { dropdown.style.display = 'none'; return; }
    let html = '';
    filtered.slice(0, 8).forEach(equipo => {
        const logo = getTeamLogo(equipo.Nombre);
        html += `<div class="autocomplete-item" onclick="selectEquipo(this, '${equipo.Nombre}', '${equipo.EquipoID}')">
            <img src="${logo}" alt="${equipo.Nombre}" style="width: 30px; height: 30px; margin-right: 10px;">
            <span>${equipo.Nombre}</span>
        </div>`;
    });
    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
}

function selectEquipo(element, nombre, id) {
    const input = element.parentElement.previousElementSibling;
    input.value = nombre;
    input.dataset.equipoId = id;
    element.parentElement.style.display = 'none';
}

// ============================================================
// CARGA DE TEMPORADAS EN SELECT
// ============================================================

async function loadTemporadasSelect() {
    try {
        console.log('Cargando temporadas...');
        const response = await fetch(`${API_BASE_URL}/temporadas`);
        const result = await response.json();
        const temporadas = result.data || result;

        // Buscar TODOS los selects de temporada posibles en la página
        const selectIds = ['temporada-select', 'temporada-filter'];
        let selectFound = null;

        for (const id of selectIds) {
            const el = document.getElementById(id);
            if (el) {
                selectFound = el;
                break;
            }
        }

        if (!selectFound) {
            console.warn('No se encontró ningún select de temporada en esta página');
            return;
        }

        if (!temporadas || !Array.isArray(temporadas) || temporadas.length === 0) {
            selectFound.innerHTML = '<option value="">No hay temporadas disponibles</option>';
            return;
        }

        selectFound.innerHTML = '<option value="">Seleccionar temporada...</option>';
        temporadas.forEach(temporada => {
            const option = document.createElement('option');
            option.value = temporada.TemporadaID;
            option.textContent = temporada.Nombre;
            selectFound.appendChild(option);
        });

        // Seleccionar la temporada más reciente por defecto
        if (temporadas.length > 0) {
            selectFound.value = temporadas[0].TemporadaID;
            filterState.temporada = temporadas[0].TemporadaID;
        }

        selectFound.addEventListener('change', (e) => {
            filterState.temporada = e.target.value;
            console.log('Temporada seleccionada:', filterState.temporada);
        });

        cache.temporadas = temporadas;
        cache.timestamps.temporadas = Date.now();
        console.log('✅ Temporadas cargadas correctamente:', temporadas.length);

    } catch (error) {
        console.error('❌ Error al cargar temporadas:', error);
        const sel = document.getElementById('temporada-select') || document.getElementById('temporada-filter');
        if (sel) sel.innerHTML = '<option value="">Error al cargar temporadas</option>';
    }
}

// ============================================================
// CARGA DE EQUIPOS EN SELECT (para páginas que lo necesitan)
// ============================================================

async function loadEquiposSelect() {
    const selectEquipo = document.getElementById('equipo-filter');
    if (!selectEquipo) return;

    try {
        const equipos = await getCachedData('equipos', '/equipos');
        if (!equipos || equipos.length === 0) return;

        selectEquipo.innerHTML = '<option value="">Todos los equipos</option>';
        equipos.forEach(equipo => {
            const option = document.createElement('option');
            option.value = equipo.EquipoID;
            option.textContent = equipo.Nombre;
            selectEquipo.appendChild(option);
        });

        selectEquipo.addEventListener('change', (e) => {
            filterState.equipo = e.target.value;
        });
    } catch (error) {
        console.error('Error cargando equipos en select:', error);
    }
}

// ============================================================
// LECTURA DE FILTROS (compatible con todos los IDs del HTML)
// ============================================================

function readFilterValues() {
    // Temporada (puede ser temporada-select o temporada-filter)
    const selTemp = document.getElementById('temporada-select') || document.getElementById('temporada-filter');
    if (selTemp) filterState.temporada = selTemp.value || null;

    // Conferencia (ID real en HTML: conferencia-filter)
    const selConf = document.getElementById('conferencia-filter') || document.getElementById('conferencia-select');
    if (selConf) filterState.conferencia = selConf.value || null;

    // Division
    const selDiv = document.getElementById('division-filter');
    if (selDiv) filterState.division = selDiv.value || null;

    // Equipo
    const selEquipo = document.getElementById('equipo-filter');
    if (selEquipo) filterState.equipo = selEquipo.value || null;

    // Fecha inicio
    const fechaInicio = document.getElementById('fecha-inicio') || document.getElementById('fecha-filter');
    if (fechaInicio) filterState.fechaInicio = fechaInicio.value || null;

    // Fecha fin
    const fechaFin = document.getElementById('fecha-fin');
    if (fechaFin) filterState.fechaFin = fechaFin.value || null;

    // PPG min/max
    const ppgMin = document.getElementById('ppg-min');
    if (ppgMin) filterState.ppgMin = parseFloat(ppgMin.value) || 0;
    const ppgMax = document.getElementById('ppg-max');
    if (ppgMax) filterState.ppgMax = parseFloat(ppgMax.value) || 150;

    // Confianza (puede ser range #confianza-min o select #confianza-filter)
    const confRange = document.getElementById('confianza-min');
    const confSelect = document.getElementById('confianza-filter');
    if (confRange) {
        filterState.confianzaMin = parseFloat(confRange.value) || 0;
    } else if (confSelect) {
        filterState.confianzaMin = parseFloat(confSelect.value) || 0;
    }

    console.log('📋 Filtros leídos:', filterState);
}

// ============================================================
// APLICAR FILTROS
// ============================================================

async function applyFilters() {
    try {
        console.log('🔄 Aplicando filtros...');
        showNotification('Aplicando filtros...', 'info');
        readFilterValues();

        // Limpiar cache
        cache.partidos = null;
        cache.clasificacion = null;
        cache.rankings = null;
        cache.timestamps.partidos = null;
        cache.timestamps.clasificacion = null;
        cache.timestamps.rankings = null;

        const currentPage = document.body.getAttribute('data-page') || 'dashboard';

        switch (currentPage) {
            case 'dashboard': await loadDashboardData(); break;
            case 'partidos': await loadPartidosPage(); break;
            case 'clasificacion': await loadClasificacionPage(); break;
            case 'estadisticas': await loadEstadisticasPage(); break;
            case 'predicciones': await loadPrediccionesPage(); break;
            case 'equipos': await loadEquiposPage(); break;
            case 'historial': await loadHistorialPage(); break;
            case 'temporadas': await loadTemporadasPage(); break;
        }

        showNotification('Filtros aplicados correctamente', 'success');
        console.log('✅ Filtros aplicados correctamente');
    } catch (error) {
        console.error('❌ Error aplicando filtros:', error);
        showNotification('Error al aplicar filtros', 'error');
    }
}

// ============================================================
// PÁGINA: DASHBOARD
// ============================================================

async function loadDashboardData() {
    await loadStats();
    await loadAdvancedCharts();
    await loadDataTable();
    await loadRecentGames();
    await loadTopTeams();
    await loadPredictions();
    await loadH2HTeams();
}

async function loadStats() {
    try {
        const equipos = await getCachedData('equipos', '/equipos');
        const arenas = await getCachedData('arenas', '/arenas');
        const partidos = await getCachedData('partidos', '/partidos?limit=10000');
        const predicciones = await getCachedData('predicciones', '/predicciones');

        if (equipos && equipos.length > 0) animateValue('total-equipos', 0, equipos.length, 1500);
        if (arenas && arenas.length > 0) animateValue('total-arenas', 0, arenas.length, 1500);
        if (partidos && partidos.length > 0) {
            animateValue('total-partidos', 0, partidos.length, 2000);
        }
        if (predicciones && predicciones.length > 0) {
            animateValue('total-predicciones', 0, predicciones.length, 2000);
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

async function loadAdvancedCharts() {
    try {
        const temporadaId = filterState.temporada || 1;

        // Gráfica PPG Top 5
        const rankings = await apiCall(`/ranking/${temporadaId}`);
        if (rankings && rankings.length > 0) {
            const top5 = rankings.slice(0, 5);
            createChart('ppgTrendChart', 'bar', top5.map(r => r.Equipo || r.Nombre || 'N/A'), [top5.map(r => r.Puntos || 0)], ['Top 5 PPG']);

            // Top 10 equipos
            const top10 = rankings.slice(0, 10);
            createChart('topEquiposChart', 'bar', top10.map(r => r.Equipo || r.Nombre || 'N/A'), [top10.map(r => r.Puntos || 0)], ['PPG']);
        }

        // Gráfica de conferencias
        const clasificacion = await apiCall(`/clasificacion/${temporadaId}`);
        if (clasificacion && clasificacion.length > 0) {
            const top10 = clasificacion.slice(0, 10);
            createChart('conferenceChart', 'bar',
                top10.map(c => c.Abreviatura || c.Nombre || 'N/A'),
                [top10.map(c => c.Victorias || 0), top10.map(c => c.Derrotas || 0)],
                ['Victorias', 'Derrotas']
            );

            // Distribución de victorias
            createChart('victoriasChart', 'doughnut',
                clasificacion.slice(0, 8).map(c => c.Abreviatura || c.Nombre || 'N/A'),
                [clasificacion.slice(0, 8).map(c => c.Victorias || 0)],
                ['Victorias']
            );
        }

        // Predicciones accuracy chart
        const predicciones = await getCachedData('predicciones', '/predicciones');
        if (predicciones && predicciones.length > 0) {
            const confianzaRanges = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'];
            const counts = [0, 0, 0, 0, 0];
            predicciones.forEach(p => {
                const conf = p.Confianza || 0;
                if (conf <= 20) counts[0]++;
                else if (conf <= 40) counts[1]++;
                else if (conf <= 60) counts[2]++;
                else if (conf <= 80) counts[3]++;
                else counts[4]++;
            });
            createChart('predictionAccuracyChart', 'bar', confianzaRanges, [counts], ['Predicciones por Confianza']);
        }

        // Points distribution chart
        const partidos = await getCachedData('partidos', '/partidos?limit=10000');
        if (partidos && partidos.length > 0) {
            const ranges = ['80-90', '90-100', '100-110', '110-120', '120-130', '130+'];
            const localCounts = [0, 0, 0, 0, 0, 0];
            partidos.forEach(p => {
                const pts = p.PuntosLocal || 0;
                if (pts < 90) localCounts[0]++;
                else if (pts < 100) localCounts[1]++;
                else if (pts < 110) localCounts[2]++;
                else if (pts < 120) localCounts[3]++;
                else if (pts < 130) localCounts[4]++;
                else localCounts[5]++;
            });
            createChart('pointsDistributionChart', 'bar', ranges, [localCounts], ['Distribución de Puntos']);
        }

    } catch (error) {
        console.error('Error cargando gráficas:', error);
    }
}

async function loadDataTable() {
    const container = document.getElementById('data-table-container');
    if (!container) return;

    try {
        let partidos = await getCachedData('partidos', '/partidos?limit=100');
        if (!partidos || partidos.length === 0) {
            container.innerHTML = '<p class="text-center">No hay datos de partidos</p>';
            return;
        }

        let html = '<table class="data-table"><thead><tr><th>Fecha</th><th>Local</th><th>Visitante</th><th>Resultado</th></tr></thead><tbody>';
        partidos.slice(0, 20).forEach(p => {
            html += `<tr>
                <td>${formatDate(p.Fecha)}</td>
                <td>${p.EquipoLocal || 'N/A'}</td>
                <td>${p.EquipoVisitante || 'N/A'}</td>
                <td>${p.PuntosLocal || 0} - ${p.PuntosVisitante || 0}</td>
            </tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error cargando tabla:', error);
    }
}

async function loadRecentGames() {
    const container = document.getElementById('recent-games-list');
    if (!container) return;

    try {
        const partidos = await getCachedData('partidos', '/partidos?limit=10');
        if (!partidos || partidos.length === 0) {
            container.innerHTML = '<p class="text-center">No hay resultados recientes</p>';
            return;
        }

        let html = '';
        partidos.slice(0, 10).forEach(p => {
            html += `<div class="game-card">
                <div class="game-date">${formatDate(p.Fecha)}</div>
                <div class="game-teams">
                    <span class="team">${p.EquipoLocal || 'N/A'}</span>
                    <span class="score">${p.PuntosLocal || 0} - ${p.PuntosVisitante || 0}</span>
                    <span class="team">${p.EquipoVisitante || 'N/A'}</span>
                </div>
            </div>`;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Error cargando partidos recientes:', error);
    }
}

async function loadTopTeams() {
    const container = document.getElementById('top-teams-list');
    if (!container) return;

    try {
        const temporadaId = filterState.temporada || 1;
        const rankings = await apiCall(`/ranking/${temporadaId}`);
        if (!rankings || rankings.length === 0) {
            container.innerHTML = '<p class="text-center">No hay datos de equipos</p>';
            return;
        }

        let html = '';
        rankings.slice(0, 6).forEach((team, idx) => {
            const logo = getTeamLogo(team.Equipo || team.Nombre);
            html += `<div class="team-card">
                <div class="team-rank">#${idx + 1}</div>
                <img src="${logo}" alt="${team.Equipo}" style="width: 40px; height: 40px;">
                <div class="team-name">${team.Equipo || team.Nombre || 'N/A'}</div>
                <div class="team-ppg">PPG: ${team.Puntos || 0}</div>
            </div>`;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Error cargando equipos destacados:', error);
    }
}

async function loadPredictions() {
    const container = document.getElementById('predictions-list');
    if (!container) return;

    try {
        const predicciones = await getCachedData('predicciones', '/predicciones');
        if (!predicciones || predicciones.length === 0) {
            container.innerHTML = '<p class="text-center">No hay predicciones disponibles</p>';
            return;
        }

        let html = '';
        predicciones.slice(0, 6).forEach(pred => {
            const titulo = pred.EquipoLocal && pred.EquipoVisitante
                ? `${pred.EquipoLocal} vs ${pred.EquipoVisitante}`
                : `Predicción #${pred.PrediccionID || ''}`;
            html += `<div class="prediction-card">
                <div class="prediction-title">${titulo}</div>
                <div class="prediction-confidence">Confianza: ${pred.Confianza || 0}%</div>
                <div class="prediction-date">${formatDate(pred.FechaCreacion)}</div>
            </div>`;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Error cargando predicciones:', error);
    }
}

async function loadH2HTeams() {
    const select1 = document.getElementById('h2h-team1');
    const select2 = document.getElementById('h2h-team2');
    if (!select1 || !select2) return;

    try {
        const equipos = await getCachedData('equipos', '/equipos');
        if (!equipos) return;

        const buildOptions = (select) => {
            select.innerHTML = '<option value="">Seleccionar equipo</option>';
            equipos.forEach(equipo => {
                const option = document.createElement('option');
                option.value = equipo.EquipoID;
                option.textContent = equipo.Nombre;
                select.appendChild(option);
            });
        };
        buildOptions(select1);
        buildOptions(select2);
    } catch (error) {
        console.error('Error cargando equipos H2H:', error);
    }
}

// ============================================================
// PÁGINA: PARTIDOS
// ============================================================

async function loadPartidosPage() {
    const container = document.getElementById('partidos-list');
    if (!container) return;

    try {
        let endpoint = '/partidos';
        if (filterState.temporada) {
            endpoint = `/partidos/temporada/${filterState.temporada}`;
        }

        let partidos = await apiCall(endpoint);
        if (!partidos || !Array.isArray(partidos)) partidos = [];

        // Filtrar por fecha
        if (filterState.fechaInicio) {
            const fi = new Date(filterState.fechaInicio);
            partidos = partidos.filter(p => new Date(p.Fecha) >= fi);
        }
        if (filterState.fechaFin) {
            const ff = new Date(filterState.fechaFin);
            partidos = partidos.filter(p => new Date(p.Fecha) <= ff);
        }

        // Filtrar por equipo
        if (filterState.equipo) {
            partidos = partidos.filter(p =>
                p.EquipoLocalID == filterState.equipo || p.EquipoVisitanteID == filterState.equipo
            );
        }

        if (partidos.length === 0) {
            container.innerHTML = '<p class="text-center">No hay partidos con los filtros seleccionados</p>';
            return;
        }

        let html = '<table class="data-table"><thead><tr><th>Fecha</th><th>Local</th><th>Visitante</th><th>Resultado</th><th>Arena</th></tr></thead><tbody>';
        partidos.forEach(p => {
            html += `<tr>
                <td>${formatDate(p.Fecha)}</td>
                <td>${p.EquipoLocal || 'N/A'}</td>
                <td>${p.EquipoVisitante || 'N/A'}</td>
                <td>${p.PuntosLocal || 0} - ${p.PuntosVisitante || 0}</td>
                <td>${p.Arena || 'N/A'}</td>
            </tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;

        console.log(`📊 Partidos cargados: ${partidos.length}`);
    } catch (error) {
        console.error('Error cargando partidos:', error);
        container.innerHTML = '<p class="text-center">Error al cargar partidos</p>';
    }
}

// ============================================================
// PÁGINA: CLASIFICACIÓN
// ============================================================

async function loadClasificacionPage() {
    const tbody = document.getElementById('clasificacion-tbody');
    if (!tbody) return;

    try {
        if (!filterState.temporada) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Selecciona una temporada</td></tr>';
            return;
        }

        let clasificacion = await apiCall(`/clasificacion/${filterState.temporada}`);
        if (!clasificacion || !Array.isArray(clasificacion)) clasificacion = [];

        // Filtrar por conferencia
        if (filterState.conferencia) {
            clasificacion = clasificacion.filter(c => c.ConferenciaID == filterState.conferencia);
        }

        // Filtrar por division
        if (filterState.division) {
            clasificacion = clasificacion.filter(c => c.DivisionID == filterState.division);
        }

        if (clasificacion.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay datos de clasificación</td></tr>';
            return;
        }

        let html = '';
        clasificacion.forEach((equipo, idx) => {
            const totalGames = (equipo.Victorias || 0) + (equipo.Derrotas || 0);
            const winPct = totalGames > 0 ? ((equipo.Victorias / totalGames) * 100).toFixed(1) : '0.0';
            const confName = equipo.ConferenciaID == 1 ? 'East' : equipo.ConferenciaID == 2 ? 'West' : 'N/A';

            html += `<tr>
                <td>${idx + 1}</td>
                <td>${equipo.Nombre || 'N/A'}</td>
                <td>${confName}</td>
                <td>${equipo.DivisionID || 'N/A'}</td>
                <td>${equipo.Victorias || 0}</td>
                <td>${equipo.Derrotas || 0}</td>
                <td>${winPct}%</td>
            </tr>`;
        });
        tbody.innerHTML = html;

        console.log(`📊 Clasificación cargada: ${clasificacion.length} equipos`);
    } catch (error) {
        console.error('Error cargando clasificación:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error al cargar clasificación</td></tr>';
    }
}

// ============================================================
// PÁGINA: ESTADÍSTICAS
// ============================================================

async function loadEstadisticasPage() {
    const tbody = document.getElementById('stats-tbody');

    try {
        if (!filterState.temporada) {
            if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="text-center">Selecciona una temporada</td></tr>';
            return;
        }

        const rankings = await apiCall(`/ranking/${filterState.temporada}`);
        if (!rankings || !Array.isArray(rankings) || rankings.length === 0) {
            if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay datos de estadísticas</td></tr>';
            return;
        }

        // Filtrar por PPG
        let data = rankings.filter(r => {
            const puntos = r.Puntos || 0;
            return puntos >= filterState.ppgMin && puntos <= filterState.ppgMax;
        });

        // Filtrar por equipo
        if (filterState.equipo) {
            data = data.filter(r => r.EquipoID == filterState.equipo);
        }

        // Actualizar cards de estadísticas
        if (data.length > 0) {
            const ppgs = data.map(r => r.Puntos || 0);
            const avgPPG = (ppgs.reduce((a, b) => a + b, 0) / ppgs.length).toFixed(2);
            const maxPPG = Math.max(...ppgs).toFixed(2);
            const minPPG = Math.min(...ppgs).toFixed(2);

            const avgEl = document.getElementById('avg-ppg');
            const maxEl = document.getElementById('max-ppg');
            const minEl = document.getElementById('min-ppg');
            const totalEl = document.getElementById('total-games');

            if (avgEl) avgEl.textContent = avgPPG;
            if (maxEl) maxEl.textContent = maxPPG;
            if (minEl) minEl.textContent = minPPG;
            if (totalEl) totalEl.textContent = data.length;
        }

        // Llenar tabla
        if (tbody) {
            let html = '';
            data.forEach((equipo, idx) => {
                html += `<tr>
                    <td>${idx + 1}</td>
                    <td>${equipo.Equipo || equipo.Nombre || 'N/A'}</td>
                    <td>${equipo.Abreviatura || 'N/A'}</td>
                    <td>${equipo.Puntos || 0}</td>
                </tr>`;
            });
            tbody.innerHTML = html;
        }

        // Actualizar gráficas de estadísticas
        if (data.length > 0) {
            const top5 = data.slice(0, 5);
            createChart('ppgTrendChart', 'bar',
                top5.map(r => r.Equipo || r.Nombre || 'N/A'),
                [top5.map(r => r.Puntos || 0)],
                ['PPG']
            );

            createChart('pointsDistributionChart', 'line',
                data.slice(0, 10).map(r => r.Equipo || r.Nombre || 'N/A'),
                [data.slice(0, 10).map(r => r.Puntos || 0)],
                ['Distribución PPG']
            );
        }

        console.log(`📊 Estadísticas cargadas: ${data.length} equipos`);
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="text-center">Error al cargar estadísticas</td></tr>';
    }
}

// ============================================================
// PÁGINA: PREDICCIONES
// ============================================================

async function loadPrediccionesPage() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const predictionsSection = mainContent.querySelector('.predictions-section');
    const tableSection = mainContent.querySelector('.data-table-section');

    // ── Generador on-demand (parte superior) ──────────────────────────
    if (predictionsSection) {
        predictionsSection.innerHTML = `
            <div style="background:var(--card-bg,#12213a);border:1px solid var(--border-color,#1e3a5f);border-radius:12px;padding:1.5rem;margin-bottom:1.5rem;">
                <h2 style="margin-bottom:1rem;font-size:1.2rem;">⚡ Generar Predicción</h2>
                <div style="display:flex;gap:1rem;align-items:flex-end;flex-wrap:wrap;">
                    <div style="flex:1;min-width:180px;">
                        <label style="display:block;font-size:0.8rem;margin-bottom:4px;color:var(--text-muted,#8fa3bc);">🏠 EQUIPO LOCAL</label>
                        <select id="pred-team-local" class="filter-select" style="width:100%;"><option value="">Seleccionar...</option></select>
                    </div>
                    <div style="font-size:1.5rem;font-weight:bold;padding-bottom:6px;color:var(--accent,#00d4ff);">VS</div>
                    <div style="flex:1;min-width:180px;">
                        <label style="display:block;font-size:0.8rem;margin-bottom:4px;color:var(--text-muted,#8fa3bc);">✈️ EQUIPO VISITANTE</label>
                        <select id="pred-team-visitante" class="filter-select" style="width:100%;"><option value="">Seleccionar...</option></select>
                    </div>
                    <button class="btn-primary" id="btn-generar-prediccion" style="white-space:nowrap;">🤖 Predecir</button>
                </div>
            </div>
            <div id="prediction-result"></div>
        `;
    }

    // ── Tabla de predicciones reales de la BD ─────────────────────────
    if (tableSection) {
        tableSection.style.display = 'block';
        tableSection.innerHTML = `
            <h2 class="section-title">📋 Tabla de Predicciones</h2>
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Partido</th>
                            <th>Favorito</th>
                            <th>Resultado Predicho</th>
                            <th>Confianza</th>
                            <th>Acierto</th>
                            <th>Fecha Partido</th>
                        </tr>
                    </thead>
                    <tbody id="predictions-tbody">
                        <tr><td colspan="6" class="text-center">Cargando predicciones...</td></tr>
                    </tbody>
                </table>
            </div>`;
    }

    // Cargar datos en paralelo
    try {
        const [equipos, predicciones] = await Promise.all([
            getCachedData('equipos', '/equipos'),
            apiCall('/predicciones')
        ]);

        // Rellenar selects del generador
        if (equipos && equipos.length > 0) {
            const opts = equipos.map(e => `<option value="${e.EquipoID}">${e.Nombre}</option>`).join('');
            const selLocal = document.getElementById('pred-team-local');
            const selVisit = document.getElementById('pred-team-visitante');
            if (selLocal) selLocal.innerHTML = '<option value="">Seleccionar...</option>' + opts;
            if (selVisit) selVisit.innerHTML = '<option value="">Seleccionar...</option>' + opts;
        }

        // Rellenar tabla de predicciones de la BD
        const tbody = document.getElementById('predictions-tbody');
        if (tbody) {
            const preds = Array.isArray(predicciones) ? predicciones : [];
            if (preds.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay predicciones</td></tr>';
            } else {
                tbody.innerHTML = preds.map(p => {
                    const partido = p.EquipoLocal && p.EquipoVisitante
                        ? `${p.EquipoLocal} vs ${p.EquipoVisitante}`
                        : `Predicción #${p.PrediccionID}`;
                    const resultado = p.Resultado || 'N/A';
                    const confianza = p.Confianza ? `${parseFloat(p.Confianza).toFixed(1)}%` : '—';
                    const acierto = p.EsCorrecta === 1 || p.EsCorrecta === true ? '✅ Correcto'
                                  : p.EsCorrecta === 0 || p.EsCorrecta === false ? '❌ Incorrecto'
                                  : 'Pendiente';
                    const fecha = p.FechaPartido ? new Date(p.FechaPartido).toLocaleDateString('es-ES', {day:'numeric',month:'short',year:'numeric'}) : '—';
                    const favorito = p.EquipoFavorito || '—';
                    return `<tr>
                        <td>${partido}</td>
                        <td>${favorito}</td>
                        <td>${resultado}</td>
                        <td style="color:${parseFloat(p.Confianza)>=90?'#1aad6c':parseFloat(p.Confianza)>=80?'#f59e0b':'inherit'}">${confianza}</td>
                        <td>${acierto}</td>
                        <td>${fecha}</td>
                    </tr>`;
                }).join('');
            }
        }
    } catch (e) {
        console.error('Error cargando predicciones:', e);
    }

    // Event listener del botón generador
    const btnPred = document.getElementById('btn-generar-prediccion');
    if (btnPred) btnPred.addEventListener('click', generarPrediccion);
}

async function generarPrediccion() {
    const localId = document.getElementById('pred-team-local')?.value;
    const visitanteId = document.getElementById('pred-team-visitante')?.value;
    const resultDiv = document.getElementById('prediction-result');

    if (!localId || !visitanteId) {
        if (resultDiv) resultDiv.innerHTML = '<p class="text-center" style="color:#f87171;">Selecciona ambos equipos.</p>';
        return;
    }
    if (localId === visitanteId) {
        if (resultDiv) resultDiv.innerHTML = '<p class="text-center" style="color:#f87171;">Los equipos deben ser diferentes.</p>';
        return;
    }

    if (resultDiv) resultDiv.innerHTML = '<p class="text-center">Calculando predicción...</p>';

    try {
        const [equipos, partidos] = await Promise.all([
            getCachedData('equipos', '/equipos'),
            getCachedData('partidos', '/partidos?limit=10000')
        ]);

        const teamLocal = equipos.find(e => e.EquipoID == localId);
        const teamVisit = equipos.find(e => e.EquipoID == visitanteId);
        if (!teamLocal || !teamVisit) return;

        // Calcular stats de cada equipo a partir de los partidos disponibles
        const calcStats = (teamId) => {
            const games = (partidos || []).filter(p =>
                p.EquipoLocalID == teamId || p.EquipoVisitanteID == teamId
            );
            if (games.length === 0) return { wins: 0, losses: 0, avgPts: 100, winPct: 0.5 };
            let wins = 0, totalPts = 0;
            games.forEach(p => {
                const isLocal = p.EquipoLocalID == teamId;
                const myPts = isLocal ? p.PuntosLocal : p.PuntosVisitante;
                const oppPts = isLocal ? p.PuntosVisitante : p.PuntosLocal;
                totalPts += myPts || 0;
                if ((myPts || 0) > (oppPts || 0)) wins++;
            });
            return {
                wins,
                losses: games.length - wins,
                avgPts: +(totalPts / games.length).toFixed(1),
                winPct: +(wins / games.length).toFixed(3),
                games: games.length
            };
        };

        const sLocal = calcStats(localId);
        const sVisit = calcStats(visitanteId);

        // Motor de predicción: winPct 40% + avg puntos ofensivos 35% + ventaja local 25%
        const HOME_BONUS = 0.06;
        const scoreLocal = (sLocal.winPct * 0.40) + (sLocal.avgPts / 200 * 0.35) + HOME_BONUS;
        const scoreVisit = (sVisit.winPct * 0.40) + (sVisit.avgPts / 200 * 0.35);
        const total = scoreLocal + scoreVisit || 1;
        const probLocal = Math.min(0.95, Math.max(0.05, scoreLocal / total));
        const probVisit = 1 - probLocal;
        const ganador = probLocal >= probVisit ? teamLocal.Nombre : teamVisit.Nombre;
        const confianza = Math.round(Math.max(probLocal, probVisit) * 100);

        // Score estimado coherente con la probabilidad:
        // Punto de partida = promedio de puntos anotados por cada equipo.
        // Ajuste: el equipo favorito recibe +margen proporcional a su ventaja,
        // el perdedor recibe -margen. Esto garantiza que el ganador > puntos del perdedor.
        const NBA_AVG = 112; // base NBA si no hay datos
        const baseLocal = sLocal.avgPts > 0 ? sLocal.avgPts : NBA_AVG;
        const baseVisit = sVisit.avgPts > 0 ? sVisit.avgPts : NBA_AVG;
        const avgBase = (baseLocal + baseVisit) / 2;
        // Diferencia de probabilidad determina el margen (máx ~15 puntos)
        const probDiff = Math.abs(probLocal - probVisit); // 0 a 0.9
        const margin = Math.round(probDiff * 28); // escala: 0.5 diff → ~14 pts
        const localIsWinner = probLocal >= probVisit;
        // El favorito toma la base más alta, el otro la más baja, separados por margin
        const winnerBase = Math.max(baseLocal, baseVisit, avgBase + margin / 2);
        const loserBase  = Math.min(baseLocal, baseVisit, avgBase - margin / 2);
        const scoreEstLocal  = Math.round(localIsWinner ? winnerBase : loserBase);
        const scoreEstVisit  = Math.round(localIsWinner ? loserBase  : winnerBase);

        // Partidos directos entre estos dos equipos
        const h2hGames = (partidos || []).filter(p =>
            (p.EquipoLocalID == localId && p.EquipoVisitanteID == visitanteId) ||
            (p.EquipoLocalID == visitanteId && p.EquipoVisitanteID == localId)
        );
        let h2hLocalWins = 0, h2hVisitWins = 0;
        h2hGames.forEach(p => {
            if (p.EquipoLocalID == localId) {
                if (p.PuntosLocal > p.PuntosVisitante) h2hLocalWins++; else h2hVisitWins++;
            } else {
                if (p.PuntosVisitante > p.PuntosLocal) h2hLocalWins++; else h2hVisitWins++;
            }
        });

        const barWidth = Math.round(probLocal * 100);
        const h2hInfo = h2hGames.length > 0
            ? `<div style="margin-top:1rem;font-size:0.85rem;color:var(--text-muted,#8fa3bc);">
                  ⚔️ Enfrentamientos directos: <strong>${h2hGames.length}</strong> —
                  ${teamLocal.Nombre} ganó <strong>${h2hLocalWins}</strong>,
                  ${teamVisit.Nombre} ganó <strong>${h2hVisitWins}</strong>
               </div>`
            : `<div style="margin-top:1rem;font-size:0.85rem;color:var(--text-muted,#8fa3bc);">ℹ️ Sin enfrentamientos directos registrados. Predicción basada en rendimiento individual.</div>`;

        if (resultDiv) {
            resultDiv.innerHTML = `
            <div style="background:var(--card-bg,#12213a);border:1px solid var(--border-color,#1e3a5f);border-radius:12px;padding:1.5rem;">
                <h3 style="text-align:center;margin-bottom:1.2rem;">🏀 ${teamLocal.Nombre} vs ${teamVisit.Nombre}</h3>

                <!-- Barra de probabilidad -->
                <div style="margin-bottom:1.2rem;">
                    <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:4px;">
                        <span>${teamLocal.Nombre} <strong>${Math.round(probLocal*100)}%</strong></span>
                        <span><strong>${Math.round(probVisit*100)}%</strong> ${teamVisit.Nombre}</span>
                    </div>
                    <div style="background:rgba(255,255,255,0.08);border-radius:8px;height:14px;overflow:hidden;">
                        <div style="width:${barWidth}%;height:100%;background:linear-gradient(90deg,#00d4ff,#7c3aed);border-radius:8px;transition:width 0.6s ease;"></div>
                    </div>
                </div>

                <!-- Score estimado y ganador -->
                <div style="display:flex;gap:1rem;justify-content:center;align-items:center;flex-wrap:wrap;margin-bottom:1.2rem;">
                    <div style="text-align:center;min-width:100px;">
                        <div style="font-size:2rem;font-weight:bold;">${scoreEstLocal}</div>
                        <div style="font-size:0.8rem;color:var(--text-muted,#8fa3bc);">${teamLocal.Nombre}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted,#8fa3bc);">${sLocal.wins}V – ${sLocal.losses}D</div>
                    </div>
                    <div style="font-size:1.5rem;color:var(--text-muted,#8fa3bc);">–</div>
                    <div style="text-align:center;min-width:100px;">
                        <div style="font-size:2rem;font-weight:bold;">${scoreEstVisit}</div>
                        <div style="font-size:0.8rem;color:var(--text-muted,#8fa3bc);">${teamVisit.Nombre}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted,#8fa3bc);">${sVisit.wins}V – ${sVisit.losses}D</div>
                    </div>
                </div>

                <!-- Ganador predicho -->
                <div style="text-align:center;background:rgba(0,212,255,0.08);border-radius:8px;padding:0.75rem;margin-bottom:0.5rem;">
                    <div style="font-size:0.8rem;color:var(--text-muted,#8fa3bc);margin-bottom:2px;">GANADOR PREDICHO</div>
                    <div style="font-size:1.3rem;font-weight:bold;">🏆 ${ganador}</div>
                    <div style="font-size:0.85rem;margin-top:2px;">Confianza: <strong>${confianza}%</strong></div>
                </div>

                ${h2hInfo}
            </div>`;
        }
    } catch (error) {
        console.error('Error generando predicción:', error);
        if (resultDiv) resultDiv.innerHTML = '<p class="text-center" style="color:#f87171;">Error al calcular la predicción.</p>';
    }
}

// ============================================================
// PÁGINA: EQUIPOS
// ============================================================

async function loadEquiposPage() {
    const grid = document.getElementById('teams-list') || document.getElementById('equipos-grid');
    const tbody = document.getElementById('teams-tbody');

    try {
        let equipos = await getCachedData('equipos', '/equipos');
        if (!equipos || !Array.isArray(equipos)) equipos = [];

        // Filtrar por conferencia
        if (filterState.conferencia) {
            equipos = equipos.filter(e => e.ConferenciaID == filterState.conferencia);
        }

        // Filtrar por division
        if (filterState.division) {
            equipos = equipos.filter(e => e.DivisionID == filterState.division);
        }

        if (equipos.length === 0) {
            if (grid) grid.innerHTML = '<p class="text-center">No hay equipos con los filtros seleccionados</p>';
            if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay equipos</td></tr>';
            return;
        }

        // Renderizar grid de cards
        if (grid) {
            let html = '';
            equipos.forEach(equipo => {
                const logo = getTeamLogo(equipo.Nombre);
                const confName = equipo.ConferenciaID == 1 ? 'Eastern' : equipo.ConferenciaID == 2 ? 'Western' : 'N/A';
                html += `<div class="team-card">
                    <img src="${logo}" alt="${equipo.Nombre}" class="team-logo" style="width: 60px; height: 60px;">
                    <h3>${equipo.Nombre}</h3>
                    <p>${equipo.Ciudad || ''}</p>
                    <span class="badge">${confName}</span>
                </div>`;
            });
            grid.innerHTML = html;
        }

        // Renderizar tabla
        if (tbody) {
            let html = '';
            equipos.forEach((equipo, idx) => {
                const confName = equipo.ConferenciaID == 1 ? 'Eastern' : equipo.ConferenciaID == 2 ? 'Western' : 'N/A';
                html += `<tr>
                    <td>${idx + 1}</td>
                    <td>${equipo.Nombre}</td>
                    <td>${equipo.Abreviatura || 'N/A'}</td>
                    <td>${equipo.Ciudad || 'N/A'}</td>
                    <td>${confName}</td>
                </tr>`;
            });
            tbody.innerHTML = html;
        }

        console.log(`📊 Equipos cargados: ${equipos.length}`);
    } catch (error) {
        console.error('Error cargando equipos:', error);
    }
}

// ============================================================
// PÁGINA: HISTORIAL
// ============================================================

async function loadHistorialPage() {
    const container = document.getElementById('historial-list');

    try {
        let endpoint = '/partidos';
        if (filterState.temporada) {
            endpoint = `/partidos/temporada/${filterState.temporada}`;
        }

        let partidos = await apiCall(endpoint);
        if (!partidos || !Array.isArray(partidos)) partidos = [];

        // Filtrar por equipo
        if (filterState.equipo) {
            partidos = partidos.filter(p =>
                p.EquipoLocalID == filterState.equipo || p.EquipoVisitanteID == filterState.equipo
            );
        }

        // Calcular métricas del historial
        let victorias = 0, derrotas = 0, totalPuntos = 0;
        if (filterState.equipo) {
            partidos.forEach(p => {
                if (p.EquipoLocalID == filterState.equipo) {
                    totalPuntos += p.PuntosLocal || 0;
                    if (p.PuntosLocal > p.PuntosVisitante) victorias++;
                    else derrotas++;
                } else {
                    totalPuntos += p.PuntosVisitante || 0;
                    if (p.PuntosVisitante > p.PuntosLocal) victorias++;
                    else derrotas++;
                }
            });
        }

        // Actualizar métricas
        const totalVicEl = document.getElementById('total-victorias');
        const totalDerEl = document.getElementById('total-derrotas');
        const promPtsEl = document.getElementById('promedio-puntos');
        const pctVicEl = document.getElementById('porcentaje-victorias');

        if (totalVicEl) totalVicEl.textContent = victorias;
        if (totalDerEl) totalDerEl.textContent = derrotas;
        if (promPtsEl) promPtsEl.textContent = partidos.length > 0 ? (totalPuntos / partidos.length).toFixed(1) : '0';
        if (pctVicEl) {
            const total = victorias + derrotas;
            pctVicEl.textContent = total > 0 ? ((victorias / total) * 100).toFixed(1) + '%' : '0%';
        }

        // Renderizar lista de partidos
        if (container) {
            if (partidos.length === 0) {
                container.innerHTML = '<p class="text-center">No hay historial con los filtros seleccionados</p>';
                return;
            }

            let html = '<table class="data-table"><thead><tr><th>Fecha</th><th>Local</th><th>Visitante</th><th>Resultado</th></tr></thead><tbody>';
            partidos.slice(0, 50).forEach(p => {
                html += `<tr>
                    <td>${formatDate(p.Fecha)}</td>
                    <td>${p.EquipoLocal || 'N/A'}</td>
                    <td>${p.EquipoVisitante || 'N/A'}</td>
                    <td>${p.PuntosLocal || 0} - ${p.PuntosVisitante || 0}</td>
                </tr>`;
            });
            html += '</tbody></table>';
            container.innerHTML = html;
        }

        console.log(`📊 Historial cargado: ${partidos.length} partidos`);
    } catch (error) {
        console.error('Error cargando historial:', error);
        if (container) container.innerHTML = '<p class="text-center">Error al cargar historial</p>';
    }
}

// ============================================================
// PÁGINA: TEMPORADAS
// ============================================================

async function loadTemporadasPage() {
    const container = document.getElementById('temporadas-list');
    const playoffsContainer = document.getElementById('playoffs-list');

    try {
        const temporadas = await getCachedData('temporadas', '/temporadas');
        if (!temporadas || temporadas.length === 0) {
            if (container) container.innerHTML = '<p class="text-center">No hay temporadas disponibles</p>';
            return;
        }

        if (container) {
            let html = '';
            temporadas.forEach(temp => {
                html += `<div class="temporada-card">
                    <h3>Temporada ${temp.Nombre}</h3>
                    <p><strong>Inicio:</strong> ${temp.AnoInicio} | <strong>Fin:</strong> ${temp.AnoFin}</p>
                    <p><strong>Estado:</strong> ${temp.Estado || 'N/A'}</p>
                    <p><strong>Campeón:</strong> ${temp.Campeon || 'Por definir'}</p>
                    <p><strong>Subcampeón:</strong> ${temp.Subcampeon || 'Por definir'}</p>
                    <p><strong>Mejor Equipo:</strong> ${temp.MejorEquipo || 'Por definir'}</p>
                </div>`;
            });
            container.innerHTML = html;
        }

        // Playoffs (si hay un contenedor para ello)
        if (playoffsContainer) {
            const completadas = temporadas.filter(t => t.Estado === 'Completada');
            if (completadas.length > 0) {
                let html = '';
                completadas.forEach(temp => {
                    html += `<div class="playoff-card">
                        <h4>${temp.Nombre}</h4>
                        <p>🏆 ${temp.Campeon || 'N/A'} vs ${temp.Subcampeon || 'N/A'}</p>
                    </div>`;
                });
                playoffsContainer.innerHTML = html;
            } else {
                playoffsContainer.innerHTML = '<p class="text-center">No hay datos de playoffs</p>';
            }
        }

        console.log(`📊 Temporadas cargadas: ${temporadas.length}`);
    } catch (error) {
        console.error('Error cargando temporadas:', error);
        if (container) container.innerHTML = '<p class="text-center">Error al cargar temporadas</p>';
    }
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function initEventListeners() {
    // Botón Aplicar Filtros
    const btnAplicar = document.getElementById('btn-aplicar-filtros');
    if (btnAplicar) {
        btnAplicar.addEventListener('click', async () => {
            console.log('🔄 Botón Aplicar Filtros clickeado');
            await applyFilters();
        });
    }

    // Slider de confianza (index.html)
    const confianzaSlider = document.getElementById('confianza-min');
    if (confianzaSlider) {
        confianzaSlider.addEventListener('input', (e) => {
            const label = document.getElementById('confianza-value');
            if (label) label.textContent = `${e.target.value}%`;
            filterState.confianzaMin = parseFloat(e.target.value);
        });
    }

    // Select de confianza (predicciones.html)
    const confianzaSelect = document.getElementById('confianza-filter');
    if (confianzaSelect) {
        confianzaSelect.addEventListener('change', (e) => {
            filterState.confianzaMin = parseFloat(e.target.value) || 0;
        });
    }

    // Conferencia
    const selConf = document.getElementById('conferencia-filter');
    if (selConf) {
        selConf.addEventListener('change', (e) => {
            filterState.conferencia = e.target.value;
        });
    }

    // Division
    const selDiv = document.getElementById('division-filter');
    if (selDiv) {
        selDiv.addEventListener('change', (e) => {
            filterState.division = e.target.value;
        });
    }

    // Equipo
    const selEquipo = document.getElementById('equipo-filter');
    if (selEquipo) {
        selEquipo.addEventListener('change', (e) => {
            filterState.equipo = e.target.value;
        });
    }

    // Fechas
    const fechaInicio = document.getElementById('fecha-inicio') || document.getElementById('fecha-filter');
    if (fechaInicio) {
        fechaInicio.addEventListener('change', (e) => {
            filterState.fechaInicio = e.target.value;
        });
    }
    const fechaFin = document.getElementById('fecha-fin');
    if (fechaFin) {
        fechaFin.addEventListener('change', (e) => {
            filterState.fechaFin = e.target.value;
        });
    }

    // PPG
    const ppgMin = document.getElementById('ppg-min');
    if (ppgMin) {
        ppgMin.addEventListener('change', (e) => {
            filterState.ppgMin = parseFloat(e.target.value) || 0;
        });
    }
    const ppgMax = document.getElementById('ppg-max');
    if (ppgMax) {
        ppgMax.addEventListener('change', (e) => {
            filterState.ppgMax = parseFloat(e.target.value) || 150;
        });
    }

    // H2H Compare button
    const btnH2H = document.getElementById('btn-compare-h2h');
    if (btnH2H) {
        btnH2H.addEventListener('click', compareH2H);
    }

    // Tipo historial
    const tipoHistorial = document.getElementById('tipo-historial');
    if (tipoHistorial) {
        tipoHistorial.addEventListener('change', (e) => {
            // Puede usarse para filtrar tipo de historial
            console.log('Tipo historial:', e.target.value);
        });
    }
}

async function compareH2H() {
    const team1Id = document.getElementById('h2h-team1')?.value;
    const team2Id = document.getElementById('h2h-team2')?.value;
    const resultsDiv = document.getElementById('h2h-results');

    if (!team1Id || !team2Id) {
        if (resultsDiv) resultsDiv.innerHTML = '<p class="text-center">Selecciona dos equipos para comparar</p>';
        return;
    }
    if (team1Id === team2Id) {
        if (resultsDiv) resultsDiv.innerHTML = '<p class="text-center">Selecciona equipos diferentes</p>';
        return;
    }

    if (resultsDiv) resultsDiv.innerHTML = '<p class="text-center">Calculando comparativa...</p>';

    try {
        const [partidos, equipos] = await Promise.all([
            getCachedData('partidos', '/partidos?limit=10000'),
            getCachedData('equipos', '/equipos')
        ]);

        const team1 = equipos?.find(e => e.EquipoID == team1Id);
        const team2 = equipos?.find(e => e.EquipoID == team2Id);
        const team1Name = team1?.Nombre || 'Equipo 1';
        const team2Name = team2?.Nombre || 'Equipo 2';

        // Stats generales de cada equipo
        const calcStats = (teamId) => {
            const games = (partidos || []).filter(p =>
                p.EquipoLocalID == teamId || p.EquipoVisitanteID == teamId
            );
            if (games.length === 0) return { wins: 0, losses: 0, avgPts: 0, avgPtsAllowed: 0, games: 0 };
            let wins = 0, totalPts = 0, totalAllowed = 0;
            games.forEach(p => {
                const isLocal = p.EquipoLocalID == teamId;
                const myPts = isLocal ? (p.PuntosLocal || 0) : (p.PuntosVisitante || 0);
                const oppPts = isLocal ? (p.PuntosVisitante || 0) : (p.PuntosLocal || 0);
                totalPts += myPts;
                totalAllowed += oppPts;
                if (myPts > oppPts) wins++;
            });
            return {
                wins,
                losses: games.length - wins,
                games: games.length,
                avgPts: +(totalPts / games.length).toFixed(1),
                avgPtsAllowed: +(totalAllowed / games.length).toFixed(1),
                winPct: games.length > 0 ? +((wins / games.length) * 100).toFixed(1) : 0
            };
        };

        const s1 = calcStats(team1Id);
        const s2 = calcStats(team2Id);

        // Partidos directos
        const h2hGames = (partidos || []).filter(p =>
            (p.EquipoLocalID == team1Id && p.EquipoVisitanteID == team2Id) ||
            (p.EquipoLocalID == team2Id && p.EquipoVisitanteID == team1Id)
        ).sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));

        let t1Wins = 0, t2Wins = 0;
        h2hGames.forEach(p => {
            if (p.EquipoLocalID == team1Id) {
                if (p.PuntosLocal > p.PuntosVisitante) t1Wins++; else t2Wins++;
            } else {
                if (p.PuntosVisitante > p.PuntosLocal) t1Wins++; else t2Wins++;
            }
        });

        const statRow = (label, v1, v2, higherIsBetter = true) => {
            const better1 = higherIsBetter ? v1 > v2 : v1 < v2;
            const better2 = higherIsBetter ? v2 > v1 : v2 < v1;
            return `<tr>
                <td style="font-weight:${better1?'bold':'normal'};color:${better1?'#00d4ff':'inherit'}">${v1}</td>
                <td style="color:var(--text-muted,#8fa3bc);font-size:0.8rem;text-align:center">${label}</td>
                <td style="font-weight:${better2?'bold':'normal'};color:${better2?'#00d4ff':'inherit'};text-align:right">${v2}</td>
            </tr>`;
        };

        const h2hSection = h2hGames.length > 0 ? `
            <div style="margin-top:1rem;">
                <h4 style="margin-bottom:0.5rem;font-size:0.95rem;">⚔️ Últimos enfrentamientos directos (${h2hGames.length})</h4>
                <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
                    <thead><tr>
                        <th style="text-align:left;padding:4px 8px;color:var(--text-muted,#8fa3bc);">Fecha</th>
                        <th style="padding:4px 8px;color:var(--text-muted,#8fa3bc);">Local</th>
                        <th style="padding:4px 8px;color:var(--text-muted,#8fa3bc);">Resultado</th>
                        <th style="padding:4px 8px;color:var(--text-muted,#8fa3bc);">Visitante</th>
                    </tr></thead>
                    <tbody>
                        ${h2hGames.slice(0, 8).map(p => {
                            const localName = p.EquipoLocal || '';
                            const visitName = p.EquipoVisitante || '';
                            const localWon = p.PuntosLocal > p.PuntosVisitante;
                            return `<tr style="border-top:1px solid rgba(255,255,255,0.05)">
                                <td style="padding:5px 8px;color:var(--text-muted,#8fa3bc)">${p.Fecha ? p.Fecha.split('T')[0] : '—'}</td>
                                <td style="padding:5px 8px;font-weight:${localWon?'bold':'normal'}">${localName}</td>
                                <td style="padding:5px 8px;text-align:center;font-weight:bold">${p.PuntosLocal ?? '—'} – ${p.PuntosVisitante ?? '—'}</td>
                                <td style="padding:5px 8px;font-weight:${!localWon?'bold':'normal'}">${visitName}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>` : `<p style="font-size:0.85rem;color:var(--text-muted,#8fa3bc);margin-top:0.75rem;">ℹ️ No hay enfrentamientos directos en los datos actuales.</p>`;

        if (resultsDiv) {
            resultsDiv.innerHTML = `
            <div style="background:var(--card-bg,#12213a);border:1px solid var(--border-color,#1e3a5f);border-radius:10px;padding:1.25rem;margin-top:0.75rem;">

                <!-- Cabecera con victorias H2H -->
                <div style="display:flex;align-items:center;justify-content:space-around;flex-wrap:wrap;gap:1rem;margin-bottom:1.25rem;">
                    <div style="text-align:center;">
                        <img src="${getTeamLogo(team1Name)}" style="width:48px;height:48px;object-fit:contain;">
                        <div style="font-weight:bold;margin-top:4px;">${team1Name}</div>
                        <div style="font-size:2rem;font-weight:bold;color:#00d4ff;">${t1Wins}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted,#8fa3bc);">victorias H2H</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:1.2rem;font-weight:bold;color:var(--text-muted,#8fa3bc);">VS</div>
                        <div style="font-size:0.8rem;color:var(--text-muted,#8fa3bc);margin-top:4px;">${h2hGames.length} partidos directos</div>
                    </div>
                    <div style="text-align:center;">
                        <img src="${getTeamLogo(team2Name)}" style="width:48px;height:48px;object-fit:contain;">
                        <div style="font-weight:bold;margin-top:4px;">${team2Name}</div>
                        <div style="font-size:2rem;font-weight:bold;color:#00d4ff;">${t2Wins}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted,#8fa3bc);">victorias H2H</div>
                    </div>
                </div>

                <!-- Tabla comparativa de stats -->
                <table style="width:100%;border-collapse:collapse;font-size:0.88rem;">
                    <thead><tr>
                        <th style="text-align:left;color:var(--text-muted,#8fa3bc);padding:4px 0">${team1Name}</th>
                        <th style="text-align:center;color:var(--text-muted,#8fa3bc);padding:4px 0">ESTADÍSTICA</th>
                        <th style="text-align:right;color:var(--text-muted,#8fa3bc);padding:4px 0">${team2Name}</th>
                    </tr></thead>
                    <tbody>
                        ${statRow('Victorias', s1.wins, s2.wins)}
                        ${statRow('Derrotas', s1.losses, s2.losses, false)}
                        ${statRow('% Victorias', s1.winPct + '%', s2.winPct + '%')}
                        ${statRow('Pts Promedio', s1.avgPts, s2.avgPts)}
                        ${statRow('Pts Recibidos', s1.avgPtsAllowed, s2.avgPtsAllowed, false)}
                        ${statRow('Partidos jugados', s1.games, s2.games, false)}
                    </tbody>
                </table>

                ${h2hSection}
            </div>`;
        }
    } catch (error) {
        console.error('Error en H2H:', error);
        if (resultsDiv) resultsDiv.innerHTML = '<p class="text-center" style="color:#f87171;">Error al cargar la comparativa.</p>';
    }
}

// ============================================================
// INICIALIZACIÓN PRINCIPAL
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    try {
        console.log('🏀 Inicializando NBA Analytics Pro...');
        document.body.classList.add('loading-state');

        initDarkMode();

        // Cargar temporadas y equipos en selects
        await loadTemporadasSelect();
        await loadEquiposSelect();
        await initAutocomplete();

        // Cargar datos según la página actual
        const currentPage = document.body.getAttribute('data-page') || 'dashboard';
        console.log(`📄 Página actual: ${currentPage}`);

        switch (currentPage) {
            case 'dashboard': await loadDashboardData(); break;
            case 'equipos': await loadEquiposPage(); break;
            case 'partidos': await loadPartidosPage(); break;
            case 'clasificacion': await loadClasificacionPage(); break;
            case 'estadisticas': await loadEstadisticasPage(); break;
            case 'predicciones': await loadPrediccionesPage(); break;
            case 'historial': await loadHistorialPage(); break;
            case 'temporadas': await loadTemporadasPage(); break;
        }

        // Inicializar event listeners
        initEventListeners();

        document.body.classList.remove('loading-state');
        console.log('✅ NBA Analytics Pro iniciado correctamente');
    } catch (error) {
        console.error('❌ Error inicializando app:', error);
        document.body.classList.remove('loading-state');
    }
}
