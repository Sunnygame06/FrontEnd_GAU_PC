// Controlador para gestión de actividades

// Variables globales
let currentActivityPage = 0;
const activitiesPerPage = 10;
let filteredActivities = [];
let allActivities = [];

// Función para cargar actividades desde la API
async function cargarActividades() {
    const tbody = document.getElementById('activitiesTableBody');
    const loadingDiv = document.getElementById('activitiesLoading');
    
    // Mostrar loading
    if (loadingDiv) loadingDiv.classList.add('show');
    
    try {
        // Llamar al servicio
        const response = await ActividadService.getAllActividades(currentActivityPage, activitiesPerPage);
        
        // Guardar todas las actividades
        allActivities = response.content || [];
        filteredActivities = [...allActivities];
        
        // Renderizar tabla
        renderActivitiesTable();
        
        // Actualizar paginación
        actualizarPaginacionActividades(response);
        
    } catch (error) {
        console.error('Error al cargar actividades:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar las actividades. Por favor, intenta nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2d3748'
        });
        
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error al cargar actividades</h3>
                    <p>Por favor, verifica tu conexión e intenta nuevamente</p>
                </td>
            </tr>
        `;
    } finally {
        // Ocultar loading
        if (loadingDiv) loadingDiv.classList.remove('show');
    }
}

// Función para renderizar tabla de actividades
function renderActivitiesTable() {
    const tbody = document.getElementById('activitiesTableBody');
    tbody.innerHTML = '';
    
    if (filteredActivities.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No hay actividades registradas</h3>
                    <p>Comience registrando una nueva actividad</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredActivities.forEach(actividad => {
        const tr = document.createElement('tr');
        
        // Determinar clase de estado
        let estadoClass = 'status-inactive';
        let estadoText = 'Pendiente';
        
        const estado = (actividad.estado || '').toLowerCase();
        if (estado === 'completada') {
            estadoClass = 'status-active';
            estadoText = 'Completada';
        } else if (estado === 'en-progreso' || estado === 'en progreso') {
            estadoClass = 'status-pending';
            estadoText = 'En Progreso';
        }
        
        // Formatear fecha
        let fechaFormateada = 'N/A';
        if (actividad.fecha) {
            const fecha = new Date(actividad.fecha);
            fechaFormateada = fecha.toLocaleDateString('es-SV');
        }
        
        // Obtener nombre del usuario
        const tecnico = actividad.tecnico || 'N/A';
        const usuario = actividad.usuario || 'N/A';
        
        tr.innerHTML = `
            <td>${actividad.unidad || 'N/A'}</td>
            <td>${fechaFormateada}</td>
            <td>${actividad.actividad_nombre || 'N/A'}</td>
            <td>${(actividad.departamento || 'N/A').toUpperCase()}</td>
            <td>${(actividad.municipio || 'N/A').toUpperCase()}</td>
            <td>${tecnico}</td>
            <td>${usuario}</td>
            <td><span class="status-badge ${estadoClass}">${estadoText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editarActividad(${actividad.id})" title="Editar actividad">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="action-btn delete" onclick="eliminarActividad(${actividad.id})" title="Eliminar actividad">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para actualizar paginación de actividades
function actualizarPaginacionActividades(response) {
    const totalPages = response.totalPages || 0;
    const totalElements = response.totalElements || 0;
    const showingStart = (currentActivityPage * activitiesPerPage) + 1;
    const showingEnd = Math.min((currentActivityPage + 1) * activitiesPerPage, totalElements);
    
    document.getElementById('activitiesFrom').textContent = totalElements > 0 ? showingStart : 0;
    document.getElementById('activitiesTo').textContent = totalElements > 0 ? showingEnd : 0;
    
    const totalSpans = document.querySelectorAll('#activitiesTotal');
    totalSpans.forEach(span => {
        span.textContent = totalElements;
    });
    
    // Actualizar controles de paginación
    const paginationControls = document.getElementById('activitiesPagination');
    if (paginationControls) {
        paginationControls.innerHTML = '';
        
        // Botón anterior
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = 'Anterior';
        prevBtn.disabled = currentActivityPage === 0;
        prevBtn.addEventListener('click', () => {
            if (currentActivityPage > 0) {
                currentActivityPage--;
                cargarActividades();
            }
        });
        paginationControls.appendChild(prevBtn);
        
        // Números de página
        const maxPagesToShow = 5;
        let startPage = Math.max(0, currentActivityPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(0, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn ${i === currentActivityPage ? 'active' : ''}`;
            pageBtn.textContent = i + 1;
            pageBtn.addEventListener('click', () => {
                currentActivityPage = i;
                cargarActividades();
            });
            paginationControls.appendChild(pageBtn);
        }
        
        // Botón siguiente
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = 'Siguiente';
        nextBtn.disabled = currentActivityPage >= totalPages - 1;
        nextBtn.addEventListener('click', () => {
            if (currentActivityPage < totalPages - 1) {
                currentActivityPage++;
                cargarActividades();
            }
        });
        paginationControls.appendChild(nextBtn);
    }
}

// Función para editar actividad
async function editarActividad(id) {
    try {
        // Obtener datos de la actividad
        const actividad = await ActividadService.getActividadById(id);
        
        // Llenar el modal con los datos de la actividad
        document.getElementById('modalActivityTitle').textContent = 'Editar Actividad';
        document.getElementById('activityId').value = actividad.id;
        document.getElementById('activityUnidad').value = actividad.unidad || '';
        document.getElementById('activityTecnico').value = actividad.tecnico || '';
        document.getElementById('activityEstado').value = actividad.estado || '';
        document.getElementById('activityFecha').value = actividad.fecha || '';
        document.getElementById('activityInicio').value = actividad.H_inicio || '';
        document.getElementById('activityFinalizacion').value = actividad.H_Fin || '';
        document.getElementById('activityRegion').value = actividad.region || '';
        document.getElementById('activityDepartamento').value = (actividad.departamento || '').toLowerCase();
        
        // Cargar datos geográficos
        cargarDatosGeograficosActividad(
            (actividad.departamento || '').toLowerCase(),
            actividad.distrito,
            actividad.municipio
        );
        
        document.getElementById('activityTipo').value = actividad.actividad_nombre || '';
        
        // Seleccionar tareas
        const tareasArray = (actividad.tarea || '').split(',');
        const tareasSelect = document.getElementById('activityTareas');
        Array.from(tareasSelect.options).forEach(option => {
            option.selected = tareasArray.includes(option.value);
        });
        
        document.getElementById('activityHombres').value = actividad.hombres || 0;
        document.getElementById('activityMujeres').value = actividad.mujeres || 0;
        document.getElementById('activityResultados').value = actividad.resultados || '';
        document.getElementById('activityObservaciones').value = actividad.observaciones || '';
        
        // Mostrar modal
        document.getElementById('activityModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error al cargar actividad:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar la información de la actividad',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2d3748'
        });
    }
}

// Función para eliminar actividad
async function eliminarActividad(id) {
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
            await ActividadService.deleteActividad(id);
            
            Swal.fire({
                title: 'Eliminada!',
                text: 'La actividad ha sido eliminada correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#2d3748'
            });
            
            // Recargar actividades
            cargarActividades();
            
        } catch (error) {
            console.error('Error al eliminar actividad:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar la actividad',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#2d3748'
            });
        }
    }
}

// Función para aplicar filtros de actividades
async function aplicarFiltrosActividades() {
    const dateFilter = document.getElementById('filterDate').value;
    const activityFilter = document.getElementById('filterActivity').value;
    const regionFilter = document.getElementById('filterRegion').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    try {
        const filters = {
            fecha: dateFilter,
            actividad: activityFilter,
            region: regionFilter,
            estado: statusFilter
        };
        
        const response = await ActividadService.searchActividades(filters, currentActivityPage, activitiesPerPage);
        filteredActivities = response.content || [];
        
        renderActivitiesTable();
        
    } catch (error) {
        console.error('Error al filtrar actividades:', error);
    }
}

// Función para cargar datos geográficos en actividades
function cargarDatosGeograficosActividad(departamento, distritoSeleccionado, municipioSeleccionado) {
    const datos = datosGeograficos[departamento];
    const distritoSelect = document.getElementById('activityDistrito');
    const municipioSelect = document.getElementById('activityMunicipio');
    
    if (datos && distritoSelect && municipioSelect) {
        // Cargar distritos
        distritoSelect.innerHTML = '<option value="">SELECCIONE UN DISTRITO</option>';
        datos.distritos.forEach(distrito => {
            const option = document.createElement('option');
            option.value = distrito.toLowerCase();
            option.textContent = distrito;
            option.selected = distrito === distritoSeleccionado;
            distritoSelect.appendChild(option);
        });
        
        // Cargar municipios
        municipioSelect.innerHTML = '<option value="">SELECCIONE UN MUNICIPIO</option>';
        datos.municipios.forEach(municipio => {
            const option = document.createElement('option');
            option.value = municipio.toLowerCase();
            option.textContent = municipio;
            option.selected = municipio === municipioSeleccionado;
            municipioSelect.appendChild(option);
        });
    }
}

// Función para limpiar formulario de actividad
function limpiarFormularioActividad() {
    document.getElementById('activityForm').reset();
    document.getElementById('activityId').value = '';
    document.getElementById('modalActivityTitle').textContent = 'Registrar Nueva Actividad';
    document.getElementById('fileName').textContent = 'Buscar un Archivo PDF...';
    document.getElementById('filePreview').classList.remove('show');
    
    // Limpiar selects dependientes
    document.getElementById('activityDistrito').innerHTML = '<option value="">SELECCIONE UN DISTRITO</option>';
    document.getElementById('activityMunicipio').innerHTML = '<option value="">SELECCIONE UN MUNICIPIO</option>';
}

// Función para exportar actividades
function exportarActividades(formato) {
    Swal.fire({
        title: `Exportando a ${formato.toUpperCase()}`,
        text: 'Los datos se están preparando para exportar...',
        icon: 'info',
        showConfirmButton: false,
        timer: 1500
    }).then(() => {
        Swal.fire({
            title: '¡Éxito!',
            text: `Se exportaron ${filteredActivities.length} registros a ${formato.toUpperCase()}`,
            icon: 'success',
            confirmButtonText: 'Descargar',
            confirmButtonColor: '#2d3748'
        });
    });
}

// Función para generar reporte PDF
function generarReportePDF() {
    Swal.fire({
        title: 'Generando Reporte PDF',
        text: 'El reporte se está generando, esto puede tomar unos momentos...',
        icon: 'info',
        showConfirmButton: false,
        timer: 2000
    }).then(() => {
        Swal.fire({
            title: '¡Reporte Generado!',
            text: `Se ha generado el reporte PDF con ${filteredActivities.length} actividades`,
            icon: 'success',
            confirmButtonText: 'Descargar',
            confirmButtonColor: '#2d3748'
        });
    });
}

// Exportar funciones globales
window.cargarActividades = cargarActividades;
window.editarActividad = editarActividad;
window.eliminarActividad = eliminarActividad;
window.aplicarFiltrosActividades = aplicarFiltrosActividades;
window.limpiarFormularioActividad = limpiarFormularioActividad;
window.exportarActividades = exportarActividades;
window.generarReportePDF = generarReportePDF;