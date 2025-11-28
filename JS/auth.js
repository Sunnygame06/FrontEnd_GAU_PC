document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simulación de autenticación
    if (email && password) {
        Swal.fire({
            title: 'Autenticando...',
            text: 'Por favor espere',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // Simular tiempo de autenticación
        setTimeout(() => {
            Swal.fire({
                title: '¡Éxito!',
                text: 'Inicio de sesión exitoso',
                icon: 'success',
                confirmButtonText: 'Continuar',
                confirmButtonColor: '#2d3748',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                // Guardar sesión
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userEmail', email);
                
                // Redirigir a la pantalla de carga
                window.location.href = 'dashboard.html';
            });
        }, 1000);
    } else {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, complete todos los campos',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#2d3748'
        });
    }
});

document.getElementById('forgotPasswordLink').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('recoveryOptions').classList.add('active');
    document.getElementById('loginForm').style.display = 'none';
});

document.getElementById('backToLogin').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('recoveryOptions').classList.remove('active');
    document.getElementById('loginForm').style.display = 'block';
});

// Agregar funcionalidad a los métodos de recuperación
const recoveryMethods = document.querySelectorAll('.recovery-method');
recoveryMethods.forEach(method => {
    method.addEventListener('click', function() {
        const methodName = this.querySelector('span').textContent;
        Swal.fire({
            title: 'Recuperación de contraseña',
            text: `Se ha enviado un enlace de recuperación a través de ${methodName}`,
            icon: 'info',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#2d3748'
        });
    });
});

// Verificar si ya está autenticado y redirigir a loading
if (localStorage.getItem('isAuthenticated') === 'true') {
    window.location.href = 'cargandoAPI.html';
}