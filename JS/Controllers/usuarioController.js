// Controlador para gestión de usuarios

// Variables globales
let currentUserPage = 0;
const usersPerPage = 10;
let filteredUsers = [];
let allUsers = [];

// Datos geográficos
const datosGeograficos = {
    'ahuachapan': {
        distritos: ['GUAYMANGO', 'AHUACHAPAN', 'ATIQUIZAYA'],
        municipios: ['AHUACHAPAN SUR', 'AHUACHAPAN NORTE', 'AHUACHAPAN CENTRO', 'GUAYMANGO CENTRO']
    },
    'santa-ana': {
        distritos: ['SANTA ANA', 'METAPAN'],
        municipios: ['SANTA ANA', 'CHALCHUAPA', 'METAPAN']
    },
    'sonsonate': {
        distritos: ['SONSONATE', 'IZALCO'],
        municipios: ['SONSONATE', 'IZALCO', 'NAHUIZALCO']
    },
    'san-salvador': {
        distritos: ['SAN SALVADOR'],
        municipios: ['SAN SALVADOR', 'SOYAPANGO', 'SAN MARCOS']
    },
    'la-libertad': {
        distritos: ['SANTA TECLA', 'ANTIGUO CUSCATLAN'],
        municipios: ['SANTA TECLA', 'ANTIGUO CUSCATLAN', 'NUEVO CUSCATLAN']
    },
    'san-miguel': {
        distritos: ['SAN MIGUEL'],
        municipios: ['SAN MIGUEL', 'CIUDAD BARRIOS', 'CHAPELTIQUE']
    }
};

// Función para cargar usuarios desde la API
async function cargarUsuarios() {
    const tbody = document.getElementById('usersTableBody');
    const loadingDiv = document.getElementById('usersLoading');
    
    // Mostrar loading
    if (loadingDiv) loadingDiv.classList.add('show');
    
    try {
        // Llamar al servicio
        const response = await UsuarioService.getAllUsuarios(currentUserPage, usersPerPage);
        
        // Guardar todos los usuarios
        allUsers = response.content || [];
        filteredUsers = [...allUsers];
        
        // Renderizar tabla
        renderUsersTable();
        
        // Actualizar paginación
        actualizarPaginacionUsuarios(response);
        
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los usuarios. Por favor, intenta nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2d3748'
        });
        
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error al cargar usuarios</h3>
                    <p>Por favor, verifica tu conexión e intenta nuevamente</p>
                </td>
            </tr>
        `;
    } finally {
        // Ocultar loading
        if (loadingDiv) loadingDiv.classList.remove('show');
    }
}

// Función para renderizar tabla de usuarios
function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    if (filteredUsers.length === 0) {
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
    
    filteredUsers.forEach(usuario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${usuario.nombre || 'N/A'}</td>
            <td>${usuario.email || 'N/A'}</td>
            <td>${usuario.telefono || 'N/A'}</td>
            <td>${(usuario.rol || '').toUpperCase()}</td>
            <td>${(usuario.region || '').toUpperCase()}</td>
            <td><span class="status-badge status-active">ACTIVO</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editarUsuario(${usuario.Id || usuario.id})" title="Editar usuario">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="action-btn delete" onclick="eliminarUsuario(${usuario.Id || usuario.id})" title="Eliminar usuario">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para actualizar paginación de usuarios
function actualizarPaginacionUsuarios(response) {
    const totalPages = response.totalPages || 0;
    const totalElements = response.totalElements || 0;
    const showingStart = (currentUserPage * usersPerPage) + 1;
    const showingEnd = Math.min((currentUserPage + 1) * usersPerPage, totalElements);
    
    document.getElementById('usersShowing').textContent = totalElements > 0 ? showingStart + '-' + showingEnd : '0';
    document.getElementById('usersTotal').textContent = totalElements;
    
    // Actualizar controles de paginación
    const paginationControls = document.getElementById('usersPagination');
    if (paginationControls) {
        paginationControls.innerHTML = '';
        
        // Botón anterior
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = 'Anterior';
        prevBtn.disabled = currentUserPage === 0;
        prevBtn.addEventListener('click', () => {
            if (currentUserPage > 0) {
                currentUserPage--;
                cargarUsuarios();
            }
        });
        paginationControls.appendChild(prevBtn);
        
        // Números de página
        const maxPagesToShow = 5;
        let startPage = Math.max(0, currentUserPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(0, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn ${i === currentUserPage ? 'active' : ''}`;
            pageBtn.textContent = i + 1;
            pageBtn.addEventListener('click', () => {
                currentUserPage = i;
                cargarUsuarios();
            });
            paginationControls.appendChild(pageBtn);
        }
        
        // Botón siguiente
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = 'Siguiente';
        nextBtn.disabled = currentUserPage >= totalPages - 1;
        nextBtn.addEventListener('click', () => {
            if (currentUserPage < totalPages - 1) {
                currentUserPage++;
                cargarUsuarios();
            }
        });
        paginationControls.appendChild(nextBtn);
    }
}

// Función para editar usuario
async function editarUsuario(id) {
    try {
        // Obtener datos del usuario
        const usuario = await UsuarioService.getUsuarioById(id);
        
        // Llenar el modal con los datos del usuario
        document.getElementById('modalUserTitle').textContent = 'Editar Usuario';
        document.getElementById('userId').value = usuario.Id || usuario.id;
        document.getElementById('modalNombres').value = usuario.nombre || '';
        document.getElementById('modalTelefono').value = usuario.telefono || '';
        document.getElementById('modalEmail').value = usuario.email || '';
        document.getElementById('modalUnidad').value = usuario.unidad || '';
        document.getElementById('modalDelegados').value = 'delegado1'; // Por defecto
        document.getElementById('modalRol').value = usuario.rol || '';
        document.getElementById('modalRegion').value = usuario.region || '';
        document.getElementById('modalDepartamento').value = (usuario.departamento || '').toLowerCase();
        
        // Cargar datos geográficos
        cargarDatosGeograficos(
            (usuario.departamento || '').toLowerCase(), 
            usuario.distrito, 
            usuario.municipio
        );
        
        document.getElementById('modalFiltrado').value = usuario.filtrar || 'no-aplica';
        
        // Ocultar campos de contraseña en edición
        document.getElementById('modalPassword').closest('.form-group').style.display = 'none';
        document.getElementById('modalConfirmPassword').closest('.form-group').style.display = 'none';
        document.getElementById('labelPassword').classList.remove('required');
        document.getElementById('labelConfirmPassword').classList.remove('required');
        
        // Mostrar modal
        document.getElementById('userModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar la información del usuario',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2d3748'
        });
    }
}

// Función para eliminar usuario
async function eliminarUsuario(id) {
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
            await UsuarioService.deleteUsuario(id);
            
            Swal.fire({
                title: 'Eliminado!',
                text: 'El usuario ha sido eliminado correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#2d3748'
            });
            
            // Recargar usuarios
            cargarUsuarios();
            
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el usuario',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#2d3748'
            });
        }
    }
}

// Función para aplicar filtros
async function aplicarFiltrosUsuarios() {
    const searchTerm = document.getElementById('searchUser').value;
    const roleFilter = document.getElementById('filterRole').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    try {
        // Si hay término de búsqueda, usar búsqueda
        if (searchTerm && searchTerm.trim() !== '') {
            const response = await UsuarioService.searchUsuarios(searchTerm, currentUserPage, usersPerPage);
            filteredUsers = response.content || [];
        } else {
            filteredUsers = [...allUsers];
        }
        
        // Aplicar filtros adicionales localmente
        if (roleFilter) {
            filteredUsers = filteredUsers.filter(u => u.rol === roleFilter);
        }
        
        // El filtro de estado no está en la BD, así que lo omitimos por ahora
        
        renderUsersTable();
        
    } catch (error) {
        console.error('Error al filtrar usuarios:', error);
    }
}

// Función para cargar datos geográficos
function cargarDatosGeograficos(departamento, distritoSeleccionado, municipioSeleccionado) {
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
            option.selected = distrito === distritoSeleccionado;
            distritoSelect.appendChild(option);
        });
        
        // Cargar municipios
        municipioSelect.innerHTML = '<option value="">Seleccione un municipio</option>';
        datos.municipios.forEach(municipio => {
            const option = document.createElement('option');
            option.value = municipio.toLowerCase();
            option.textContent = municipio;
            option.selected = municipio === municipioSeleccionado;
            municipioSelect.appendChild(option);
        });
    }
}

// Función para limpiar formulario
function limpiarFormularioUsuario() {
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('modalPassword').closest('.form-group').style.display = 'block';
    document.getElementById('modalConfirmPassword').closest('.form-group').style.display = 'block';
    document.getElementById('labelPassword').classList.add('required');
    document.getElementById('labelConfirmPassword').classList.add('required');
    
    // Limpiar selects dependientes
    document.getElementById('modalDistrito').innerHTML = '<option value="">Seleccione un distrito</option>';
    document.getElementById('modalMunicipio').innerHTML = '<option value="">Seleccione un municipio</option>';
}

// Función para exportar usuarios
function exportarUsuarios(formato) {
    Swal.fire({
        title: `Exportando a ${formato.toUpperCase()}`,
        text: 'Los datos se están preparando para exportar...',
        icon: 'info',
        showConfirmButton: false,
        timer: 1500
    }).then(() => {
        Swal.fire({
            title: '¡Éxito!',
            text: `Se exportaron ${filteredUsers.length} registros a ${formato.toUpperCase()}`,
            icon: 'success',
            confirmButtonText: 'Descargar',
            confirmButtonColor: '#2d3748'
        });
    });
}

// Exportar funciones globales
window.cargarUsuarios = cargarUsuarios;
window.editarUsuario = editarUsuario;
window.eliminarUsuario = eliminarUsuario;
window.aplicarFiltrosUsuarios = aplicarFiltrosUsuarios;
window.limpiarFormularioUsuario = limpiarFormularioUsuario;
window.exportarUsuarios = exportarUsuarios;