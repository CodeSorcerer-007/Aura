import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Aura ErrorBoundary caught an exception:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleResetData = () => {
        if (confirm("Reset local cache data? Your database will be preserved.")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 text-3xl font-bold">!</div>
                    <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                    <p className="text-white/60 max-w-md mb-4 text-sm">
                        Aura encountered an unexpected error. Don't worry, your offline IndexedDB data is safe.
                    </p>
                    {this.state.error && (
                        <div className="mb-6 p-4 bg-red-950/60 border border-red-800 text-red-300 text-xs text-left max-w-lg overflow-auto rounded-xl font-mono max-h-48">
                            <p className="font-bold text-red-200 mb-1">{this.state.error.toString()}</p>
                            {this.state.error.stack && <p className="text-red-400/80 whitespace-pre-wrap">{this.state.error.stack}</p>}
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button 
                            onClick={this.handleReload} 
                            className="px-5 py-2.5 bg-teal-500 text-black font-semibold rounded-xl hover:bg-teal-400 transition-colors"
                        >
                            Reload Aura
                        </button>
                        <button 
                            onClick={this.handleResetData} 
                            className="px-5 py-2.5 bg-white/10 text-white/80 rounded-xl hover:bg-white/20 transition-colors text-sm"
                        >
                            Reset App Cache
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
