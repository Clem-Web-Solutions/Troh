import { useState } from 'react';
import { LayoutDashboard, FolderOpen, Euro, Image, Settings, LogOut, ChevronLeft, Users, Briefcase } from 'lucide-react';
import { cn } from '../ui';

interface SidebarProps {
    currentPath: string;
    onNavigate: (path: string) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
    role: 'client' | 'admin';
    onLogout: () => void;
}

const CLIENT_MENU = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: 'dashboard' },
    { icon: FolderOpen, label: 'Documents', path: 'documents' },
    { icon: Euro, label: 'Suivi Financier', path: 'finance' },
    { icon: Image, label: 'Galerie Chantier', path: 'gallery' },
];

const ADMIN_MENU = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: 'admin-dashboard' },
    { icon: Briefcase, label: 'Projets', path: 'admin-projects' },
    { icon: Users, label: 'Clients', path: 'admin-clients' },
    { icon: Settings, label: 'Paramètres', path: 'settings' },
];

export function Sidebar({ currentPath, onNavigate, isMobileOpen, setIsMobileOpen, role, onLogout }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const menuItems = role === 'admin' ? ADMIN_MENU : CLIENT_MENU;

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out",
                    collapsed ? "w-20" : "w-64",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
                    <div className={cn("flex items-center gap-2 font-bold text-xl text-slate-900 overflow-hidden", collapsed && "hidden")}>
                        <span className="text-emerald-600">Meereo</span>
                    </div>
                    {collapsed && <span className="w-full text-center font-bold text-emerald-600">M</span>}

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                    >
                        <ChevronLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => {
                                onNavigate(item.path);
                                setIsMobileOpen(false);
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                currentPath === item.path
                                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 shrink-0", currentPath === item.path ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-600")} />
                            {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={onLogout}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors",
                            collapsed && "justify-center"
                        )}>
                        <LogOut className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="font-medium">Déconnexion</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
