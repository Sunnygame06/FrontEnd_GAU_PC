// Inicializador del módulo de usuarios

function initializeUsersModule() {
    console.log('Inicializando módulo de usuarios...');
    
    // Agregar loading a la tabla
    const tableContainer = document.querySelector('#usersContent .table-container');
    if (tableContainer && !document.getElementById('usersLoading')) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'usersLoading';
        loadingDiv.className = 'table-loading';
        loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
        tableContainer.appendChild(loadingDiv);
    }
    
    // Cargar usuarios inicialmente
    cargarUsuarios();
    
    // Event listeners para el modal de usuarios
    const newUserBtn = document.getElementById('newUserBtn');
    if (newUserBtn) {
        newUserBtn.addEventListener('click', () => {
            document.getElementById('modalUserTitle').textContent = 'Nuevo Usuario';
            document.getElementById('userId').value = '';
            limpiarFormularioUsuario();
            document.getElementById('userModal').style.display = 'block';
        });
    }
    
    const closeUserModal = document.getElementById('closeUserModal');
    if (closeUserModal) {
        closeUserModal.addEventListener('click', () => {
            document.getElementById('userModal').style.display = 'none';
        });
    }
    
    const cancelUserForm = document.getElementById('cancelUserForm');
    if (cancelUserForm) {
        cancelUserForm.addEventListener('click', () => {
            document.getElementById('userModal').style.display = 'none';
        });
    }
    
    const clearUserForm = document.getElementById('clearUserForm');
    if (clearUserForm) {
        clearUserForm.addEventListener('click', () => {
            limpiarFormularioUsuario();
            Swal.fire({
                title: 'Formulario limpiado',
                text: 'Todos los campos han sido restablecidos',
                icon: 'info',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#2d3748',
                timer: 1500
            });
        });
    }
    
    // Formulario de usuario
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userId = document.getElementById('userId').value;
            const password = document.getElementById('modalPassword').value;
            const confirmPassword = document.getElementById('modalConfirmPassword').value;
            
            // Validar contraseñas si es nuevo usuario
            if (!userId && password !== confirmPassword) {
                Swal.fire({
                    title: 'Error',
                    text: 'Las contraseñas no coinciden',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#2d3748'
                });
                return;
            }
            
            // Recopilar datos del formulario
            const formData = {
                nombre: document.getElementById('modalNombres').value,
                telefono: document.getElementById('modalTelefono').value,
                email: document.getElementById('modalEmail').value,
                unidad: document.getElementById('modalUnidad').value,
                pass: password || undefined,
                rol: document.getElementById('modalRol').value,
                region: document.getElementById('modalRegion').value,
                departamento: document.getElementById('modalDepartamento').value.toUpperCase(),
                distrito: document.getElementById('modalDistrito').value.toUpperCase(),
                municipio: document.getElementById('modalMunicipio').value.toUpperCase(),
                filtrar: document.getElementById('modalFiltrado').value
            };
            
            // Validar datos
            const validation = UsuarioService.validateUsuario(formData);
            if (!validation.isValid) {
                const errorMessages = Object.values(validation.errors).join('\n');
                Swal.fire({
                    title: 'Errores de Validación',
                    text: errorMessages,
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#2d3748'
                });
                return;
            }
            
            try {
                // Mostrar loading
                Swal.fire({
                    title: 'Procesando...',
                    text: 'Guardando usuario',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                if (userId) {
                    // Editar usuario existente
                    formData.Id = parseInt(userId);
                    await UsuarioService.updateUsuario(userId, formData);
                    
                    Swal.fire({
                        title: '¡Éxito!',
                        text: 'Usuario actualizado correctamente',
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#2d3748'
                    });
                } else {
                    // Crear nuevo usuario
                    await UsuarioService.createUsuario(formData);
                    
                    Swal.fire({
                        title: '¡Éxito!',
                        text: 'Usuario creado correctamente',
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#2d3748'
                    });
                }
                
                // Cerrar modal y recargar usuarios
                document.getElementById('userModal').style.display = 'none';
                cargarUsuarios();
                
            } catch (error) {
                console.error('Error al guardar usuario:', error);
                Swal.fire({
                    title: 'Error',
                    text: error.message || 'No se pudo guardar el usuario',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#2d3748'
                });
            }
        });
    }
    
    // Filtros
    const applyFilters = document.getElementById('applyFilters');
    if (applyFilters) {
        applyFilters.addEventListener('click', aplicarFiltrosUsuarios);
    }
    
    const clearFilters = document.getElementById('clearFilters');
    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            document.getElementById('searchUser').value = '';
            document.getElementById('filterRole').value = '';
            document.getElementById('filterStatus').value = '';
            cargarUsuarios();
        });
    }
    
    // Búsqueda en tiempo real
    const searchUser = document.getElementById('searchUser');
    if (searchUser) {
        let searchTimeout;
        searchUser.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(aplicarFiltrosUsuarios, 500);
        });
    }
    
    // Exportar datos
    const exportBtn = document.querySelector('#usersContent .export-options .btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            const dropdown = this.nextElementSibling;
            dropdown.classList.toggle('show');
        });
    }
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.export-options')) {
            document.querySelectorAll('.export-dropdown').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });
    
    // Opciones de exportación
    document.querySelectorAll('#usersContent .export-option').forEach(option => {
        option.addEventListener('click', function() {
            const format = this.getAttribute('data-format');
            exportarUsuarios(format);
            document.querySelector('#usersContent .export-dropdown').classList.remove('show');
        });
    });
    
    // Dependencias entre selects geográficos
    const modalDepartamento = document.getElementById('modalDepartamento');
    if (modalDepartamento) {
        modalDepartamento.addEventListener('change', function() {
            const departamento = this.value;
            const datos = datosGeograficos[departamento];
            const distritoSelect = document.getElementById('modalDistrito');
            const municipioSelect = document.getElementById('modalMunicipio');
            
            if (datos && distritoSelect && municipioSelect) {
                // Cargar distritos
                distritoSelect.innerHTML = '<option value="">Seleccione un distrito</option>';
                datos.distritos.forEach(distrito => {
                    const option = document.createElement('option');
                    option.value = distrito.toLowerCase();
                    option.textContent = distrito;
                    distritoSelect.appendChild(option);
                });
                
                // Cargar municipios
                municipioSelect.innerHTML = '<option value="">Seleccione un municipio</option>';
                datos.municipios.forEach(municipio => {
                    const option = document.createElement('option');
                    option.value = municipio.toLowerCase();
                    option.textContent = municipio;
                    municipioSelect.appendChild(option);
                });
            } else {
                // Limpiar selects si no hay datos
                distritoSelect.innerHTML = '<option value="">Seleccione un distrito</option>';
                municipioSelect.innerHTML = '<option value="">Seleccione un municipio</option>';
            }
        });
    }
    
    console.log('Módulo de usuarios inicializado correctamente');
}

// Exportar función
if (typeof module !== 'undefined' && module.exports) {
    module.exports = initializeUsersModule;
}