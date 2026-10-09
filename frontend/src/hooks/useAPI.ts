import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  analyticsAPI, projectsAPI, riskAPI, healthAPI, warningAPI,
  similarityAPI, interventionAPI, mlAPI, notificationsAPI, ingestionAPI, simulationAPI,
} from '../lib/api';

// ===================== ANALYTICS =====================
export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsAPI.dashboard().then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
export function useExecutiveAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'executive'],
    queryFn: () => analyticsAPI.executive().then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
export function useRiskAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'risk'],
    queryFn: () => analyticsAPI.risk().then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
export function useMinistryAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'ministry'],
    queryFn: () => analyticsAPI.ministry().then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
export function useStateAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'state'],
    queryFn: () => analyticsAPI.state().then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
export function useSectorAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'sector'],
    queryFn: () => analyticsAPI.sector().then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// ===================== PROJECTS =====================
export function useProjects(params?: {
  search?: string; ministry?: string; sector?: string;
  state?: string; status?: string; risk_level?: string;
  page?: number; limit?: number;
}) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsAPI.list(params).then(r => r.data),
  });
}
export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsAPI.get(id).then(r => r.data),
    enabled: !!id,
  });
}

// ===================== RISK =====================
export function useProjectRisk(projectId: string) {
  return useQuery({
    queryKey: ['risk', projectId],
    queryFn: () => riskAPI.get(projectId).then(r => r.data),
    enabled: !!projectId,
  });
}

// ===================== HEALTH =====================
export function useProjectHealth(projectId: string) {
  return useQuery({
    queryKey: ['health', projectId],
    queryFn: () => healthAPI.get(projectId).then(r => r.data),
    enabled: !!projectId,
  });
}

// ===================== EARLY WARNING =====================
export function useProjectWarnings(projectId: string) {
  return useQuery({
    queryKey: ['warnings', projectId],
    queryFn: () => warningAPI.get(projectId).then(r => r.data),
    enabled: !!projectId,
  });
}

export function usePredictiveEarlyWarnings(limitPerQueue = 20) {
  return useQuery({
    queryKey: ['early-warnings', 'predictive', limitPerQueue],
    queryFn: () => warningAPI.portfolioPredictive(limitPerQueue).then(r => r.data),
    staleTime: 60_000,
  });
}


// ===================== SIMILARITY =====================
export function useProjectSimilarity(projectId: string) {
  return useQuery({
    queryKey: ['similarity', projectId],
    queryFn: () => similarityAPI.get(projectId).then(r => r.data),
    enabled: !!projectId,
  });
}

// ===================== INTERVENTION =====================
export function useProjectInterventions(projectId: string) {
  return useQuery({
    queryKey: ['intervention', projectId],
    queryFn: () => interventionAPI.get(projectId).then(r => r.data),
    enabled: !!projectId,
  });
}

// ===================== SIMULATION =====================
export function useSimulation() {
  return useMutation({
    mutationFn: (data: {
      project_id: string; manpower_boost_pct?: number;
      budget_increase_pct?: number; procurement_delay_removed?: boolean;
      milestones_expedited_count?: number; efficiency_gain_pct?: number;
    }) => simulationAPI.run(data).then(r => r.data),
  });
}

export function useSimulationExplain() {
  return useMutation({
    mutationFn: (data: {
      project_id: string; manpower_boost_pct?: number;
      budget_increase_pct?: number; procurement_delay_removed?: boolean;
      milestones_expedited_count?: number; efficiency_gain_pct?: number;
    }) => simulationAPI.explain(data).then(r => r.data),
  });
}


// ===================== ML MODELS =====================
export function useMLStatus() {
  return useQuery({
    queryKey: ['ml', 'status'],
    queryFn: () => mlAPI.status().then(r => r.data),
  });
}
export function useTrainCostModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => mlAPI.trainCost().then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ml', 'status'] }),
  });
}
export function useTrainDelayModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => mlAPI.trainDelay().then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ml', 'status'] }),
  });
}
export function useCostPrediction() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mlAPI.predictCost(data).then(r => r.data),
  });
}
export function useDelayPrediction() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mlAPI.predictDelay(data).then(r => r.data),
  });
}

// ===================== NOTIFICATIONS =====================
export function useNotifications(params?: { unread_only?: boolean; page?: number; warning_level?: string; limit?: number }) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationsAPI.list(params).then(r => r.data),
  });
}
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsAPI.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsAPI.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
export function useDismissNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsAPI.dismiss(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ===================== INGESTION =====================
export function useUploadDataset() {
  return useMutation({
    mutationFn: ({ file, type }: { file: File; type?: string }) =>
      ingestionAPI.upload(file, type).then(r => r.data),
  });
}
export function useIngestionReport(datasetId: string) {
  return useQuery({
    queryKey: ['ingestion', 'report', datasetId],
    queryFn: () => ingestionAPI.report(datasetId).then(r => r.data),
    enabled: !!datasetId,
  });
}
