// Datos de ejemplo para actividades
let actividades = [
    {
        id: 1,
        fecha: "2024-03-15",
        actividad: "Capacitación en Primeros Auxilios",
        departamento: "SAN SALVADOR",
        municipio: "SAN SALVADOR",
        distrito: "SAN SALVADOR",
        region: "central",
        tecnico: "Juan Pérez García",
        usuario: "juan.perez@proteccioncivil.gob.sv",
        estado: "completada",
        participantesHombres: 15,
        participantesMujeres: 10,
        resultados: "Capacitación exitosa con alta participación de la comunidad",
        observaciones: "Los participantes mostraron mucho interés en el tema",
        tareas: ["tarea1", "tarea3"],
        respaldo: null,
        fechaRegistro: "2024-03-14",
        horaInicio: "08:00",
        horaFin: "17:00"
    },
    {
        id: 2,
        fecha: "2024-03-18",
        actividad: "Simulacro de Evacuación",
        departamento: "AHUACHAPAN",
        municipio: "AHUACHAPAN SUR",
        distrito: "GUAYMANGO",
        region: "occidental",
        tecnico: "María Rodríguez López",
        usuario: "maria.rodriguez@proteccioncivil.gob.sv",
        estado: "en-progreso",
        participantesHombres: 80,
        participantesMujeres: 70,
        resultados: "Simulacro en proceso de evaluación final",
        observaciones: "Se identificaron áreas de mejora en los protocolos",
        tareas: ["tarea2", "tarea3"],
        respaldo: null,
        fechaRegistro: "2024-03-17",
        horaInicio: "07:30",
        horaFin: "16:30"
    },
    {
        id: 3,
        fecha: "2024-03-20",
        actividad: "Inspección de Infraestructura",
        departamento: "SAN MIGUEL",
        municipio: "SAN MIGUEL",
        distrito: "SAN MIGUEL",
        region: "oriental",
        tecnico: "Carlos Hernández Martínez",
        usuario: "carlos.hernandez@proteccioncivil.gob.sv",
        estado: "pendiente",
        participantesHombres: 0,
        participantesMujeres: 0,
        resultados: "Programada para próxima semana",
        observaciones: "Esperando autorización de las autoridades locales",
        tareas: ["tarea1"],
        respaldo: null,
        fechaRegistro: "2024-03-19",
        horaInicio: "09:00",
        horaFin: "15:00"
    },
    {
        id: 4,
        fecha: "2024-03-22",
        actividad: "Evaluación de Riesgos",
        departamento: "LA LIBERTAD",
        municipio: "SANTA TECLA",
        distrito: "SANTA TECLA",
        region: "central",
        tecnico: "Ana María Castillo",
        usuario: "ana.castillo@proteccioncivil.gob.sv",
        estado: "completada",
        participantesHombres: 8,
        participantesMujeres: 7,
        resultados: "Evaluación completada satisfactoriamente",
        observaciones: "Se recomienda seguimiento en 6 meses",
        tareas: ["tarea1", "tarea4"],
        respaldo: null,
        fechaRegistro: "2024-03-21",
        horaInicio: "08:30",
        horaFin: "16:00"
    },
    {
        id: 5,
        fecha: "2024-03-25",
        actividad: "Coordinación Interinstitucional",
        departamento: "SONSONATE",
        municipio: "SONSONATE",
        distrito: "SONSONATE",
        region: "occidental",
        tecnico: "Luis Fernando Ramirez",
        usuario: "luis.ramirez@proteccioncivil.gob.sv",
        estado: "completada",
        participantesHombres: 12,
        participantesMujeres: 8,
        resultados: "Establecidos nuevos protocolos de colaboración",
        observaciones: "Excelente disposición de todas las instituciones",
        tareas: ["tarea2"],
        respaldo: null,
        fechaRegistro: "2024-03-24",
        horaInicio: "10:00",
        horaFin: "14:00"
    }
];

// Variables de paginación
let currentActivityPage = 1;
const activitiesPerPage = 5;
let filteredActivities = [...actividades];

// Función para cargar actividades en la tabla con paginación
function cargarActividades() {
    const tbody = document.getElementById('activitiesTableBody');
    const loadingDiv = document.getElementById('activitiesLoading');
    
    // Mostrar loading
    if (loadingDiv) loadingDiv.classList.add('show');
    
    setTimeout(() => {
        tbody.innerHTML = '';
        
        const startIndex = (currentActivityPage - 1) * activitiesPerPage;
        const endIndex = startIndex + activitiesPerPage;
        const activitiesToShow = filteredActivities.slice(startIndex, endIndex);

        if (activitiesToShow.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <h3>No hay actividades registradas</h3>
                        <p>Comience registrando una nueva actividad</p>
                    </td>
                </tr>
            `;
        } else {
            activitiesToShow.forEach(actividad => {
                const tr = document.createElement('tr');
                
                // Determinar clase de estado
                let estadoClass = '';
                let estadoText = '';
                switch(actividad.estado) {
                    case 'completada':
                        estadoClass = 'status-active';
                        estadoText = 'Completada';
                        break;
                    case 'en-progreso':
                        estadoClass = 'status-pending';
                        estadoText = 'En Progreso';
                        break;
                    case 'pendiente':
                        estadoClass = 'status-inactive';
                        estadoText = 'Pendiente';
                        break;
                }

                // Obtener nombre del usuario
                const usuario = obtenerUsuarioPorEmail(actividad.usuario);
                const nombreUsuario = usuario ? usuario.nombres : 'Usuario no encontrado';

                tr.innerHTML = `
                    <td>${new Date(actividad.fecha).toLocaleDateString('es-SV')}</td>
                    <td>${actividad.actividad}</td>
                    <td>${actividad.departamento}</td>
                    <td>${actividad.municipio}</td>
                    <td>${actividad.tecnico}</td>
                    <td>${nombreUsuario}</td>
                    <td><span class="status-badge ${estadoClass}">${estadoText}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn details" onclick="mostrarDetallesActividad(${actividad.id})" title="Ver detalles">
                                <i class="fas fa-eye"></i> Detalles
                            </button>
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

        // Actualizar información de paginación
        actualizarPaginacionActividades();
        
        // Ocultar loading
        if (loadingDiv) loadingDiv.classList.remove('show');
    }, 500);
}

// Función para actualizar la paginación de actividades
function actualizarPaginacionActividades() {
    const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);
    const showingStart = ((currentActivityPage - 1) * activitiesPerPage) + 1;
    const showingEnd = Math.min(currentActivityPage * activitiesPerPage, filteredActivities.length);
    
    document.getElementById('activitiesFrom').textContent = showingStart;
    document.getElementById('activitiesTo').textContent = showingEnd;
    document.getElementById('activitiesTotal').textContent = filteredActivities.length;
    
    // Actualizar controles de paginación
    const paginationControls = document.getElementById('activitiesPagination');
    if (paginationControls) {
        paginationControls.innerHTML = '';
        
        // Botón anterior
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = 'Anterior';
        prevBtn.disabled = currentActivityPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentActivityPage > 1) {
                currentActivityPage--;
                cargarActividades();
            }
        });
        paginationControls.appendChild(prevBtn);
        
        // Números de página
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentActivityPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn ${i === currentActivityPage ? 'active' : ''}`;
            pageBtn.textContent = i;
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
        nextBtn.disabled = currentActivityPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentActivityPage < totalPages) {
                currentActivityPage++;
                cargarActividades();
            }
        });
        paginationControls.appendChild(nextBtn);
    }
}

// Función para crear nueva actividad
function crearActividad(actividadData) {
    const nuevoId = Math.max(...actividades.map(a => a.id), 0) + 1;
    const usuarioActual = localStorage.getItem('userEmail') || 'sistema@proteccioncivil.gob.sv';
    
    const nuevaActividad = {
        id: nuevoId,
        ...actividadData,
        usuario: usuarioActual,
        fechaRegistro: new Date().toISOString().split('T')[0]
    };
    
    actividades.push(nuevaActividad);
    aplicarFiltrosActividades();
    cargarActividades();
    
    Swal.fire({
        title: '¡Éxito!',
        text: 'Actividad registrada correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2d3748'
    });
}

// Función para editar actividad
function editarActividad(id) {
    const actividad = actividades.find(a => a.id === id);
    if (!actividad) return;

    // Llenar el modal con los datos de la actividad
    document.getElementById('modalActivityTitle').textContent = 'Editar Actividad';
    document.getElementById('activityId').value = actividad.id;
    document.getElementById('activityTecnico').value = actividad.tecnico;
    document.getElementById('activityEstado').value = actividad.estado;
    document.getElementById('activityFecha').value = actividad.fecha;
    document.getElementById('activityInicio').value = actividad.horaInicio;
    document.getElementById('activityFinalizacion').value = actividad.horaFin;
    document.getElementById('activityRegion').value = actividad.region;
    
    // Cargar datos geográficos
    cargarDatosGeograficosActividad(actividad.departamento.toLowerCase(), actividad.distrito, actividad.municipio);
    
    document.getElementById('activityTipo').value = actividad.actividad;
    
    // Seleccionar tareas
    const tareasSelect = document.getElementById('activityTareas');
    Array.from(tareasSelect.options).forEach(option => {
        option.selected = actividad.tareas.includes(option.value);
    });
    
    document.getElementById('activityHombres').value = actividad.participantesHombres;
    document.getElementById('activityMujeres').value = actividad.participantesMujeres;
    document.getElementById('activityResultados').value = actividad.resultados;
    document.getElementById('activityObservaciones').value = actividad.observaciones;

    // Mostrar modal
    document.getElementById('activityModal').style.display = 'block';
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

// Función para eliminar actividad
function eliminarActividad(id) {
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
            actividades = actividades.filter(a => a.id !== id);
            aplicarFiltrosActividades();
            cargarActividades();
            
            Swal.fire({
                title: 'Eliminada!',
                text: 'La actividad ha sido eliminada',
                icon: 'success',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#2d3748'
            });
        }
    });
}

// Función para aplicar filtros de actividades
function aplicarFiltrosActividades() {
    const dateFilter = document.getElementById('filterDate').value;
    const activityFilter = document.getElementById('filterActivity').value;
    const regionFilter = document.getElementById('filterRegion').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    filteredActivities = actividades.filter(actividad => {
        const matchesDate = !dateFilter || actividad.fecha === dateFilter;
        const matchesActivity = !activityFilter || actividad.actividad.toLowerCase().includes(activityFilter.toLowerCase());
        const matchesRegion = !regionFilter || actividad.region === regionFilter;
        const matchesStatus = !statusFilter || actividad.estado === statusFilter;
        
        return matchesDate && matchesActivity && matchesRegion && matchesStatus;
    });
    
    currentActivityPage = 1;
    cargarActividades();
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
    const data = filteredActivities.map(actividad => {
        const usuario = obtenerUsuarioPorEmail(actividad.usuario);
        return {
            'Fecha': actividad.fecha,
            'Actividad': actividad.actividad,
            'Departamento': actividad.departamento,
            'Municipio': actividad.municipio,
            'Técnico': actividad.tecnico,
            'Usuario': usuario ? usuario.nombres : 'Usuario no encontrado',
            'Estado': actividad.estado,
            'Participantes Hombres': actividad.participantesHombres,
            'Participantes Mujeres': actividad.participantesMujeres,
            'Fecha Registro': actividad.fechaRegistro
        };
    });

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

// Función para cargar usuarios en el select de técnicos
function cargarUsuariosEnSelect() {
    const usuariosActivos = obtenerTodosLosUsuarios();
    const tecnicoSelect = document.getElementById('activityTecnico');
    
    if (tecnicoSelect) {
        // Limpiar select
        tecnicoSelect.innerHTML = '<option value="">Seleccione un técnico</option>';
        
        // Agregar opciones
        usuariosActivos.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.nombres;
            option.textContent = usuario.nombres;
            tecnicoSelect.appendChild(option);
        });
    }
}

// Función para manejar archivos
function manejarArchivo() {
    const fileInput = document.getElementById('activityRespaldo');
    const filePreview = document.getElementById('filePreview');
    const previewFileName = document.getElementById('previewFileName');
    const previewFileSize = document.getElementById('previewFileSize');
    const fileName = document.getElementById('fileName');
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.type === 'application/pdf') {
                fileName.textContent = file.name;
                previewFileName.textContent = file.name;
                previewFileSize.textContent = `Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
                filePreview.classList.add('show');
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Solo se permiten archivos PDF',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#2d3748'
                });
                this.value = '';
            }
        }
    });

    // Remover archivo
    document.getElementById('removeFile').addEventListener('click', function() {
        fileInput.value = '';
        filePreview.classList.remove('show');
        fileName.textContent = 'Buscar un Archivo PDF...';
    });
}

// NUEVA FUNCIÓN: Mostrar detalles de la actividad
function mostrarDetallesActividad(id) {
    const actividad = actividades.find(a => a.id === id);
    if (!actividad) return;

    // Llenar el modal de detalles con los datos de la actividad
    document.getElementById('detailFecha').textContent = new Date(actividad.fecha).toLocaleDateString('es-SV');
    document.getElementById('detailActividad').textContent = actividad.actividad;
    document.getElementById('detailEstado').textContent = actividad.estado.charAt(0).toUpperCase() + actividad.estado.slice(1);
    document.getElementById('detailEstado').className = `status-badge ${actividad.estado === 'completada' ? 'status-active' : actividad.estado === 'en-progreso' ? 'status-pending' : 'status-inactive'}`;
    document.getElementById('detailHoraInicio').textContent = actividad.horaInicio;
    document.getElementById('detailHoraFin').textContent = actividad.horaFin;
    document.getElementById('detailRegion').textContent = actividad.region.toUpperCase();
    document.getElementById('detailDepartamento').textContent = actividad.departamento;
    document.getElementById('detailMunicipio').textContent = actividad.municipio;
    document.getElementById('detailDistrito').textContent = actividad.distrito;
    document.getElementById('detailTecnico').textContent = actividad.tecnico;
    
    // Obtener nombre del usuario
    const usuario = obtenerUsuarioPorEmail(actividad.usuario);
    document.getElementById('detailUsuario').textContent = usuario ? usuario.nombres : 'Usuario no encontrado';
    
    // Mostrar tareas seleccionadas
    const tareasContainer = document.getElementById('detailTareas');
    tareasContainer.innerHTML = '';
    actividad.tareas.forEach(tarea => {
        const tareaText = obtenerTextoDeTarea(tarea);
        if (tareaText) {
            const tareaElement = document.createElement('div');
            tareaElement.className = 'tarea-item';
            tareaElement.innerHTML = `<i class="fas fa-check-circle"></i> ${tareaText}`;
            tareasContainer.appendChild(tareaElement);
        }
    });
    
    document.getElementById('detailHombres').textContent = actividad.participantesHombres;
    document.getElementById('detailMujeres').textContent = actividad.participantesMujeres;
    document.getElementById('detailResultados').textContent = actividad.resultados || 'No hay resultados registrados';
    document.getElementById('detailObservaciones').textContent = actividad.observaciones || 'No hay observaciones registradas';
    document.getElementById('detailFechaRegistro').textContent = new Date(actividad.fechaRegistro).toLocaleDateString('es-SV');

    // Mostrar modal de detalles
    document.getElementById('activityDetailModal').style.display = 'block';
}

// Función auxiliar para obtener texto de tarea
function obtenerTextoDeTarea(valor) {
    const tareasMap = {
        'tarea1': 'Tarea de preparación',
        'tarea2': 'Coordinación con autoridades',
        'tarea3': 'Ejecución de actividad',
        'tarea4': 'Evaluación de resultados',
        'tarea5': 'Elaboración de informe',
        'tarea6': 'Seguimiento y monitoreo'
    };
    return tareasMap[valor] || valor;
}

// Función para inicializar el módulo de actividades
function initializeActivitiesModule() {
    // Agregar loading a la tabla
    const tableContainer = document.querySelector('#activitiesContent .table-container');
    if (tableContainer && !document.getElementById('activitiesLoading')) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'activitiesLoading';
        loadingDiv.className = 'table-loading';
        loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
        tableContainer.appendChild(loadingDiv);
    }
    
    cargarActividades();
    cargarUsuariosEnSelect();
    manejarArchivo();

    // Event listeners para el modal de actividades
    document.getElementById('newActivityBtn').addEventListener('click', () => {
        limpiarFormularioActividad();
        document.getElementById('activityModal').style.display = 'block';
    });

    document.getElementById('closeActivityModal').addEventListener('click', () => {
        document.getElementById('activityModal').style.display = 'none';
    });

    document.getElementById('cancelActivityForm').addEventListener('click', () => {
        document.getElementById('activityModal').style.display = 'none';
    });

    document.getElementById('clearActivityForm').addEventListener('click', () => {
        limpiarFormularioActividad();
        Swal.fire({
            title: 'Formulario limpiado',
            text: 'Todos los campos han sido restablecidos',
            icon: 'info',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2d3748',
            timer: 1500
        });
    });

    // CORRECCIÓN: Event listener para el formulario de actividades
    document.getElementById('activityForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const activityId = document.getElementById('activityId').value;
        const usuarioActual = localStorage.getItem('userEmail') || 'sistema@proteccioncivil.gob.sv';

        const formData = {
            fecha: document.getElementById('activityFecha').value,
            actividad: document.getElementById('activityTipo').value,
            departamento: document.getElementById('activityDepartamento').value.toUpperCase(),
            municipio: document.getElementById('activityMunicipio').value.toUpperCase(),
            distrito: document.getElementById('activityDistrito').value.toUpperCase(),
            region: document.getElementById('activityRegion').value,
            tecnico: document.getElementById('activityTecnico').value,
            estado: document.getElementById('activityEstado').value,
            participantesHombres: parseInt(document.getElementById('activityHombres').value) || 0,
            participantesMujeres: parseInt(document.getElementById('activityMujeres').value) || 0,
            resultados: document.getElementById('activityResultados').value,
            observaciones: document.getElementById('activityObservaciones').value,
            tareas: Array.from(document.getElementById('activityTareas').selectedOptions).map(opt => opt.value),
            horaInicio: document.getElementById('activityInicio').value,
            horaFin: document.getElementById('activityFinalizacion').value
        };

        // Validación básica
        if (!formData.fecha || !formData.actividad || !formData.departamento || !formData.region) {
            Swal.fire({
                title: 'Error',
                text: 'Por favor complete todos los campos obligatorios',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#2d3748'
            });
            return;
        }

        if (activityId) {
            // Editar actividad existente
            const index = actividades.findIndex(a => a.id === parseInt(activityId));
            if (index !== -1) {
                actividades[index] = { ...actividades[index], ...formData };
                aplicarFiltrosActividades();
                cargarActividades();
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Actividad actualizada correctamente',
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#2d3748'
                });
            }
        } else {
            // Crear nueva actividad
            crearActividad(formData);
        }

        document.getElementById('activityModal').style.display = 'none';
    });

    // Event listeners para el modal de detalles
    document.getElementById('closeActivityDetailModal').addEventListener('click', () => {
        document.getElementById('activityDetailModal').style.display = 'none';
    });

    document.getElementById('closeDetailBtn').addEventListener('click', () => {
        document.getElementById('activityDetailModal').style.display = 'none';
    });

    // Filtros
    document.getElementById('applyActivityFilters').addEventListener('click', aplicarFiltrosActividades);

    document.getElementById('clearActivityFilters').addEventListener('click', () => {
        document.getElementById('filterDate').value = '';
        document.getElementById('filterActivity').value = '';
        document.getElementById('filterRegion').value = '';
        document.getElementById('filterStatus').value = '';
        aplicarFiltrosActividades();
    });

    // Generar reporte
    document.getElementById('generateReport').addEventListener('click', generarReportePDF);

    // Exportar datos
    const exportBtn = document.querySelector('#activitiesContent .export-options .btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            const dropdown = this.nextElementSibling;
            dropdown.classList.toggle('show');
        });
    }

    // Opciones de exportación
    document.querySelectorAll('#activitiesContent .export-option').forEach(option => {
        option.addEventListener('click', function() {
            const format = this.getAttribute('data-format');
            exportarActividades(format);
            document.querySelector('#activitiesContent .export-dropdown').classList.remove('show');
        });
    });

    // Dependencias entre selects geográficos
    document.getElementById('activityDepartamento').addEventListener('change', function() {
        const departamento = this.value;
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
                distritoSelect.appendChild(option);
            });
            
            // Cargar municipios
            municipioSelect.innerHTML = '<option value="">SELECCIONE UN MUNICIPIO</option>';
            datos.municipios.forEach(municipio => {
                const option = document.createElement('option');
                option.value = municipio.toLowerCase();
                option.textContent = municipio;
                municipioSelect.appendChild(option);
            });
        } else {
            // Limpiar selects si no hay datos
            distritoSelect.innerHTML = '<option value="">SELECCIONE UN DISTRITO</option>';
            municipioSelect.innerHTML = '<option value="">SELECCIONE UN MUNICIPIO</option>';
        }
    });
}