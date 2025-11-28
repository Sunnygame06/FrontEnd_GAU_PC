// Configuración global del sistema
const CONFIG = {
    // URL base de la API
    API_BASE_URL: 'http://localhost:8080',
    
    // Endpoints de la API
    ENDPOINTS: {
        USUARIOS: {
            GET_ALL: '/apiUsuario/getAllUsuarios',
            GET_BY_ID: '/apiUsuario/getUsuario',
            CREATE: '/apiUsuario/newUsuario',
            UPDATE: '/apiUsuario/updateUsuario',
            DELETE: '/apiUsuario/deleteUsuario'
        },
        ACTIVIDADES: {
            GET_ALL: '/apiActividad/getAllActividades',
            GET_BY_ID: '/apiActividad/getActividad',
            CREATE: '/apiActividad/newActividad',
            UPDATE: '/apiActividad/updateActividad',
            DELETE: '/apiActividad/deleteActividad'
        }
    },
    
    // Configuración de paginación
    PAGINATION: {
        DEFAULT_PAGE: 0,
        DEFAULT_SIZE: 10,
        MAX_SIZE: 50
    },
    
    // Configuración de tiempos
    TIMEOUT: {
        REQUEST: 10000, // 10 segundos
        RETRY: 3000,    // 3 segundos
        LOADING: 2000   // 2 segundos mínimo de carga
    },
    
    // Configuración de reintentos
    RETRY: {
        MAX_ATTEMPTS: 3,
        DELAY: 2000
    },
    
    // Mensajes del sistema
    MESSAGES: {
        CONNECTION_ERROR: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.',
        SERVER_ERROR: 'Error en el servidor. Intenta nuevamente más tarde.',
        SUCCESS_SAVE: 'Datos guardados correctamente',
        SUCCESS_UPDATE: 'Datos actualizados correctamente',
        SUCCESS_DELETE: 'Datos eliminados correctamente',
        CONFIRM_DELETE: '¿Estás seguro de eliminar este registro?',
        VALIDATION_ERROR: 'Por favor, completa todos los campos requeridos'
    }
};

// Función para construir URL completa
function buildURL(endpoint, params = {}) {
    let url = CONFIG.API_BASE_URL + endpoint;
    
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
            queryParams.append(key, params[key]);
        }
    });
    
    const queryString = queryParams.toString();
    if (queryString) {
        url += '?' + queryString;
    }
    
    return url;
}

// Función para verificar conexión con el servidor
async function checkServerConnection() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT.REQUEST);
        
        const response = await fetch(CONFIG.API_BASE_URL + '/apiUsuario/getAllUsuarios?page=0&size=1', {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        clearTimeout(timeoutId);
        
        return response.ok;
    } catch (error) {
        console.error('Error al verificar conexión:', error);
        return false;
    }
}

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, buildURL, checkServerConnection };
}