import { SiteGallery } from '../components/client/SiteGallery';
import { Card } from '../components/ui';
import { Calendar, Filter } from 'lucide-react';

export function GalleryPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Galerie Chantier</h1>
                    <p className="text-slate-500 mt-1">L'évolution de votre projet en images.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                        <Calendar className="w-4 h-4" />
                        Janvier 2024
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                        <Filter className="w-4 h-4" />
                        Filtrer par phase
                    </button>
                </div>
            </div>

            {/* Main Gallery Grid */}
            <SiteGallery />

            {/* Additional "On Demand" Section (Mockup) */}
            <div className="mt-12">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Vidéos & Timelapse</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="aspect-video bg-slate-900 flex items-center justify-center group cursor-pointer overflow-hidden relative">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-50 group-hover:opacity-60 transition-opacity" />
                        <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                        </div>
                        <div className="absolute bottom-4 left-4 text-white z-10">
                            <p className="font-semibold">Timelapse - Semaine 4</p>
                            <p className="text-xs text-slate-300">Durée: 0:45</p>
                        </div>
                    </Card>
                    <Card className="aspect-video bg-slate-100 flex items-center justify-center border-dashed border-2 border-slate-300">
                        <p className="text-slate-500 text-sm">Aucune autre vidéo disponible</p>
                    </Card>
                </div>
            </div>

        </div>
    );
}
