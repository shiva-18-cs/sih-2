export type UserRole = 
  | 'Administrator'
  | 'Project Coordinator'
  | 'Director/Senior Officer'
  | 'Implementation Agency'
  | 'Auditor';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  locked_tech_stack: {
    backend: string;
    frontend: string;
    database: string;
    ocr: string;
    rag: string;
    rbac: string;
  };
  modules?: Record<string, string>;
}

export interface DocumentItem {
  id: string;
  filename: string;
  file_type: string;
  document_type?: string;
  subsidiary?: string;
  mine_name?: string;
  department?: string;
  report_year?: number;
  report_period?: string;
  page_count: number;
  status: string;
  ocr_engine?: string;
  avg_ocr_confidence: number;
  has_low_confidence_pages: boolean;
  created_at: string;
}

export interface ConflictItem {
  id: string;
  conflict_id?: string;
  source_a_filename: string;
  source_a_page: number;
  source_a_value: string;
  source_b_filename: string;
  source_b_page: number;
  source_b_value: string;
  metric_name: string;
  metric_type?: string;
  severity?: string;
  subsidiary?: string;
  mine_name?: string;
  year?: number;
  conflict_type: string;
  status: string;
  conflicting_values?: { doc: string; value: string }[];
  documents_involved?: string[];
  resolved_value?: string;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface SourceCitation {
  document_name: string;
  document_id?: string;
  page_no: number;
  snippet: string;
  similarity?: number;
  similarity_score?: number;
  metric_tag?: string;
}

export interface QueryResult {
  query_id: string;
  query_text: string;
  answer: string;
  is_insufficient_evidence: boolean;
  sources: SourceCitation[];
  latency_ms: number;
  retrieved_chunks_count: number;
}

export interface ReportItem {
  id: string;
  title: string;
  report_type: string;
  subsidiary?: string;
  report_year?: number;
  status: string;
  generated_by?: string;
  approved_by?: string;
  created_at: string;
}

export interface DashboardStats {
  ingestion: {
    total_documents: number;
    total_chunks: number;
    embedded_chunks: number;
    embedding_coverage_pct: number;
    flagged_documents: number;
    avg_ocr_confidence: number;
  };
  conflicts: {
    open_conflicts: number;
    total_conflicts: number;
    resolved_conflicts: number;
  };
  reports: {
    total_reports: number;
    pending_approval: number;
    approved_reports: number;
  };
  queries: {
    total_queries: number;
    answer_rate_pct: number;
    avg_latency_ms: number;
  };
  breakdowns: {
    by_document_type: Record<string, number>;
    by_subsidiary: Record<string, number>;
    by_year: Record<string, number>;
  };
}

export interface TrendDataPoint {
  year: string;
  coal_production_mt: number;
  overburden_mcm: number;
}

export interface TopicWord {
  word: string;
  count: number;
  weight: number;
}

export interface AuditLogItem {
  id: string;
  username: string;
  role: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface HighPriorityQuery {
  id: string;
  title: string;
  query_text?: string;
  stage: string;
  status: string;
  validation_status?: string;
  created_by?: string;
  assigned_reviewer?: string;
  created_at: string;
}
