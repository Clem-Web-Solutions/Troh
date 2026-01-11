import { UploadCloud } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, cn } from '../ui';
import { useState } from 'react';

export function UploadConsole() {
    const [isDragging, setIsDragging] = useState(false);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-emerald-600" />
                    Console d'Upload
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {/* Drop Zone */}
                <div
                    className={cn(
                        "flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center transition-all duration-200",
                        isDragging ? "border-emerald-500 bg-emerald-50 scale-[0.99]" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
                >
                    <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                        <UploadCloud className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="font-medium text-slate-900">Glissez vos fichiers ici</p>
                    <p className="text-sm text-slate-500 mt-1 mb-4">ou cliquez pour parcourir</p>
                    <Button variant="secondary" size="sm">Sélectionner</Button>
                </div>

                {/* Category Selector */}
                <div className="grid grid-cols-2 gap-2">
                    {['Plans', 'Photos', 'Factures', 'Administratif'].map((cat) => (
                        <button key={cat} className="text-xs font-medium px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-left">
                            {cat}
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
