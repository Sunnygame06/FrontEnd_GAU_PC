// JS/services/usuarioService.js
class UsuarioService {
    constructor() {
        this.baseURL = 'http://localhost:8080/apiUsuario';
    }

    // Obtener todos los usuarios con paginación
    async getAllUsuarios(page = 0, size = 10) {
        try {
            const response = await fetch(`${this.baseURL}/getAllUsuarios?page=${page}&size=${size}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    }

    // Crear nuevo usuario
    async createUsuario(usuarioData) {
        try {
            const response = await fetch(`${this.baseURL}/newUsuario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(usuarioData)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        }
    }

    // Actualizar usuario existente
    async updateUsuario(id, usuarioData) {
        try {
            const response = await fetch(`${this.baseURL}/updateUsuario/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                body: JSON.stringify(usuarioData)
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    }

    // Eliminar usuario
    async deleteUsuario(id) {
        try {
            const response = await fetch(`${this.baseURL}/deleteUsuario/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw error;
        }
    }

    // Convertir datos del formulario al formato DTO
    convertirFormDataADTO(formData) {
        return {
            nombre: formData.nombres,
            telefono: formData.telefono,
            email: formData.email,
            unidad: formData.unidad,
            pass: formData.password,
            rol: formData.rol,
            region: formData.region,
            departamento: formData.departamento,
            municipio: formData.municipio,
            distrito: formData.distrito,
            filtrar: formData.filtrado || 'No Aplica'
        };
    }

    // Convertir DTO a datos del formulario
    convertirDTOAFormData(usuarioDTO) {
        return {
            id: usuarioDTO.Id,
            nombres: usuarioDTO.nombre,
            telefono: usuarioDTO.telefono,
            email: usuarioDTO.email,
            unidad: usuarioDTO.unidad,
            rol: usuarioDTO.rol,
            region: usuarioDTO.region,
            departamento: usuarioDTO.departamento,
            municipio: usuarioDTO.municipio,
            distrito: usuarioDTO.distrito,
            filtrado: usuarioDTO.filtrar || 'No Aplica'
        };
    }
}