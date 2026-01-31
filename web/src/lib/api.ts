const API_URL = 'http://localhost:5001/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export const api = {
    // Auth
    login: async (credentials: any) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        if (!res.ok) throw new Error('Login failed');
        return res.json();
    },
    changePassword: async (userId: number, newPassword: string) => {
        const res = await fetch(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ userId, newPassword }),
        });
        if (!res.ok) throw new Error('Password change failed');
        return res.json();
    },
    createClient: async (data: any) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ ...data, role: 'client' }),
        });
        if (!res.ok) throw new Error('Falied to create client');
        return res.json();
    },
    createAdmin: async (data: any) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ ...data, role: 'admin' }),
        });
        if (!res.ok) throw new Error('Failed to create admin');
        return res.json();
    },
    getUsers: async (role?: string) => {
        const query = role ? `?role=${role}` : '';
        const res = await fetch(`${API_URL}/users${query}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },
    getClients: async () => {
        // Reuse getUsers
        return api.getUsers('client');
    },
    deleteClient: async (id: number) => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete client');
        return res.json();
    },

    // Projects
    getProjects: async () => {
        const res = await fetch(`${API_URL}/projects`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch projects');
        return res.json();
    },
    deleteProject: async (id: number) => {
        const res = await fetch(`${API_URL}/projects/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete project');
        return res.json();
    },
    getProject: async (id: string) => {
        const res = await fetch(`${API_URL}/projects/${id}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch project');
        return res.json();
    },
    createProject: async (data: any) => {
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create project');
        return res.json();
    },

    // Folders
    createFolder: async (data: { projectId: string | number, name: string, date?: string, type?: 'DOCUMENTS' | 'PHOTOS' }) => {
        const res = await fetch(`${API_URL}/folders`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create folder');
        return res.json();
    },
    getFolders: async (projectId: string | number, type?: 'DOCUMENTS' | 'PHOTOS') => {
        let url = `${API_URL}/folders/${projectId}`;
        if (type) url += `?type=${type}`;
        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch folders');
        return res.json();
    },
    deleteFolder: async (id: number) => {
        const res = await fetch(`${API_URL}/folders/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete folder');
        return res.json();
    },

    // Documents
    getDocuments: async (projectId: string) => {
        const res = await fetch(`${API_URL}/documents/${projectId}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch documents');
        return res.json();
    },
    uploadDocument: async (formData: FormData) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/documents/upload`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
    },

    // Finances
    getFinance: async (projectId: string) => {
        const res = await fetch(`${API_URL}/finances/${projectId}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch finance');
        return res.json();
    },

    addTransaction: async (projectId: number, data: any) => {
        const response = await fetch(`${API_URL}/finances/${projectId}/transaction`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to add transaction');
        return response.json();
    },
    deleteTransaction: async (id: number) => {
        const res = await fetch(`${API_URL}/finances/transaction/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete transaction');
        return res.json();
    },

    // Phases
    getPhases: async (projectId: string) => {
        const res = await fetch(`${API_URL}/phases/${projectId}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch phases');
        return res.json();
    },
    createPhase: async (projectId: string, name: string) => {
        const res = await fetch(`${API_URL}/phases/${projectId}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name })
        });
        if (!res.ok) throw new Error('Failed to create phase');
        return res.json();
    },
    updatePhase: async (id: number, data: any) => {
        const res = await fetch(`${API_URL}/phases/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update phase');
        return res.json();
    },
    deletePhase: async (id: number) => {
        const res = await fetch(`${API_URL}/phases/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete phase');
        return res.json();
    },

    // Activities / Stats
    getRecentActivities: async () => {
        const res = await fetch(`${API_URL}/activities`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch activities');
        return res.json();
    },
    getActivityStats: async () => {
        const res = await fetch(`${API_URL}/activities/stats`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
    }
};
