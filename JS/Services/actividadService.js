// JS/services/actividadService.js
class ActividadService {
    constructor() {
        this.baseURL = 'http://localhost:8080/apiActividad';
    }

    // Obtener todas las actividades con paginación
    async getAllActividades(page = 0, size = 10) {
        try {
            const response = await fetch(`${this.baseURL}/getAllActividades?page=${page}&size=${size}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al obtener actividades:', error);
            throw error;
        }
    }

    // Crear nueva actividad
    async createActividad(actividadData) {
        try {
            const response = await fetch(`${this.baseURL}/newActividad`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(actividadData)
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
        try {
            const response = await fetch(`${this.baseURL}/updateActividad/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(actividadData)
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
            Id_Usuario: this.obtenerUsuarioActualId() // Obtener ID del usuario logueado
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

    // Obtener ID del usuario actual (simulado - en producción vendría del token/auth)
    obtenerUsuarioActualId() {
        // Por ahora retornamos 1 como usuario por defecto
        // En producción esto debería venir del sistema de autenticación
        return 1;
    }
}