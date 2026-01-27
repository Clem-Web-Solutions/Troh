import { FileText, Download, FileSpreadsheet, FileImage, Loader2, Folder, FolderPlus, Home, Upload, Trash2 } from 'lucide-react';
import { Card, Button } from '../ui';
import { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { CreateFolderModal } from './CreateFolderModal';

interface ProjectDocumentsProps {
    projectId: string;
    onFolderChange?: (folder: any) => void;
    refreshKey?: number;
}

export function ProjectDocuments({ projectId, onFolderChange, refreshKey }: ProjectDocumentsProps) {
    const [documents, setDocuments] = useState<any[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentFolder, setCurrentFolder] = useState<any | null>(null);
    const [viewType, setViewType] = useState<'DOCUMENTS' | 'PHOTOS'>('DOCUMENTS');
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSetFolder = (folder: any) => {
        setCurrentFolder(folder);
        if (onFolderChange) onFolderChange(folder);
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch Folders
            const foldersData = await api.getFolders(projectId, viewType);
            setFolders(foldersData);

            // Fetch Documents
            const docsData = await api.getDocuments(projectId);
            setDocuments(docsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Maintain current folder state unless reset is desired? 
        // Usually refresh doesn't reset navigation, but project switch does.
    }, [projectId, viewType, refreshKey]);

    // Reset folder when project changes only
    useEffect(() => {
        handleSetFolder(null);
    }, [projectId]);

    const getIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <FileImage className="w-8 h-8 text-blue-600" />;
        if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
        if (['pdf'].includes(ext || '')) return <FileText className="w-8 h-8 text-red-600" />;
        return <FileText className="w-8 h-8 text-slate-500" />;
    };

    const handleDownload = (url: string) => {
        const fullUrl = `http://localhost:5000${url}`;
        window.open(fullUrl, '_blank');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);
        formData.append('category', viewType === 'PHOTOS' ? 'Photos' : 'Autre'); // Default category based on view
        if (currentFolder) {
            formData.append('folderId', currentFolder.id);
        }

        try {
            await api.uploadDocument(formData);
            await fetchData(); // Refresh
        } catch (error) {
            console.error("Upload failed", error);
            alert("Erreur lors de l'upload");
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const handleDeleteFolder = async (e: React.MouseEvent, folderId: number) => {
        e.stopPropagation();
        if (!confirm('Voulez-vous vraiment supprimer ce dossier ? Les fichiers resteront mais seront orphelins.')) return;
        try {
            await api.deleteFolder(folderId);
            fetchData();
        } catch (err) {
            alert('Erreur suppression');
        }
    };

    // Filter displayed items
    const displayedFolders = folders; // Folders are already filtered by API based on viewType

    const displayedDocuments = documents.filter(doc => {
        // Filter by folder
        if (currentFolder) {
            return doc.folderId === currentFolder.id;
        } else {
            // Root view: show docs with no folder AND matching the view type intuitively?
            // Actually, if ViewType is PHOTOS, we only want to show photos?
            // The 'category' field exists.
            // If viewType is PHOTOS, show category 'Photos' or images.
            // If viewType is DOCUMENTS, show others.

            const isPhoto = doc.category === 'Photos' || /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.url);

            if (viewType === 'PHOTOS') {
                // In root, show loose photos? Yes.
                return doc.folderId === null && isPhoto;
            } else {
                // In root documents, show loose documents (not photos ideally, or everything?)
                // Let's exclude photos from Documents tab to keep it clean, unless category is explicitly not Photos.
                return doc.folderId === null && !isPhoto;
            }
        }
    });

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-red-600" /></div>;

    return (
        <Card className="h-full flex flex-col relative">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
            />

            {/* Header / Tabs */}
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewType('DOCUMENTS')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewType === 'DOCUMENTS' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Documents
                        </button>
                        <button
                            onClick={() => setViewType('PHOTOS')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewType === 'PHOTOS' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Photos / Galerie
                        </button>
                    </div>
                    <Button size="sm" onClick={() => setIsCreateFolderOpen(true)} className="gap-2 bg-slate-800 hover:bg-slate-700 text-white">
                        <FolderPlus className="w-4 h-4" />
                        Nouveau Dossier
                    </Button>
                </div>

                {/* Breadcrumbs / Navigation */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <button
                        onClick={() => handleSetFolder(null)}
                        className={`flex items-center gap-1 hover:text-red-600 transition-colors ${!currentFolder ? 'font-bold text-slate-700' : ''}`}
                    >
                        <Home className="w-4 h-4" /> Racine
                    </button>
                    {currentFolder && (
                        <>
                            <span>/</span>
                            <span className="font-bold text-slate-700">{currentFolder.name}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">

                {/* Folders Grid */}
                {!currentFolder && displayedFolders.length > 0 && (
                    <div className="mb-8">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Dossiers</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {displayedFolders.map(folder => (
                                <div
                                    key={folder.id}
                                    onClick={() => handleSetFolder(folder)}
                                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-red-200 hover:shadow-md transition-all cursor-pointer group relative"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <Folder className={viewType === 'PHOTOS' ? "w-8 h-8 text-blue-500" : "w-8 h-8 text-yellow-500"} />
                                        <button
                                            onClick={(e) => handleDeleteFolder(e, folder.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="font-semibold text-slate-700 truncate">{folder.name}</p>
                                    <p className="text-xs text-slate-400">{new Date(folder.date).toLocaleDateString()}</p>
                                    <div className="mt-2 text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded w-fit border border-slate-100">
                                        {folder.documents?.length || 0} éléments
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Files Grid */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            {currentFolder ? `Fichiers dans ${currentFolder.name}` : 'Fichiers non classés'}
                        </h4>
                        <Button variant="ghost" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={triggerUpload}>
                            <Upload className="w-4 h-4" />
                            {currentFolder ? "Ajouter ici" : "Ajouter fichier"}
                        </Button>
                    </div>

                    {displayedDocuments.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
                            <p className="text-slate-400 text-sm">Aucun fichier ici.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {displayedDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="shrink-0">
                                            {getIcon(doc.name)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-600 truncate text-sm">{doc.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span className="bg-slate-200 px-1.5 rounded">{doc.category || 'Autre'}</span>
                                                <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDownload(doc.url)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Download className="w-4 h-4 text-slate-600" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CreateFolderModal
                isOpen={isCreateFolderOpen}
                onClose={() => setIsCreateFolderOpen(false)}
                projectId={projectId}
                type={viewType}
                onSuccess={fetchData}
            />
        </Card>
    );
}
