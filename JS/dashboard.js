// Verificar autenticación
if (localStorage.getItem('isAuthenticated') !== 'true') {
    window.location.href = 'index.html';
}

// Cargar información del usuario
document.addEventListener('DOMContentLoaded', function() {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        document.getElementById('userName').textContent = userEmail.split('@')[0];
    }
    
    // Configurar navegación
    setupNavigation();
    
    // Cargar estadísticas iniciales
    cargarEstadisticas();
});

// Función para cargar estadísticas
function cargarEstadisticas() {
    // Verificar que las variables existen antes de usarlas
    const totalUsuarios = window.usuarios ? window.usuarios.length : 0;
    const usuariosActivos = window.usuarios ? window.usuarios.filter(u => u.estado === 'activo').length : 0;
    const totalActividades = window.actividades ? window.actividades.length : 0;
    const actividadesCompletadas = window.actividades ? window.actividades.filter(a => a.estado === 'completada').length : 0;
    
    // Actualizar tarjetas de estadísticas
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 3) {
        statNumbers[0].textContent = totalActividades;
        statNumbers[1].textContent = totalUsuarios;
        statNumbers[2].textContent = actividadesCompletadas;
    }
}

// Configurar navegación
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase active de todos los enlaces
            document.querySelectorAll('.nav-link').forEach(item => {
                item.classList.remove('active');
            });
            
            // Agregar clase active al enlace clickeado
            this.classList.add('active');
            
            // Ocultar todos los contenidos
            document.querySelectorAll('.welcome-content, .activities-content, .users-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Mostrar el contenido correspondiente
            const target = this.getAttribute('data-target');
            if (target === 'activities') {
                document.getElementById('activitiesContent').classList.add('active');
                // Asegurar que el módulo de actividades esté cargado
                if (!document.querySelector('#activitiesContent .table-container')) {
                    loadActivitiesModule();
                }
                // Recargar actividades al cambiar a la pestaña
                if (typeof cargarActividades === 'function') {
                    cargarActividades();
                }
            } else if (target === 'users') {
                document.getElementById('usersContent').classList.add('active');
                // Asegurar que el módulo de usuarios esté cargado
                if (!document.querySelector('#usersContent .table-container')) {
                    loadUsersModule();
                }
                // Recargar usuarios al cambiar a la pestaña
                if (typeof cargarUsuarios === 'function') {
                    cargarUsuarios();
                }
            } else {
                document.getElementById('welcomeContent').classList.add('active');
                cargarEstadisticas();
            }
        });
    });
}

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', function() {
    Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Está seguro de que desea cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2d3748',
        cancelButtonColor: '#718096'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userEmail');
            window.location.href = 'index.html';
        }
    });
});

// Cargar módulo de actividades
function loadActivitiesModule() {
    const activitiesContent = document.getElementById('activitiesContent');
    
    // Solo cargar si no está ya cargado
    if (activitiesContent.querySelector('.table-container')) {
        return;
    }
    
    activitiesContent.innerHTML = `
        <div class="content-header">
            <div class="page-title">
                <h2>Gestión de Actividades</h2>
                <p>Registre y administre las actividades del sistema</p>
            </div>
            <div class="page-actions">
                <button class="btn btn-primary" id="newActivityBtn">
                    <i class="fas fa-plus-circle"></i>
                    Nueva Actividad
                </button>
                <div class="export-options">
                    <button class="btn btn-secondary">
                        <i class="fas fa-download"></i>
                        Exportar
                    </button>
                    <div class="export-dropdown">
                        <button class="export-option" data-format="excel">
                            <i class="fas fa-file-excel"></i>
                            Excel
                        </button>
                        <button class="export-option" data-format="pdf">
                            <i class="fas fa-file-pdf"></i>
                            PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="filter-section">
            <div class="filter-row">
                <div class="form-group">
                    <label for="filterDate">Fecha</label>
                    <input type="date" id="filterDate" class="form-control">
                </div>
                <div class="form-group">
                    <label for="filterActivity">Actividad</label>
                    <select id="filterActivity" class="form-control">
                        <option value="">Todas las actividades</option>
                        <option value="capacitacion">Capacitación</option>
                        <option value="simulacro">Simulacro</option>
                        <option value="inspeccion">Inspección</option>
                        <option value="evaluacion">Evaluación</option>
                        <option value="coordinacion">Coordinación</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="filterRegion">Región</label>
                    <select id="filterRegion" class="form-control">
                        <option value="">Todas las regiones</option>
                        <option value="occidental">OCCIDENTAL</option>
                        <option value="central">CENTRAL</option>
                        <option value="oriental">ORIENTAL</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="filterStatus">Estado</label>
                    <select id="filterStatus" class="form-control">
                        <option value="">Todos los estados</option>
                        <option value="completada">Completada</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="en-progreso">En Progreso</option>
                    </select>
                </div>
            </div>
            <div class="filter-actions">
                <button class="btn btn-secondary" id="clearActivityFilters">
                    <i class="fas fa-times"></i>
                    Limpiar
                </button>
                <button class="btn btn-primary" id="applyActivityFilters">
                    <i class="fas fa-filter"></i>
                    Filtrar
                </button>
                <button class="btn btn-success" id="generateReport">
                    <i class="fas fa-file-pdf"></i>
                    Reporte
                </button>
            </div>
        </div>
        
        <div class="table-container activities-container">
            <div class="table-header">
                <div class="table-title">Lista de Actividades</div>
                <div class="table-actions">
                    <span class="table-info">Total: <strong id="activitiesTotal">0</strong> actividades</span>
                </div>
            </div>
            <div class="table-scroll-wrapper">
                <table class="activities-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Actividad</th>
                            <th>Departamento</th>
                            <th>Municipio</th>
                            <th>Rol</th>
                            <th>Usuario</th>
                            <th>Estado</th>
                            <th>Opciones</th>
                        </tr>
                    </thead>
                    <tbody id="activitiesTableBody">
                        <!-- Las actividades se cargarán aquí dinámicamente -->
                    </tbody>
                </table>
            </div>
            <div class="pagination">
                <div class="pagination-info">
                    Mostrando registros del <span id="activitiesFrom">0</span> al <span id="activitiesTo">0</span> de un total de <span id="activitiesTotal">0</span> registros
                </div>
                <div class="pagination-controls" id="activitiesPagination">
                    <!-- Controles de paginación se cargarán aquí -->
                </div>
            </div>
        </div>
        
        <!-- Modal para nueva actividad -->
        <div class="modal" id="activityModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modalActivityTitle">Registrar Nueva Actividad</h3>
                    <button class="modal-close" id="closeActivityModal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="activityForm">
                        <input type="hidden" id="activityId">
                        <div class="form-section">
                            <h2 class="section-title">
                                <i class="fas fa-info-circle"></i>
                                Información General
                            </h2>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="activityEstado" class="required">Estado</label>
                                    <select id="activityEstado" class="form-control" required>
                                        <option value="">SELECCIONE</option>
                                        <option value="completada">Completada</option>
                                        <option value="pendiente">Pendiente</option>
                                        <option value="en-progreso">En Progreso</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="activityFecha" class="required">Fecha</label>
                                    <input type="date" id="activityFecha" class="form-control" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="activityInicio" class="required">Hora de Inicio</label>
                                    <input type="time" id="activityInicio" class="form-control" required value="08:00">
                                </div>
                                <div class="form-group">
                                    <label for="activityFinalizacion" class="required">Hora de Finalización</label>
                                    <input type="time" id="activityFinalizacion" class="form-control" required value="17:00">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h2 class="section-title">
                                <i class="fas fa-map"></i>
                                Ubicación
                            </h2>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="activityRegion" class="required">Región</label>
                                    <select id="activityRegion" class="form-control" required>
                                        <option value="">SELECCIONE UNA REGIÓN</option>
                                        <option value="occidental">OCCIDENTAL</option>
                                        <option value="central">CENTRAL</option>
                                        <option value="oriental">ORIENTAL</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="activityDepartamento" class="required">Departamento</label>
                                    <select id="activityDepartamento" class="form-control" required>
                                        <option value="">SELECCIONE UN DEPARTAMENTO</option>
                                        <option value="ahuachapan">AHUACHAPAN</option>
                                        <option value="santa-ana">SANTA ANA</option>
                                        <option value="sonsonate">SONSONATE</option>
                                        <option value="san-salvador">SAN SALVADOR</option>
                                        <option value="la-libertad">LA LIBERTAD</option>
                                        <option value="san-miguel">SAN MIGUEL</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="activityMunicipio" class="required">Municipio</label>
                                    <select id="activityMunicipio" class="form-control" required>
                                        <option value="">SELECCIONE UN MUNICIPIO</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="activityDistrito" class="required">Distrito</label>
                                    <select id="activityDistrito" class="form-control" required>
                                        <option value="">SELECCIONE UN DISTRITO</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h2 class="section-title">
                                <i class="fas fa-tasks"></i>
                                Detalles de la Actividad
                            </h2>
                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label for="activityTipo" class="required">Tipo de Actividad</label>
                                    <select id="activityTipo" class="form-control" required>
                                        <option value="">SELECCIONE</option>
                                        <option value="Capacitación en Primeros Auxilios">Capacitación en Primeros Auxilios</option>
                                        <option value="Simulacro de Evacuación">Simulacro de Evacuación</option>
                                        <option value="Inspección de Infraestructura">Inspección de Infraestructura</option>
                                        <option value="Evaluación de Riesgos">Evaluación de Riesgos</option>
                                        <option value="Coordinación Interinstitucional">Coordinación Interinstitucional</option>
                                        <option value="Taller de Prevención">Taller de Prevención</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label for="activityTareas">Tareas (Puedes seleccionar varias)</label>
                                    <select id="activityTareas" class="form-control" multiple>
                                        <option value="tarea1">Tarea de preparación</option>
                                        <option value="tarea2">Coordinación con autoridades</option>
                                        <option value="tarea3">Ejecución de actividad</option>
                                        <option value="tarea4">Evaluación de resultados</option>
                                        <option value="tarea5">Elaboración de informe</option>
                                        <option value="tarea6">Seguimiento y monitoreo</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h2 class="section-title">
                                <i class="fas fa-users"></i>
                                Participantes
                            </h2>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="activityHombres">Hombres</label>
                                    <input type="number" id="activityHombres" class="form-control" min="0" value="0">
                                </div>
                                <div class="form-group">
                                    <label for="activityMujeres">Mujeres</label>
                                    <input type="number" id="activityMujeres" class="form-control" min="0" value="0">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h2 class="section-title">
                                <i class="fas fa-clipboard-check"></i>
                                Resultados y Observaciones
                            </h2>
                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label for="activityResultados">Resultados de la Actividad</label>
                                    <textarea id="activityResultados" class="form-control" placeholder="Escribe aquí los Resultados de la Actividad" rows="4"></textarea>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label for="activityObservaciones">Observaciones o Comentarios</label>
                                    <textarea id="activityObservaciones" class="form-control" placeholder="Escribe aquí los observaciones o comentarios" rows="4"></textarea>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h2 class="section-title">
                                <i class="fas fa-paperclip"></i>
                                Documentación
                            </h2>
                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label for="activityRespaldo">Respaldo (Archivo PDF)</label>
                                    <div class="file-upload">
                                        <input type="file" id="activityRespaldo" class="file-upload-input" accept=".pdf">
                                        <label for="activityRespaldo" class="file-upload-label">
                                            <span id="fileName">Buscar un Archivo PDF...</span>
                                            <i class="fas fa-search"></i>
                                        </label>
                                    </div>
                                    <div class="file-preview" id="filePreview">
                                        <i class="fas fa-file-pdf file-preview-icon"></i>
                                        <div class="file-preview-info">
                                            <div class="file-preview-name" id="previewFileName"></div>
                                            <div class="file-preview-size" id="previewFileSize"></div>
                                        </div>
                                        <button type="button" class="file-preview-remove" id="removeFile">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <div class="modal-footer">
                                <div class="footer-buttons">
                                    <button type="button" class="btn-clear" id="clearActivityForm">
                                        <i class="fas fa-broom"></i>
                                        Limpiar Formulario
                                    </button>
                                    <div class="modal-action-buttons">
                                        <button type="button" class="btn-cancel" id="cancelActivityForm">
                                            <i class="fas fa-times"></i>
                                            Cancelar
                                        </button>
                                        <button type="submit" class="btn-save">
                                            <i class="fas fa-save"></i>
                                            Guardar Actividad
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        
        <!-- NUEVO MODAL: Detalles de la Actividad -->
        <div class="modal" id="activityDetailModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detalles de la Actividad</h3>
                    <button class="modal-close" id="closeActivityDetailModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="detail-container">
                        <div class="detail-section">
                            <h2 class="section-title">
                                <i class="fas fa-info-circle"></i>
                                Información General
                            </h2>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Fecha:</label>
                                    <span id="detailFecha">-</span>
                                </div>
                                <div class="detail-item">
                                    <label>Actividad:</label>
                                    <span id="detailActividad">-</span>
                                </div>
                                <div class="detail-item">
                                    <label>Estado:</label>
                                    <span id="detailEstado">-</span>
                                </div>
                                <div class="detail-item">
                                    <label>Hora de Inicio:</label>
                                    <span id="detailHoraInicio">-</span>
                                </div>
                                <div class="detail-item">
                                    <label>Hora de Finalización:</label>
                                    <span id="detailHoraFin">-</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h2 class="section-title">
                                <i class="fas fa-map"></i>
                                Ubicación
                            </h2>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Región:</label>
                                    <span id="detailRegion">-</span>
                                </div>
                                <div class="detail-item">
                                    <label>Departamento:</label>
                                    <span id="detailDepartamento">-</span>
                                </div>
                                <div class="detail-item">
                                    <label>Municipio:</label>
                                    <span id="detailMunicipio">-</span>
                                </div>
                                <div class="detail-item">
                                    <label>Distrito:</label>
                                    <span id="detailDistrito">-</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h2 class="section-title">
                                <i class="fas fa-users"></i>
                                Personal
                            </h2>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Técnico:</label>
                                    <span id="detailTecnico">-</span>
                                </div>
                                <div class="detail-item">
                                    <label>Usuario:</label>
                                    <span id="detailUsuario">-</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h2 class="section-title">
                                <i class="fas fa-tasks"></i>
                                Tareas Realizadas
                            </h2>
                            <div id="detailTareas" class="tareas-container">
                                <!-- Las tareas se cargarán aquí dinámicamente -->
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h2 class="section-title">
                                <i class="fas fa-user-friends"></i>
                                Participantes
                            </h2>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Hombres:</label>
                                    <span id="detailHombres">-</span>
                                </div>
                                <div class="detail-item">
                                    <label>Mujeres:</label>
                                    <span id="detailMujeres">-</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h2 class="section-title">
                                <i class="fas fa-clipboard-check"></i>
                                Resultados y Observaciones
                            </h2>
                            <div class="detail-full">
                                <div class="detail-item full-width">
                                    <label>Resultados:</label>
                                    <div id="detailResultados" class="detail-text">-</div>
                                </div>
                                <div class="detail-item full-width">
                                    <label>Observaciones:</label>
                                    <div id="detailObservaciones" class="detail-text">-</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h2 class="section-title">
                                <i class="fas fa-calendar-alt"></i>
                                Información de Registro
                            </h2>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Fecha de Registro:</label>
                                    <span id="detailFechaRegistro">-</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="closeDetailBtn">
                        <i class="fas fa-times"></i>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Inicializar funcionalidad del módulo de actividades
    if (typeof initializeActivitiesModule === 'function') {
        initializeActivitiesModule();
    } else {
        console.error('initializeActivitiesModule no está disponible');
    }
}

// Cargar módulo de usuarios
function loadUsersModule() {
    const usersContent = document.getElementById('usersContent');
    
    // Solo cargar si no está ya cargado
    if (usersContent.querySelector('.table-container')) {
        return;
    }
    
    usersContent.innerHTML = `
        <div class="content-header">
            <div class="page-title">
                <h2>Gestión de Usuarios</h2>
                <p>Administre los usuarios del sistema</p>
            </div>
            <div class="page-actions">
                <button class="btn btn-primary" id="newUserBtn">
                    <i class="fas fa-plus-circle"></i>
                    Nuevo Usuario
                </button>
                <div class="export-options">
                    <button class="btn btn-secondary">
                        <i class="fas fa-download"></i>
                        Exportar
                    </button>
                    <div class="export-dropdown">
                        <button class="export-option" data-format="excel">
                            <i class="fas fa-file-excel"></i>
                            Excel
                        </button>
                        <button class="export-option" data-format="pdf">
                            <i class="fas fa-file-pdf"></i>
                            PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="filter-section">
            <div class="filter-row">
                <div class="form-group">
                    <label for="searchUser">Buscar Usuario</label>
                    <input type="text" id="searchUser" class="form-control" placeholder="Buscar por nombre o email...">
                </div>
                <div class="form-group">
                    <label for="filterRole">Filtrar por Rol</label>
                    <select id="filterRole" class="form-control">
                        <option value="">Todos los roles</option>
                        <option value="administrador">ADMINISTRADOR</option>
                        <option value="usuario">USUARIO</option>
                        <option value="visor">VISOR</option>
                        <option value="editor">EDITOR</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="filterStatus">Filtrar por Estado</label>
                    <select id="filterStatus" class="form-control">
                        <option value="">Todos los estados</option>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>
            </div>
            <div class="filter-actions">
                <button class="btn btn-secondary" id="clearFilters">
                    <i class="fas fa-times"></i>
                    Limpiar Filtros
                </button>
                <button class="btn btn-primary" id="applyFilters">
                    <i class="fas fa-filter"></i>
                    Aplicar Filtros
                </button>
            </div>
        </div>
        
        <div class="table-container users-container">
            <div class="table-header">
                <div class="table-title">Lista de Usuarios</div>
            </div>
            <div class="table-scroll-wrapper">
                <table class="users-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Rol</th>
                            <th>Región</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="usersTableBody">
                        <!-- Los usuarios se cargarán aquí dinámicamente -->
                    </tbody>
                </table>
            </div>
            <div class="pagination">
                <div class="pagination-info">
                    Mostrando <span id="usersShowing">0</span> de <span id="usersTotal">0</span> usuarios
                </div>
                <div class="pagination-controls" id="usersPagination">
                    <!-- Controles de paginación se cargarán aquí -->
                </div>
            </div>
        </div>
        
        <!-- Modal para nuevo usuario -->
        <div class="modal" id="userModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modalUserTitle">Nuevo Usuario</h3>
                    <button class="modal-close" id="closeUserModal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="userForm">
                        <input type="hidden" id="userId">
                        <div class="form-section">
                            <h2 class="section-title">
                                <i class="fas fa-user"></i>
                                Información Personal
                            </h2>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="modalNombres" class="required">Nombres Completos</label>
                                    <input type="text" id="modalNombres" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label for="modalTelefono" class="required">Teléfono</label>
                                    <input type="tel" id="modalTelefono" class="form-control" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="modalEmail" class="required">Correo Electrónico</label>
                                    <input type="email" id="modalEmail" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label for="modalUnidad" class="required">Unidad Organizacional</label>
                                    <input type="text" id="modalUnidad" class="form-control" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h2 class="section-title">
                                <i class="fas fa-key"></i>
                                Credenciales de Acceso
                            </h2>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="modalPassword" id="labelPassword" class="required">Contraseña</label>
                                    <input type="password" id="modalPassword" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label for="modalDelegados" class="required">Delegados Territoriales</label>
                                    <select id="modalDelegados" class="form-control" required>
                                        <option value="">Seleccione una opción</option>
                                        <option value="delegado1">Delegado Territorial 1</option>
                                        <option value="delegado2">Delegado Territorial 2</option>
                                        <option value="delegado3">Delegado Territorial 3</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="modalConfirmPassword" id="labelConfirmPassword" class="required">Confirmar Contraseña</label>
                                    <input type="password" id="modalConfirmPassword" class="form-control" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h2 class="section-title">
                                <i class="fas fa-user-shield"></i>
                                Configuración de Permisos
                            </h2>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="modalRol" class="required">Rol de Usuario</label>
                                    <select id="modalRol" class="form-control" required>
                                        <option value="">Seleccione un rol</option>
                                        <option value="administrador">ADMINISTRADOR</option>
                                        <option value="usuario">USUARIO</option>
                                        <option value="visor">VISOR</option>
                                        <option value="editor">EDITOR</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="modalRegion" class="required">Región Asignada</label>
                                    <select id="modalRegion" class="form-control" required>
                                        <option value="">Seleccione una región</option>
                                        <option value="occidental">OCCIDENTAL</option>
                                        <option value="central">CENTRAL</option>
                                        <option value="oriental">ORIENTAL</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h2 class="section-title">
                                <i class="fas fa-map-marker-alt"></i>
                                Ubicación Geográfica
                            </h2>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="modalDepartamento" class="required">Departamento</label>
                                    <select id="modalDepartamento" class="form-control" required>
                                        <option value="">Seleccione un departamento</option>
                                        <option value="ahuachapan">AHUACHAPAN</option>
                                        <option value="santa-ana">SANTA ANA</option>
                                        <option value="sonsonate">SONSONATE</option>
                                        <option value="san-salvador">SAN SALVADOR</option>
                                        <option value="la-libertad">LA LIBERTAD</option>
                                        <option value="san-miguel">SAN MIGUEL</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="modalDistrito" class="required">Distrito</label>
                                    <select id="modalDistrito" class="form-control" required>
                                        <option value="">Seleccione un distrito</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="modalMunicipio" class="required">Municipio</label>
                                    <select id="modalMunicipio" class="form-control" required>
                                        <option value="">Seleccione un municipio</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="modalFiltrado">Configuración de Filtrado</label>
                                    <select id="modalFiltrado" class="form-control">
                                        <option value="no-aplica">NO APLICA</option>
                                        <option value="filtro-regional">FILTRO REGIONAL</option>
                                        <option value="filtro-departamental">FILTRO DEPARTAMENTAL</option>
                                        <option value="filtro-municipal">FILTRO MUNICIPAL</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <div class="modal-footer">
                                <div class="footer-buttons">
                                    <button type="button" class="btn-clear" id="clearUserForm">
                                        <i class="fas fa-broom"></i>
                                        Limpiar Formulario
                                    </button>
                                    <div class="modal-action-buttons">
                                        <button type="button" class="btn-cancel" id="cancelUserForm">
                                            <i class="fas fa-times"></i>
                                            Cancelar
                                        </button>
                                        <button type="submit" class="btn-save">
                                            <i class="fas fa-save"></i>
                                            Guardar Usuario
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Inicializar funcionalidad del módulo de usuarios
    if (typeof initializeUsersModule === 'function') {
        initializeUsersModule();
    } else {
        console.error('initializeUsersModule no está disponible');
    }
}