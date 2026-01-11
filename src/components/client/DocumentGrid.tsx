import { FileText, Download, FileSpreadsheet, FileImage } from 'lucide-react';
import { Card, Button } from '../ui';

interface Document {
    id: string;
    name: string;
    type: 'pdf' | 'excel' | 'image';
    date: string;
    size: string;
}

const MOCK_DOCS: Document[] = [
    { id: '1', name: 'Devis_Initial_Signé.pdf', type: 'pdf', date: '12 Jan 2024', size: '2.4 MB' },
    { id: '2', name: 'Plans_Architecte_v2.pdf', type: 'pdf', date: '15 Jan 2024', size: '15.8 MB' },
    { id: '3', name: 'Facture_Acompte_1.pdf', type: 'pdf', date: '20 Jan 2024', size: '1.2 MB' },
    { id: '4', name: 'Planning_Travaux.xlsx', type: 'excel', date: '22 Jan 2024', size: '850 KB' },
];

export function DocumentGrid() {
    const getIcon = (type: string) => {
        switch (type) {
            case 'excel': return <FileSpreadsheet className="w-8 h-8 text-emerald-600" />;
            case 'image': return <FileImage className="w-8 h-8 text-blue-600" />;
            default: return <FileText className="w-8 h-8 text-red-500" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Documents Récents</h3>
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                    Voir tout
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MOCK_DOCS.map((doc) => (
                    <Card key={doc.id} className="group p-4 flex flex-col gap-4 hover:shadow-md transition-all duration-300 border-slate-200/60 hover:border-emerald-500/30">
                        <div className="flex items-start justify-between">
                            <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-white border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                                {getIcon(doc.type)}
                            </div>
                            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Download className="w-4 h-4 text-slate-600" />
                            </Button>
                        </div>

                        <div className="space-y-1">
                            <p className="font-medium text-slate-900 truncate" title={doc.name}>{doc.name}</p>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>{doc.date}</span>
                                <span>{doc.size}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
