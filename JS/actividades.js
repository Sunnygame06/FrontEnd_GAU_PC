// Inicializador del módulo de actividades

// Datos geográficos (igual que en usuarios)
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

function initializeActivitiesModule() {
    console.log('Inicializando módulo de actividades...');
    
    // Agregar loading a la tabla
    const tableContainer = document.querySelector('#activitiesContent .table-container');
    if (tableContainer && !document.getElementById('activitiesLoading')) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'activitiesLoading';
        loadingDiv.className = 'table-loading';
        loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
        tableContainer.appendChild(loadingDiv);
    }
    
    // Cargar actividades inicialmente
    cargarActividades();
    
    // Cargar usuarios en el select de técnicos
    cargarUsuariosEnSelect();
    
    // Manejar archivos
    manejarArchivo();
    
    // Event listeners para el modal de actividades
    const newActivityBtn = document.getElementById('newActivityBtn');
    if (newActivityBtn) {
        newActivityBtn.addEventListener('click', () => {
            limpiarFormularioActividad();
            document.getElementById('activityModal').style.display = 'block';
        });
    }
    
    const closeActivityModal = document.getElementById('closeActivityModal');
    if (closeActivityModal) {
        closeActivityModal.addEventListener('click', () => {
            document.getElementById('activityModal').style.display = 'none';
        });
    }
    
    const cancelActivityForm = document.getElementById('cancelActivityForm');
    if (cancelActivityForm) {
        cancelActivityForm.addEventListener('click', () => {
            document.getElementById('activityModal').style.display = 'none';
        });
    }
    
    const clearActivityForm = document.getElementById('clearActivityForm');
    if (clearActivityForm) {
        clearActivityForm.addEventListener('click', () => {
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
    }
    
    // Formulario de actividad
    const activityForm = document.getElementById('activityForm');
    if (activityForm) {
        activityForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const activityId = document.getElementById('activityId').value;
            
            // Obtener tareas seleccionadas
            const tareasSelect = document.getElementById('activityTareas');
            const tareasSeleccionadas = Array.from(tareasSelect.selectedOptions).map(opt => opt.value);
            
            // Recopilar datos del formulario
            const formData = {
                estado: document.getElementById('activityEstado').value,
                fecha: document.getElementById('activityFecha').value,
                H_inicio: document.getElementById('activityInicio').value,
                H_Fin: document.getElementById('activityFinalizacion').value,
                region: document.getElementById('activityRegion').value,
                departamento: document.getElementById('activityDepartamento').value.toUpperCase(),
                municipio: document.getElementById('activityMunicipio').value.toUpperCase(),
                distrito: document.getElementById('activityDistrito').value.toUpperCase(),
                actividad_nombre: document.getElementById('activityTipo').value,
                tarea: tareasSeleccionadas.join(','),
                hombres: parseInt(document.getElementById('activityHombres').value) || 0,
                mujeres: parseInt(document.getElementById('activityMujeres').value) || 0,
                resultados: document.getElementById('activityResultados').value,
                observaciones: document.getElementById('activityObservaciones').value,
                respaldo: '',
                Id_Usuario: 1 // Por defecto, debería obtenerse del usuario actual
            };
            
            // Validar datos
            const validation = ActividadService.validateActividad(formData);
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
                    text: 'Guardando actividad',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                if (activityId) {
                    // Editar actividad existente
                    formData.id = parseInt(activityId);
                    await ActividadService.updateActividad(activityId, formData);
                    
                    Swal.fire({
                        title: '¡Éxito!',
                        text: 'Actividad actualizada correctamente',
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#2d3748'
                    });
                } else {
                    // Crear nueva actividad
                    await ActividadService.createActividad(formData);
                    
                    Swal.fire({
                        title: '¡Éxito!',
                        text: 'Actividad registrada correctamente',
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#2d3748'
                    });
                }
                
                // Cerrar modal y recargar actividades
                document.getElementById('activityModal').style.display = 'none';
                cargarActividades();
                
            } catch (error) {
                console.error('Error al guardar actividad:', error);
                Swal.fire({
                    title: 'Error',
                    text: error.message || 'No se pudo guardar la actividad',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#2d3748'
                });
            }
        });
    }
    
    // Filtros
    const applyActivityFilters = document.getElementById('applyActivityFilters');
    if (applyActivityFilters) {
        applyActivityFilters.addEventListener('click', aplicarFiltrosActividades);
    }
    
    const clearActivityFilters = document.getElementById('clearActivityFilters');
    if (clearActivityFilters) {
        clearActivityFilters.addEventListener('click', () => {
            document.getElementById('filterDate').value = '';
            document.getElementById('filterActivity').value = '';
            document.getElementById('filterRegion').value = '';
            document.getElementById('filterStatus').value = '';
            cargarActividades();
        });
    }
    
    // Generar reporte
    const generateReport = document.getElementById('generateReport');
    if (generateReport) {
        generateReport.addEventListener('click', generarReportePDF);
    }
    
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
    const activityDepartamento = document.getElementById('activityDepartamento');
    if (activityDepartamento) {
        activityDepartamento.addEventListener('change', function() {
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
    
    console.log('Módulo de actividades inicializado correctamente');
}

// Función para cargar usuarios en el select de técnicos
async function cargarUsuariosEnSelect() {
    try {
        const response = await UsuarioService.getAllUsuarios(0, 100); // Obtener todos los usuarios
        const usuarios = response.content || [];
        
        const tecnicoSelect = document.getElementById('activityTecnico');
        if (tecnicoSelect) {
            // Limpiar select
            tecnicoSelect.innerHTML = '<option value="">Seleccione un técnico</option>';
            
            // Agregar opciones
            usuarios.forEach(usuario => {
                const option = document.createElement('option');
                option.value = usuario.nombre;
                option.textContent = usuario.nombre;
                tecnicoSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

// Función para manejar archivos
function manejarArchivo() {
    const fileInput = document.getElementById('activityRespaldo');
    const filePreview = document.getElementById('filePreview');
    const previewFileName = document.getElementById('previewFileName');
    const previewFileSize = document.getElementById('previewFileSize');
    const fileName = document.getElementById('fileName');
    
    if (fileInput) {
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
    }
    
    // Remover archivo
    const removeFile = document.getElementById('removeFile');
    if (removeFile) {
        removeFile.addEventListener('click', function() {
            fileInput.value = '';
            filePreview.classList.remove('show');
            fileName.textContent = 'Buscar un Archivo PDF...';
        });
    }
}

// Exportar función
if (typeof module !== 'undefined' && module.exports) {
    module.exports = initializeActivitiesModule;
}