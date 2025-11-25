class UsuarioService {
    constructor() {
        this.baseURL = 'http://localhost:8080/apiUsuario';
        this.offlineMode = localStorage.getItem('offlineMode') === 'true';
    }

    // Obtener todos los usuarios con paginación
    async getAllUsuarios(page = 0, size = 10) {
        if (this.offlineMode) {
            return this.getOfflineUsers(page, size);
        }

        try {
            const response = await fetch(`${this.baseURL}/getAllUsuarios?page=${page}&size=${size}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return this.normalizeApiResponse(data);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    }

    // Crear nuevo usuario
    async createUsuario(usuarioData) {
        if (this.offlineMode) {
            return this.createOfflineUser(usuarioData);
        }

        try {
            const dto = this.convertirFormDataADTO(usuarioData);
            const response = await fetch(`${this.baseURL}/newUsuario`, {
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
            console.error('Error al crear usuario:', error);
            throw error;
        }
    }

    // Actualizar usuario existente
    async updateUsuario(id, usuarioData) {
        if (this.offlineMode) {
            return this.updateOfflineUser(id, usuarioData);
        }

        try {
            const dto = this.convertirFormDataADTO(usuarioData);
            const response = await fetch(`${this.baseURL}/updateUsuario/${id}`, {
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
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    }

    // Eliminar usuario
    async deleteUsuario(id) {
        if (this.offlineMode) {
            return this.deleteOfflineUser(id);
        }

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

    // ============================
    // MODO OFFLINE
    // ============================

    getOfflineUsers(page = 0, size = 10) {
        const usuarios = this.getStoredUsers();
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedUsers = usuarios.slice(startIndex, endIndex);

        return {
            content: paginatedUsers,
            totalElements: usuarios.length,
            totalPages: Math.ceil(usuarios.length / size),
            size: size,
            number: page
        };
    }

    createOfflineUser(usuarioData) {
        const usuarios = this.getStoredUsers();
        const nuevoId = Math.max(...usuarios.map(u => u.Id), 0) + 1;
        
        const nuevoUsuario = {
            Id: nuevoId,
            ...usuarioData,
            fechaCreacion: new Date().toISOString().split('T')[0],
            estado: 'activo'
        };
        
        usuarios.push(nuevoUsuario);
        this.saveUsers(usuarios);
        
        return {
            status: 'Completado',
            data: nuevoUsuario
        };
    }

    updateOfflineUser(id, usuarioData) {
        const usuarios = this.getStoredUsers();
        const index = usuarios.findIndex(u => u.Id === parseInt(id));
        
        if (index !== -1) {
            usuarios[index] = { ...usuarios[index], ...usuarioData };
            this.saveUsers(usuarios);
            return usuarios[index];
        }
        
        throw new Error('Usuario no encontrado');
    }

    deleteOfflineUser(id) {
        const usuarios = this.getStoredUsers();
        const filtered = usuarios.filter(u => u.Id !== parseInt(id));
        
        if (filtered.length < usuarios.length) {
            this.saveUsers(filtered);
            return {
                status: 'Completado',
                message: 'Usuario eliminado correctamente'
            };
        }
        
        throw new Error('Usuario no encontrado');
    }

    getStoredUsers() {
        const stored = localStorage.getItem('offlineUsers');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Datos de ejemplo si no hay datos guardados
        const defaultUsers = [
            {
                Id: 1,
                nombre: "Juan Pérez García",
                email: "juan.perez@proteccioncivil.gob.sv",
                telefono: "1234-5678",
                rol: "Administrador",
                region: "Central",
                departamento: "SAN SALVADOR",
                municipio: "SAN SALVADOR",
                distrito: "SAN SALVADOR",
                estado: "activo",
                unidad: "Unidad Central",
                fechaCreacion: "2024-01-15",
                filtrar: "No Aplica"
            },
            {
                Id: 2,
                nombre: "María Rodríguez López",
                email: "maria.rodriguez@proteccioncivil.gob.sv",
                telefono: "2345-6789",
                rol: "Coordinador",
                region: "Paracentral",
                departamento: "LA PAZ",
                municipio: "ZACATECOLUCA",
                distrito: "ZACATECOLUCA",
                estado: "activo",
                unidad: "Unidad Regional",
                fechaCreacion: "2024-02-20",
                filtrar: "Region"
            },
            {
                Id: 3,
                nombre: "Carlos Hernández Martínez",
                email: "carlos.hernandez@proteccioncivil.gob.sv",
                telefono: "3456-7890",
                rol: "Técnico",
                region: "Oriental",
                departamento: "SAN MIGUEL",
                municipio: "SAN MIGUEL",
                distrito: "SAN MIGUEL",
                estado: "inactivo",
                unidad: "Unidad Técnica",
                fechaCreacion: "2024-03-10",
                filtrar: "Departamento"
            }
        ];
        
        this.saveUsers(defaultUsers);
        return defaultUsers;
    }

    saveUsers(usuarios) {
        localStorage.setItem('offlineUsers', JSON.stringify(usuarios));
    }

    // Verificar conexión con el servidor
    async checkConnection() {
        try {
            const response = await fetch(`${this.baseURL}/getAllUsuarios?page=0&size=1`, {
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