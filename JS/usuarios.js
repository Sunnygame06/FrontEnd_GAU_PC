// Datos de ejemplo para usuarios
let usuarios = [
    {
        id: 1,
        nombres: "Juan Pérez García",
        email: "juan.perez@proteccioncivil.gob.sv",
        telefono: "1234-5678",
        rol: "administrador",
        region: "occidental",
        departamento: "AHUACHAPAN",
        distrito: "GUAYMANGO",
        municipio: "AHUACHAPAN SUR",
        estado: "activo",
        unidad: "Unidad Central",
        fechaCreacion: "2024-01-15",
        delegados: "delegado1",
        filtrado: "no-aplica"
    },
    {
        id: 2,
        nombres: "María Rodríguez López",
        email: "maria.rodriguez@proteccioncivil.gob.sv",
        telefono: "2345-6789",
        rol: "usuario",
        region: "central",
        departamento: "SAN SALVADOR",
        distrito: "SAN SALVADOR",
        municipio: "SAN SALVADOR",
        estado: "activo",
        unidad: "Unidad Regional Central",
        fechaCreacion: "2024-02-20",
        delegados: "delegado2",
        filtrado: "filtro-regional"
    },
    {
        id: 3,
        nombres: "Carlos Hernández Martínez",
        email: "carlos.hernandez@proteccioncivil.gob.sv",
        telefono: "3456-7890",
        rol: "visor",
        region: "oriental",
        departamento: "SAN MIGUEL",
        distrito: "SAN MIGUEL",
        municipio: "SAN MIGUEL",
        estado: "inactivo",
        unidad: "Unidad Regional Oriental",
        fechaCreacion: "2024-03-10",
        delegados: "delegado3",
        filtrado: "filtro-departamental"
    },
    {
        id: 4,
        nombres: "Ana María Castillo",
        email: "ana.castillo@proteccioncivil.gob.sv",
        telefono: "4567-8901",
        rol: "editor",
        region: "occidental",
        departamento: "SONSONATE",
        distrito: "SONSONATE",
        municipio: "SONSONATE",
        estado: "activo",
        unidad: "Unidad Técnica",
        fechaCreacion: "2024-03-15",
        delegados: "delegado1",
        filtrado: "no-aplica"
    },
    {
        id: 5,
        nombres: "Luis Fernando Ramirez",
        email: "luis.ramirez@proteccioncivil.gob.sv",
        telefono: "5678-9012",
        rol: "usuario",
        region: "central",
        departamento: "LA LIBERTAD",
        distrito: "SANTA TECLA",
        municipio: "SANTA TECLA",
        estado: "activo",
        unidad: "Unidad Operativa",
        fechaCreacion: "2024-03-18",
        delegados: "delegado2",
        filtrado: "filtro-municipal"
    }
];

// Variables de paginación
let currentUserPage = 1;
const usersPerPage = 5;
let filteredUsers = [...usuarios];

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

// Función para cargar usuarios en la tabla con paginación
function cargarUsuarios() {
    const tbody = document.getElementById('usersTableBody');
    const loadingDiv = document.getElementById('usersLoading');
    
    // Mostrar loading
    if (loadingDiv) loadingDiv.classList.add('show');
    
    setTimeout(() => {
        tbody.innerHTML = '';
        
        const startIndex = (currentUserPage - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const usersToShow = filteredUsers.slice(startIndex, endIndex);

        if (usersToShow.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No se encontraron usuarios</h3>
                        <p>Intente ajustar los filtros de búsqueda</p>
                    </td>
                </tr>
            `;
        } else {
            usersToShow.forEach(usuario => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${usuario.nombres}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.telefono}</td>
                    <td>${usuario.rol.toUpperCase()}</td>
                    <td>${usuario.region.toUpperCase()}</td>
                    <td><span class="status-badge ${usuario.estado === 'activo' ? 'status-active' : 'status-inactive'}">${usuario.estado}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="editarUsuario(${usuario.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="action-btn delete" onclick="eliminarUsuario(${usuario.id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Actualizar información de paginación
        actualizarPaginacionUsuarios();
        
        // Ocultar loading
        if (loadingDiv) loadingDiv.classList.remove('show');
    }, 500);
}

// Función para actualizar la paginación
function actualizarPaginacionUsuarios() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const showingStart = ((currentUserPage - 1) * usersPerPage) + 1;
    const showingEnd = Math.min(currentUserPage * usersPerPage, filteredUsers.length);
    
    document.getElementById('usersShowing').textContent = `${showingStart}-${showingEnd}`;
    document.getElementById('usersTotal').textContent = filteredUsers.length;
    
    // Actualizar controles de paginación
    const paginationControls = document.getElementById('usersPagination');
    if (paginationControls) {
        paginationControls.innerHTML = '';
        
        // Botón anterior
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = 'Anterior';
        prevBtn.disabled = currentUserPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentUserPage > 1) {
                currentUserPage--;
                cargarUsuarios();
            }
        });
        paginationControls.appendChild(prevBtn);
        
        // Números de página
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentUserPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn ${i === currentUserPage ? 'active' : ''}`;
            pageBtn.textContent = i;
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
        nextBtn.disabled = currentUserPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentUserPage < totalPages) {
                currentUserPage++;
                cargarUsuarios();
            }
        });
        paginationControls.appendChild(nextBtn);
    }
}

// Función para crear nuevo usuario
function crearUsuario(usuarioData) {
    const nuevoId = Math.max(...usuarios.map(u => u.id), 0) + 1;
    const nuevoUsuario = {
        id: nuevoId,
        ...usuarioData,
        fechaCreacion: new Date().toISOString().split('T')[0],
        estado: 'activo'
    };
    
    usuarios.push(nuevoUsuario);
    aplicarFiltrosUsuarios();
    cargarUsuarios();
    
    Swal.fire({
        title: '¡Éxito!',
        text: 'Usuario creado correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2d3748'
    });
}

// Función para editar usuario
function editarUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;

    // Llenar el modal con los datos del usuario
    document.getElementById('modalUserTitle').textContent = 'Editar Usuario';
    document.getElementById('userId').value = usuario.id;
    document.getElementById('modalNombres').value = usuario.nombres;
    document.getElementById('modalTelefono').value = usuario.telefono;
    document.getElementById('modalEmail').value = usuario.email;
    document.getElementById('modalUnidad').value = usuario.unidad;
    document.getElementById('modalDelegados').value = usuario.delegados;
    document.getElementById('modalRol').value = usuario.rol;
    document.getElementById('modalRegion').value = usuario.region;
    
    // Cargar datos geográficos
    cargarDatosGeograficos(usuario.departamento.toLowerCase(), usuario.distrito, usuario.municipio);
    
    document.getElementById('modalFiltrado').value = usuario.filtrado;
    
    // Ocultar campos de contraseña en edición
    document.getElementById('modalPassword').closest('.form-group').style.display = 'none';
    document.getElementById('modalConfirmPassword').closest('.form-group').style.display = 'none';
    document.getElementById('labelPassword').classList.remove('required');
    document.getElementById('labelConfirmPassword').classList.remove('required');

    // Mostrar modal
    document.getElementById('userModal').style.display = 'block';
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

// Función para eliminar usuario
function eliminarUsuario(id) {
    Swal.fire({
        title: '¿Está seguro?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e53e3e',
        cancelButtonColor: '#718096'
    }).then((result) => {
        if (result.isConfirmed) {
            usuarios = usuarios.filter(u => u.id !== id);
            aplicarFiltrosUsuarios();
            cargarUsuarios();
            
            Swal.fire({
                title: 'Eliminado!',
                text: 'El usuario ha sido eliminado',
                icon: 'success',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#2d3748'
            });
        }
    });
}

// Función para aplicar filtros
function aplicarFiltrosUsuarios() {
    const searchTerm = document.getElementById('searchUser').value.toLowerCase();
    const roleFilter = document.getElementById('filterRole').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    filteredUsers = usuarios.filter(usuario => {
        const matchesSearch = usuario.nombres.toLowerCase().includes(searchTerm) || 
                             usuario.email.toLowerCase().includes(searchTerm);
        const matchesRole = !roleFilter || usuario.rol === roleFilter;
        const matchesStatus = !statusFilter || usuario.estado === statusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    });
    
    currentUserPage = 1;
    cargarUsuarios();
}

// Función para limpiar formulario de usuario
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

// Función para exportar datos
function exportarUsuarios(formato) {
    const data = filteredUsers.map(usuario => ({
        'Nombres': usuario.nombres,
        'Email': usuario.email,
        'Teléfono': usuario.telefono,
        'Rol': usuario.rol.toUpperCase(),
        'Región': usuario.region.toUpperCase(),
        'Departamento': usuario.departamento,
        'Municipio': usuario.municipio,
        'Estado': usuario.estado,
        'Unidad': usuario.unidad,
        'Fecha Creación': usuario.fechaCreacion
    }));

    Swal.fire({
        title: `Exportando a ${formato.toUpperCase()}`,
        text: 'Los datos se están preparando para exportar...',
        icon: 'info',
        showConfirmButton: false,
        timer: 1500
    }).then(() => {
        Swal.fire({
            title: '¡Éxito!',
            text: `Se exportaron ${data.length} registros a ${formato.toUpperCase()}`,
            icon: 'success',
            confirmButtonText: 'Descargar',
            confirmButtonColor: '#2d3748'
        });
    });
}

// Función para obtener todos los usuarios (para uso en actividades)
function obtenerTodosLosUsuarios() {
    return usuarios.filter(usuario => usuario.estado === 'activo');
}

// Función para obtener usuario por email
function obtenerUsuarioPorEmail(email) {
    return usuarios.find(usuario => usuario.email === email);
}

// Función para inicializar el módulo de usuarios
function initializeUsersModule() {
    // Agregar loading a la tabla
    const tableContainer = document.querySelector('#usersContent .table-container');
    if (tableContainer && !document.getElementById('usersLoading')) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'usersLoading';
        loadingDiv.className = 'table-loading';
        loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
        tableContainer.appendChild(loadingDiv);
    }
    
    cargarUsuarios();

    // Event listeners para el modal de usuarios
    document.getElementById('newUserBtn').addEventListener('click', () => {
        document.getElementById('modalUserTitle').textContent = 'Nuevo Usuario';
        document.getElementById('userId').value = '';
        limpiarFormularioUsuario();
        document.getElementById('userModal').style.display = 'block';
    });

    document.getElementById('closeUserModal').addEventListener('click', () => {
        document.getElementById('userModal').style.display = 'none';
    });

    document.getElementById('cancelUserForm').addEventListener('click', () => {
        document.getElementById('userModal').style.display = 'none';
    });

    document.getElementById('clearUserForm').addEventListener('click', () => {
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

    document.getElementById('userForm').addEventListener('submit', (e) => {
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

        // Validar email único
        const email = document.getElementById('modalEmail').value;
        const emailExists = usuarios.some(u => u.email === email && u.id !== parseInt(userId));
        if (emailExists) {
            Swal.fire({
                title: 'Error',
                text: 'El email ya está registrado en el sistema',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#2d3748'
            });
            return;
        }

        const formData = {
            nombres: document.getElementById('modalNombres').value,
            telefono: document.getElementById('modalTelefono').value,
            email: email,
            unidad: document.getElementById('modalUnidad').value,
            delegados: document.getElementById('modalDelegados').value,
            rol: document.getElementById('modalRol').value,
            region: document.getElementById('modalRegion').value,
            departamento: document.getElementById('modalDepartamento').value.toUpperCase(),
            distrito: document.getElementById('modalDistrito').value.toUpperCase(),
            municipio: document.getElementById('modalMunicipio').value.toUpperCase(),
            filtrado: document.getElementById('modalFiltrado').value
        };

        if (userId) {
            // Editar usuario existente
            const index = usuarios.findIndex(u => u.id === parseInt(userId));
            if (index !== -1) {
                usuarios[index] = { ...usuarios[index], ...formData };
                aplicarFiltrosUsuarios();
                cargarUsuarios();
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Usuario actualizado correctamente',
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#2d3748'
                });
            }
        } else {
            // Crear nuevo usuario
            crearUsuario(formData);
        }

        document.getElementById('userModal').style.display = 'none';
    });

    // Filtros
    document.getElementById('applyFilters').addEventListener('click', aplicarFiltrosUsuarios);

    document.getElementById('clearFilters').addEventListener('click', () => {
        document.getElementById('searchUser').value = '';
        document.getElementById('filterRole').value = '';
        document.getElementById('filterStatus').value = '';
        aplicarFiltrosUsuarios();
    });

    // Búsqueda en tiempo real
    document.getElementById('searchUser').addEventListener('input', aplicarFiltrosUsuarios);

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
    document.getElementById('modalDepartamento').addEventListener('change', function() {
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