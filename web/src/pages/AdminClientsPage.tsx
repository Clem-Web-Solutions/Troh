import { Card, Button } from '../components/ui';
import { Search, Mail, Phone, UserPlus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { CreateClientModal } from '../components/admin/CreateClientModal';
import { EditClientModal } from '../components/admin/EditClientModal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function AdminClientsPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Delete Confirmation State
    const [clientToDelete, setClientToDelete] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit State
    const [editingClient, setEditingClient] = useState<any>(null);

    const handleUpdateClient = async (id: number, data: any) => {
        try {
            await api.updateUser(id, data);
            fetchClients();
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la modification du client');
        }
    };

    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const data = await api.getClients();
            // Transform data if needed or backend returns flat User objects
            const clientsWithStats = data.map((c: any) => ({
                ...c,
                projects: 0,
                status: 'active',
                phone: c.phone || 'N/A' // Use actual phone or fallback
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

    const confirmDeleteClient = (clientId: number) => {
        setClientToDelete(clientId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!clientToDelete) return;

        setIsDeleting(true);
        try {
            await api.deleteClient(clientToDelete);
            fetchClients();
            setIsDeleteModalOpen(false);
            setClientToDelete(null);
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la suppression du client.');
        } finally {
            setIsDeleting(false);
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

            {/* Section Header */}
            <div className="pt-2">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Mois en cours</h2>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {isLoading ? (
                        <div className="col-span-full flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : clients.length === 0 ? (
                        <div className="col-span-full text-center p-8 text-slate-500">Aucun client trouvé.</div>
                    ) : (
                        clients.map((client) => (
                            <Card key={client.id} className="p-5 flex flex-col justify-between group hover:shadow-md transition-all duration-200 border-slate-200">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                                            {client.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${client.status === 'active' ? 'bg-[#ff6b6b] text-white' : 'bg-slate-100 text-slate-600'}`}>
                                            {client.status === 'active' ? 'Actif' : 'Prospect'}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="font-semibold text-slate-700 text-base">{client.name} (ID: {client.id})</h3>
                                        <div className="mt-2 space-y-1.5">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Mail className="w-3.5 h-3.5" />
                                                <span className="truncate">{client.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{client.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                                    <span className="text-xs font-medium text-slate-500">{client.projects} Projet(s)</span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Handle edit logic here 
                                                // For now just console log or maybe open a modal in future
                                                setEditingClient(client);
                                            }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                confirmDeleteClient(client.id);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <CreateClientModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateClient}
            />

            <EditClientModal
                isOpen={!!editingClient}
                onClose={() => setEditingClient(null)}
                currentClient={editingClient}
                onSubmit={handleUpdateClient}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Supprimer le client ?"
                message="Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible et supprimera toutes les données associées."
                confirmText="Oui, supprimer"
                variant="danger"
                isLoading={isDeleting}
            />

        </div>
    );
}
