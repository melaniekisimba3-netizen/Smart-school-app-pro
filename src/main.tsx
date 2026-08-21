import './utils/safeStorage.ts';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { SmartSchoolCoreProvider } from './context/SmartSchoolCoreContext.tsx';
import { PedagogicalTimetableProvider } from './context/PedagogicalTimetableContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="SmartSchool RDC - Bouclier Haute Disponibilité">
      <SmartSchoolCoreProvider>
        <PedagogicalTimetableProvider>
          <App />
        </PedagogicalTimetableProvider>
      </SmartSchoolCoreProvider>
    </ErrorBoundary>
  </StrictMode>,
);

