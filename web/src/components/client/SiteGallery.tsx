import { Camera, Calendar, Loader2 } from 'lucide-react';
import { Card, Badge } from '../ui';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface SiteGalleryProps {
    projectId?: string;
}

export function SiteGallery({ projectId }: SiteGalleryProps) {
    const [photos, setPhotos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (photos.length === 0) return null; // Hide if no photos

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-slate-900" />
                <h3 className="text-lg font-semibold text-slate-900">Galerie Chantier</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {photos.map((photo) => (
                    <Card key={photo.id} className="overflow-hidden group border-none shadow-sm cursor-pointer" onClick={() => window.open(`http://localhost:5000${photo.url}`, '_blank')}>
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <img
                                src={`http://localhost:5000${photo.url}`}
                                alt={photo.name}
                                className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                            <div className="absolute top-3 left-3">
                                <Badge className="bg-white/90 text-slate-900 shadow-sm backdrop-blur-sm">
                                    {photo.category || 'Chantier'}
                                </Badge>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 text-white">
                                <div className="flex items-center gap-1.5 text-xs text-slate-200 mb-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(photo.uploadDate).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm font-medium line-clamp-1">{photo.name}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
