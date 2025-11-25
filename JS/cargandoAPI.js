class LoadingManager {
    constructor() {
        this.maxRetries = 3;
        this.retryCount = 0;
        this.retryInterval = 3000; // 3 segundos
        this.progress = 0;
        this.init();
    }

    init() {
        this.checkServerConnection();
        this.setupEventListeners();
        this.simulateProgress();
    }

    async checkServerConnection() {
        try {
            // Intentar conectar con el endpoint de actividades
            const response = await fetch('http://localhost:8080/apiActividad/getAllActividades?page=0&size=1', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000
            });

            if (response.ok) {
                this.connectionSuccess();
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            this.connectionFailed();
        }
    }

    connectionSuccess() {
        this.updateProgress(100);
        setTimeout(() => {
            // Redirigir al dashboard
            window.location.href = 'dashboard.html';
        }, 1000);
    }

    connectionFailed() {
        this.retryCount++;
        
        if (this.retryCount <= this.maxRetries) {
            this.showRetryMessage();
            setTimeout(() => {
                this.hideErrorMessage();
                this.checkServerConnection();
            }, this.retryInterval);
        } else {
            this.showFinalErrorMessage();
        }
    }

    showRetryMessage() {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = errorMessage.querySelector('p');
        errorText.textContent = `No se puede conectar con el servidor. Reintentando... (${this.retryCount}/${this.maxRetries})`;
        errorMessage.style.display = 'block';
    }

    showFinalErrorMessage() {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = errorMessage.querySelector('p');
        errorText.textContent = 'No se puede establecer conexión con el servidor en este momento. Por favor, verifique que el servidor esté ejecutándose.';
        errorMessage.style.display = 'block';
        this.updateProgress(0);
    }

    hideErrorMessage() {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.style.display = 'none';
    }

    simulateProgress() {
        const interval = setInterval(() => {
            if (this.progress < 90) {
                this.progress += Math.random() * 10;
                this.updateProgress(this.progress);
            }
        }, 500);
    }

    updateProgress(percentage) {
        this.progress = Math.min(100, Math.max(0, percentage));
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${this.progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(this.progress)}%`;
        }

        // Actualizar iconos de detalles
        this.updateLoadingDetails(this.progress);
    }

    updateLoadingDetails(progress) {
        const details = document.querySelectorAll('.detail-item');
        
        details.forEach((detail, index) => {
            const icon = detail.querySelector('i');
            const threshold = (index + 1) * 30;
            
            if (progress >= threshold) {
                icon.className = 'fas fa-check-circle';
                icon.style.color = 'var(--success-color)';
            } else if (progress >= threshold - 15) {
                icon.className = 'fas fa-spinner fa-spin';
                icon.style.color = 'var(--primary-medium)';
            }
        });
    }

    setupEventListeners() {
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.retryCount = 0;
            this.hideErrorMessage();
            this.updateProgress(0);
            this.simulateProgress();
            this.checkServerConnection();
        });

        document.getElementById('offlineBtn').addEventListener('click', () => {
            localStorage.setItem('offlineMode', 'true');
            window.location.href = 'dashboard.html';
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new LoadingManager();
});

// Polyfill para timeout en fetch
if (!window.fetch) {
    console.error('Fetch no está soportado en este navegador');
} else {
    // Agregar timeout a fetch
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const [resource, config = {}] = args;
        const timeout = config.timeout || 8000;
        
        const controller = new AbortController();
        const { signal } = controller;
        
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        return originalFetch(resource, {
            ...config,
            signal
        }).then(response => {
            clearTimeout(timeoutId);
            return response;
        }).catch(error => {
            clearTimeout(timeoutId);
            throw error;
        });
    };
}