import React from "react";
import { ArrowLeft, Home, ChevronRight } from "lucide-react";
import { useNavigation } from "../context/NavigationContext";

export interface PageHeaderNavigationProps {
  title: string;
  subtitle?: string;
  category?: string;
  icon?: React.ElementType;
  badgeText?: string;
  badgeType?: "info" | "warning" | "success" | "neutral";
  onCustomBack?: () => void;
  showHomeButton?: boolean;
  extraActions?: React.ReactNode;
}

export function PageHeaderNavigation({
  title,
  subtitle,
  category,
  icon: Icon,
  badgeText,
  badgeType = "info",
  onCustomBack,
  showHomeButton = true,
  extraActions
}: PageHeaderNavigationProps) {
  const { goBack, goHome, canGoBack, activeTab } = useNavigation();

  const handleBackClick = () => {
    if (onCustomBack) {
      onCustomBack();
    } else {
      goBack();
    }
  };

  const isDashboard = activeTab === "dashboard";

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3 mb-6 transition-colors shadow-2xs rounded-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Navigation Control Group (← Retour + ⌂ Accueil + Title) */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 min-w-0">
          
          {/* ← RETOUR BUTTON */}
          {(!isDashboard || canGoBack || onCustomBack) && (
            <button
              type="button"
              onClick={handleBackClick}
              className="inline-flex items-center justify-center space-x-2 min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-all border border-slate-200/60 dark:border-slate-700/60 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95 shrink-0"
              title="Revenir à l'écran précédent"
            >
              <ArrowLeft className="h-4 w-4 text-brand-blue dark:text-blue-400 shrink-0" />
              <span className="font-black text-xs">Retour</span>
            </button>
          )}

          {/* ⌂ ACCUEIL BUTTON */}
          {!isDashboard && showHomeButton && (
            <button
              type="button"
              onClick={goHome}
              className="inline-flex items-center justify-center space-x-1.5 min-h-[44px] px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-all border border-indigo-100 dark:border-indigo-900/60 cursor-pointer hover:scale-[1.02] active:scale-95 shrink-0"
              title="Revenir à l'Accueil du Portail"
            >
              <Home className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-extrabold text-xs hidden xs:inline">Accueil</span>
            </button>
          )}

          {/* Vertical Divider */}
          {(!isDashboard || canGoBack || onCustomBack) && (
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1 shrink-0" />
          )}

          {/* Breadcrumbs & Title Stack */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest overflow-hidden">
              <span className="hover:text-indigo-500 cursor-pointer" onClick={goHome}>SmartSchool</span>
              {category && (
                <>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <span className="truncate">{category}</span>
                </>
              )}
              <ChevronRight className="h-3 w-3 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300 truncate">{title}</span>
            </div>

            <div className="flex items-center space-x-2 mt-0.5 min-w-0">
              {Icon && <Icon className="h-5 w-5 text-brand-blue dark:text-blue-400 shrink-0" />}
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                {title}
              </h1>

              {badgeText && (
                <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border shrink-0 ${
                  badgeType === "warning" 
                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900" 
                    : badgeType === "success"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900"
                    : badgeType === "neutral"
                    ? "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                    : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900"
                }`}>
                  {badgeText}
                </span>
              )}
            </div>

            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>

        </div>

        {/* Extra Actions Slot */}
        {extraActions && (
          <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
            {extraActions}
          </div>
        )}

      </div>
    </div>
  );
}
