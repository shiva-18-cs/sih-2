import axios from 'axios';
import type {
  HealthCheckResponse, DocumentItem, ConflictItem, QueryResult,
  ReportItem, DashboardStats, TrendDataPoint, TopicWord, AuditLogItem, HighPriorityQuery
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cmpdi_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────
export const login = async (username: string, password: string) => {
  const resp = await apiClient.post('/auth/login', { username, password });
  return resp.data;
};

export const getCurrentUser = async () => {
  const resp = await apiClient.get('/auth/me');
  return resp.data;
};

export const checkHealth = async (): Promise<HealthCheckResponse> => {
  const resp = await apiClient.get<HealthCheckResponse>('/health');
  return resp.data;
};

// ─── Documents ───────────────────────────────────────────────────────────────
export const listDocuments = async (limit = 50): Promise<DocumentItem[]> => {
  const resp = await apiClient.get('/documents', { params: { limit } });
  return resp.data;
};

export const uploadDocument = async (file: File, onProgress?: (pct: number) => void): Promise<DocumentItem> => {
  const form = new FormData();
  form.append('file', file);
  const resp = await apiClient.post('/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return resp.data;
};

export const bulkIngestDataset = async (): Promise<any> => {
  const resp = await apiClient.post('/documents/ingest-dataset');
  return resp.data;
};

// ─── Validation & Conflicts ──────────────────────────────────────────────────
export const listConflicts = async (status?: string): Promise<ConflictItem[]> => {
  const resp = await apiClient.get('/validation/conflicts', { params: status ? { status } : {} });
  return resp.data;
};

export const resolveConflict = async (conflictId: string, data: any) => {
  const resp = await apiClient.post(`/validation/conflicts/${conflictId}/resolve`, data);
  return resp.data;
};

export const runValidation = async () => {
  const resp = await apiClient.post('/validation/run-check');
  return resp.data;
};

// ─── RAG Query ───────────────────────────────────────────────────────────────
export const askQuery = async (params: {
  query_text: string;
  subsidiary_filter?: string;
  year_filter?: number;
  doc_type_filter?: string;
  is_high_priority?: boolean;
}): Promise<QueryResult> => {
  const resp = await apiClient.post('/query/ask', params);
  return resp.data;
};

export const getQueryHistory = async (limit = 20) => {
  const resp = await apiClient.get('/query/history', { params: { limit } });
  return resp.data;
};

export const triggerIndexing = async () => {
  const resp = await apiClient.post('/query/index');
  return resp.data;
};

// ─── Topics ──────────────────────────────────────────────────────────────────
export const getTopics = async (subsidiary?: string, year?: number): Promise<{ words: TopicWord[]; total_docs: number; total_chunks: number; document_type_breakdown: Record<string, number> }> => {
  const resp = await apiClient.get('/query/topics', { params: { subsidiary, year } });
  return resp.data;
};

// ─── High Priority Queries ───────────────────────────────────────────────────
export const listHighPriorityQueries = async (): Promise<HighPriorityQuery[]> => {
  const resp = await apiClient.get('/query/high-priority');
  return resp.data;
};

export const createHighPriorityQuery = async (data: { title: string; query_text: string; assigned_reviewer?: string }) => {
  const resp = await apiClient.post('/query/high-priority', data);
  return resp.data;
};

// ─── Reports ─────────────────────────────────────────────────────────────────
export const listReports = async (): Promise<ReportItem[]> => {
  const resp = await apiClient.get('/reports/');
  return resp.data;
};

export const generateReport = async (params: {
  report_type: string;
  subsidiary?: string;
  year?: number;
}) => {
  const resp = await apiClient.post('/reports/generate', params);
  return resp.data;
};

export const getReportDetail = async (reportId: string) => {
  const resp = await apiClient.get(`/reports/${reportId}`);
  return resp.data;
};

export const updateReportApproval = async (reportId: string, action: string, reviewer_notes?: string) => {
  const resp = await apiClient.patch(`/reports/${reportId}/approval`, { action, reviewer_notes });
  return resp.data;
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const resp = await apiClient.get('/analytics/dashboard');
  return resp.data;
};

export const getProductionTrends = async (subsidiary?: string): Promise<{ trend_data: TrendDataPoint[] }> => {
  const resp = await apiClient.get('/analytics/production-trends', { params: { subsidiary } });
  return resp.data;
};

export const getConflictTrends = async () => {
  const resp = await apiClient.get('/analytics/conflict-trends');
  return resp.data;
};

export const getAuditTrail = async (limit = 50): Promise<AuditLogItem[]> => {
  const resp = await apiClient.get('/analytics/audit-trail', { params: { limit } });
  return resp.data;
};

export const getKPIBenchmark = async () => {
  const resp = await apiClient.get('/analytics/kpi-benchmark');
  return resp.data;
};
