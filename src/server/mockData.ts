export interface UserData {
  id: string;
  username: string;
  email: string;
  role: 'Administrator' | 'Project Coordinator' | 'Director/Senior Officer' | 'Implementation Agency' | 'Auditor';
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface DocumentData {
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
  content_snippet?: string;
}

export interface ConflictData {
  id: string;
  conflict_id: string;
  source_a_filename: string;
  source_a_page: number;
  source_a_value: string;
  source_b_filename: string;
  source_b_page: number;
  source_b_value: string;
  metric_name: string;
  metric_type?: string;
  severity: 'critical' | 'warning' | 'info';
  subsidiary?: string;
  mine_name?: string;
  year?: number;
  conflict_type: string;
  status: 'open' | 'resolved';
  conflicting_values?: { doc: string; value: string }[];
  documents_involved?: string[];
  resolved_value?: string;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface AuditLogData {
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

export interface QueryLogData {
  id: string;
  query_text: string;
  answer_text: string;
  is_insufficient_evidence: boolean;
  latency_ms: number;
  created_at: string;
  sources?: any[];
}

export interface ReportData {
  id: string;
  title: string;
  report_type: string;
  subsidiary?: string;
  report_year?: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  generated_by: string;
  approved_by?: string;
  reviewer_notes?: string;
  content_json: any;
  created_at: string;
}

export const INITIAL_USERS: UserData[] = [
  {
    id: 'user-admin',
    username: 'admin',
    email: 'admin@cmpdi.co.in',
    role: 'Administrator',
    full_name: 'Chief System Administrator (HQ)',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-coord',
    username: 'coordinator',
    email: 'coordinator@cmpdi.co.in',
    role: 'Project Coordinator',
    full_name: 'Dr. A. Verma (Project Coordinator)',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-direct',
    username: 'director',
    email: 'director@cmpdi.co.in',
    role: 'Director/Senior Officer',
    full_name: 'Shri R. K. Sharma (Director Technical)',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-agency',
    username: 'agency',
    email: 'agency@cmpdi.co.in',
    role: 'Implementation Agency',
    full_name: 'Technical Ops Support Team',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-audit',
    username: 'auditor',
    email: 'auditor@coalindia.in',
    role: 'Auditor',
    full_name: 'Smt. P. Sengupta (Chief Vigilance & Statutory Auditor)',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const INITIAL_DOCUMENTS: DocumentData[] = [
  {
    id: 'doc-001',
    filename: 'NCSL_Annual_Production_Report_2023.pdf',
    file_type: 'pdf',
    document_type: 'Production',
    subsidiary: 'Northern Coalfields Sample Ltd',
    mine_name: 'Sample Mine-A',
    department: 'Mining Operations',
    report_year: 2023,
    report_period: 'Annual FY2023',
    page_count: 24,
    status: 'processed',
    ocr_engine: 'digital',
    avg_ocr_confidence: 99.4,
    has_low_confidence_pages: false,
    created_at: '2024-02-10T10:15:00Z',
    content_snippet: 'Northern Coalfields Sample Ltd: Sample Mine-A total achieved coal production recorded at 9.80 MT for FY2023.',
  },
  {
    id: 'doc-002',
    filename: 'NCSL_Mine_A_Monthly_Dispatches_2023.xlsx',
    file_type: 'xlsx',
    document_type: 'Production',
    subsidiary: 'Northern Coalfields Sample Ltd',
    mine_name: 'Sample Mine-A',
    department: 'Sales & Logistics',
    report_year: 2023,
    report_period: 'FY2023 Monthly Aggregation',
    page_count: 12,
    status: 'flagged',
    ocr_engine: 'digital',
    avg_ocr_confidence: 100.0,
    has_low_confidence_pages: false,
    created_at: '2024-02-12T11:20:00Z',
    content_snippet: 'Dispatch ledger sheet indicates total off-take production of 10.20 MT from Mine-A loading railway siding.',
  },
  {
    id: 'doc-003',
    filename: 'Scanned_Inspection_Log_NCSL_Mine_A_1998.png',
    file_type: 'image',
    document_type: 'Inspection',
    subsidiary: 'Northern Coalfields Sample Ltd',
    mine_name: 'Sample Mine-A',
    department: 'Safety & DGMS',
    report_year: 1998,
    report_period: 'Q3 Inspection',
    page_count: 4,
    status: 'flagged',
    ocr_engine: 'tesseract',
    avg_ocr_confidence: 84.5,
    has_low_confidence_pages: true,
    created_at: '2024-02-15T14:30:00Z',
    content_snippet: 'Historical DGMS inspection log deskewed and thresholded. Seam III depth recorded at 142m with minor water seepage.',
  },
  {
    id: 'doc-004',
    filename: 'NCSL_Annual_Production_Report_2022.pdf',
    file_type: 'pdf',
    document_type: 'Production',
    subsidiary: 'Northern Coalfields Sample Ltd',
    mine_name: 'Subsidiary Overall',
    department: 'Planning & Statistics',
    report_year: 2022,
    report_period: 'Annual FY2022',
    page_count: 28,
    status: 'processed',
    ocr_engine: 'digital',
    avg_ocr_confidence: 98.8,
    has_low_confidence_pages: false,
    created_at: '2024-01-18T09:00:00Z',
    content_snippet: 'In FY2022, the total coal production of Northern Coalfields Sample Ltd was 22.30 MT across all open-cast blocks.',
  },
  {
    id: 'doc-005',
    filename: 'Bilingual_Administrative_Summary_NCSL_2024.pdf',
    file_type: 'pdf',
    document_type: 'Administrative',
    subsidiary: 'Northern Coalfields Sample Ltd',
    mine_name: 'HQ Singrauli Block',
    department: 'Corporate Social Responsibility',
    report_year: 2024,
    report_period: 'Annual FY2024',
    page_count: 18,
    status: 'processed',
    ocr_engine: 'paddleocr',
    avg_ocr_confidence: 96.4,
    has_low_confidence_pages: false,
    created_at: '2024-03-01T16:45:00Z',
    content_snippet: 'वर्ष 2024 में उत्तरी कोयला क्षेत्र नमूना लिमिटेड (NCSL) द्वारा कुल सीएसआर व्यय ₹48.65 करोड़ दर्ज किया गया।',
  },
  {
    id: 'doc-006',
    filename: 'EMSL_Geological_Exploration_Block_7_2023.pdf',
    file_type: 'pdf',
    document_type: 'Geological',
    subsidiary: 'Eastern Mining Sample Ltd',
    mine_name: 'Block 7 Quarry',
    department: 'Geology & Exploration',
    report_year: 2023,
    report_period: 'Exploration FY2023',
    page_count: 45,
    status: 'processed',
    ocr_engine: 'digital',
    avg_ocr_confidence: 97.5,
    has_low_confidence_pages: false,
    created_at: '2024-02-20T13:10:00Z',
    content_snippet: 'Detailed core borehole drilling confirmed proven coal reserves of 185.4 MT with average strip ratio 1:3.4.',
  },
  {
    id: 'doc-007',
    filename: 'EMSL_Contractor_Billing_Statement_2023.xlsx',
    file_type: 'xlsx',
    document_type: 'Production',
    subsidiary: 'Eastern Mining Sample Ltd',
    mine_name: 'Quarry-4',
    department: 'Finance & Accounts',
    report_year: 2023,
    report_period: 'FY2023 OB Removal',
    page_count: 8,
    status: 'flagged',
    ocr_engine: 'digital',
    avg_ocr_confidence: 100.0,
    has_low_confidence_pages: false,
    created_at: '2024-02-22T10:05:00Z',
    content_snippet: 'Overburden contractor measured billing volume claimed: 44.10 MCM excavated across Quarry-4 benches.',
  },
  {
    id: 'doc-008',
    filename: 'EMSL_Geological_Core_Drilling_Report_2023.pdf',
    file_type: 'pdf',
    document_type: 'Geological',
    subsidiary: 'Eastern Mining Sample Ltd',
    mine_name: 'Quarry-4',
    department: 'Geology & Survey',
    report_year: 2023,
    report_period: 'Annual Survey',
    page_count: 36,
    status: 'flagged',
    ocr_engine: 'digital',
    avg_ocr_confidence: 98.2,
    has_low_confidence_pages: false,
    created_at: '2024-02-22T10:15:00Z',
    content_snippet: 'Geodetic survey and volumetric mine laser mapping verified actual overburden removed at 42.50 MCM.',
  },
  {
    id: 'doc-009',
    filename: 'CCSL_Annual_Production_Report_2023.pdf',
    file_type: 'pdf',
    document_type: 'Production',
    subsidiary: 'Central Collieries Sample Ltd',
    mine_name: 'Subsidiary Overall',
    department: 'Operations',
    report_year: 2023,
    report_period: 'FY2023 Summary',
    page_count: 30,
    status: 'flagged',
    ocr_engine: 'digital',
    avg_ocr_confidence: 99.1,
    has_low_confidence_pages: false,
    created_at: '2024-02-25T15:00:00Z',
    content_snippet: 'Executive summary states total subsidiary coal output at 34.50 MT, while summation of individual mines totals 35.80 MT.',
  },
  {
    id: 'doc-010',
    filename: 'CCSL_Environmental_Compliance_Audit_2024.pdf',
    file_type: 'pdf',
    document_type: 'Environmental',
    subsidiary: 'Central Collieries Sample Ltd',
    mine_name: 'Pipra Colliery',
    department: 'Environment & Forestry',
    report_year: 2024,
    report_period: 'FY2024 H1',
    page_count: 32,
    status: 'processed',
    ocr_engine: 'digital',
    avg_ocr_confidence: 98.1,
    has_low_confidence_pages: false,
    created_at: '2024-03-05T12:00:00Z',
    content_snippet: 'Effluent treatment plant efficiency tested at 94.2%. Ambient PM10 and PM2.5 levels remained within SPCB limits.',
  },
  {
    id: 'doc-011',
    filename: 'NCSL_Mine_B_Coal_Dispatch_Ledger_2024.csv',
    file_type: 'csv',
    document_type: 'Production',
    subsidiary: 'Northern Coalfields Sample Ltd',
    mine_name: 'Sample Mine-B',
    department: 'Logistics',
    report_year: 2024,
    report_period: 'FY2024 Q1-Q3',
    page_count: 14,
    status: 'processed',
    ocr_engine: 'digital',
    avg_ocr_confidence: 100.0,
    has_low_confidence_pages: false,
    created_at: '2024-03-10T14:20:00Z',
    content_snippet: 'MGR dispatch tally: 14.8 MT hauled to NTPC thermal power station via merry-go-round rail track.',
  },
  {
    id: 'doc-012',
    filename: 'EMSL_Safety_Statistical_Handbook_2023.docx',
    file_type: 'docx',
    document_type: 'Safety',
    subsidiary: 'Eastern Mining Sample Ltd',
    mine_name: 'All Collieries',
    department: 'Safety & DGMS',
    report_year: 2023,
    report_period: 'Calendar Year 2023',
    page_count: 22,
    status: 'processed',
    ocr_engine: 'digital',
    avg_ocr_confidence: 99.6,
    has_low_confidence_pages: false,
    created_at: '2024-01-25T11:00:00Z',
    content_snippet: 'Zero fatality year achieved in underground seam operations. Lost time injury frequency rate reduced to 0.18.',
  },
  {
    id: 'doc-013',
    filename: 'CCSL_Dragline_Availability_Audit_2024.pdf',
    file_type: 'pdf',
    document_type: 'Technical',
    subsidiary: 'Central Collieries Sample Ltd',
    mine_name: 'Jayant Block',
    department: 'Heavy Earth Moving Machinery',
    report_year: 2024,
    report_period: 'FY2024',
    page_count: 16,
    status: 'processed',
    ocr_engine: 'digital',
    avg_ocr_confidence: 97.9,
    has_low_confidence_pages: false,
    created_at: '2024-03-12T09:30:00Z',
    content_snippet: '24/96 Dragline operational availability recorded at 88.4% with bucket turnaround cycle time of 54 seconds.',
  },
  {
    id: 'doc-014',
    filename: 'NCSL_Washery_Yield_Analysis_2023.pdf',
    file_type: 'pdf',
    document_type: 'Quality',
    subsidiary: 'Northern Coalfields Sample Ltd',
    mine_name: 'Bina Washery',
    department: 'Coal Beneficiation',
    report_year: 2023,
    report_period: 'FY2023',
    page_count: 20,
    status: 'processed',
    ocr_engine: 'digital',
    avg_ocr_confidence: 98.7,
    has_low_confidence_pages: false,
    created_at: '2024-02-05T15:15:00Z',
    content_snippet: 'Coking coal washery clean coal yield stood at 52.4% with average ash content reduced from 34% to 17.5%.',
  },
  {
    id: 'doc-015',
    filename: 'CIL_HQ_Statutory_Vigilance_Inspection_2023.pdf',
    file_type: 'pdf',
    document_type: 'Inspection',
    subsidiary: 'Central Collieries Sample Ltd',
    mine_name: 'HQ Review',
    department: 'Vigilance & Internal Audit',
    report_year: 2023,
    report_period: 'Annual Audit',
    page_count: 40,
    status: 'processed',
    ocr_engine: 'digital',
    avg_ocr_confidence: 99.0,
    has_low_confidence_pages: false,
    created_at: '2024-01-30T10:00:00Z',
    content_snippet: 'Audit report verifying procurement processes, diesel bunkering calibration, and volumetric survey controls.',
  },
];

export const INITIAL_CONFLICTS: ConflictData[] = [
  {
    id: 'conf-001',
    conflict_id: 'CONF-001',
    source_a_filename: 'NCSL_Annual_Production_Report_2023.pdf',
    source_a_page: 4,
    source_a_value: '9.80 MT',
    source_b_filename: 'NCSL_Mine_A_Monthly_Dispatches_2023.xlsx',
    source_b_page: 1,
    source_b_value: '10.20 MT',
    metric_name: 'Sample Mine-A Coal Production',
    metric_type: 'coal_production',
    severity: 'critical',
    subsidiary: 'Northern Coalfields Sample Ltd',
    mine_name: 'Sample Mine-A',
    year: 2023,
    conflict_type: 'cross_document_discrepancy',
    status: 'open',
    conflicting_values: [
      { doc: 'NCSL_Annual_Production_Report_2023.pdf', value: '9.80 MT' },
      { doc: 'NCSL_Mine_A_Monthly_Dispatches_2023.xlsx', value: '10.20 MT' },
    ],
    documents_involved: [
      'NCSL_Annual_Production_Report_2023.pdf',
      'NCSL_Mine_A_Monthly_Dispatches_2023.xlsx',
    ],
    created_at: '2024-02-12T12:00:00Z',
  },
  {
    id: 'conf-002',
    conflict_id: 'CONF-002',
    source_a_filename: 'EMSL_Geological_Core_Drilling_Report_2023.pdf',
    source_a_page: 12,
    source_a_value: '42.50 MCM',
    source_b_filename: 'EMSL_Contractor_Billing_Statement_2023.xlsx',
    source_b_page: 3,
    source_b_value: '44.10 MCM',
    metric_name: 'Quarry-4 Overburden Excavation Volume',
    metric_type: 'overburden_removal',
    severity: 'warning',
    subsidiary: 'Eastern Mining Sample Ltd',
    mine_name: 'Quarry-4',
    year: 2023,
    conflict_type: 'measurement_method_mismatch',
    status: 'open',
    conflicting_values: [
      { doc: 'EMSL_Geological_Core_Drilling_Report_2023.pdf', value: '42.50 MCM' },
      { doc: 'EMSL_Contractor_Billing_Statement_2023.xlsx', value: '44.10 MCM' },
    ],
    documents_involved: [
      'EMSL_Geological_Core_Drilling_Report_2023.pdf',
      'EMSL_Contractor_Billing_Statement_2023.xlsx',
    ],
    created_at: '2024-02-22T11:00:00Z',
  },
  {
    id: 'conf-003',
    conflict_id: 'CONF-003',
    source_a_filename: 'CCSL_Annual_Production_Report_2023.pdf',
    source_a_page: 2,
    source_a_value: '34.50 MT',
    source_b_filename: 'CCSL_Annual_Production_Report_2023.pdf (Mine Ledger)',
    source_b_page: 18,
    source_b_value: '35.80 MT (Component Sum)',
    metric_name: 'Subsidiary Aggregate vs Mine-Wise Sum',
    metric_type: 'arithmetic_sum_mismatch',
    severity: 'critical',
    subsidiary: 'Central Collieries Sample Ltd',
    mine_name: 'Subsidiary Overall',
    year: 2023,
    conflict_type: 'arithmetic_aggregation_error',
    status: 'open',
    conflicting_values: [
      { doc: 'CCSL_Annual_Production_Report_2023.pdf (Executive Summary)', value: '34.50 MT' },
      { doc: 'CCSL_Annual_Production_Report_2023.pdf (Mine-Wise Summation)', value: '35.80 MT' },
    ],
    documents_involved: ['CCSL_Annual_Production_Report_2023.pdf'],
    created_at: '2024-02-25T15:30:00Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogData[] = [
  {
    id: 'audit-001',
    username: 'coordinator',
    role: 'Project Coordinator',
    action: 'INGESTION_BATCH_COMPLETED',
    resource_type: 'DocumentCollection',
    resource_id: 'batch-2024-01',
    details: { total_documents: 42, format_types: ['PDF', 'DOCX', 'XLSX', 'PNG'] },
    ip_address: '10.0.4.12',
    created_at: '2024-02-10T09:30:00Z',
  },
  {
    id: 'audit-002',
    username: 'coordinator',
    role: 'Project Coordinator',
    action: 'OCR_PREPROCESSING_EXECUTED',
    resource_type: 'Document',
    resource_id: 'doc-003',
    details: { filename: 'Scanned_Inspection_Log_NCSL_Mine_A_1998.png', engine: 'tesseract', deskew: true },
    ip_address: '10.0.4.12',
    created_at: '2024-02-15T14:32:00Z',
  },
  {
    id: 'audit-003',
    username: 'system',
    role: 'System Engine',
    action: 'VALIDATION_SCAN_FLAGGED',
    resource_type: 'ConflictRecord',
    resource_id: 'conf-001',
    details: { metric: 'Sample Mine-A Coal Production', delta_mt: 0.40 },
    ip_address: '127.0.0.1',
    created_at: '2024-02-12T12:05:00Z',
  },
  {
    id: 'audit-004',
    username: 'auditor',
    role: 'Auditor',
    action: 'AUDIT_TRAIL_VERIFIED',
    resource_type: 'AuditLog',
    resource_id: 'all',
    details: { verification: 'Statutory ground truth consistency validated' },
    ip_address: '10.0.8.44',
    created_at: '2024-03-01T11:00:00Z',
  },
];

export const INITIAL_REPORTS: ReportData[] = [
  {
    id: 'rep-001',
    title: 'Northern Coalfields Sample Ltd — Annual Production Summary FY2023',
    report_type: 'production_summary',
    subsidiary: 'Northern Coalfields Sample Ltd',
    report_year: 2023,
    status: 'approved',
    generated_by: 'coordinator',
    approved_by: 'director',
    reviewer_notes: 'Reviewed and verified against audited geological reports.',
    content_json: {
      executive_summary: 'Northern Coalfields Sample Ltd recorded a solid operational year in FY2023 with total production of 24.80 MT, marking a 5.6% growth over FY2022.',
      kpis: { total_coal_mt: 24.8, total_ob_mcm: 94.2, dragline_availability: '88.4%' },
      sections: [
        { heading: 'Mine-Wise Performance', content: 'Mine-A contributed 9.80 MT, Mine-B produced 8.60 MT, and Mine-C yielded 6.40 MT.' },
        { heading: 'Overburden Stripping Ratio', content: 'Average stripped overburden reached 3.80 m³/tonne.' },
      ],
    },
    created_at: '2024-02-28T16:00:00Z',
  },
];

export const TOPIC_WORDS = [
  { word: 'coal', count: 482, weight: 2.0 },
  { word: 'production', count: 395, weight: 2.0 },
  { word: 'ncsl', count: 284, weight: 2.0 },
  { word: 'overburden', count: 240, weight: 2.0 },
  { word: 'geological', count: 196, weight: 1.8 },
  { word: 'seam', count: 185, weight: 1.8 },
  { word: 'safety', count: 172, weight: 1.8 },
  { word: 'emsl', count: 168, weight: 1.8 },
  { word: 'drilling', count: 154, weight: 1.8 },
  { word: 'ccsl', count: 142, weight: 1.8 },
  { word: 'reserve', count: 138, weight: 1.8 },
  { word: 'dragline', count: 125, weight: 1.8 },
  { word: 'washery', count: 112, weight: 1.8 },
  { word: 'compliance', count: 98, weight: 1.5 },
  { word: 'excavation', count: 94, weight: 1.5 },
  { word: 'dispatch', count: 88, weight: 1.5 },
  { word: 'environmental', count: 82, weight: 1.5 },
  { word: 'borehole', count: 76, weight: 1.5 },
  { word: 'revenue', count: 71, weight: 1.5 },
  { word: 'opencast', count: 68, weight: 1.5 },
];
