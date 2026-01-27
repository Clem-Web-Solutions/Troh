import { Camera, Calendar, Loader2, X, ChevronLeft, ChevronRight, Maximize2, Folder, ArrowLeft } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface SiteGalleryProps {
    projectId?: string;
}

export function SiteGallery({ projectId }: SiteGalleryProps) {
    const [photos, setPhotos] = useState<any[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [currentFolder, setCurrentFolder] = useState<any | null>(null);

    const fetchData = async () => {
        if (!projectId) return;
        setIsLoading(true);
        try {
            const [docs, foldersData] = await Promise.all([
                api.getDocuments(projectId),
                api.getFolders(projectId, 'PHOTOS')
            ]);

            // Filter for images or category 'Photos'
            const gallery = docs.filter((d: any) =>
                d.category === 'Photos' ||
                /\.(jpg|jpeg|png|gif|webp)$/i.test(d.url)
            );
            setPhotos(gallery);
            setFolders(foldersData);
        } catch (error) {
            console.error("Failed to load gallery", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        setCurrentFolder(null);
    }, [projectId]);

    const openLightbox = (index: number) => {
        setCurrentPhotoIndex(index);
        setLightboxOpen(true);
    };

    const nextPhoto = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentPhotoIndex((prev) => (prev + 1) % displayedPhotos.length);
    };

    const prevPhoto = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentPhotoIndex((prev) => (prev - 1 + displayedPhotos.length) % displayedPhotos.length);
    };

    // Keyboard navigation
    useEffect(() => {
        if (!lightboxOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowRight') setCurrentPhotoIndex((prev) => (prev + 1) % displayedPhotos.length);
            if (e.key === 'ArrowLeft') setCurrentPhotoIndex((prev) => (prev - 1 + displayedPhotos.length) % displayedPhotos.length);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen]); // Note: dependency on photos length handles in prev/next logic but might be stale if strict

    const displayedPhotos = photos.filter(p => {
        if (currentFolder) return p.folderId === currentFolder.id;
        return p.folderId === null;
    });

    if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

    if (photos.length === 0 && folders.length === 0) return (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucune photo pour le moment</p>
            <p className="text-xs text-slate-400">Les photos du chantier apparaîtront ici</p>
        </div>
    );

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-600 flex items-center gap-2 truncate">
                            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0" />
                            <span className="truncate">{currentFolder ? currentFolder.name : "Galerie"}</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500">{displayedPhotos.length} photo(s) disponible(s)</p>
                    </div>
                    {currentFolder && (
                        <Button variant="ghost" size="sm" onClick={() => setCurrentFolder(null)} className="shrink-0">
                            <ArrowLeft className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Retour</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Albums Grid (Only at root) */}
            {!currentFolder && folders.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    {folders.map(folder => (
                        <div
                            key={folder.id}
                            onClick={() => setCurrentFolder(folder)}
                            className="bg-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-700 transition-colors group relative overflow-hidden min-h-[140px] sm:min-h-[160px]"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Folder className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                            </div>
                            <div className="relative z-10">
                                <Folder className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mb-2 sm:mb-3" />
                                <h3 className="text-white font-bold truncate text-sm sm:text-base">{folder.name}</h3>
                                <p className="text-slate-400 text-xs mt-1">{new Date(folder.date).toLocaleDateString()}</p>
                                <span className="inline-block mt-2 sm:mt-3 text-xs bg-white/10 text-white px-2 py-1 rounded">
                                    {folder.documents?.length || 0} photos
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {displayedPhotos.map((photo, index) => (
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
            {lightboxOpen && displayedPhotos[currentPhotoIndex] && (
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
                            src={`http://localhost:5000${displayedPhotos[currentPhotoIndex].url}`}
                            alt={displayedPhotos[currentPhotoIndex].name}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />
                        <div className="mt-4 text-center text-white">
                            <h3 className="text-lg font-medium">{displayedPhotos[currentPhotoIndex].name}</h3>
                            <p className="text-sm text-slate-400">
                                {new Date(displayedPhotos[currentPhotoIndex].uploadDate).toLocaleDateString()} • {currentPhotoIndex + 1} / {displayedPhotos.length}
                            </p>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
