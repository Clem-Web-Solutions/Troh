import { FileText, Download, FileSpreadsheet, FileImage, Loader2, Folder, Search, Filter } from 'lucide-react';
import { Card, Button } from '../ui';
import { useState, useEffect, useMemo } from 'react';
import { api } from '../../lib/api';

interface DocumentGridProps {
    projectId?: string;
}

export function DocumentGrid({ projectId }: DocumentGridProps) {
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!projectId) {
            setIsLoading(false);
            return;
        }
        const fetchDocs = async () => {
            try {
                const data = await api.getDocuments(projectId);
                setDocuments(data);
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

    const categories = ['all', 'Plans', 'Administratif', 'Financier', 'Technique', 'Autre'];

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
            const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [documents, selectedCategory, searchQuery]);

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-600 flex items-center gap-2">
                        <Folder className="w-5 h-5 text-red-600" />
                        Documents
                    </h2>
                    <p className="text-sm text-slate-500">{documents.length} document(s) au total</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-full"
                        />
                    </div>
                    {/* Category Dropdown/Tabs could go here, for now simple tabs below */}
                </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                                ? 'bg-slate-600 text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        {cat === 'all' ? 'Tous' : cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {filteredDocuments.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Aucun document trouvé</p>
                    <p className="text-xs text-slate-400">Essayez de modifier vos filtres</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
    );
}
