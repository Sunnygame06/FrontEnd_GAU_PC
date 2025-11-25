class ActividadController {
    constructor() {
        this.actividadService = new ActividadService();
        this.currentPage = 0;
        this.pageSize = 10;
        this.filteredActivities = [];
        this.isOffline = localStorage.getItem('offlineMode') === 'true';
        this.init();
    }

    async init() {
        await this.setupModule();
        await this.cargarActividades();
        this.setupEventListeners();
    }

    async setupModule() {
        // Si estamos en el dashboard, cargar el módulo dinámicamente
        const activitiesContent = document.getElementById('activitiesContent');
        if (activitiesContent && !activitiesContent.querySelector('.table-container')) {
            try {
                const response = await fetch('activities.html');
                const html = await response.text();
                activitiesContent.innerHTML = html;
            } catch (error) {
                console.error('Error cargando el módulo de actividades:', error);
                activitiesContent.innerHTML = '<div class="error-message">Error al cargar el módulo de actividades</div>';
            }
        }
    }

    async cargarActividades() {
        const tbody = document.getElementById('activitiesTableBody');
        const loadingDiv = this.createLoadingIndicator();
        
        if (tbody) {
            tbody.innerHTML = '';
            tbody.parentNode.appendChild(loadingDiv);
            loadingDiv.classList.add('show');
        }

        try {
            const response = await this.actividadService.getAllActividades(this.currentPage, this.pageSize);
            const actividades = response.content || [];
            this.filteredActivities = actividades;

            this.renderActividades(actividades);
            this.actualizarPaginacion(response);
            
        } catch (error) {
            console.error('Error cargando actividades:', error);
            this.showError('Error al cargar las actividades');
        } finally {
            loadingDiv.classList.remove('show');
        }
    }

    renderActividades(actividades) {
        const tbody = document.getElementById('activitiesTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (actividades.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <h3>No hay actividades registradas</h3>
                        <p>Comience registrando una nueva actividad</p>
                    </td>
                </tr>
            `;
            return;
        }

        actividades.forEach(actividad => {
            const tr = document.createElement('tr');
            
            const estadoClass = this.getEstadoClass(actividad.estado);
            const estadoText = this.getEstadoText(actividad.estado);

            tr.innerHTML = `
                <td>${this.formatDate(actividad.fecha)}</td>
                <td>${actividad.actividad_nombre}</td>
                <td>${actividad.departamento}</td>
                <td>${actividad.municipio}</td>
                <td>${this.getNombreTecnico(actividad.Id_Usuario)}</td>
                <td>${this.getNombreUsuario(actividad.Id_Usuario)}</td>
                <td><span class="status-badge ${estadoClass}">${estadoText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn details" onclick="actividadController.mostrarDetalles(${actividad.id})" title="Ver detalles">
                            <i class="fas fa-eye"></i> Detalles
                        </button>
                        <button class="action-btn edit" onclick="actividadController.editarActividad(${actividad.id})" title="Editar actividad">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="action-btn delete" onclick="actividadController.eliminarActividad(${actividad.id})" title="Eliminar actividad">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    async mostrarDetalles(id) {
        try {
            const actividades = await this.actividadService.getAllActividades(0, 1000);
            const actividad = actividades.content.find(a => a.id === id);
            
            if (!actividad) {
                this.showError('Actividad no encontrada');
                return;
            }

            this.llenarModalDetalles(actividad);
            this.mostrarModal('activityDetailModal');
            
        } catch (error) {
            console.error('Error mostrando detalles:', error);
            this.showError('Error al cargar los detalles de la actividad');
        }
    }

    llenarModalDetalles(actividad) {
        // Información General
        document.getElementById('detailFecha').textContent = this.formatDate(actividad.fecha);
        document.getElementById('detailActividad').textContent = actividad.actividad_nombre;
        document.getElementById('detailEstado').textContent = this.getEstadoText(actividad.estado);
        document.getElementById('detailEstado').className = `status-badge ${this.getEstadoClass(actividad.estado)}`;
        document.getElementById('detailHoraInicio').textContent = actividad.H_inicio;
        document.getElementById('detailHoraFin').textContent = actividad.H_Fin;

        // Ubicación
        document.getElementById('detailRegion').textContent = actividad.region;
        document.getElementById('detailDepartamento').textContent = actividad.departamento;
        document.getElementById('detailMunicipio').textContent = actividad.municipio;
        document.getElementById('detailDistrito').textContent = actividad.distrito;

        // Personal
        document.getElementById('detailTecnico').textContent = this.getNombreTecnico(actividad.Id_Usuario);
        document.getElementById('detailUsuario').textContent = this.getNombreUsuario(actividad.Id_Usuario);

        // Tareas
        const tareasContainer = document.getElementById('detailTareas');
        tareasContainer.innerHTML = '';
        if (actividad.tarea) {
            const tareas = actividad.tarea.split(', ');
            tareas.forEach(tarea => {
                const tareaElement = document.createElement('div');
                tareaElement.className = 'tarea-item';
                tareaElement.innerHTML = `<i class="fas fa-check-circle"></i> ${tarea.trim()}`;
                tareasContainer.appendChild(tareaElement);
            });
        }

        // Participantes
        document.getElementById('detailHombres').textContent = actividad.hombres || 0;
        document.getElementById('detailMujeres').textContent = actividad.mujeres || 0;

        // Resultados y Observaciones
        document.getElementById('detailResultados').textContent = actividad.resultados || 'No hay resultados registrados';
        document.getElementById('detailObservaciones').textContent = actividad.observaciones || 'No hay observaciones registradas';
    }

    async editarActividad(id) {
        try {
            const actividades = await this.actividadService.getAllActividades(0, 1000);
            const actividad = actividades.content.find(a => a.id === id);
            
            if (!actividad) {
                this.showError('Actividad no encontrada');
                return;
            }

            this.llenarFormularioEdicion(actividad);
            this.mostrarModal('activityModal');
            
        } catch (error) {
            console.error('Error editando actividad:', error);
            this.showError('Error al cargar la actividad para editar');
        }
    }

    llenarFormularioEdicion(actividad) {
        document.getElementById('modalActivityTitle').textContent = 'Editar Actividad';
        document.getElementById('activityId').value = actividad.id;
        document.getElementById('activityEstado').value = actividad.estado;
        document.getElementById('activityFecha').value = actividad.fecha;
        document.getElementById('activityInicio').value = actividad.H_inicio;
        document.getElementById('activityFinalizacion').value = actividad.H_Fin;
        document.getElementById('activityRegion').value = actividad.region;
        document.getElementById('activityDepartamento').value = actividad.departamento;
        document.getElementById('activityTipo').value = actividad.actividad_nombre;
        document.getElementById('activityHombres').value = actividad.hombres || 0;
        document.getElementById('activityMujeres').value = actividad.mujeres || 0;
        document.getElementById('activityResultados').value = actividad.resultados || '';
        document.getElementById('activityObservaciones').value = actividad.observaciones || '';

        // Cargar selects dependientes
        this.cargarSelectsDependientes(actividad.departamento, actividad.distrito, actividad.municipio);

        // Seleccionar tareas
        if (actividad.tarea) {
            const tareas = actividad.tarea.split(', ').map(t => t.trim());
            const tareasSelect = document.getElementById('activityTareas');
            Array.from(tareasSelect.options).forEach(option => {
                option.selected = tareas.includes(option.value);
            });
        }
    }

    async eliminarActividad(id) {
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
                await this.actividadService.deleteActividad(id);
                this.showSuccess('Actividad eliminada correctamente');
                this.cargarActividades();
            } catch (error) {
                console.error('Error eliminando actividad:', error);
                this.showError('Error al eliminar la actividad');
            }
        }
    }

    async guardarActividad(formData) {
        try {
            if (formData.id) {
                await this.actividadService.updateActividad(formData.id, formData);
                this.showSuccess('Actividad actualizada correctamente');
            } else {
                await this.actividadService.createActividad(formData);
                this.showSuccess('Actividad creada correctamente');
            }
            
            this.ocultarModal('activityModal');
            this.cargarActividades();
            
        } catch (error) {
            console.error('Error guardando actividad:', error);
            this.showError('Error al guardar la actividad');
        }
    }

    // Métodos de UI y utilidades
    setupEventListeners() {
        // Filtros
        const filterInput = document.getElementById('activityFilter');
        if (filterInput) {
            filterInput.addEventListener('input', (e) => this.filtrarActividades(e.target.value));
        }

        // Botón nueva actividad
        const newActivityBtn = document.getElementById('newActivityBtn');
        if (newActivityBtn) {
            newActivityBtn.addEventListener('click', () => this.nuevaActividad());
        }

        // Formulario de actividad
        const activityForm = document.getElementById('activityForm');
        if (activityForm) {
            activityForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Selects dependientes
        const departamentoSelect = document.getElementById('activityDepartamento');
        if (departamentoSelect) {
            departamentoSelect.addEventListener('change', (e) => this.cargarMunicipios(e.target.value));
        }

        const municipioSelect = document.getElementById('activityMunicipio');
        if (municipioSelect) {
            municipioSelect.addEventListener('change', (e) => this.cargarDistritos(e.target.value));
        }
    }

    filtrarActividades(searchTerm) {
        if (!searchTerm) {
            this.renderActividades(this.filteredActivities);
            return;
        }

        const filtered = this.filteredActivities.filter(actividad => 
            actividad.actividad_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            actividad.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
            actividad.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
            this.getNombreTecnico(actividad.Id_Usuario).toLowerCase().includes(searchTerm.toLowerCase())
        );

        this.renderActividades(filtered);
    }

    nuevaActividad() {
        document.getElementById('modalActivityTitle').textContent = 'Nueva Actividad';
        document.getElementById('activityForm').reset();
        document.getElementById('activityId').value = '';
        this.mostrarModal('activityModal');
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const formData = this.getFormData();
        this.guardarActividad(formData);
    }

    getFormData() {
        const form = document.getElementById('activityForm');
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Procesar tareas seleccionadas
        const tareasSelect = document.getElementById('activityTareas');
        if (tareasSelect) {
            const tareasSeleccionadas = Array.from(tareasSelect.selectedOptions).map(option => option.value);
            data.tarea = tareasSeleccionadas.join(', ');
        }

        return data;
    }

    cargarSelectsDependientes(departamento, distrito, municipio) {
        this.cargarMunicipios(departamento);
        setTimeout(() => {
            if (municipio) {
                document.getElementById('activityMunicipio').value = municipio;
                this.cargarDistritos(municipio);
                setTimeout(() => {
                    if (distrito) {
                        document.getElementById('activityDistrito').value = distrito;
                    }
                }, 100);
            }
        }, 100);
    }

    cargarMunicipios(departamento) {
        const municipioSelect = document.getElementById('activityMunicipio');
        if (!municipioSelect) return;

        municipioSelect.innerHTML = '<option value="">Seleccione municipio</option>';
        
        // Simulación de datos - en una implementación real esto vendría de un servicio
        const municipiosData = {
            'San Salvador': ['San Salvador', 'Soyapango', 'Santa Tecla', 'Mejicanos'],
            'La Libertad': ['Santa Tecla', 'Antiguo Cuscatlán', 'Zaragoza', 'Quezaltepeque'],
            'Santa Ana': ['Santa Ana', 'Chalchuapa', 'Metapán', 'Coatepeque']
        };

        const municipios = municipiosData[departamento] || [];
        municipios.forEach(municipio => {
            const option = document.createElement('option');
            option.value = municipio;
            option.textContent = municipio;
            municipioSelect.appendChild(option);
        });
    }

    cargarDistritos(municipio) {
        const distritoSelect = document.getElementById('activityDistrito');
        if (!distritoSelect) return;

        distritoSelect.innerHTML = '<option value="">Seleccione distrito</option>';
        
        // Simulación de datos - en una implementación real esto vendría de un servicio
        const distritosData = {
            'San Salvador': ['Centro', 'San Jacinto', 'Candelaria', 'San Esteban'],
            'Soyapango': ['Centro', 'San Antonio', 'El Progreso', 'Santa Lucía'],
            'Santa Tecla': ['Centro', 'San Luis', 'Santa Anita', 'El Carmen']
        };

        const distritos = distritosData[municipio] || [];
        distritos.forEach(distrito => {
            const option = document.createElement('option');
            option.value = distrito;
            option.textContent = distrito;
            distritoSelect.appendChild(option);
        });
    }

    mostrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
        }
    }

    ocultarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
    }

    actualizarPaginacion(response) {
        const paginationContainer = document.getElementById('activitiesPagination');
        if (!paginationContainer) return;

        const totalPages = response.totalPages || 0;
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Botón anterior
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === 0 ? 'disabled' : ''}" 
                    ${this.currentPage === 0 ? 'disabled' : ''}
                    onclick="actividadController.cambiarPagina(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Páginas
        for (let i = 0; i < totalPages; i++) {
            paginationHTML += `
                <button class="pagination-btn ${this.currentPage === i ? 'active' : ''}" 
                        onclick="actividadController.cambiarPagina(${i})">
                    ${i + 1}
                </button>
            `;
        }

        // Botón siguiente
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === totalPages - 1 ? 'disabled' : ''}" 
                    ${this.currentPage === totalPages - 1 ? 'disabled' : ''}
                    onclick="actividadController.cambiarPagina(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    cambiarPagina(page) {
        this.currentPage = page;
        this.cargarActividades();
    }

    createLoadingIndicator() {
        let loadingDiv = document.getElementById('activitiesLoading');
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'activitiesLoading';
            loadingDiv.className = 'loading-indicator';
            loadingDiv.innerHTML = `
                <div class="loading-spinner"></div>
                <p>Cargando actividades...</p>
            `;
        }
        return loadingDiv;
    }

    showSuccess(message) {
        Swal.fire({
            title: 'Éxito',
            text: message,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#38a169'
        });
    }

    showError(message) {
        Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#e53e3e'
        });
    }

    // Métodos auxiliares
    getEstadoClass(estado) {
        const estados = {
            'Completada': 'status-active',
            'En Progreso': 'status-pending',
            'Pendiente': 'status-inactive',
            'Cancelada': 'status-inactive'
        };
        return estados[estado] || 'status-inactive';
    }

    getEstadoText(estado) {
        const estados = {
            'Completada': 'Completada',
            'En Progreso': 'En Progreso',
            'Pendiente': 'Pendiente',
            'Cancelada': 'Cancelada'
        };
        return estados[estado] || estado;
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-SV');
    }

    getNombreTecnico(userId) {
        const tecnicos = {
            1: 'Juan Pérez García',
            2: 'María Rodríguez López',
            3: 'Carlos Hernández Martínez',
            4: 'Ana María Castillo',
            5: 'Luis Fernando Ramirez'
        };
        return tecnicos[userId] || 'Técnico Asignado';
    }

    getNombreUsuario(userId) {
        const usuarios = {
            1: 'admin@proteccioncivil.gob.sv',
            2: 'tecnico@proteccioncivil.gob.sv',
            3: 'supervisor@proteccioncivil.gob.sv',
            4: 'coordinador@proteccioncivil.gob.sv',
            5: 'monitor@proteccioncivil.gob.sv'
        };
        return usuarios[userId] || 'Usuario Sistema';
    }
}

// Inicializar el controlador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.actividadController = new ActividadController();
});