import { FileText, Download, FileSpreadsheet, FileImage, Loader2, Folder, Search, ArrowLeft } from 'lucide-react';
import { Card, Button } from '../ui';
import { useState, useEffect, useMemo } from 'react';
import { api } from '../../lib/api';

interface DocumentGridProps {
    projectId?: string;
}

export function DocumentGrid({ projectId }: DocumentGridProps) {
    const [documents, setDocuments] = useState<any[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentFolder, setCurrentFolder] = useState<any | null>(null);

    useEffect(() => {
        if (!projectId) {
            setIsLoading(false);
            return;
        }
        const fetchDocs = async () => {
            setIsLoading(true);
            try {
                const [docsData, foldersData] = await Promise.all([
                    api.getDocuments(projectId),
                    api.getFolders(projectId, 'DOCUMENTS')
                ]);
                setDocuments(docsData);
                setFolders(foldersData);
            } catch (error) {
                console.error("Failed to load docs", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocs();
    }, [projectId]);

    const getIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'pdf'].includes(ext || '')) return <FileImage className="w-8 h-8 text-blue-600" />;
        if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="w-8 h-8 text-red-600" />;
        return <FileText className="w-8 h-8 text-slate-500" />;
    };

    const handleDownload = (url: string) => {
        window.open(`http://localhost:5000${url}`, '_blank');
    };

    const categories = ['all', 'Plans', 'Administratif', 'Financier', 'Technique', 'PV', 'Autre'];

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            // Folder logic
            if (currentFolder) {
                if (doc.folderId !== currentFolder.id) return false;
            } else {
                if (doc.folderId !== null) return false;
            }

            const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
            const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [documents, selectedCategory, searchQuery, currentFolder]);

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Controls */}
            <div className="flex flex-col gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-600 flex items-center gap-2 truncate">
                            <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0" />
                            <span className="truncate">{currentFolder ? currentFolder.name : "Documents"}</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500">{filteredDocuments.length} document(s)</p>
                    </div>
                    {currentFolder && (
                        <Button variant="ghost" size="sm" onClick={() => setCurrentFolder(null)} className="shrink-0">
                            <ArrowLeft className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Retour</span>
                        </Button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full items-stretch">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Folders Grid (Root Only) */}
            {!currentFolder && folders.length > 0 && (
                <div className="mb-4 sm:mb-6">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Dossiers</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {folders.map(folder => (
                            <div
                                key={folder.id}
                                onClick={() => setCurrentFolder(folder)}
                                className="p-3 sm:p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-red-300 hover:shadow-md transition-all group flex items-start gap-3"
                            >
                                <Folder className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 group-hover:text-red-500 transition-colors shrink-0" />
                                <div className="overflow-hidden min-w-0 flex-1">
                                    <h4 className="font-semibold text-sm sm:text-base text-slate-700 truncate">{folder.name}</h4>
                                    <p className="text-xs text-slate-500">{new Date(folder.date).toLocaleDateString()}</p>
                                    <span className="text-xs text-slate-400">{folder.documents?.length || 0} fichiers</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Documents Grid */}
            <div>
                {/* Categories only relevant if mixing types, but sticking to it */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${selectedCategory === cat
                                ? 'bg-slate-600 text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            {cat === 'all' ? 'Tous' : cat}
                        </button>
                    ))}
                </div>

                {filteredDocuments.length === 0 ? (
                    <div className="text-center py-12 sm:py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <Folder className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm sm:text-base text-slate-500 font-medium">Aucun document trouvé</p>
                        <p className="text-xs text-slate-400">Cette vue est vide</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {filteredDocuments.map((doc) => (
                            <Card key={doc.id} className="group p-4 flex flex-col gap-4 hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-red-500/30 bg-white">
                                <div className="flex items-start justify-between">
                                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-red-50 border border-slate-100 group-hover:border-red-100 group-hover:scale-110 transition-all duration-300">
                                        {getIcon(doc.name)}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDownload(doc.url)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 hover:bg-slate-200"
                                    >
                                        <Download className="w-4 h-4 text-slate-700" />
                                    </Button>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="font-semibold text-slate-600 truncate" title={doc.name}>
                                        {doc.name}
                                    </h4>
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{doc.category}</span>
                                        <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
