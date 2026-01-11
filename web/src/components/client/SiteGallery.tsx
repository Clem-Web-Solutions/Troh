import { Camera, Calendar, Loader2, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface SiteGalleryProps {
    projectId?: string;
}

export function SiteGallery({ projectId }: SiteGalleryProps) {
    const [photos, setPhotos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    useEffect(() => {
        if (!projectId) {
            setIsLoading(false);
            return;
        }
        const fetchPhotos = async () => {
            try {
                const docs = await api.getDocuments(projectId);
                // Filter for images or category 'Photos'
                const gallery = docs.filter((d: any) =>
                    d.category === 'Photos' ||
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(d.url)
                );
                setPhotos(gallery);
            } catch (error) {
                console.error("Failed to load gallery", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPhotos();
    }, [projectId]);

    const openLightbox = (index: number) => {
        setCurrentPhotoIndex(index);
        setLightboxOpen(true);
    };

    const nextPhoto = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    };

    const prevPhoto = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    // Keyboard navigation
    useEffect(() => {
        if (!lightboxOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowRight') setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
            if (e.key === 'ArrowLeft') setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, photos.length]);

    if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

    if (photos.length === 0) return (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucune photo pour le moment</p>
            <p className="text-xs text-slate-400">Les photos du chantier apparaîtront ici</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-600 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-red-600" />
                        Galerie Chantier
                    </h2>
                    <p className="text-sm text-slate-500">{photos.length} photo(s) disponible(s)</p>
                </div>
                {/* Could add date filters here */}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                    <Card
                        key={photo.id}
                        className="overflow-hidden group border-none shadow-sm cursor-pointer relative bg-slate-600 rounded-xl"
                        onClick={() => openLightbox(index)}
                    >
                        <div className="aspect-[4/3] overflow-hidden">
                            <img
                                src={`http://localhost:5000${photo.url}`}
                                alt={photo.name}
                                className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-8 h-8 text-white/80 drop-shadow-md transform scale-50 group-hover:scale-100 transition-transform duration-300" />
                            </div>

                            <div className="absolute top-3 left-3">
                                <Badge className="bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm hover:bg-white">
                                    {photo.category || 'Chantier'}
                                </Badge>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 text-white">
                                <div className="flex items-center gap-1.5 text-xs text-slate-200 mb-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(photo.uploadDate).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm font-medium line-clamp-1 text-shadow-sm">{photo.name}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setLightboxOpen(false)}>

                    {/* Close Button */}
                    <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2">
                        <X className="w-8 h-8" />
                    </button>

                    {/* Navigation */}
                    <button
                        onClick={prevPhoto}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <button
                        onClick={nextPhoto}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    {/* Main Image */}
                    <div className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={`http://localhost:5000${photos[currentPhotoIndex].url}`}
                            alt={photos[currentPhotoIndex].name}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />
                        <div className="mt-4 text-center text-white">
                            <h3 className="text-lg font-medium">{photos[currentPhotoIndex].name}</h3>
                            <p className="text-sm text-slate-400">
                                {new Date(photos[currentPhotoIndex].uploadDate).toLocaleDateString()} • {currentPhotoIndex + 1} / {photos.length}
                            </p>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
