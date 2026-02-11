import { FileText, Download, FileSpreadsheet, FileImage, Loader2, Folder, FolderPlus, Home, Upload, Trash2, UploadCloud } from 'lucide-react';
import { Card, Button, ConfirmationModal, cn } from '../ui';
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
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSetFolder = (folder: any) => {
        setCurrentFolder(folder);
        if (onFolderChange) onFolderChange(folder);
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const foldersData = await api.getFolders(projectId, 'DOCUMENTS'); // Default view type
            setFolders(foldersData);
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
    }, [projectId, refreshKey]);

    useEffect(() => {
        handleSetFolder(null);
    }, [projectId]);

    const getIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <FileImage className="w-5 h-5 text-purple-600" />;
        if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
        if (['pdf'].includes(ext || '')) return <FileText className="w-5 h-5 text-red-600" />;
        return <FileText className="w-5 h-5 text-slate-400" />;
    };

    const handleDownload = (url: string) => {
        const fullUrl = `http://localhost:5001${url}`; // Adjusted port to 5001 based on backend
        window.open(fullUrl, '_blank');
    };

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        try {
            const formData = new FormData();
            formData.append('file', files[0]);
            formData.append('projectId', projectId);
            formData.append('category', 'Autre');
            if (currentFolder) {
                formData.append('folderId', currentFolder.id);
            }

            await api.uploadDocument(formData);
            fetchData();
        } catch (error) {
            console.error("Upload failed", error);
            alert("Erreur lors de l'upload");
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) handleUpload(e.dataTransfer.files);
    };

    const [folderToDelete, setFolderToDelete] = useState<number | null>(null);
    const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

    const confirmDeleteFolder = async () => {
        if (!folderToDelete) return;
        try {
            await api.deleteFolder(folderToDelete);
            setFolderToDelete(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const confirmDeleteDocument = async () => {
        if (!documentToDelete) return;
        try {
            await api.deleteDocument(documentToDelete);
            setDocumentToDelete(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const displayedFolders = folders;
    const displayedDocuments = documents.filter(doc => {
        if (currentFolder) return doc.folderId === currentFolder.id;
        return doc.folderId === null;
    });

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-red-600" /></div>;

    return (
        <Card
            className={cn("h-[600px] flex flex-col relative transition-colors", isDragging ? "border-red-500 bg-red-50/10" : "")}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
            />

            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-xl">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <button
                        onClick={() => handleSetFolder(null)}
                        className={`flex items-center gap-1 hover:text-slate-800 transition-colors ${!currentFolder ? 'font-bold text-slate-800' : ''}`}
                    >
                        <Home className="w-4 h-4" />
                    </button>
                    {currentFolder && (
                        <>
                            <span>/</span>
                            <span className="font-bold text-slate-800 flex items-center gap-2">
                                <Folder className="w-4 h-4 text-slate-400" />
                                {currentFolder.name}
                            </span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsCreateFolderOpen(true)} className="gap-2 text-slate-600">
                        <FolderPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Nouveau Dossier</span>
                    </Button>
                    <Button size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                        <UploadCloud className="w-4 h-4" />
                        <span className="hidden sm:inline">Uploader un fichier</span>
                        <span className="sm:hidden">Upload</span>
                    </Button>
                </div>
            </div>

            {/* Drag Overlay Message */}
            {isDragging && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-red-600 rounded-xl border-2 border-dashed border-red-500">
                    <UploadCloud className="w-12 h-12 mb-2 animate-bounce" />
                    <p className="font-bold text-lg">Déposez votre fichier ici</p>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">

                {/* Empty State */}
                {!currentFolder && displayedFolders.length === 0 && displayedDocuments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                            <Upload className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="font-medium text-slate-600">Aucun document</p>
                        <p className="text-sm">Glissez-déposez des fichiers ici pour les ajouter</p>
                    </div>
                )}

                {/* Folders */}
                {displayedFolders.length > 0 && !currentFolder && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {displayedFolders.map(folder => (
                            <div
                                key={folder.id}
                                onClick={() => handleSetFolder(folder)}
                                className="group relative p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all cursor-pointer flex flex-col items-center text-center gap-3"
                            >
                                <Folder className="w-10 h-10 text-amber-400 fill-amber-100" />
                                <div className="w-full">
                                    <p className="font-medium text-sm text-slate-700 truncate w-full">{folder.name}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{folder.documents?.length || 0} éléments</p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFolderToDelete(folder.id); }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Files */}
                {displayedDocuments.length > 0 && (
                    <div>
                        {!currentFolder && displayedFolders.length > 0 && <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Fichiers</h3>}
                        <div className="space-y-2">
                            {displayedDocuments.map((doc) => (
                                <div
                                    key={doc.id}
                                    onDoubleClick={() => handleDownload(doc.url)}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 hover:border-slate-300 transition-all group shadow-sm hover:shadow-md cursor-pointer"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                                            {getIcon(doc.name)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-700 text-sm truncate pr-4">{doc.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                                <span>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Date inconnue'}</span>
                                                <span>•</span>
                                                <span className="uppercase">{doc.extension || doc.name.split('.').pop()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDownload(doc.url)}
                                            className="text-slate-400 hover:text-slate-600"
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDocumentToDelete(doc.id);
                                            }}
                                            className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <CreateFolderModal
                isOpen={isCreateFolderOpen}
                onClose={() => setIsCreateFolderOpen(false)}
                projectId={projectId}
                type={'DOCUMENTS'}
                onSuccess={fetchData}
            />

            <ConfirmationModal
                isOpen={!!folderToDelete}
                onClose={() => setFolderToDelete(null)}
                onConfirm={confirmDeleteFolder}
                title="Supprimer le dossier"
                message="Voulez-vous vraiment supprimer ce dossier ?"
                confirmText="Supprimer"
                variant="danger"
            />

            <ConfirmationModal
                isOpen={!!documentToDelete}
                onClose={() => setDocumentToDelete(null)}
                onConfirm={confirmDeleteDocument}
                title="Supprimer le document"
                message="Voulez-vous vraiment supprimer ce document ? Cette action est irréversible."
                confirmText="Supprimer"
                variant="danger"
            />
        </Card>
    );
}
