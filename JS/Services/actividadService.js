class ActividadService {
    constructor() {
        this.baseURL = 'http://localhost:8080/apiActividad';
        this.offlineMode = localStorage.getItem('offlineMode') === 'true';
    }

    // Obtener todas las actividades con paginación
    async getAllActividades(page = 0, size = 10) {
        if (this.offlineMode) {
            return this.getOfflineActivities(page, size);
        }

        try {
            const response = await fetch(`${this.baseURL}/getAllActividades?page=${page}&size=${size}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return this.normalizeApiResponse(data);
        } catch (error) {
            console.error('Error al obtener actividades:', error);
            throw error;
        }
    }

    // Crear nueva actividad
    async createActividad(actividadData) {
        if (this.offlineMode) {
            return this.createOfflineActivity(actividadData);
        }

        try {
            const dto = this.convertirFormDataADTO(actividadData);
            const response = await fetch(`${this.baseURL}/newActividad`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dto)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al crear actividad:', error);
            throw error;
        }
    }

    // Actualizar actividad existente
    async updateActividad(id, actividadData) {
        if (this.offlineMode) {
            return this.updateOfflineActivity(id, actividadData);
        }

        try {
            const dto = this.convertirFormDataADTO(actividadData);
            const response = await fetch(`${this.baseURL}/updateActividad/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dto)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al actualizar actividad:', error);
            throw error;
        }
    }

    // Eliminar actividad
    async deleteActividad(id) {
        if (this.offlineMode) {
            return this.deleteOfflineActivity(id);
        }

        try {
            const response = await fetch(`${this.baseURL}/deleteActividad/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al eliminar actividad:', error);
            throw error;
        }
    }

    // Normalizar respuesta de la API
    normalizeApiResponse(apiResponse) {
        // Si la API retorna un objeto con content (Spring Page)
        if (apiResponse.content) {
            return {
                content: apiResponse.content,
                totalElements: apiResponse.totalElements,
                totalPages: apiResponse.totalPages,
                size: apiResponse.size,
                number: apiResponse.number
            };
        }
        
        // Si retorna un array directamente
        if (Array.isArray(apiResponse)) {
            return {
                content: apiResponse,
                totalElements: apiResponse.length,
                totalPages: Math.ceil(apiResponse.length / 10),
                size: 10,
                number: 0
            };
        }
        
        return apiResponse;
    }

    // Convertir datos del formulario al formato DTO
    convertirFormDataADTO(formData) {
        return {
            estado: formData.estado,
            fecha: formData.fecha,
            H_inicio: formData.horaInicio,
            H_Fin: formData.horaFin,
            region: formData.region,
            departamento: formData.departamento,
            municipio: formData.municipio,
            distrito: formData.distrito,
            actividad_nombre: formData.actividad,
            tarea: Array.isArray(formData.tareas) ? formData.tareas.join(', ') : formData.tareas,
            hombres: parseInt(formData.participantesHombres) || 0,
            mujeres: parseInt(formData.participantesMujeres) || 0,
            resultados: formData.resultados,
            observaciones: formData.observaciones,
            respaldo: formData.respaldo || null,
            Id_Usuario: this.obtenerUsuarioActualId()
        };
    }

    // Convertir DTO a datos del formulario
    convertirDTOAFormData(actividadDTO) {
        return {
            id: actividadDTO.id,
            estado: actividadDTO.estado,
            fecha: actividadDTO.fecha,
            horaInicio: actividadDTO.H_inicio,
            horaFin: actividadDTO.H_Fin,
            region: actividadDTO.region,
            departamento: actividadDTO.departamento,
            municipio: actividadDTO.municipio,
            distrito: actividadDTO.distrito,
            actividad: actividadDTO.actividad_nombre,
            tareas: actividadDTO.tarea ? actividadDTO.tarea.split(', ') : [],
            participantesHombres: actividadDTO.hombres,
            participantesMujeres: actividadDTO.mujeres,
            resultados: actividadDTO.resultados,
            observaciones: actividadDTO.observaciones,
            respaldo: actividadDTO.respaldo
        };
    }

    // Obtener ID del usuario actual
    obtenerUsuarioActualId() {
        // En producción esto debería venir del sistema de autenticación
        return 1;
    }

    // ============================
    // MODO OFFLINE
    // ============================

    getOfflineActivities(page = 0, size = 10) {
        const actividades = this.getStoredActivities();
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedActivities = actividades.slice(startIndex, endIndex);

        return {
            content: paginatedActivities,
            totalElements: actividades.length,
            totalPages: Math.ceil(actividades.length / size),
            size: size,
            number: page
        };
    }

    createOfflineActivity(actividadData) {
        const actividades = this.getStoredActivities();
        const nuevoId = Math.max(...actividades.map(a => a.id), 0) + 1;
        
        const nuevaActividad = {
            id: nuevoId,
            ...actividadData,
            fechaRegistro: new Date().toISOString().split('T')[0]
        };
        
        actividades.push(nuevaActividad);
        this.saveActivities(actividades);
        
        return {
            status: 'Completado',
            data: nuevaActividad
        };
    }

    updateOfflineActivity(id, actividadData) {
        const actividades = this.getStoredActivities();
        const index = actividades.findIndex(a => a.id === parseInt(id));
        
        if (index !== -1) {
            actividades[index] = { ...actividades[index], ...actividadData };
            this.saveActivities(actividades);
            return actividades[index];
        }
        
        throw new Error('Actividad no encontrada');
    }

    deleteOfflineActivity(id) {
        const actividades = this.getStoredActivities();
        const filtered = actividades.filter(a => a.id !== parseInt(id));
        
        if (filtered.length < actividades.length) {
            this.saveActivities(filtered);
            return {
                status: 'Proceso completado',
                message: 'Actividad eliminada exitosamente'
            };
        }
        
        throw new Error('Actividad no encontrada');
    }

    getStoredActivities() {
        const stored = localStorage.getItem('offlineActivities');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Datos de ejemplo si no hay datos guardados
        const defaultActivities = [
            {
                id: 1,
                fecha: "2024-03-15",
                actividad_nombre: "Capacitación en Primeros Auxilios",
                departamento: "SAN SALVADOR",
                municipio: "SAN SALVADOR",
                distrito: "SAN SALVADOR",
                region: "Central",
                estado: "Completada",
                H_inicio: "08:00",
                H_Fin: "17:00",
                hombres: 15,
                mujeres: 10,
                resultados: "Capacitación exitosa con alta participación de la comunidad",
                observaciones: "Los participantes mostraron mucho interés en el tema",
                tarea: "Planificación, Ejecución",
                respaldo: null,
                Id_Usuario: 1
            },
            {
                id: 2,
                fecha: "2024-03-18",
                actividad_nombre: "Simulacro de Evacuación",
                departamento: "AHUACHAPAN",
                municipio: "AHUACHAPAN SUR",
                distrito: "GUAYMANGO",
                region: "Occidental",
                estado: "En Progreso",
                H_inicio: "07:30",
                H_Fin: "16:30",
                hombres: 80,
                mujeres: 70,
                resultados: "Simulacro en proceso de evaluación final",
                observaciones: "Se identificaron áreas de mejora en los protocolos",
                tarea: "Coordinación, Ejecución",
                respaldo: null,
                Id_Usuario: 2
            },
            {
                id: 3,
                fecha: "2024-03-20",
                actividad_nombre: "Inspección de Infraestructura",
                departamento: "SAN MIGUEL",
                municipio: "SAN MIGUEL",
                distrito: "SAN MIGUEL",
                region: "Oriental",
                estado: "Pendiente",
                H_inicio: "09:00",
                H_Fin: "15:00",
                hombres: 0,
                mujeres: 0,
                resultados: "Programada para próxima semana",
                observaciones: "Esperando autorización de las autoridades locales",
                tarea: "Planificación",
                respaldo: null,
                Id_Usuario: 3
            },
            {
                id: 4,
                fecha: "2024-03-22",
                actividad_nombre: "Evaluación de Riesgos",
                departamento: "LA LIBERTAD",
                municipio: "SANTA TECLA",
                distrito: "SANTA TECLA",
                region: "Central",
                estado: "Completada",
                H_inicio: "08:30",
                H_Fin: "16:00",
                hombres: 8,
                mujeres: 7,
                resultados: "Evaluación completada satisfactoriamente",
                observaciones: "Se recomienda seguimiento en 6 meses",
                tarea: "Evaluación, Reporte",
                respaldo: null,
                Id_Usuario: 4
            },
            {
                id: 5,
                fecha: "2024-03-25",
                actividad_nombre: "Coordinación Interinstitucional",
                departamento: "SONSONATE",
                municipio: "SONSONATE",
                distrito: "SONSONATE",
                region: "Occidental",
                estado: "Cancelada",
                H_inicio: "10:00",
                H_Fin: "14:00",
                hombres: 12,
                mujeres: 8,
                resultados: "Reunión cancelada por condiciones climáticas",
                observaciones: "Se reprogramará para la próxima semana",
                tarea: "Coordinación",
                respaldo: null,
                Id_Usuario: 5
            }
        ];
        
        this.saveActivities(defaultActivities);
        return defaultActivities;
    }

    saveActivities(actividades) {
        localStorage.setItem('offlineActivities', JSON.stringify(actividades));
    }

    // Verificar conexión con el servidor
    async checkConnection() {
        try {
            const response = await fetch(`${this.baseURL}/getAllActividades?page=0&size=1`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}