import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ArrowLeft, Home, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface NavigationContextType {
  activeTab: string;
  navStack: string[];
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (dirty: boolean) => void;
  navigateTo: (tab: string) => void;
  goBack: () => void;
  goHome: () => void;
  canGoBack: boolean;
  registerUnsavedGuard: (isDirty: boolean) => void;
  requestNavigation: (action: () => void) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ 
  children,
  activeTab,
  setActiveTab
}: { 
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const [navStack, setNavStack] = useState<string[]>(["dashboard"]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false);

  // Sync initial tab if needed
  useEffect(() => {
    if (navStack.length === 0) {
      setNavStack([activeTab]);
    }
  }, []);

  const requestNavigation = (action: () => void) => {
    if (hasUnsavedChanges) {
      setPendingAction(() => action);
      setShowUnsavedModal(true);
    } else {
      action();
    }
  };

  const navigateTo = (targetTab: string) => {
    if (!targetTab) return;
    if (targetTab === activeTab) return;

    requestNavigation(() => {
      if (targetTab === "dashboard") {
        setNavStack(["dashboard"]);
        setActiveTab("dashboard");
      } else {
        setNavStack(prev => {
          // If tab already in history, trim up to it to avoid infinite loops, else push
          const existingIdx = prev.indexOf(targetTab);
          if (existingIdx !== -1) {
            return prev.slice(0, existingIdx + 1);
          }
          return [...prev, targetTab];
        });
        setActiveTab(targetTab);
      }
      setHasUnsavedChanges(false);
      try {
        window.history.pushState({ tab: targetTab }, "", `#${targetTab}`);
      } catch (e) {
        // Safe fallback for iFrame
      }
    });
  };

  const goBack = () => {
    requestNavigation(() => {
      if (navStack.length > 1) {
        const newStack = [...navStack];
        newStack.pop(); // Remove current
        const previousTab = newStack[newStack.length - 1] || "dashboard";
        setNavStack(newStack);
        setActiveTab(previousTab);
        try {
          window.history.pushState({ tab: previousTab }, "", `#${previousTab}`);
        } catch (e) {}
      } else {
        setNavStack(["dashboard"]);
        setActiveTab("dashboard");
      }
      setHasUnsavedChanges(false);
    });
  };

  const goHome = () => {
    requestNavigation(() => {
      setNavStack(["dashboard"]);
      setActiveTab("dashboard");
      setHasUnsavedChanges(false);
      try {
        window.history.pushState({ tab: "dashboard" }, "", "#dashboard");
      } catch (e) {}
    });
  };

  // Browser / Android Back Button Integration
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (hasUnsavedChanges) {
        // Prevent immediate navigation, show unsaved warning modal
        try {
          window.history.pushState({ tab: activeTab }, "", `#${activeTab}`);
        } catch (_e) {}
        setShowUnsavedModal(true);
        setPendingAction(() => () => {
          setHasUnsavedChanges(false);
          goBack();
        });
        return;
      }

      if (event.state && event.state.tab) {
        const targetTab = event.state.tab;
        setActiveTab(targetTab);
        setNavStack(prev => {
          if (prev.includes(targetTab)) {
            return prev.slice(0, prev.indexOf(targetTab) + 1);
          }
          return [...prev, targetTab];
        });
      } else if (navStack.length > 1) {
        const newStack = [...navStack];
        newStack.pop();
        const prevTab = newStack[newStack.length - 1] || "dashboard";
        setNavStack(newStack);
        setActiveTab(prevTab);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [hasUnsavedChanges, activeTab, navStack]);

  const handleConfirmLeave = () => {
    setShowUnsavedModal(false);
    setHasUnsavedChanges(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleCancelLeave = () => {
    setShowUnsavedModal(false);
    setPendingAction(null);
  };

  return (
    <NavigationContext.Provider
      value={{
        activeTab,
        navStack,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        navigateTo,
        goBack,
        goHome,
        canGoBack: navStack.length > 1 || activeTab !== "dashboard",
        registerUnsavedGuard: setHasUnsavedChanges,
        requestNavigation
      }}
    >
      {children}

      {/* UNSAVED FORMULARIES CONFIRMATION MODAL */}
      <AnimatePresence>
        {showUnsavedModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-left relative overflow-hidden"
            >
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Modifications non enregistrées
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                    Vous avez des modifications non enregistrées dans votre formulaire. Voulez-vous vraiment quitter cette page ?
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-2xl border border-amber-200/50 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                ⚠️ Les informations saisies non sauvegardées seront définitivement perdues.
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCancelLeave}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold rounded-xl transition-all cursor-pointer text-center"
                >
                  Continuer l'édition
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLeave}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer text-center"
                >
                  Quitter sans enregistrer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
