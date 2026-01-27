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

    const handleDeleteClient = async (clientId: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
            try {
                await api.deleteClient(clientId);
                fetchClients();
            } catch (error) {
                console.error(error);
                alert('Erreur lors de la suppression du client.');
            }
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-600 tracking-tight">Clients</h1>
                    <p className="text-sm sm:text-base text-slate-500 mt-1">Gestion de votre base prospects et clients.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-slate-600 hover:bg-slate-800 w-full sm:w-auto">
                    <UserPlus className="w-4 h-4" /> <span className="hidden sm:inline">Nouveau Client</span><span className="sm:hidden">Ajouter</span>
                </Button>
            </div>

            {/* Toolbar */}
            <Card className="p-3 sm:p-4 flex gap-3 sm:gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un client..."
                        className="w-full pl-9 pr-4 py-2 text-sm border-none focus:outline-none"
                    />
                </div>
            </Card>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {isLoading ? (
                    <div className="col-span-full flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : clients.length === 0 ? (
                    <div className="col-span-full text-center p-8 text-slate-500">Aucun client trouvé.</div>
                ) : (
                    clients.map((client) => (
                        <Card key={client.id} className="p-6 relative group hover:border-red-500/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                    {client.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClient(client.id);
                                        }}
                                        title="Supprimer le client"
                                    >
                                        <MoreHorizontal className="w-4 h-4 rotate-90" /> {/* Using rotate-90 merely as a placeholder for trash icon or keep distinct */}
                                        {/* Ideally replace MoreHorizontal with Trash2 if available or just use Trash2 */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                    </Button>
                                </div>
                            </div>

                            <h3 className="font-semibold text-slate-600 mb-1">{client.name} (ID: {client.id})</h3>
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
