import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  XCircle,
  FileCheck,
  Check,
  ArrowRight,
  Database,
  Layers,
} from 'lucide-react';
import { useUploadDataset, useIngestionReport } from '../hooks/useAPI';
import Skeleton from '../components/ui/Skeleton';

export default function DataQuality() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [datasetType, setDatasetType] = useState('projects');
  const [uploadedDatasetId, setUploadedDatasetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [committed, setCommitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'validation_workspace' | 'ingestion_pipeline'>('validation_workspace');

  const uploadMutation = useUploadDataset();
  const { data: reportData, isLoading: reportLoading } = useIngestionReport(uploadedDatasetId || '');

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(
      { file: selectedFile, type: datasetType },
      {
        onSuccess: (res: any) => {
          setUploadedDatasetId(res.dataset_id || res.id || 'batch-2026-q4');
        },
      }
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1E2B45] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Data Validation & Ingestion
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              Operational Workspace (Ref 1)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            PAIMANA / CLR Monitoring Protocol — GoI • Ingestion Validation & Audit Gate
          </p>
        </div>

        {/* Workspace View Toggle */}
        <div className="flex items-center rounded-md border border-slate-200 dark:border-[#1E2B45] p-0.5 bg-slate-50 dark:bg-[#0B1322]">
          <button
            onClick={() => setActiveTab('validation_workspace')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === 'validation_workspace'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Validation Workspace (Ref 1)
          </button>
          <button
            onClick={() => setActiveTab('ingestion_pipeline')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === 'ingestion_pipeline'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Ingestion Pipeline
          </button>
        </div>
      </div>

      {/* ── Operational Workspace (Exact Blueprint Reference 1) ── */}
      {activeTab === 'validation_workspace' && (
        <div className="space-y-4">
          {/* Main Record Card */}
          <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] rounded-lg p-5 space-y-4 shadow-2xs">
            {/* Record Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-[#1E2B45] pb-3">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  #3
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Thermal Power Unit Expansion
                </span>
                <span className="text-xs font-mono text-slate-400">
                  report_date: <strong>2026-07</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Observation for project DEMO26003 at 2026-07 already exists in the database. Skipped.
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                  WARNING
                </span>
              </div>
            </div>

            {/* Source Context Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0E1729] p-2.5 rounded-md border border-slate-200 dark:border-[#1E2B45]">
              <div className="flex items-center gap-4">
                <span>
                  SOURCE CONTEXT: <strong>Document Source • Page N/A</strong>
                </span>
                <span>Annexures/Table</span>
              </div>
              <div>
                Sector: <strong>POWER</strong> • Ministry: <strong>Ministry of Power</strong>
              </div>
            </div>

            {/* Specific Missing Fields Warning Strip */}
            <div className="p-3 rounded-md bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>SPECIFIC MISSING FIELDS IN RECORD (1):</span>
              </div>
              <div className="font-mono text-rose-600 dark:text-rose-400 pl-5 text-[11px]">
                ✗ start_date
              </div>
            </div>

            {/* Extracted Metrics Grid (12 Items) */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CURRENTLY EXTRACTED METRICS FROM DOCUMENT:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'ORIGINAL COST', val: '₹8,000 Cr', missing: false },
                  { label: 'REVISED COST', val: '₹12,000 Cr', missing: false },
                  { label: 'ANTICIPATED COST', val: '₹14,500 Cr', missing: false },
                  { label: 'CUMULATIVE EXPENDITURE', val: '₹4,500 Cr', missing: false },
                  { label: 'COST OVERRUN', val: '— (Missing)', missing: true },
                  { label: 'APPROVAL DATE', val: '2020-05', missing: false },
                  { label: 'PHYSICAL PROGRESS', val: '— (Missing)', missing: true },
                  { label: 'MILESTONE/ACHIEVED', val: '2027-09', missing: false },
                  { label: 'REVISED COMPLETION', val: '2029-03', missing: false },
                  { label: 'ANTICIPATED COMPLETION', val: '2029-09', missing: false },
                  { label: 'TIME OVERRUN', val: '— (Missing)', missing: true },
                  { label: 'EXTRACTION CONFIDENCE', val: '— (Missing)', missing: true },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="p-3 rounded-md bg-slate-50 dark:bg-[#0E1729] border border-slate-200 dark:border-[#1E2B45] text-center"
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block truncate">
                      {m.label}
                    </span>
                    <div
                      className={`text-xs sm:text-sm font-bold mt-1 font-mono truncate ${
                        m.missing
                          ? 'text-slate-400 italic font-normal'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {m.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Status Bar */}
            <div className="p-3 rounded-md bg-slate-100 dark:bg-[#0A1120] border border-slate-200 dark:border-[#1E2B45] text-xs font-mono text-slate-600 dark:text-slate-400">
              <span className="font-bold text-amber-600 dark:text-amber-400">
                Validation Status: WARNING
              </span>{' '}
              • Observation for project DEMO26003 at 2026-07 already exists in the database. Skipped. •
              REC-IPL-2016-0218-1
            </div>
          </div>

          {/* Commit Data to System Box (Reference 1 Bottom Area) */}
          <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Commit Data to System
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                0 valid records, 3 non-blocking warnings require review before writing to database.
              </p>
            </div>

            <button
              onClick={() => setCommitted(true)}
              disabled={committed}
              className="px-5 py-2 rounded-md text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-emerald-600 transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
            >
              {committed ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Committed to System</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>Commit to System</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Ingestion Pipeline Tab ──────────────────────────── */}
      {activeTab === 'ingestion_pipeline' && (
        <div className="space-y-6">
          {/* Quality Health Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45]">
              <span className="text-[10px] font-bold uppercase text-slate-400">Quality Score</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                100.0%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Zero schema breaches</div>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45]">
              <span className="text-[10px] font-bold uppercase text-slate-400">Nulls Imputed</span>
              <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                428
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">KNN / Domain heuristics</div>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45]">
              <span className="text-[10px] font-bold uppercase text-slate-400">Deduplicated</span>
              <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
                14
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Exact project ID matches</div>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45]">
              <span className="text-[10px] font-bold uppercase text-slate-400">Active Rules</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                28 Rules
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                All passing
              </div>
            </div>
          </div>

          {/* Upload Zone */}
          <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2B45] pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Upload New Progress / Ingestion Dataset
              </h3>
              <select
                value={datasetType}
                onChange={(e) => setDatasetType(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-[#0E1626] border border-slate-200 dark:border-[#1E2B45] rounded-md text-slate-900 dark:text-white"
              >
                <option value="projects">Projects Master CSV</option>
                <option value="milestones">Milestones Progress CSV</option>
                <option value="observations">Field Observations CSV</option>
              </select>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-[#1E2B45] hover:border-indigo-500 rounded-lg p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-[#0A101F]/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.json"
                onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {selectedFile ? selectedFile.name : 'Click or drag CSV/XLSX file to upload'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Automated schema validation checks data ranges, missing IDs, and date chronology.
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="px-4 py-1.5 rounded-md text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  {uploadMutation.isPending ? 'Validating...' : 'Execute Ingestion'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
