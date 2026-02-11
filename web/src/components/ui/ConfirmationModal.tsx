import { AlertTriangle, X } from 'lucide-react';
import { Button } from '.'; // Imports from index.tsx in the same directory

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    variant = 'danger',
    isLoading = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
                onClick={isLoading ? undefined : onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full shrink-0 ${variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>

                    <div className="flex-1 pt-1">
                        <h3 className="text-lg font-bold text-slate-800 leading-none mb-2">
                            {title}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-slate-400 hover:text-slate-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Traitement...' : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
