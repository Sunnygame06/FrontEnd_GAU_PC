// Variables globales
let retryCount = 0;
let connectionEstablished = false;

// Elementos del DOM
const statusTitle = document.getElementById('statusTitle');
const statusMessage = document.getElementById('statusMessage');
const progressBar = document.getElementById('progressBar');
const retryContainer = document.getElementById('retryContainer');
const retryBtn = document.getElementById('retryBtn');
const offlineBtn = document.getElementById('offlineBtn');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');

// Inicializar verificación al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    initializeLoading();
});

// Función principal de inicialización
async function initializeLoading() {
    try {
        // Paso 1: Verificar servidor
        await updateStep(1, 'active', 'Verificando servidor...');
        const serverOnline = await checkServerConnection();
        
        if (!serverOnline) {
            throw new Error('Servidor no disponible');
        }
        
        await updateStep(1, 'completed', 'Servidor conectado');
        await delay(500);
        
        // Paso 2: Verificar base de datos
        await updateStep(2, 'active', 'Conectando a base de datos...');
        const dbConnected = await checkDatabaseConnection();
        
        if (!dbConnected) {
            throw new Error('Base de datos no disponible');
        }
        
        await updateStep(2, 'completed', 'Base de datos conectada');
        await delay(500);
        
        // Paso 3: Cargar recursos
        await updateStep(3, 'active', 'Cargando recursos del sistema...');
        await loadSystemResources();
        await updateStep(3, 'completed', 'Recursos cargados');
        
        // Completar carga
        await completeLoading();
        
    } catch (error) {
        console.error('Error durante la carga:', error);
        handleLoadingError(error.message);
    }
}

// Verificar conexión con el servidor
async function checkServerConnection() {
    try {
        updateProgress(20);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT.REQUEST);
        
        const response = await fetch(buildURL(CONFIG.ENDPOINTS.USUARIOS.GET_ALL, { page: 0, size: 1 }), {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        clearTimeout(timeoutId);
        updateProgress(40);
        
        return response.ok || response.status === 304;
        
    } catch (error) {
        console.error('Error verificando servidor:', error);
        return false;
    }
}

// Verificar conexión con base de datos
async function checkDatabaseConnection() {
    try {
        updateProgress(50);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT.REQUEST);
        
        // Intentar obtener datos para verificar la BD
        const response = await fetch(buildURL(CONFIG.ENDPOINTS.ACTIVIDADES.GET_ALL, { page: 0, size: 1 }), {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        clearTimeout(timeoutId);
        updateProgress(70);
        
        return response.ok || response.status === 304;
        
    } catch (error) {
        console.error('Error verificando base de datos:', error);
        return false;
    }
}

// Cargar recursos del sistema
async function loadSystemResources() {
    updateProgress(80);
    
    // Simular carga de recursos
    await delay(1000);
    
    updateProgress(100);
}

// Actualizar paso de carga
async function updateStep(stepNumber, status, message) {
    const step = document.getElementById(`step${stepNumber}`);
    const icon = step.querySelector('.step-icon');
    
    // Remover clases anteriores
    step.classList.remove('active', 'completed', 'error');
    icon.classList.remove('fa-circle-notch', 'fa-spin', 'fa-check-circle', 'fa-circle', 'fa-times-circle');
    
    // Aplicar nuevo estado
    step.classList.add(status);
    
    switch(status) {
        case 'active':
            icon.classList.add('fa-circle-notch', 'fa-spin');
            break;
        case 'completed':
            icon.classList.add('fa-check-circle');
            break;
        case 'error':
            icon.classList.add('fa-times-circle');
            break;
        default:
            icon.classList.add('fa-circle');
    }
    
    if (message) {
        statusMessage.textContent = message;
    }
}

// Actualizar barra de progreso
function updateProgress(percentage) {
    progressBar.style.width = percentage + '%';
}

// Completar proceso de carga
async function completeLoading() {
    connectionEstablished = true;
    
    statusTitle.textContent = '¡Conexión Exitosa!';
    statusMessage.textContent = 'Redirigiendo al sistema...';
    
    // Esperar un momento antes de redirigir
    await delay(1500);
    
    // Verificar si el usuario ya está autenticado
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (isAuthenticated) {
        window.location.href = 'dashboard.html';
    } else {
        window.location.href = 'index.html';
    }
}

// Manejar errores de carga
function handleLoadingError(errorMessage) {
    // Marcar paso actual como error
    if (step1.classList.contains('active')) {
        updateStep(1, 'error', 'Error al conectar con el servidor');
    } else if (step2.classList.contains('active')) {
        updateStep(2, 'error', 'Error al conectar con la base de datos');
    } else if (step3.classList.contains('active')) {
        updateStep(3, 'error', 'Error al cargar recursos');
    }
    
    statusTitle.textContent = 'Error de Conexión';
    statusMessage.textContent = errorMessage || CONFIG.MESSAGES.CONNECTION_ERROR;
    
    // Mostrar opciones de reintento
    retryContainer.style.display = 'flex';
    
    // Detener animación de progreso
    progressBar.style.animation = 'none';
}

// Reintentar conexión
retryBtn.addEventListener('click', async () => {
    retryCount++;
    
    if (retryCount > CONFIG.RETRY.MAX_ATTEMPTS) {
        Swal.fire({
            title: 'Demasiados Intentos',
            text: 'Has excedido el número máximo de intentos. Por favor, verifica tu conexión y el servidor.',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#2d3748'
        });
        return;
    }
    
    // Ocultar botones de reintento
    retryContainer.style.display = 'none';
    
    // Reiniciar estados
    step1.classList.remove('completed', 'error');
    step2.classList.remove('active', 'completed', 'error');
    step3.classList.remove('active', 'completed', 'error');
    
    progressBar.style.width = '0%';
    progressBar.style.animation = 'progress 2s ease-in-out infinite';
    
    statusTitle.textContent = 'Reintentando Conexión...';
    statusMessage.textContent = `Intento ${retryCount} de ${CONFIG.RETRY.MAX_ATTEMPTS}`;
    
    // Esperar antes de reintentar
    await delay(CONFIG.RETRY.DELAY);
    
    // Reiniciar proceso
    initializeLoading();
});

// Trabajar sin conexión
offlineBtn.addEventListener('click', () => {
    Swal.fire({
        title: 'Modo Sin Conexión',
        html: `
            <p>El modo sin conexión no está disponible actualmente.</p>
            <p>Por favor, verifica:</p>
            <ul style="text-align: left; margin: 20px 40px;">
                <li>Que el servidor esté ejecutándose en el puerto 8080</li>
                <li>Tu conexión a internet</li>
                <li>La configuración del firewall</li>
            </ul>
        `,
        icon: 'info',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#2d3748'
    });
});

// Función de utilidad para delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Prevenir navegación hacia atrás durante la carga
window.addEventListener('popstate', (e) => {
    if (!connectionEstablished) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
    }
});

// Agregar estado inicial al historial
window.history.pushState(null, '', window.location.href);