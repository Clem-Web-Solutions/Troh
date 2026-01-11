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
                    className="fixed inset-0 z-40 bg-slate-600/50 backdrop-blur-sm md:hidden"
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
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0 relative">
                    <div className={cn("flex items-center gap-3", collapsed && "w-full justify-center")}>
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0 transition-colors">M</div>
                        {!collapsed && (
                            <span className="font-bold text-xl text-slate-800 whitespace-nowrap transition-opacity animate-in fade-in duration-300">
                                Meereo Project
                            </span>
                        )}
                    </div>

                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}

                    {/* Collapsed Toggle Overlay */}
                    {collapsed && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden md:flex absolute -right-3 top-6 bg-white border border-slate-200 text-slate-500 rounded-full p-1 shadow-md hover:text-slate-600 transition-all z-50"
                        >
                            <ChevronLeft className="w-4 h-4 rotate-180" />
                        </button>
                    )}
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
                                    ? "bg-neutral-600 text-white shadow-md shadow-slate-200"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 shrink-0", currentPath === item.path ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
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
            </aside >
        </>
    );
}
