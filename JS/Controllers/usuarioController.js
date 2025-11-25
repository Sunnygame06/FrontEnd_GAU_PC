class UsuarioController {
    constructor() {
        this.usuarioService = new UsuarioService();
        this.currentPage = 0;
        this.pageSize = 10;
        this.filteredUsers = [];
        this.isOffline = localStorage.getItem('offlineMode') === 'true';
        this.init();
    }

    async init() {
        await this.setupModule();
        await this.cargarUsuarios();
        this.setupEventListeners();
    }

    async setupModule() {
        // Si estamos en el dashboard, cargar el módulo dinámicamente
        const usersContent = document.getElementById('usersContent');
        if (usersContent && !usersContent.querySelector('.table-container')) {
            try {
                const response = await fetch('users.html');
                const html = await response.text();
                usersContent.innerHTML = html;
            } catch (error) {
                console.error('Error cargando el módulo de usuarios:', error);
                usersContent.innerHTML = '<div class="error-message">Error al cargar el módulo de usuarios</div>';
            }
        }
    }

    async cargarUsuarios() {
        const tbody = document.getElementById('usersTableBody');
        const loadingDiv = this.createLoadingIndicator();
        
        if (tbody) {
            tbody.innerHTML = '';
            tbody.parentNode.appendChild(loadingDiv);
            loadingDiv.classList.add('show');
        }

        try {
            const response = await this.usuarioService.getAllUsuarios(this.currentPage, this.pageSize);
            const usuarios = response.content || [];
            this.filteredUsers = usuarios;

            this.renderUsuarios(usuarios);
            this.actualizarPaginacion(response);
            
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            this.showError('Error al cargar los usuarios');
        } finally {
            loadingDiv.classList.remove('show');
        }
    }

    renderUsuarios(usuarios) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (usuarios.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No se encontraron usuarios</h3>
                        <p>Intente ajustar los filtros de búsqueda</p>
                    </td>
                </tr>
            `;
            return;
        }

        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            
            const estadoClass = usuario.estado === 'activo' ? 'status-active' : 'status-inactive';
            const estadoText = usuario.estado === 'activo' ? 'Activo' : 'Inactivo';

            tr.innerHTML = `
                <td>${usuario.nombre}</td>
                <td>${usuario.email}</td>
                <td>${usuario.telefono}</td>
                <td>${usuario.rol}</td>
                <td>${usuario.region}</td>
                <td><span class="status-badge ${estadoClass}">${estadoText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="usuarioController.editarUsuario(${usuario.Id})" title="Editar usuario">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="action-btn delete" onclick="usuarioController.eliminarUsuario(${usuario.Id})" title="Eliminar usuario">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    async editarUsuario(id) {
        try {
            const usuarios = await this.usuarioService.getAllUsuarios(0, 1000);
            const usuario = usuarios.content.find(u => u.Id === id);
            
            if (!usuario) {
                this.showError('Usuario no encontrado');
                return;
            }

            this.llenarFormularioEdicion(usuario);
            this.mostrarModal('userModal');
            
        } catch (error) {
            console.error('Error editando usuario:', error);
            this.showError('Error al cargar el usuario para editar');
        }
    }

    llenarFormularioEdicion(usuario) {
        document.getElementById('modalUserTitle').textContent = 'Editar Usuario';
        document.getElementById('userId').value = usuario.Id;
        document.getElementById('modalNombres').value = usuario.nombre;
        document.getElementById('modalTelefono').value = usuario.telefono;
        document.getElementById('modalEmail').value = usuario.email;
        document.getElementById('modalUnidad').value = usuario.unidad;
        document.getElementById('modalRol').value = usuario.rol;
        document.getElementById('modalRegion').value = usuario.region;
        document.getElementById('modalFiltrado').value = usuario.filtrar || 'No Aplica';

        // Ocultar campos de contraseña en edición
        document.getElementById('modalPassword').closest('.form-group').style.display = 'none';
        document.getElementById('modalConfirmPassword').closest('.form-group').style.display = 'none';
        document.getElementById('labelPassword').classList.remove('required');
        document.getElementById('labelConfirmPassword').classList.remove('required');

        // Cargar selects dependientes
        this.cargarSelectsDependientes(usuario.departamento, usuario.distrito, usuario.municipio);
    }

    async eliminarUsuario(id) {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#e53e3e',
            cancelButtonColor: '#718096'
        });

        if (result.isConfirmed) {
            try {
                await this.usuarioService.deleteUsuario(id);
                this.showSuccess('Usuario eliminado correctamente');
                this.cargarUsuarios();
            } catch (error) {
                console.error('Error eliminando usuario:', error);
                this.showError('Error al eliminar el usuario');
            }
        }
    }

    async guardarUsuario(formData) {
        try {
            if (formData.id) {
                await this.usuarioService.updateUsuario(formData.id, formData);
                this.showSuccess('Usuario actualizado correctamente');
            } else {
                await this.usuarioService.createUsuario(formData);
                this.showSuccess('Usuario creado correctamente');
            }
            
            this.ocultarModal('userModal');
            this.cargarUsuarios();
            
        } catch (error) {
            console.error('Error guardando usuario:', error);
            this.showError('Error al guardar el usuario');
        }
    }

    // Métodos auxiliares
    createLoadingIndicator() {
        let loadingDiv = document.getElementById('usersLoading');
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'usersLoading';
            loadingDiv.className = 'table-loading';
            loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
        }
        return loadingDiv;
    }

    mostrarModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    ocultarModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    showSuccess(message) {
        Swal.fire({
            title: '¡Éxito!',
            text: message,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2d3748'
        });
    }

    showError(message) {
        Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2d3748'
        });
    }

    actualizarPaginacion(response) {
        const showing = `${(this.currentPage * this.pageSize) + 1}-${Math.min((this.currentPage + 1) * this.pageSize, response.totalElements)}`;
        const total = response.totalElements;

        document.getElementById('usersShowing').textContent = showing;
        document.getElementById('usersTotal').textContent = total;

        this.renderPaginationControls(response.totalPages);
    }

    renderPaginationControls(totalPages) {
        const paginationContainer = document.getElementById('usersPagination');
        if (!paginationContainer) return;

        paginationContainer.innerHTML = '';

        // Botón anterior
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = 'Anterior';
        prevBtn.disabled = this.currentPage === 0;
        prevBtn.addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.cargarUsuarios();
            }
        });
        paginationContainer.appendChild(prevBtn);

        // Números de página
        for (let i = 0; i < totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i + 1;
            pageBtn.addEventListener('click', () => {
                this.currentPage = i;
                this.cargarUsuarios();
            });
            paginationContainer.appendChild(pageBtn);
        }

        // Botón siguiente
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = 'Siguiente';
        nextBtn.disabled = this.currentPage === totalPages - 1;
        nextBtn.addEventListener('click', () => {
            if (this.currentPage < totalPages - 1) {
                this.currentPage++;
                this.cargarUsuarios();
            }
        });
        paginationContainer.appendChild(nextBtn);
    }

    cargarSelectsDependientes(departamento, distrito, municipio) {
        // Implementar la carga de selects dependientes según los datos geográficos
        console.log('Cargando selects para:', departamento, distrito, municipio);
    }

    setupEventListeners() {
        // Los event listeners se configurarán después de que el DOM esté listo
        setTimeout(() => {
            this.setupUserEventListeners();
        }, 100);
    }

    setupUserEventListeners() {
        // Nuevo usuario
        const newUserBtn = document.getElementById('newUserBtn');
        if (newUserBtn) {
            newUserBtn.addEventListener('click', () => {
                this.limpiarFormulario();
                this.mostrarModal('userModal');
            });
        }

        // Formulario de usuario
        const userForm = document.getElementById('userForm');
        if (userForm) {
            userForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.procesarFormulario();
            });
        }

        // Cerrar modales
        this.setupModalCloseListeners();

        // Filtros
        const applyFiltersBtn = document.getElementById('applyFilters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.aplicarFiltros();
            });
        }

        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.limpiarFiltros();
            });
        }

        // Búsqueda en tiempo real
        const searchInput = document.getElementById('searchUser');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.aplicarFiltros();
            });
        }
    }

    setupModalCloseListeners() {
        const closeButtons = [
            'closeUserModal', 'cancelUserForm'
        ];

        closeButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    const modal = button.closest('.modal');
                    if (modal) {
                        modal.style.display = 'none';
                    }
                });
            }
        });
    }

    limpiarFormulario() {
        document.getElementById('modalUserTitle').textContent = 'Nuevo Usuario';
        document.getElementById('userForm').reset();
        document.getElementById('userId').value = '';
        
        // Mostrar campos de contraseña en nuevo usuario
        document.getElementById('modalPassword').closest('.form-group').style.display = 'block';
        document.getElementById('modalConfirmPassword').closest('.form-group').style.display = 'block';
        document.getElementById('labelPassword').classList.add('required');
        document.getElementById('labelConfirmPassword').classList.add('required');
    }

    procesarFormulario() {
        const formData = this.obtenerDatosFormulario();
        
        if (this.validarFormulario(formData)) {
            this.guardarUsuario(formData);
        }
    }

    obtenerDatosFormulario() {
        return {
            id: document.getElementById('userId').value,
            nombres: document.getElementById('modalNombres').value,
            telefono: document.getElementById('modalTelefono').value,
            email: document.getElementById('modalEmail').value,
            unidad: document.getElementById('modalUnidad').value,
            password: document.getElementById('modalPassword').value,
            confirmPassword: document.getElementById('modalConfirmPassword').value,
            rol: document.getElementById('modalRol').value,
            region: document.getElementById('modalRegion').value,
            departamento: document.getElementById('modalDepartamento').value,
            municipio: document.getElementById('modalMunicipio').value,
            distrito: document.getElementById('modalDistrito').value,
            filtrado: document.getElementById('modalFiltrado').value
        };
    }

    validarFormulario(formData) {
        const camposRequeridos = [
            'nombres', 'telefono', 'email', 'unidad', 
            'rol', 'region', 'departamento', 'municipio', 'distrito'
        ];

        // Validar campos requeridos
        for (const campo of camposRequeridos) {
            if (!formData[campo]) {
                this.showError(`El campo ${campo} es requerido`);
                return false;
            }
        }

        // Validar contraseñas si es nuevo usuario
        if (!formData.id) {
            if (!formData.password || !formData.confirmPassword) {
                this.showError('Las contraseñas son requeridas para nuevos usuarios');
                return false;
            }

            if (formData.password !== formData.confirmPassword) {
                this.showError('Las contraseñas no coinciden');
                return false;
            }

            if (formData.password.length < 6) {
                this.showError('La contraseña debe tener al menos 6 caracteres');
                return false;
            }
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            this.showError('El formato del email no es válido');
            return false;
        }

        return true;
    }

    aplicarFiltros() {
        const searchTerm = document.getElementById('searchUser').value.toLowerCase();
        const roleFilter = document.getElementById('filterRole').value;
        const statusFilter = document.getElementById('filterStatus').value;

        // En una implementación real, esto se haría en el backend
        // Por ahora, filtramos en el frontend
        this.cargarUsuarios().then(() => {
            const filtered = this.filteredUsers.filter(usuario => {
                const matchesSearch = usuario.nombre.toLowerCase().includes(searchTerm) || 
                                     usuario.email.toLowerCase().includes(searchTerm);
                const matchesRole = !roleFilter || usuario.rol === roleFilter;
                const matchesStatus = !statusFilter || usuario.estado === statusFilter;
                
                return matchesSearch && matchesRole && matchesStatus;
            });

            this.renderUsuarios(filtered);
            
            // Actualizar información de paginación
            const showing = `1-${filtered.length}`;
            const total = filtered.length;
            document.getElementById('usersShowing').textContent = showing;
            document.getElementById('usersTotal').textContent = total;
        });
    }

    limpiarFiltros() {
        document.getElementById('searchUser').value = '';
        document.getElementById('filterRole').value = '';
        document.getElementById('filterStatus').value = '';
        this.cargarUsuarios();
    }
}

// Inicializar el controlador cuando esté disponible
let usuarioController;
document.addEventListener('DOMContentLoaded', () => {
    usuarioController = new UsuarioController();
});