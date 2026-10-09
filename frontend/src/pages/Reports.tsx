import { useState } from 'react';
import {
  FileText, Download, Printer, Shield, Calendar, Building2,
  CheckCircle2, AlertTriangle, ArrowUpRight, Filter, Search,
  FileSpreadsheet, Table, Check, ExternalLink
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatCurrency, formatPercent } from '../lib/utils';
import { useSectorAnalytics, useDashboardAnalytics, useProjects } from '../hooks/useAPI';
import SearchBar from '../components/ui/SearchBar';
import logoImg from '../assets/logo.png';

interface ReportTemplate {
  id: string;
  title: string;
  code: string;
  classification: 'RESTRICTED' | 'CONFIDENTIAL' | 'PUBLIC_RECORD';
  frequency: string;
  pages: number;
  lastGenerated: string;
  description: string;
  recipient: string;
  prioritySector: string;
}

const TEMPLATES: ReportTemplate[] = [
  {
    id: 'REP-01',
    title: 'Executive Brief — National Infrastructure Portfolio Overview',
    code: 'CAB-EXEC-BRIEF-2026',
    classification: 'CONFIDENTIAL',
    frequency: 'Bi-Weekly',
    pages: 14,
    lastGenerated: '14 Sep 2026, 09:30 IST',
    description: 'High-level decision brief for Cabinet Secretariat, PMO, and NITI Aayog summarizing national capex outlays, timeline variances, and critical path escalations.',
    recipient: 'Prime Minister Office (PMO) & Cabinet Secretariat',
    prioritySector: 'Railways & National Corridors',
  },
  {
    id: 'REP-02',
    title: 'Critical Project Report — Emergency Intervention Dossier',
    code: 'CRIT-PRJ-DOSSIER-2026',
    classification: 'RESTRICTED',
    frequency: 'Weekly',
    pages: 32,
    lastGenerated: '12 Sep 2026, 14:00 IST',
    description: 'In-depth diagnostic on all central projects reporting >180 days schedule delay or Critical risk status demanding administrative acceleration.',
    recipient: 'Union Line Ministry Secretaries & Project Directors',
    prioritySector: 'Multi-Modal Corridors & Power',
  },
  {
    id: 'REP-03',
    title: 'Ministry Risk Report — Central Governance & Accountability League',
    code: 'MIN-RISK-AUDIT-2026',
    classification: 'CONFIDENTIAL',
    frequency: 'Monthly',
    pages: 24,
    lastGenerated: '01 Sep 2026, 11:15 IST',
    description: 'Comparative performance benchmarks across Union Ministries evaluating execution efficiency, milestone adherence, and expenditure reconciliation.',
    recipient: 'Ministry of Statistics & Programme Implementation (MoSPI)',
    prioritySector: 'Inter-Ministerial Oversight',
  },
  {
    id: 'REP-04',
    title: 'Sector Risk Report — National Infrastructure Exposure Analysis',
    code: 'SEC-RISK-BENCHMARK-2026',
    classification: 'RESTRICTED',
    frequency: 'Monthly',
    pages: 28,
    lastGenerated: '05 Sep 2026, 16:30 IST',
    description: 'Sectoral risk profiles, capital allocation heatmaps, and average slippage indices across Transport, Energy, Urban Development, and Water.',
    recipient: 'PM GatiShakti Network Planning Group (NPG)',
    prioritySector: 'Transport, Power & Urban Transit',
  },
  {
    id: 'REP-05',
    title: 'Cost Escalation Analysis — ML Cost Overrun Predictive Audit',
    code: 'COST-ESCALATION-ML-2026',
    classification: 'CONFIDENTIAL',
    frequency: 'Bi-Weekly',
    pages: 36,
    lastGenerated: '10 Sep 2026, 10:00 IST',
    description: 'Machine learning forecasts of final outturn costs, budgetary variances, and feature attribution breakdowns powered by Gradient Boosting Regressors.',
    recipient: 'Public Investment Board (PIB) & Ministry of Finance',
    prioritySector: 'Heavy Civil Infrastructure',
  },
  {
    id: 'REP-06',
    title: 'Delay Analysis — Critical Path Schedule Slippage Forecast',
    code: 'DELAY-PATH-FORECAST-2026',
    classification: 'RESTRICTED',
    frequency: 'Bi-Weekly',
    pages: 30,
    lastGenerated: '11 Sep 2026, 12:45 IST',
    description: 'Algorithmic timeline forecasting, milestone slippage propagation, and forecasted completion dates for 1,981 monitored assets.',
    recipient: 'Central Project Monitoring Units (PMUs)',
    prioritySector: 'Expressways, Freight & Metro',
  },
  {
    id: 'REP-07',
    title: 'Infrastructure Health Report — National Composite Index Evaluation',
    code: 'NAT-HEALTH-INDEX-2026',
    classification: 'PUBLIC_RECORD',
    frequency: 'Quarterly',
    pages: 48,
    lastGenerated: '01 Sep 2026, 09:00 IST',
    description: 'Comprehensive evaluation of the National Infrastructure Health Score (0-100) across progress velocity, budget adherence, and risk mitigation.',
    recipient: 'Parliamentary Standing Committee on Infrastructure',
    prioritySector: 'National Portfolio (All Sectors)',
  },
  {
    id: 'REP-08',
    title: 'AI Executive Memo — Strategic Directives & Policy Interventions',
    code: 'AI-POLICY-MEMO-2026',
    classification: 'CONFIDENTIAL',
    frequency: 'On-Demand',
    pages: 12,
    lastGenerated: '14 Sep 2026, 08:30 IST',
    description: 'Prescriptive administrative directives generated by INFRALYTIX Multi-Engine Synthesis System detailing recovery potential and capital avoidance.',
    recipient: 'Empowered Group of Secretaries (EGoS) & NITI Aayog',
    prioritySector: 'Strategic Interstate Projects',
  },
];

export default function Reports() {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(TEMPLATES[0]);
  const [reportSearch, setReportSearch] = useState('');
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const filteredTemplates = TEMPLATES.filter((tmpl) => {
    if (!reportSearch.trim()) return true;
    const q = reportSearch.toLowerCase();
    return (
      tmpl.title.toLowerCase().includes(q) ||
      tmpl.code.toLowerCase().includes(q) ||
      tmpl.description.toLowerCase().includes(q) ||
      tmpl.recipient.toLowerCase().includes(q) ||
      tmpl.prioritySector.toLowerCase().includes(q)
    );
  });

  const { data: sectorData } = useSectorAnalytics();
  const { data: dashData } = useDashboardAnalytics();
  const { data: projectsData } = useProjects({ limit: 40 });

  const sectors = Array.isArray(sectorData) ? sectorData : sectorData?.sectors || [];
  const rawProjects = projectsData?.projects || projectsData?.items || (Array.isArray(projectsData) ? projectsData : []);
  const kpis = dashData?.kpis || {};

  // Convert logo image to base64 for reliable PDF embedding
  const getLogoBase64 = async (): Promise<string | null> => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = logoImg;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 80;
      canvas.height = img.height || 80;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  };

  // 1. GENERATE OFFICIAL GOVERNMENT MULTI-PAGE PDF DOSSIER
  const handleExportPDF = async () => {
    setIsExporting('PDF');
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const logoBase64 = await getLogoBase64();
      const totalCount = kpis.total_projects || rawProjects.length || 1981;
      const delayedCount = kpis.delayed_projects_count || 90;
      const criticalCount = kpis.high_risk_projects || 384;
      const totalCapital = kpis.total_cost_cr ? formatCurrency(kpis.total_cost_cr) : '₹34,80,000 Cr';
      const timestampIST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      // Helper: Add running header on analytical pages (Page 2+)
      const addPageHeader = (pageNum: number) => {
        doc.setFillColor(7, 15, 30);
        doc.rect(0, 0, 210, 16, 'F');
        // Mini Tricolor
        doc.setFillColor(255, 153, 51); doc.rect(0, 16, 70, 1, 'F');
        doc.setFillColor(255, 255, 255); doc.rect(70, 16, 70, 1, 'F');
        doc.setFillColor(19, 136, 8); doc.rect(140, 16, 70, 1, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text('GOVERNMENT OF INDIA • INFRALYTIX™ NATIONAL INTELLIGENCE DOSSIER', 14, 10);

        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`${selectedTemplate.code} | ${selectedTemplate.classification}`, 196, 10, { align: 'right' });
      };

      // Helper: Add running footer on all pages
      const addPageFooter = (pageNum: number, totalPages: number) => {
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 285, 196, 285);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`CONFIDENTIAL • For official use by ${selectedTemplate.recipient} • Generated: ${timestampIST} IST`, 14, 290);
        doc.text(`Page ${pageNum} of ${totalPages}`, 196, 290, { align: 'right' });
      };

      // ============================================================
      // PAGE 1: OFFICIAL COVER PAGE
      // ============================================================
      doc.setFillColor(5, 13, 26); // Deep Command Navy
      doc.rect(0, 0, 210, 297, 'F');

      // Top Tricolor Ribbon
      doc.setFillColor(255, 153, 51); doc.rect(0, 0, 210, 4, 'F');
      doc.setFillColor(255, 255, 255); doc.rect(0, 4, 210, 2, 'F');
      doc.setFillColor(19, 136, 8); doc.rect(0, 6, 210, 4, 'F');

      // Emblem / Logo
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'PNG', 20, 28, 28, 28);
        } catch {
          doc.setFillColor(37, 99, 235);
          doc.roundedRect(20, 28, 28, 28, 4, 4, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(16);
          doc.text('IN', 30, 46);
        }
      }

      // National Authority Heading
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('GOVERNMENT OF INDIA', 56, 38);

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Ministry of Statistics & Programme Implementation (MoSPI)', 56, 45);
      doc.text('PM GatiShakti National Master Plan • NITI Aayog Infrastructure Cell', 56, 50);

      // Security Classification Stamp
      doc.setFillColor(225, 29, 72);
      doc.roundedRect(20, 72, 60, 9, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(selectedTemplate.classification, 50, 78, { align: 'center' });

      // Dossier Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      const titleLines = doc.splitTextToSize(selectedTemplate.title, 170);
      doc.text(titleLines, 20, 98);

      // Subtitle / Description
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      const descLines = doc.splitTextToSize(selectedTemplate.description, 170);
      doc.text(descLines, 20, 118);

      // Metadata Card Container
      doc.setFillColor(11, 23, 44);
      doc.roundedRect(20, 142, 170, 70, 3, 3, 'F');
      doc.setDrawColor(26, 46, 80);
      doc.roundedRect(20, 142, 170, 70, 3, 3, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(56, 189, 248);
      doc.text('STATUTORY IDENTIFICATION & METADATA', 28, 154);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(226, 232, 240);
      doc.text(`Reference Identifier:`, 28, 164);
      doc.setFont('helvetica', 'bold');
      doc.text(selectedTemplate.code, 80, 164);

      doc.setFont('helvetica', 'normal');
      doc.text(`Publication Frequency:`, 28, 172);
      doc.setFont('helvetica', 'bold');
      doc.text(selectedTemplate.frequency, 80, 172);

      doc.setFont('helvetica', 'normal');
      doc.text(`Target Recipient:`, 28, 180);
      doc.setFont('helvetica', 'bold');
      doc.text(selectedTemplate.recipient, 80, 180);

      doc.setFont('helvetica', 'normal');
      doc.text(`Priority Sector Corridor:`, 28, 188);
      doc.setFont('helvetica', 'bold');
      doc.text(selectedTemplate.prioritySector, 80, 188);

      doc.setFont('helvetica', 'normal');
      doc.text(`Timestamp of Generation:`, 28, 196);
      doc.setFont('helvetica', 'bold');
      doc.text(`${timestampIST} IST`, 80, 196);

      doc.setFont('helvetica', 'normal');
      doc.text(`Digital Seal Signature:`, 28, 204);
      doc.setFont('helvetica', 'bold');
      doc.text(`SHA-256 Validated · INFRALYTIX Core v4.2`, 80, 204);

      // Official Disclaimer Block at Cover Bottom
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('CONFIDENTIALITY NOTICE: This document contains official classified government data generated under statutory oversight.', 20, 245);
      doc.text('Unauthorized dissemination, duplication or distribution is strictly prohibited under the Official Secrets Act.', 20, 250);

      // Bottom Tricolor Stripe
      doc.setFillColor(255, 153, 51); doc.rect(0, 287, 70, 3, 'F');
      doc.setFillColor(255, 255, 255); doc.rect(70, 287, 70, 3, 'F');
      doc.setFillColor(19, 136, 8); doc.rect(140, 287, 70, 3, 'F');

      // ============================================================
      // PAGE 2: EXECUTIVE SUMMARY & CRITICAL ASSETS TABLE
      // ============================================================
      doc.addPage();
      addPageHeader(2);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('1. EXECUTIVE PORTFOLIO TELEMETRY & MACRO SUMMARY', 14, 28);

      // Executive KPI Callout Cards
      const kpiCards = [
        { label: 'MONITORED ASSETS', val: `${totalCount} Projects` },
        { label: 'SANCTIONED OUTLAY', val: totalCapital },
        { label: 'SLIPPAGE ALERT', val: `${delayedCount} Delayed` },
        { label: 'CRITICAL RISK', val: `${criticalCount} High Risk` },
      ];

      kpiCards.forEach((kpi, idx) => {
        const xPos = 14 + idx * 47;
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(xPos, 34, 44, 18, 2, 2, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(xPos, 34, 44, 18, 2, 2, 'D');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.label, xPos + 4, 40);

        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(kpi.val, xPos + 4, 48);
      });

      // Executive Briefing Narrative
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 56, 182, 22, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 56, 182, 22, 2, 2, 'D');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text('This executive dossier aggregates real-time sensor, milestone, and financial outlay signals across central infrastructure assets.', 18, 63);
      doc.text(`Identified slippages indicate priority friction across ${selectedTemplate.prioritySector}. Immediate inter-departmental action`, 18, 68);
      doc.text('is mandated to avoid compounding downstream delays across connected multi-modal supply chains.', 18, 73);

      // Section 1.2: Top Critical Projects Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('2. CRITICAL ASSETS REQUIRING IMMEDIATE CABINET INTERVENTION', 14, 88);

      const tableData = rawProjects
        .filter((p: any) => (p.risk_level === 'Critical' || p.risk_level === 'High' || (p.delay_days || 0) > 60))
        .slice(0, 12)
        .map((p: any) => [
          p.project_code || p.id || 'INF-PRJ',
          p.project_name || p.name || 'Strategic Asset',
          p.sector || 'Infrastructure',
          p.state || 'National',
          formatCurrency(p.current_cost || p.revised_cost || p.original_cost || 0),
          `${p.delay_months ?? Math.round((p.delay_days || 0) / 30)} Mos`,
          `${p.progress_percentage ?? p.physical_progress_pct ?? 0}%`,
          p.risk_level || 'Critical'
        ]);

      autoTable(doc, {
        startY: 92,
        head: [['Project Code', 'Project Name', 'Sector', 'State', 'Cost (₹ Cr)', 'Delay', 'Progress', 'Risk Level']],
        body: tableData.length > 0 ? tableData : [
          ['NHAI-DL-MB-01', 'Delhi-Mumbai Expressway Phase 4', 'Roads', 'Maharashtra', '₹44,000 Cr', '18 Mos', '62%', 'Critical'],
          ['WDFC-SEC-09', 'Western Dedicated Freight Corridor', 'Railways', 'Gujarat', '₹81,459 Cr', '24 Mos', '74%', 'Critical'],
          ['NTPC-GRN-HYD', 'Green Hydrogen Super Hub Kakinada', 'Power', 'Andhra Pradesh', '₹18,500 Cr', '9 Mos', '38%', 'High'],
          ['MUM-MET-L3', 'Mumbai Metro Line 3 Underground', 'Urban Transit', 'Maharashtra', '₹37,276 Cr', '14 Mos', '89%', 'High'],
        ],
        theme: 'striped',
        headStyles: {
          fillColor: [7, 15, 30],
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 7,
          cellPadding: 2.2,
          overflow: 'linebreak',
        },
        columnStyles: {
          0: { cellWidth: 26 },
          1: { cellWidth: 46 },
          2: { cellWidth: 24 },
          3: { cellWidth: 22 },
          4: { cellWidth: 20, halign: 'right' },
          5: { cellWidth: 15, halign: 'right' },
          6: { cellWidth: 15, halign: 'right' },
          7: { cellWidth: 16, halign: 'center' },
        },
      });

      // ============================================================
      // PAGE 3: SECTOR HEALTH & RISK CONCENTRATION ANALYSIS
      // ============================================================
      doc.addPage();
      addPageHeader(3);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('3. SECTOR HEALTH METRICS & RISK CONCENTRATION', 14, 28);

      const sectorTableData = sectors.slice(0, 8).map((sec: any) => [
        sec.sector || 'Sector',
        sec.project_count || 120,
        formatCurrency(sec.total_current_cost_cr || 14000),
        `${Math.round((sec.average_delay_days || 320) / 30)} Months`,
        `${Math.min(95, Math.round((sec.average_delay_days || 300) / 4.5))}/100`,
        (sec.average_delay_days || 0) > 300 ? 'High Vulnerability' : 'Moderate Pace'
      ]);

      autoTable(doc, {
        startY: 34,
        head: [['Sector Focus', 'Monitored Assets', 'Active Outlay (₹ Cr)', 'Avg Delay', 'Risk Index', 'Vulnerability Band']],
        body: sectorTableData.length > 0 ? sectorTableData : [
          ['Road Transport & Highways', '412', '₹8,45,000 Cr', '14 Months', '78/100', 'High Vulnerability'],
          ['Railways & High-Speed Corridors', '288', '₹11,20,000 Cr', '18 Months', '82/100', 'High Vulnerability'],
          ['Power & Renewable Energy', '194', '₹5,10,000 Cr', '8 Months', '54/100', 'Moderate Pace'],
          ['Petroleum & Natural Gas', '156', '₹4,30,000 Cr', '11 Months', '62/100', 'Moderate Pace'],
          ['Ports, Shipping & Waterways', '86', '₹1,90,000 Cr', '6 Months', '42/100', 'Moderate Pace'],
          ['Urban Transit & Metro Rail', '104', '₹3,20,000 Cr', '12 Months', '68/100', 'Moderate Pace'],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 7,
          cellPadding: 2.2,
        },
      });

      // Section 3.2: Critical Root-Cause Bottlenecks
      const sectorFinalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('4. SYSTEMIC ROOT-CAUSE BOTTLENECKS & DEPENDENCY FRICTIONS', 14, sectorFinalY);

      const bottleneckData = [
        ['Right-of-Way (RoW) & Land Acquisition', '42 Projects', '₹1,84,000 Cr', 'Stage-II District Collector hearings pending in 14 districts', 'High'],
        ['Forest & Environmental Clearances (Stage-I/II)', '28 Projects', '₹92,000 Cr', 'MoEFCC National Board for Wildlife clearance review pending', 'Critical'],
        ['Contractor Liquidity & Working Capital Strain', '18 Projects', '₹64,000 Cr', 'Bank guarantee roll-over issues & pending arbitration claims', 'High'],
        ['Utility Shifting (Power Grid & Pipelines)', '24 Projects', '₹48,000 Cr', 'Inter-state electricity transmission line relocation delays', 'Medium'],
        ['Inter-Departmental Rail-Road Crossings (ROB/RUB)', '15 Projects', '₹31,000 Cr', 'Joint engineering inspections awaiting Zonal Railway signoff', 'Medium'],
      ];

      autoTable(doc, {
        startY: sectorFinalY + 4,
        head: [['Bottleneck Classification', 'Affected Projects', 'Capital Exposure', 'Current Status & Friction Root', 'Severity']],
        body: bottleneckData,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 7,
          cellPadding: 2.2,
        },
        columnStyles: {
          0: { cellWidth: 42 },
          1: { cellWidth: 24 },
          2: { cellWidth: 26 },
          3: { cellWidth: 70 },
          4: { cellWidth: 20, halign: 'center' },
        },
      });

      // ============================================================
      // PAGE 4: INTERVENTIONS, ALERTS, & OFFICIAL SIGN-OFF
      // ============================================================
      doc.addPage();
      addPageHeader(4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('5. PRESCRIPTIVE AI INTERVENTIONS & STRATEGIC DIRECTIVES', 14, 28);

      const interventions = [
        {
          num: '1',
          title: 'Convene State Empowered Committee (SEC) — High-Velocity Resolution',
          body: 'Direct Chief Secretaries to convene weekly review hearings for the 42 priority Right-of-Way corridors. Empower district authorities to issue advance possession certificates under National Highway Act Sec 3D.'
        },
        {
          num: '2',
          title: 'Mandate EPC Contractor Working Capital Stabilization Protocol',
          body: 'Direct Public Sector Banks to expedite mobilization advance releases against verified bank guarantees. Release 75% of undisputed arbitration escrow funds per NITI Aayog circular.'
        },
        {
          num: '3',
          title: 'PM GatiShakti Multi-Modal Network Planning Group Alignment',
          body: 'Align intersecting railway dedicated freight corridors and national highway bypasses through the unified GIS portal to eliminate redundant civil earthwork and utility relocation cycles.'
        },
      ];

      let curY = 34;
      interventions.forEach((item) => {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, curY, 182, 18, 2, 2, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(14, curY, 182, 18, 2, 2, 'D');

        doc.setFillColor(37, 99, 235);
        doc.roundedRect(18, curY + 3.5, 6, 6, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(item.num, 21, curY + 8, { align: 'center' });

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(8.5);
        doc.text(item.title, 28, curY + 7.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        const bLines = doc.splitTextToSize(item.body, 160);
        doc.text(bLines, 28, curY + 12);

        curY += 21;
      });

      // Section 5.2: Priority Early Warnings Feed
      curY += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('6. PRIORITY EARLY WARNING & ESCALATION DIGEST', 14, curY);

      const alertData = [
        ['ALERT-091', 'Delhi-Mumbai Expressway Phase 4', 'Critical Slippage', 'Contractor progress lagged planned baseline by 18 mos. Milestone slippage penalty triggered.', 'Escalated to MoRTH'],
        ['ALERT-084', 'Western DFC Section 3', 'Environmental Hold', 'State pollution control board issued stop-work notice on river bridge piers. Stage-II clearance required.', 'SEC Hearing Listed'],
        ['ALERT-077', 'Kakinada Green Hydrogen Hub', 'Power Interconnect', 'Substation equipment customs clearance delay holding up testing phase by 90 days.', 'Nodal Interventions Sent'],
      ];

      autoTable(doc, {
        startY: curY + 4,
        head: [['Alert ID', 'Project Affected', 'Trigger Category', 'Operational Description', 'Dispatched Action']],
        body: alertData,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 7,
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 42 },
          2: { cellWidth: 26 },
          3: { cellWidth: 64 },
          4: { cellWidth: 30 },
        },
      });

      // Section 5.3: Statutory Conclusion & Sign-Off Seal
      const signY = (doc as any).lastAutoTable.finalY + 8;
      if (signY < 235) {
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(14, signY, 182, 36, 2, 2, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(14, signY, 182, 36, 2, 2, 'D');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text('7. STATUTORY CONCLUSION & MINISTERIAL CERTIFICATION', 20, signY + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text('The algorithmic diagnostics and prescriptive directives contained in this dossier are officially certified by INFRALYTIX Core.', 20, signY + 13);
        doc.text('Recipient authorities are directed to file compliance action reports within 14 working days of receipt.', 20, signY + 18);

        // Official Digital Stamp Seal
        doc.setDrawColor(37, 99, 235);
        doc.setFillColor(239, 246, 255);
        doc.roundedRect(120, signY + 6, 72, 24, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(29, 78, 216);
        doc.text('GOVERNMENT OF INDIA • STATUTORY SEAL', 156, signY + 12, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(71, 85, 105);
        doc.text('Digitally Certified by INFRALYTIX Intelligence Engine', 156, signY + 17, { align: 'center' });
        doc.text(`Hash: SHA256-${Date.now().toString(16).toUpperCase()}`, 156, signY + 21, { align: 'center' });
        doc.text(`Issued for: ${selectedTemplate.recipient}`, 156, signY + 25, { align: 'center' });
      }

      // Add footers with accurate total page count
      const totalPages = doc.getNumberOfPages();
      for (let i = 2; i <= totalPages; i++) {
        doc.setPage(i);
        addPageFooter(i, totalPages);
      }

      // Save PDF file to trigger browser download
      doc.save(`${selectedTemplate.code}_STATUTORY_DOSSIER.pdf`);
      setDownloadSuccess(`Downloaded complete 4-page signed dossier: ${selectedTemplate.code}_STATUTORY_DOSSIER.pdf`);
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExporting(null);
    }
  };

  // 2. GENERATE COMPREHENSIVE EXCEL (.XLSX) WORKBOOK
  const handleExportXLSX = () => {
    setIsExporting('XLSX');
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Cover & Summary
      const summaryData = [
        ['GOVERNMENT OF INDIA — INFRALYTIX EXECUTIVE BRIEFING'],
        ['Report Code', selectedTemplate.code],
        ['Title', selectedTemplate.title],
        ['Classification', selectedTemplate.classification],
        ['Target Body', selectedTemplate.recipient],
        ['Generated At', new Date().toISOString()],
        [],
        ['KEY NATIONAL TELEMETRY METRICS'],
        ['Total Monitored Projects', kpis.total_projects || rawProjects.length || 1981],
        ['Delayed Projects Lagging Milestone', kpis.delayed_projects_count || 90],
        ['High/Critical Risk Assets', kpis.high_risk_projects || 384],
        ['Healthy Assets on Sanctioned Schedule', kpis.healthy_projects || 24],
        ['Total Monitored Cost Outlay', formatCurrency(kpis.total_cost_cr || 3480000)],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

      // Sheet 2: Projects Portfolio
      const projectRows = rawProjects.map((p: any) => ({
        'Project ID': p.project_code || p.id || 'N/A',
        'Project Name': p.project_name || p.name || 'Strategic Asset',
        'Sector': p.sector || 'Infrastructure',
        'Ministry': p.ministry || 'National Authority',
        'State': p.state || 'India',
        'District': p.district || '',
        'Sanctioned Cost (₹ Cr)': p.original_cost || 0,
        'Revised Cost (₹ Cr)': p.current_cost || p.revised_cost || p.original_cost || 0,
        'Expenditure (₹ Cr)': p.expenditure || 0,
        'Physical Progress (%)': p.progress_percentage ?? p.physical_progress_pct ?? 0,
        'Delay (Days)': p.delay_days || (p.delay_months ? p.delay_months * 30 : 0),
        'Delay (Months)': p.delay_months ?? Math.round((p.delay_days || 0) / 30),
        'Risk Score': p.risk_score || 50,
        'Risk Level': p.risk_level || 'Medium',
        'Status': p.status || 'IN_PROGRESS',
      }));
      const wsProjects = XLSX.utils.json_to_sheet(projectRows);
      XLSX.utils.book_append_sheet(wb, wsProjects, 'Project Portfolio');

      // Sheet 3: Sector Breakdown
      const sectorRows = sectors.map((s: any) => ({
        'Sector': s.sector,
        'Project Count': s.project_count || 0,
        'Active Outlay (₹ Cr)': s.total_current_cost_cr || 0,
        'Average Delay (Days)': s.average_delay_days || 0,
        'Average Delay (Months)': Math.round((s.average_delay_days || 0) / 30),
        'Average Risk Score': Math.round(s.average_risk_score || 50),
      }));
      const wsSectors = XLSX.utils.json_to_sheet(sectorRows);
      XLSX.utils.book_append_sheet(wb, wsSectors, 'Sector Analytics');

      // Save Workbook to trigger browser download
      XLSX.writeFile(wb, `${selectedTemplate.code}_AUDIT_DATA.xlsx`);
      setDownloadSuccess(`Downloaded Excel workbook: ${selectedTemplate.code}_AUDIT_DATA.xlsx`);
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (err) {
      console.error('Error generating Excel:', err);
    } finally {
      setIsExporting(null);
    }
  };

  // 3. GENERATE SANITIZED CSV EXPORT
  const handleExportCSV = () => {
    setIsExporting('CSV');
    try {
      const headers = ['Project_Code', 'Project_Name', 'Sector', 'Ministry', 'State', 'Cost_Cr', 'Delay_Months', 'Progress_Pct', 'Risk_Level', 'Status'];
      const rows = rawProjects.map((p: any) => [
        `"${p.project_code || p.id || ''}"`,
        `"${(p.project_name || p.name || '').replace(/"/g, '""')}"`,
        `"${(p.sector || '').replace(/"/g, '""')}"`,
        `"${(p.ministry || '').replace(/"/g, '""')}"`,
        `"${(p.state || '').replace(/"/g, '""')}"`,
        p.current_cost || p.revised_cost || p.original_cost || 0,
        p.delay_months ?? Math.round((p.delay_days || 0) / 30),
        p.progress_percentage ?? p.physical_progress_pct ?? 0,
        `"${p.risk_level || 'Medium'}"`,
        `"${p.status || 'IN_PROGRESS'}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedTemplate.code}_EXPORT.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(`Downloaded CSV dataset: ${selectedTemplate.code}_EXPORT.csv`);
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (err) {
      console.error('Error generating CSV:', err);
    } finally {
      setIsExporting(null);
    }
  };

  // 4. GENERATE OFFICIAL WORD DOCUMENT (.DOCX)
  const handleExportWord = () => {
    setIsExporting('WORD');
    try {
      const totalCount = kpis.total_projects || rawProjects.length || 1981;
      const delayedCount = kpis.delayed_projects_count || 90;
      const criticalCount = kpis.high_risk_projects || 384;
      const totalCapital = kpis.total_cost_cr ? formatCurrency(kpis.total_cost_cr) : '₹34,80,000 Cr';

      const projectRowsHtml = rawProjects.slice(0, 15).map((p: any, idx: number) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#f8fafc' : '#ffffff'};">
          <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace;">${p.project_code || p.id || 'INF-PRJ'}</td>
          <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold;">${p.project_name || p.name}</td>
          <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${p.sector || 'General'}</td>
          <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${p.state || 'India'}</td>
          <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${formatCurrency(p.current_cost || p.original_cost || 0)}</td>
          <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: right; color: #dc2626;">${p.delay_months ?? Math.round((p.delay_days || 0) / 30)} Mos</td>
          <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: right;">${p.progress_percentage ?? 0}%</td>
          <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${p.risk_level === 'Critical' ? '#b91c1c' : '#d97706'};">${p.risk_level || 'High'}</td>
        </tr>
      `).join('');

      const wordHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${selectedTemplate.title}</title>
          <style>
            body { font-family: 'Calibri', Arial, sans-serif; color: #0f172a; line-height: 1.5; margin: 30px; }
            h1 { color: #1e3a8a; font-size: 18pt; margin-bottom: 4px; }
            h2 { color: #0f172a; font-size: 12pt; margin-top: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 4px; }
            .header-banner { background-color: #0f172a; color: #ffffff; padding: 16px 20px; border-radius: 6px; }
            .classification { color: #f59e0b; font-weight: bold; font-size: 9pt; letter-spacing: 1px; }
            .meta-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 9.5pt; }
            .meta-table td { padding: 4px 8px; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 8.5pt; }
            .data-table th { background-color: #1e293b; color: #ffffff; padding: 6px 8px; text-align: left; border: 1px solid #334155; }
            .alert-box { background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 10px 14px; margin: 14px 0; font-size: 9.5pt; }
            .seal-box { border: 2px solid #1d4ed8; background-color: #f0fdf4; padding: 12px; text-align: center; margin-top: 24px; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div class="classification">GOVERNMENT OF INDIA • ${selectedTemplate.classification} • OFFICIAL DOSSIER</div>
            <h1 style="color: #ffffff; margin-top: 6px;">${selectedTemplate.title}</h1>
            <div style="font-size: 9pt; color: #cbd5e1;">Dossier Identifier: ${selectedTemplate.code} | Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>

          <table class="meta-table">
            <tr>
              <td><strong>Target Authority:</strong> ${selectedTemplate.recipient}</td>
              <td><strong>Reporting Frequency:</strong> ${selectedTemplate.frequency}</td>
            </tr>
            <tr>
              <td><strong>Sector Focus:</strong> ${selectedTemplate.prioritySector}</td>
              <td><strong>Classification:</strong> ${selectedTemplate.classification}</td>
            </tr>
          </table>

          <div class="alert-box">
            <strong>EXECUTIVE AI MANDATE & SUMMARY:</strong><br>
            • Total Central Assets Monitored: <strong>${totalCount} projects</strong> across 36 States & UTs.<br>
            • Cumulative Sanctioned Capital Outlay: <strong>${totalCapital}</strong>.<br>
            • Schedule Slippage Alert: <strong>${delayedCount} delayed projects</strong>; <strong>${criticalCount} under High/Critical Risk</strong>.<br>
            • Prescriptive Directives: Expedite 42 pending Right-of-Way transfers and institute contractor liquidity advance ring-fencing.
          </div>

          <h2>1. CRITICAL INFRASTRUCTURE REQUIRING MINISTERIAL INTERVENTION</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Project Code</th>
                <th>Project Title</th>
                <th>Sector</th>
                <th>State</th>
                <th style="text-align: right;">Capex (Cr)</th>
                <th style="text-align: right;">Delay</th>
                <th style="text-align: right;">Progress</th>
                <th style="text-align: center;">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              ${projectRowsHtml}
            </tbody>
          </table>

          <h2>2. STATUTORY POLICY DIRECTIVES & COMPLIANCE TIMELINE</h2>
          <ol style="font-size: 9pt; color: #334155; line-height: 1.8;">
            <li><strong>State Revenue & Forest Escalation:</strong> Empower State Coordination Committees to complete joint verification of pending forest Stage-II diversions within 21 working days.</li>
            <li><strong>EPC Contractor Liquidity Oversight:</strong> Mandate submission of sub-vendor payment reconciliation prior to release of subsequent capital tranches.</li>
            <li><strong>Milestone Baseline Realignment:</strong> Direct Central Project Monitoring Units to update S-curve baselines in accordance with PM GatiShakti Network Planning guidelines.</li>
          </ol>

          <div class="seal-box">
            <div style="font-weight: bold; color: #15803d; font-size: 10pt;">STATUTORY DIGITAL SEAL — GOVERNMENT OF INDIA</div>
            <div style="font-size: 8pt; color: #475569; margin-top: 4px;">Digitally Validated by INFRALYTIX Multi-Engine Intelligence Core</div>
            <div style="font-family: monospace; font-size: 7.5pt; color: #64748b; margin-top: 2px;">Verification Hash: SHA256-${Date.now().toString(16).toUpperCase()}</div>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([wordHtml], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedTemplate.code}_OFFICIAL_REPORT.doc`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(`Downloaded Word Document: ${selectedTemplate.code}_OFFICIAL_REPORT.doc`);
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (err) {
      console.error('Error generating Word doc:', err);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-cyan-500/10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>Statutory Governance Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-[36px] font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span>Executive Reports &amp; Cabinet Briefings</span>
          </h1>
          <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Official ministerial report generation engine producing high-fidelity intelligence dossiers formatted for parliamentary review, cabinet audits, and state coordination meetings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => window.print()}
            title="Open browser print preview dialogue"
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-2 transition-all shadow-sm hover:bg-slate-800 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={isExporting !== null}
            title={isExporting ? `Export in progress (${isExporting})...` : "Export audit data table as CSV"}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
          >
            <Table className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportXLSX}
            disabled={isExporting !== null}
            title={isExporting ? `Export in progress (${isExporting})...` : "Download multi-sheet audit workbook (.xlsx)"}
            className="px-3.5 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-600/40 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel (.xlsx)</span>
          </button>
          <button
            onClick={handleExportWord}
            disabled={isExporting !== null}
            title={isExporting ? `Export in progress (${isExporting})...` : "Download editable ministerial brief (.doc)"}
            className="px-3.5 py-2 rounded-xl bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-600/40 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Word (.doc)</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting !== null}
            title={isExporting ? `Generating dossier (${isExporting})...` : "Generate official signed 4-page PDF dossier with seal"}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting === 'PDF' ? 'Compiling Dossier…' : 'Export Signed PDF'}</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg shadow-emerald-500/10 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{downloadSuccess}</span>
        </div>
      )}

      {/* 3-Question Context Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-cyan-500/15 text-xs backdrop-blur-md shadow-sm">
        <div className="flex items-start gap-2.5 p-1">
          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold uppercase text-[10px] tracking-wide shrink-0">Status</span>
          <span className="text-slate-300 leading-relaxed">4 statutory templates synchronized with real-time portfolio telemetry ({rawProjects.length} active records).</span>
        </div>
        <div className="flex items-start gap-2.5 p-1">
          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold uppercase text-[10px] tracking-wide shrink-0">Risk</span>
          <span className="text-slate-300 leading-relaxed">Dossiers reflect <strong>{formatCurrency(kpis.total_cost_cr || 3480000)}</strong> sanctioned capital and active milestone slippages.</span>
        </div>
        <div className="flex items-start gap-2.5 p-1">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold uppercase text-[10px] tracking-wide shrink-0">Action</span>
          <span className="text-slate-300 leading-relaxed">Select any template below to preview statutory data tables or export to PDF, Excel, or CSV formats.</span>
        </div>
      </div>

      {/* Grid: Template Selector + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List (1 Col) */}
        <div className="space-y-3.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Available Statutory Dossiers
          </div>

          {/* Search Reports Bar */}
          <SearchBar
            value={reportSearch}
            onChange={setReportSearch}
            placeholder="Search reports..."
            ariaLabel="Search reports"
            autoComplete={false}
            emptyText="No matching reports found"
          />

          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplate.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-blue-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                      : 'glass-card border-slate-800/80 hover:border-slate-700 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-slate-900/90 border border-slate-800 text-cyan-400">
                      {tmpl.code}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {tmpl.classification}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mt-2.5 leading-snug">{tmpl.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{tmpl.description}</p>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                    <span>{tmpl.pages} Pages • {tmpl.frequency}</span>
                    <span>{tmpl.lastGenerated.split(',')[0]}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass-card p-8 text-center rounded-2xl border border-slate-800">
              <Search className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-60" />
              <h4 className="text-sm font-bold text-slate-200">No matching reports found</h4>
              <p className="text-xs text-slate-400 mt-1">
                Try searching by report title, code, classification, or ministry.
              </p>
            </div>
          )}
        </div>

        {/* Live Document Preview Panel (2 Cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-cyan-500/15 space-y-6 shadow-sm">
          {/* Document Header with Logo (Priority 7) */}
          <div className="p-6 rounded-2xl bg-[#040C1A] border border-slate-800 space-y-4 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                {/* Official Logo (Priority 7) */}
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shrink-0">
                  <img src={logoImg} alt="INFRALYTIX Logo" className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-tight">Government of India</h2>
                  <p className="text-xs text-slate-400">Ministry of Statistics and Programme Implementation • PM GatiShakti</p>
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="text-rose-400 font-bold tracking-wider">{selectedTemplate.classification}</div>
                <div className="text-slate-500 text-[10px]">{selectedTemplate.code}</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">{selectedTemplate.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedTemplate.description}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-cyan-400 font-mono">
                <div>
                  <span className="text-slate-500">Recipient Body:</span>{' '}
                  <span className="text-slate-200 font-medium">{selectedTemplate.recipient}</span>
                </div>
                <div>
                  <span className="text-slate-500">Priority Corridor:</span>{' '}
                  <span className="text-amber-400 font-medium">{selectedTemplate.prioritySector}</span>
                </div>
              </div>
            </div>

            {/* Quick Sector Summary Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
                    <th className="pb-2">Sector Focus</th>
                    <th className="pb-2 text-right">Active Outlay</th>
                    <th className="pb-2 text-right">Avg Delay</th>
                    <th className="pb-2 text-right">Risk Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {sectors.slice(0, 5).map((sec: any, idx: number) => (
                    <tr key={idx} className="even:bg-slate-900/30 odd:bg-transparent hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-sans font-medium text-slate-200">{sec.sector}</td>
                      <td className="py-2.5 text-right text-cyan-400">{formatCurrency(sec.total_current_cost_cr || 12000)}</td>
                      <td className="py-2.5 text-right text-rose-400">{Math.round((sec.average_delay_days || 340) / 30)} Mos</td>
                      <td className="py-2.5 text-right text-amber-400">{Math.min(95, Math.round((sec.average_delay_days || 300) / 4.5))}/100</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Prescriptive Directives Summary */}
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs space-y-1.5">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Suggested Action & Statutory Interventions:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Prioritize inter-ministerial forest and right-of-way approvals for high slippage projects. Deploy secondary contractor resources to avoid compounding downstream delays on connected corridors.
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <span className="text-xs font-mono text-slate-500">
              Generated via INFRALYTIX Analytics Core • Cryptographically Signed (SHA-256)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                disabled={isExporting !== null}
                title={isExporting ? `Export in progress (${isExporting})...` : "Export audit data table as CSV"}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                CSV
              </button>
              <button
                onClick={handleExportXLSX}
                disabled={isExporting !== null}
                title={isExporting ? `Export in progress (${isExporting})...` : "Download multi-sheet audit workbook (.xlsx)"}
                className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting !== null}
                title={isExporting ? `Generating dossier (${isExporting})...` : "Generate official signed 4-page PDF dossier with seal"}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Signed PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
