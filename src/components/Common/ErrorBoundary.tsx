import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    componentName?: string;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`❌ ErrorBoundary caught error in ${this.props.componentName || 'Unknown'}:`, error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-xl text-center my-4">
                    <h4 className="text-red-400 font-bold mb-2">Error en {this.props.componentName || 'Componente'}</h4>
                    <p className="text-xs text-gray-500 font-mono overflow-auto max-h-20">
                        {this.state.error?.message}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
