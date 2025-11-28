// Servicio para gestión de actividades
const ActividadService = {
    
    /**
     * Obtener todas las actividades con paginación
     * @param {number} page - Número de página (default: 0)
     * @param {number} size - Tamaño de página (default: 10)
     * @returns {Promise} Promesa con los datos de actividades
     */
    async getAllActividades(page = 0, size = 10) {
        try {
            const url = buildURL(CONFIG.ENDPOINTS.ACTIVIDADES.GET_ALL, { page, size });
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error al obtener actividades:', error);
            throw error;
        }
    },
    
    /**
     * Obtener actividad por ID
     * @param {number} id - ID de la actividad
     * @returns {Promise} Promesa con los datos de la actividad
     */
    async getActividadById(id) {
        try {
            const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ACTIVIDADES.GET_BY_ID}/${id}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error al obtener actividad:', error);
            throw error;
        }
    },
    
    /**
     * Crear nueva actividad
     * @param {Object} actividadData - Datos de la actividad
     * @returns {Promise} Promesa con la actividad creada
     */
    async createActividad(actividadData) {
        try {
            const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ACTIVIDADES.CREATE}`;
            
            // Preparar datos para enviar
            const dataToSend = this.prepareActividadData(actividadData);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error al crear actividad:', error);
            throw error;
        }
    },
    
    /**
     * Actualizar actividad existente
     * @param {number} id - ID de la actividad
     * @param {Object} actividadData - Datos actualizados de la actividad
     * @returns {Promise} Promesa con la actividad actualizada
     */
    async updateActividad(id, actividadData) {
        try {
            const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ACTIVIDADES.UPDATE}/${id}`;
            
            // Preparar datos para enviar
            const dataToSend = this.prepareActividadData(actividadData);
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error al actualizar actividad:', error);
            throw error;
        }
    },
    
    /**
     * Eliminar actividad
     * @param {number} id - ID de la actividad
     * @returns {Promise} Promesa con resultado de eliminación
     */
    async deleteActividad(id) {
        try {
            const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ACTIVIDADES.DELETE}/${id}`;
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error al eliminar actividad:', error);
            throw error;
        }
    },
    
    /**
     * Buscar actividades por filtros
     * @param {Object} filters - Filtros de búsqueda
     * @param {number} page - Número de página
     * @param {number} size - Tamaño de página
     * @returns {Promise} Promesa con resultados de búsqueda
     */
    async searchActividades(filters, page = 0, size = 10) {
        try {
            // Obtener todas las actividades
            const allData = await this.getAllActividades(page, size);
            
            // Aplicar filtros localmente
            let filteredContent = allData.content;
            
            if (filters.fecha && filters.fecha !== '') {
                filteredContent = filteredContent.filter(act => act.fecha === filters.fecha);
            }
            
            if (filters.actividad && filters.actividad !== '') {
                filteredContent = filteredContent.filter(act => 
                    act.actividad_nombre && act.actividad_nombre.toLowerCase().includes(filters.actividad.toLowerCase())
                );
            }
            
            if (filters.region && filters.region !== '') {
                filteredContent = filteredContent.filter(act => 
                    act.region && act.region.toLowerCase() === filters.region.toLowerCase()
                );
            }
            
            if (filters.estado && filters.estado !== '') {
                filteredContent = filteredContent.filter(act => 
                    act.estado && act.estado.toLowerCase() === filters.estado.toLowerCase()
                );
            }
            
            return {
                ...allData,
                content: filteredContent,
                totalElements: filteredContent.length
            };
            
        } catch (error) {
            console.error('Error al buscar actividades:', error);
            throw error;
        }
    },
    
    /**
     * Preparar datos de actividad para enviar al backend
     * @param {Object} actividadData - Datos sin procesar
     * @returns {Object} Datos preparados
     */
    prepareActividadData(actividadData) {
        return {
            id: actividadData.id || null,
            estado: actividadData.estado || '',
            fecha: actividadData.fecha || null,
            H_inicio: actividadData.H_inicio || actividadData.horaInicio || '',
            H_Fin: actividadData.H_Fin || actividadData.horaFin || '',
            region: actividadData.region || '',
            departamento: actividadData.departamento || '',
            municipio: actividadData.municipio || '',
            distrito: actividadData.distrito || '',
            actividad_nombre: actividadData.actividad_nombre || actividadData.actividad || '',
            tarea: actividadData.tarea || '',
            hombres: parseInt(actividadData.hombres) || 0,
            mujeres: parseInt(actividadData.mujeres) || 0,
            resultados: actividadData.resultados || '',
            observaciones: actividadData.observaciones || '',
            respaldo: actividadData.respaldo || '',
            Id_Usuario: actividadData.Id_Usuario || null
        };
    },
    
    /**
     * Validar datos de actividad
     * @param {Object} actividadData - Datos a validar
     * @returns {Object} Objeto con validación y errores
     */
    validateActividad(actividadData) {
        const errors = {};
        
        // Validar estado
        if (!actividadData.estado || actividadData.estado.trim() === '') {
            errors.estado = 'El estado es requerido';
        }
        
        // Validar fecha
        if (!actividadData.fecha) {
            errors.fecha = 'La fecha es requerida';
        }
        
        // Validar hora inicio
        if (!actividadData.H_inicio && !actividadData.horaInicio) {
            errors.H_inicio = 'La hora de inicio es requerida';
        }
        
        // Validar hora fin
        if (!actividadData.H_Fin && !actividadData.horaFin) {
            errors.H_Fin = 'La hora de finalización es requerida';
        }
        
        // Validar región
        if (!actividadData.region || actividadData.region.trim() === '') {
            errors.region = 'La región es requerida';
        }
        
        // Validar departamento
        if (!actividadData.departamento || actividadData.departamento.trim() === '') {
            errors.departamento = 'El departamento es requerido';
        }
        
        // Validar municipio
        if (!actividadData.municipio || actividadData.municipio.trim() === '') {
            errors.municipio = 'El municipio es requerido';
        }
        
        // Validar distrito
        if (!actividadData.distrito || actividadData.distrito.trim() === '') {
            errors.distrito = 'El distrito es requerido';
        }
        
        // Validar actividad nombre
        if (!actividadData.actividad_nombre && !actividadData.actividad) {
            errors.actividad_nombre = 'El nombre de la actividad es requerido';
        }
        
        // Validar tarea
        if (!actividadData.tarea || actividadData.tarea.trim() === '') {
            errors.tarea = 'La tarea es requerida';
        }
        
        // Validar resultados
        if (!actividadData.resultados || actividadData.resultados.trim() === '') {
            errors.resultados = 'Los resultados son requeridos';
        }
        
        // Validar observaciones
        if (!actividadData.observaciones || actividadData.observaciones.trim() === '') {
            errors.observaciones = 'Las observaciones son requeridas';
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};

// Exportar el servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActividadService;
}