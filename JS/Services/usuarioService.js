// Servicio para gestión de usuarios
const UsuarioService = {
    
    /**
     * Obtener todos los usuarios con paginación
     * @param {number} page - Número de página (default: 0)
     * @param {number} size - Tamaño de página (default: 10)
     * @returns {Promise} Promesa con los datos de usuarios
     */
    async getAllUsuarios(page = 0, size = 10) {
        try {
            const url = buildURL(CONFIG.ENDPOINTS.USUARIOS.GET_ALL, { page, size });
            
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
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    },
    
    /**
     * Obtener usuario por ID
     * @param {number} id - ID del usuario
     * @returns {Promise} Promesa con los datos del usuario
     */
    async getUsuarioById(id) {
        try {
            const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.USUARIOS.GET_BY_ID}/${id}`;
            
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
            console.error('Error al obtener usuario:', error);
            throw error;
        }
    },
    
    /**
     * Crear nuevo usuario
     * @param {Object} usuarioData - Datos del usuario
     * @returns {Promise} Promesa con el usuario creado
     */
    async createUsuario(usuarioData) {
        try {
            const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.USUARIOS.CREATE}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(usuarioData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        }
    },
    
    /**
     * Actualizar usuario existente
     * @param {number} id - ID del usuario
     * @param {Object} usuarioData - Datos actualizados del usuario
     * @returns {Promise} Promesa con el usuario actualizado
     */
    async updateUsuario(id, usuarioData) {
        try {
            const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.USUARIOS.UPDATE}/${id}`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(usuarioData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    },
    
    /**
     * Eliminar usuario
     * @param {number} id - ID del usuario
     * @returns {Promise} Promesa con resultado de eliminación
     */
    async deleteUsuario(id) {
        try {
            const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.USUARIOS.DELETE}/${id}`;
            
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
            console.error('Error al eliminar usuario:', error);
            throw error;
        }
    },
    
    /**
     * Buscar usuarios por término
     * @param {string} searchTerm - Término de búsqueda
     * @param {number} page - Número de página
     * @param {number} size - Tamaño de página
     * @returns {Promise} Promesa con resultados de búsqueda
     */
    async searchUsuarios(searchTerm, page = 0, size = 10) {
        try {
            // Primero obtener todos los usuarios
            const allData = await this.getAllUsuarios(page, size);
            
            // Filtrar localmente (si el backend no tiene endpoint de búsqueda)
            if (searchTerm && searchTerm.trim() !== '') {
                const term = searchTerm.toLowerCase();
                const filteredContent = allData.content.filter(usuario => 
                    usuario.nombre.toLowerCase().includes(term) ||
                    usuario.email.toLowerCase().includes(term) ||
                    usuario.telefono.includes(term)
                );
                
                return {
                    ...allData,
                    content: filteredContent,
                    totalElements: filteredContent.length
                };
            }
            
            return allData;
            
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
            throw error;
        }
    },
    
    /**
     * Validar datos de usuario
     * @param {Object} usuarioData - Datos a validar
     * @returns {Object} Objeto con validación y errores
     */
    validateUsuario(usuarioData) {
        const errors = {};
        
        // Validar nombre
        if (!usuarioData.nombre || usuarioData.nombre.trim() === '') {
            errors.nombre = 'El nombre es requerido';
        } else if (usuarioData.nombre.length > 200) {
            errors.nombre = 'El nombre no puede exceder 200 caracteres';
        }
        
        // Validar teléfono
        if (!usuarioData.telefono || usuarioData.telefono.trim() === '') {
            errors.telefono = 'El teléfono es requerido';
        } else if (usuarioData.telefono.length > 9) {
            errors.telefono = 'El teléfono no puede exceder 9 caracteres';
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!usuarioData.email || usuarioData.email.trim() === '') {
            errors.email = 'El email es requerido';
        } else if (!emailRegex.test(usuarioData.email)) {
            errors.email = 'El formato del email no es válido';
        } else if (usuarioData.email.length > 200) {
            errors.email = 'El email no puede exceder 200 caracteres';
        }
        
        // Validar unidad
        if (!usuarioData.unidad || usuarioData.unidad.trim() === '') {
            errors.unidad = 'La unidad es requerida';
        }
        
        // Validar contraseña (solo para nuevos usuarios)
        if (!usuarioData.Id && (!usuarioData.pass || usuarioData.pass.trim() === '')) {
            errors.pass = 'La contraseña es requerida';
        }
        
        // Validar rol
        if (!usuarioData.rol || usuarioData.rol.trim() === '') {
            errors.rol = 'El rol es requerido';
        }
        
        // Validar región
        if (!usuarioData.region || usuarioData.region.trim() === '') {
            errors.region = 'La región es requerida';
        }
        
        // Validar departamento
        if (!usuarioData.departamento || usuarioData.departamento.trim() === '') {
            errors.departamento = 'El departamento es requerido';
        }
        
        // Validar municipio
        if (!usuarioData.municipio || usuarioData.municipio.trim() === '') {
            errors.municipio = 'El municipio es requerido';
        }
        
        // Validar distrito
        if (!usuarioData.distrito || usuarioData.distrito.trim() === '') {
            errors.distrito = 'El distrito es requerido';
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};

// Exportar el servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UsuarioService;
}