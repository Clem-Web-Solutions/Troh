import { Card, Button, Badge } from '../components/ui';
import { Search, Mail, Phone, MoreHorizontal, UserPlus, Loader2 } from 'lucide-react';
import { CreateClientModal } from '../components/admin/CreateClientModal';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function AdminClientsPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const data = await api.getClients();
            // Transform data if needed or backend returns flat User objects
            // Adding mock stats for projects count/status since User model might not have it aggregated yet
            // In a real app, we'd include count in query.
            const clientsWithStats = data.map((c: any) => ({
                ...c,
                projects: 0, // Placeholder
                status: 'active', // Placeholder
                phone: 'N/A' // Placeholder if not in DB
            }));
            setClients(clientsWithStats);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleCreateClient = async (clientData: any) => {
        try {
            const response = await api.createClient(clientData);
            fetchClients();
            return response;
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clients</h1>
                    <p className="text-slate-500 mt-1">Gestion de votre base prospects et clients.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-slate-900 hover:bg-slate-800">
                    <UserPlus className="w-4 h-4" /> Nouveau Client
                </Button>
            </div>

            {/* Toolbar */}
            <Card className="p-4 flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un client par nom, email..."
                        className="w-full pl-9 pr-4 py-2 text-sm border-none focus:outline-none"
                    />
                </div>
            </Card>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : clients.length === 0 ? (
                    <div className="col-span-full text-center p-8 text-slate-500">Aucun client trouvé.</div>
                ) : (
                    clients.map((client) => (
                        <Card key={client.id} className="p-6 relative group hover:border-emerald-500/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                    {client.name.substring(0, 2).toUpperCase()}
                                </div>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                </Button>
                            </div>

                            <h3 className="font-semibold text-slate-900 mb-1">{client.name} (ID: {client.id})</h3>
                            <div className="space-y-2 text-sm text-slate-500 mb-6">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5" /> {client.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5" /> {client.phone}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <span className="text-xs font-medium text-slate-500">{client.projects} Projet(s)</span>
                                <Badge variant={client.status === 'active' ? 'success' : 'neutral'}>
                                    {client.status === 'active' ? 'Actif' : 'Prospect'}
                                </Badge>
                            </div>
                        </Card>
                    )))}
            </div>

            <CreateClientModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateClient}
            />

        </div>
    );
}
