import { FileText, Download, FileSpreadsheet, FileImage, Loader2 } from 'lucide-react';
import { Card, Button } from '../ui';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface ProjectDocumentsProps {
    projectId: string;
}

export function ProjectDocuments({ projectId }: ProjectDocumentsProps) {
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDocuments = async () => {
        try {
            const data = await api.getDocuments(projectId);
            setDocuments(data);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [projectId]);

    const getIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <FileImage className="w-8 h-8 text-blue-600" />;
        if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="w-8 h-8 text-red-600" />;
        return <FileText className="w-8 h-8 text-red-500" />;
    };

    const handleDownload = (url: string) => {
        // Backend serves uploads at root /uploads, but API is localhost:5000/api
        // We need to construct the full URL.
        // Assuming backend serves static files from root or /uploads
        // In documentController, url is saved as `/uploads/filename`
        const fullUrl = `http://localhost:5000${url}`;
        window.open(fullUrl, '_blank');
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-red-600" /></div>;

    return (
        <Card className="h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-semibold text-slate-600">Documents du Projet</h3>
                <Button variant="ghost" size="sm" onClick={fetchDocuments}>
                    Actualiser
                </Button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
                {documents.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                        Aucun document disponible.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {documents.map((doc) => (
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
        </Card>
    );
}
