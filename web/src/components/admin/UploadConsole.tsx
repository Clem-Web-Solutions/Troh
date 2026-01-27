import { UploadCloud, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, cn } from '../ui';
import { useState, useRef } from 'react';
import { api } from '../../lib/api';

interface UploadConsoleProps {
    projectId: string;
    targetFolder?: any;
    onUploadSuccess?: () => void;
}

export function UploadConsole({ projectId, targetFolder, onUploadSuccess }: UploadConsoleProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);
    const [category, setCategory] = useState('Plans');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async () => {
        if (!files || files.length === 0) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', files[0]);
            formData.append('projectId', projectId);
            formData.append('category', category);
            if (targetFolder) {
                formData.append('folderId', targetFolder.id);
            }

            await api.uploadDocument(formData);
            // alert('Fichier uploadé avec succès'); // Remove alert for smoother flow? Or keep it? keeping it simple for now or using toast if available.
            setFiles(null);
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'upload");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card className="h-full flex flex-col min-h-0 shadow-none border-slate-200">
            <CardHeader className="p-3 pb-2">
                <CardTitle className="flex items-center justify-between text-sm font-semibold">
                    <div className="flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-red-600" />
                        Upload Rapide
                    </div>
                </CardTitle>
                {targetFolder && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1 truncate">
                        Vers : {targetFolder.name}
                    </div>
                )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-2 p-3 pt-0 min-h-0">
                {/* Drop Zone */}
                <div
                    className={cn(
                        "flex-1 border border-dashed rounded-lg flex flex-col items-center justify-center p-2 text-center transition-all duration-200 min-h-0",
                        isDragging ? "border-red-500 bg-red-50" : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                    )}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files) setFiles(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => setFiles(e.target.files)}
                    />

                    {files ? (
                        <div className="flex flex-col items-center gap-1">
                            <div className="p-1.5 bg-red-100 rounded-full text-red-600">
                                <UploadCloud className="w-4 h-4" />
                            </div>
                            <p className="font-medium text-red-700 text-xs truncate max-w-[140px]">{files[0].name}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="p-1.5 bg-white rounded-full shadow-sm text-red-600 border border-slate-100">
                                <UploadCloud className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-600 text-xs">Glisser ou cliquer</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Category Selector */}
                <div className="grid grid-cols-2 gap-1.5">
                    {['Plans', 'Photos', 'Factures', 'PV', 'Admin'].map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={cn(
                                "text-[10px] uppercase tracking-wide font-semibold px-2 py-1.5 rounded-md transition-colors text-left border",
                                category === cat
                                    ? "bg-red-50 border-red-200 text-red-700"
                                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                            )}>
                            {cat}
                        </button>
                    ))}
                </div>

                {files && (
                    <Button onClick={handleUpload} disabled={isUploading} className="w-full bg-red-600 hover:bg-red-700">
                        {isUploading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                        Uploader
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
