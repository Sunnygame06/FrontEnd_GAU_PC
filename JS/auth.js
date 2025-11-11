document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simulación de autenticación
    if (email && password) {
        Swal.fire({
            title: '¡Éxito!',
            text: 'Inicio de sesión exitoso',
            icon: 'success',
            confirmButtonText: 'Continuar',
            confirmButtonColor: '#2d3748'
        }).then((result) => {
            if (result.isConfirmed) {
                // Guardar sesión y redirigir al dashboard
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userEmail', email);
                window.location.href = 'dashboard.html';
            }
        });
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

// Verificar si ya está autenticado
if (localStorage.getItem('isAuthenticated') === 'true') {
    window.location.href = 'dashboard.html';
}