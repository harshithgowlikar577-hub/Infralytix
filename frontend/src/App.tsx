import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDossier from './pages/ProjectDossier';
import RiskRadar from './pages/RiskRadar';
import EarlyWarnings from './pages/EarlyWarnings';
import Analytics from './pages/Analytics';
import MapIntelligence from './pages/MapIntelligence';
import Copilot from './pages/Copilot';
import HealthCenter from './pages/HealthCenter';
import SimilarityEngine from './pages/SimilarityEngine';
import DependencyNetwork from './pages/DependencyNetwork';
import Interventions from './pages/Interventions';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import ModelLab from './pages/ModelLab';
import DataQuality from './pages/DataQuality';
import Settings from './pages/Settings';
import RecoveryCommandCenter from './pages/RecoveryCommandCenter';

function DefaultRedirect() {
  const defaultLanding = localStorage.getItem('infralytix-pref-landing-page') || '/dashboard';
  return <Navigate to={defaultLanding} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main Authenticated Layout Shell */}
      <Route element={<AppShell />}>
        <Route path="/" element={<DefaultRedirect />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDossier />} />
        <Route path="/radar" element={<RiskRadar />} />
        <Route path="/risk" element={<RiskRadar />} />
        <Route path="/alerts" element={<EarlyWarnings />} />
        <Route path="/early-warnings" element={<EarlyWarnings />} />
        <Route path="/warnings" element={<EarlyWarnings />} />
        <Route path="/health" element={<HealthCenter />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/map" element={<MapIntelligence />} />
        <Route path="/similarity" element={<SimilarityEngine />} />
        <Route path="/network" element={<DependencyNetwork />} />
        <Route path="/dependencies" element={<DependencyNetwork />} />
        <Route path="/interventions" element={<Interventions />} />
        <Route path="/recovery" element={<RecoveryCommandCenter />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/copilot" element={<Copilot />} />
        <Route path="/model-lab" element={<ModelLab />} />
        <Route path="/models" element={<ModelLab />} />
        <Route path="/data-quality" element={<DataQuality />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
