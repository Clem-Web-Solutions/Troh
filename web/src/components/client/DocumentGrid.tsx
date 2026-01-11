import { FileText, Download, FileSpreadsheet, FileImage, Loader2 } from 'lucide-react';
import { Card, Button } from '../ui';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface DocumentGridProps {
    projectId?: string;
}

export function DocumentGrid({ projectId }: DocumentGridProps) {
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!projectId) {
            setIsLoading(false);
            return;
        }
        const fetchDocs = async () => {
            try {
                const data = await api.getDocuments(projectId);
                // Take latest 4
                setDocuments(data.slice(0, 4));
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
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <FileImage className="w-8 h-8 text-blue-600" />;
        if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="w-8 h-8 text-emerald-600" />;
        return <FileText className="w-8 h-8 text-red-500" />;
    };

    const handleDownload = (url: string) => {
        window.open(`http://localhost:5000${url}`, '_blank');
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (documents.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Documents Récents</h3>
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                    Voir tout
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {documents.map((doc) => (
                    <Card key={doc.id} className="group p-4 flex flex-col gap-4 hover:shadow-md transition-all duration-300 border-slate-200/60 hover:border-emerald-500/30">
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
                            <p className="font-medium text-slate-900 truncate" title={doc.name}>{doc.name}</p>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                <span>{doc.category}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
