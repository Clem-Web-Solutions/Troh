import { Camera, Calendar } from 'lucide-react';
import { Card, Badge } from '../ui';

interface Photo {
    id: string;
    url: string;
    date: string;
    phase: string;
    description: string;
}

const MOCK_PHOTOS: Photo[] = [
    { id: '1', url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80', date: '25 Jan 2024', phase: 'Démolition', description: 'Début de la démolition des cloisons.' },
    { id: '2', url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80', date: '02 Fév 2024', phase: 'Gros Oeuvre', description: 'Pose des nouvelles structures.' },
    { id: '3', url: 'https://images.unsplash.com/photo-1621905252507-b35492cc2575?auto=format&fit=crop&q=80', date: '15 Fév 2024', phase: 'Plomberie', description: 'Installation arrivée d\'eau.' },
];

export function SiteGallery() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-slate-900" />
                <h3 className="text-lg font-semibold text-slate-900">Galerie Chantier</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MOCK_PHOTOS.map((photo) => (
                    <Card key={photo.id} className="overflow-hidden group border-none shadow-sm cursor-pointer">
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <img
                                src={photo.url}
                                alt={photo.description}
                                className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                            <div className="absolute top-3 left-3">
                                <Badge className="bg-white/90 text-slate-900 shadow-sm backdrop-blur-sm">
                                    {photo.phase}
                                </Badge>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 text-white">
                                <div className="flex items-center gap-1.5 text-xs text-slate-200 mb-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{photo.date}</span>
                                </div>
                                <p className="text-sm font-medium line-clamp-1">{photo.description}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
