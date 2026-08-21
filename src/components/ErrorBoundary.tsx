import React, { ErrorInfo, ReactNode } from "react";
import { RefreshCw, ShieldAlert, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  key?: string | number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("SmartSchool RDC - Safe Shield Caught Exception:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReloadPage = (): void => {
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 bg-slate-900 border border-red-500/30 rounded-3xl text-white shadow-2xl max-w-4xl mx-auto space-y-4">
          <div className="flex items-center space-x-3 text-red-400">
            <div className="p-2.5 bg-red-500/10 rounded-2xl border border-red-500/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white uppercase">
                {this.props.fallbackTitle || "Protection Anti-Crash SmartSchool RDC Active"}
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Une anomalie inattendue a été interceptée. Votre session et vos données sont complètement protégées.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto space-y-1">
            <div className="font-bold text-red-400">
              {this.state.error?.toString() || "Erreur indéterminée"}
            </div>
            {this.state.errorInfo?.componentStack && (
              <pre className="text-[10px] text-slate-500 max-h-32 overflow-y-auto leading-relaxed mt-2">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-400 font-mono">
              Système de Haute Disponibilité SmartSchool RDC v4.8.2
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Régénérer le Module</span>
              </button>

              <button
                onClick={this.handleReloadPage}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Recharger la Plateforme</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
