import { FileText, Download, FileSpreadsheet, FileImage, Loader2, Search, Filter } from 'lucide-react';
import { Card, CardContent, Button } from '../components/ui';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function DocumentsPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projects = await api.getProjects();
                if (projects && projects.length > 0) {
                    const projectId = projects[0].id;
                    const docs = await api.getDocuments(projectId);
                    setDocuments(docs);
                }
            } catch (error) {
                console.error("Failed to load documents", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const getIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <FileImage className="w-8 h-8 text-blue-600" />;
        if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="w-8 h-8 text-red-600" />;
        return <FileText className="w-8 h-8 text-red-500" />;
    };

    const handleDownload = (url: string) => {
        window.open(`http://localhost:5000${url}`, '_blank');
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory ? doc.category === filterCategory : true;
        return matchesSearch && matchesCategory;
    });

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-600 tracking-tight">Mes Documents</h1>
                <p className="text-slate-500 mt-1">Retrouvez tous les fichiers relatifs à votre projet.</p>
            </div>

            {/* Toolbar */}
            <Card>
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un document..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="flex gap-2">
                            {['Plans', 'Photos', 'Factures', 'Admin'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${filterCategory === cat
                                            ? 'bg-red-50 border-red-200 text-red-700'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            {filteredDocuments.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    Aucun document trouvé.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredDocuments.map((doc) => (
                        <Card key={doc.id} className="group p-4 flex flex-col gap-4 hover:shadow-md transition-all duration-300 border-slate-200/60 hover:border-red-500/30">
                            <div className="flex items-start justify-between">
                                <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-white border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                                    {getIcon(doc.name)}
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

                            <div className="space-y-1">
                                <p className="font-medium text-slate-600 truncate" title={doc.name}>{doc.name}</p>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded-full">{doc.category}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

        </div>
    );
}
