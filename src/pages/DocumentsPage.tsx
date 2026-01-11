import { DocumentGrid } from '../components/client/DocumentGrid';
import { Card, CardContent } from '../components/ui';
import { Search, Filter } from 'lucide-react';

export function DocumentsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mes Documents</h1>
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
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                            <Filter className="w-4 h-4" />
                            Filtrer
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            <DocumentGrid />

        </div>
    );
}
