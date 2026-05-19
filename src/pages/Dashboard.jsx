import React, { useState, useMemo, useCallback } from 'react';
import ReactFlow, { Controls, Background, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import TopHeader from '../components/TopHeader';
import { Activity, PlayCircle, Info, ExternalLink, HelpCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';
import StarBorder from '../components/StarBorder';
import CelonisDashboardImg from '../assets/Celonis_Dashboard.png';
import PowerBIDashboardImg from '../assets/PowerBI_Dashboard.png';

const PipelineNode = ({ data, selected }) => {
  return (
    <div style={{
      padding: '16px 20px',
      borderRadius: '14px',
      background: 'radial-gradient(circle at top left, rgba(25, 25, 25, 0.95), rgba(10, 10, 10, 0.98))',
      border: selected
        ? `2px solid ${data.color || 'var(--ofi-gold, #CCA23E)'}`
        : `1px solid ${data.color || 'var(--ofi-gold, #CCA23E)'}80`,
      boxShadow: selected
        ? `0 0 25px ${data.color || 'var(--ofi-gold, #CCA23E)'}80, inset 0 0 10px ${data.color || 'var(--ofi-gold, #CCA23E)'}30`
        : `0 4px 20px rgba(0, 0, 0, 0.8), 0 0 12px ${data.color || 'var(--ofi-gold, #CCA23E)'}25`,
      color: '#FFFFFF',
      width: '260px',
      textAlign: 'center',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      transform: selected ? 'scale(1.04)' : 'scale(1)',
      position: 'relative'
    }}
      className="hover-lift glowing-node pipeline-node"
    >
      {/* Target handle on the left border */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: data.color || '#CCA23E',
          border: 'none',
          width: '8px',
          height: '8px',
          boxShadow: `0 0 8px ${data.color || '#CCA23E'}`
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
        <span style={{
          fontSize: '15px',
          filter: `drop-shadow(0px 0px 4px ${data.color || '#CCA23E'})`
        }}>
          {data.icon}
        </span>
        <span style={{
          fontSize: '9.5px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: data.color || 'var(--ofi-text-sec, #A0A0A0)',
          fontWeight: '800'
        }}>
          {data.category}
        </span>
      </div>
      <div style={{
        fontSize: '14px',
        fontWeight: '800',
        marginBottom: '6px',
        color: '#FFFFFF',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      }}>
        {data.label}
      </div>
      <div style={{
        fontSize: '10.5px',
        color: 'var(--ofi-text-sec, #A0A0A0)',
        lineHeight: '1.4'
      }}>
        {data.desc}
      </div>

      {/* Bottom glowing line indicator */}
      <div style={{
        height: '3px',
        width: '40%',
        margin: '8px auto 0',
        borderRadius: '2px',
        background: data.color || '#CCA23E',
        boxShadow: `0 0 8px ${data.color || '#CCA23E'}`
      }} />

      {/* Source handle on the right border */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: data.color || '#CCA23E',
          border: 'none',
          width: '8px',
          height: '8px',
          boxShadow: `0 0 8px ${data.color || '#CCA23E'}`
        }}
      />
    </div>
  );
};

function DashboardPage({ sidebarCollapsed, setSidebarCollapsed, setSelectedAgent }) {
  const navigate = useNavigate();

  // Selected node details state for the flowchart
  const [selectedNode, setSelectedNode] = useState({
    id: 'db_silver',
    label: 'SAP Silver Layer',
    category: 'Source Database',
    color: '#CCA23E',
    details: 'Raw silver database layer containing 26 primary SAP tables. In its raw form, this layer features cryptic 4-letter names, has no pre-defined joins, and lacks business context, making it unusable directly in process mining software.',
    kpis: ['26 SAP Tables', 'Raw cryptical columns', 'No pre-defined joins'],
    feasibility: 'High (Standard ingestion)',
    solution: 'Ingested into Databricks and targeted by our intelligent orchestrator agent pipeline.'
  });

  const nodeTypes = useMemo(() => ({ pipeline: PipelineNode }), []);

  const initialNodes = [
    {
      id: 'db_silver',
      type: 'pipeline',
      position: { x: 30, y: 200 },
      data: {
        label: 'SAP Silver Layer',
        category: 'Source Data',
        desc: '26 SAP Cryptic Tables',
        icon: '🛢️',
        color: '#CCA23E'
      }
    },
    {
      id: 'agent1',
      type: 'pipeline',
      position: { x: 380, y: 200 },
      data: {
        label: 'Agent 1: Silver → Gold',
        category: 'Orchestration',
        desc: 'Transforms raw to structured gold',
        icon: '🔗',
        color: '#CCA23E'
      }
    },
    {
      id: 'gold_tables',
      type: 'pipeline',
      position: { x: 730, y: 120 },
      data: {
        label: 'Transformed Gold Tables',
        category: 'Target Data',
        desc: '4 Generated Target Tables',
        icon: '🗂️',
        color: '#D4AF37'
      }
    },
    {
      id: 'agent2',
      type: 'pipeline',
      position: { x: 1080, y: 40 },
      data: {
        label: 'Agent 2: Auto-DM Creator',
        category: 'Data Model API',
        desc: 'pycelonis automated model setup',
        icon: '💾',
        color: '#A6802B'
      }
    },
    {
      id: 'pbi_poc',
      type: 'pipeline',
      position: { x: 730, y: 280 },
      data: {
        label: 'Power BI Dashboard',
        category: 'BI Prototyping',
        desc: 'DAX measures and TMDL metadata',
        icon: '📊',
        color: '#D4AF37'
      }
    },
    {
      id: 'agent3',
      type: 'pipeline',
      position: { x: 1080, y: 200 },
      data: {
        label: 'Agent 3: SQL → PQL',
        category: 'Translation',
        desc: 'Translates DAX to PQL',
        icon: '🌐',
        color: '#B8963A'
      }
    },
    {
      id: 'agent4',
      type: 'pipeline',
      position: { x: 1080, y: 360 },
      data: {
        label: 'Agent 4: TMDL → YAML',
        category: 'KPI Extraction',
        desc: 'Embeds PQL into Celonis YAML',
        icon: '⚙️',
        color: '#A6802B'
      }
    },
    {
      id: 'celonis_ems',
      type: 'pipeline',
      position: { x: 1430, y: 200 },
      data: {
        label: 'Celonis EMS Studio',
        category: 'Target Live',
        desc: 'Operationalized Process Mining',
        icon: '🚀',
        color: '#22C55E'
      }
    }
  ];

  const initialEdges = [
    { id: 'e1-2', source: 'db_silver', target: 'agent1', animated: true, className: 'glowing-edge-gold' },
    { id: 'e2-3', source: 'agent1', target: 'gold_tables', animated: true, className: 'glowing-edge-gold' },
    { id: 'e3-4', source: 'gold_tables', target: 'agent2', animated: true, className: 'glowing-edge-bronze' },
    { id: 'e4-8', source: 'agent2', target: 'celonis_ems', animated: true, className: 'glowing-edge-green' },
    { id: 'e3-5', source: 'gold_tables', target: 'pbi_poc', animated: true, className: 'glowing-edge-yellow' },
    { id: 'e5-6', source: 'pbi_poc', target: 'agent3', animated: true, className: 'glowing-edge-yellow' },
    { id: 'e6-7', source: 'agent3', target: 'agent4', animated: true, className: 'glowing-edge-brown' },
    { id: 'e5-7', source: 'pbi_poc', target: 'agent4', animated: true, className: 'glowing-edge-brown' },
    { id: 'e7-8', source: 'agent4', target: 'celonis_ems', animated: true, className: 'glowing-edge-green' }
  ];

  // Pipeline node data dictionary for interactive drawer details
  const nodeDetailsDict = {
    db_silver: {
      label: 'SAP Silver Layer',
      category: 'Source Database',
      color: '#CCA23E',
      details: 'Raw silver database layer containing 26 primary SAP tables like BKPF, BSEG, EKKO. In its raw form, this layer features cryptic 4-letter names, has no pre-defined joins, and lacks business context, making it unusable directly in process mining software.',
      kpis: ['26 SAP Tables Ingested', 'Cryptic SAP technical names', 'Contains Raw Transaction Logs'],
      feasibility: 'High (Standard Ingestion)',
      solution: 'Read and analyzed by the Agent 1 schema mapper.'
    },
    agent1: {
      label: 'Agent 1: Silver → Gold Transformation',
      category: 'Intelligent Orchestration',
      color: '#CCA23E',
      details: 'A powerful AI agent orchestrator coordinating specialized sub-agents to consolidate the 26 Silver tables into 4 optimized Gold tables. Handles automatic join resolutions, filtering, casting, and data standardizations.',
      kpis: ['Consolidates 26 Silver Tables', 'Outputs 4 structured Gold tables', 'Validates DDL & Null values'],
      feasibility: 'High (Fully local to Databricks)',
      solution: 'Outputs T1 Procurement Events, T2 Finance Events, T3 Vendor Master, T4 Material Master.'
    },
    gold_tables: {
      label: 'Transformed Gold Tables',
      category: 'Target Database',
      color: '#D4AF37',
      details: 'The final, highly normalized output data from Agent 1. This contains the physical 4 tables: T1 Procurement Events.csv, T2 Finance Events.csv, T3 Vendor Master.csv, and T4 Material Master.csv.',
      kpis: ['Process-Mining Ready', 'Simplified Star Schema', 'Pre-computed metrics'],
      feasibility: 'High (Stored in Databricks)',
      solution: 'Used as the core foundation for both Power BI and Celonis Data Models.'
    },
    pbi_poc: {
      label: 'Power BI Prototype',
      category: 'BI Prototyping',
      color: '#D4AF37',
      details: 'A business-validated Power BI prototype connected directly to the Transformed Gold Tables. It contains fully articulated DAX measure formulas, display folders, relationship graphs, and metadata stored as plain text TMDL formats.',
      kpis: ['Plain text plain-code definitions', 'Captures business KPI rules', 'Defines table relationships'],
      feasibility: 'High (Tabular Editor or Desktop)',
      solution: 'Exported as plain text .tmdl file to feed Agent 3 and Agent 4.'
    },
    agent2: {
      label: 'Agent 2: Automated Celonis DM Creator',
      category: 'API Automation',
      color: '#A6802B',
      details: 'Automates Data Model creation inside Celonis EMS. Using `pycelonis` API scripts, it connects to the generated 4 Gold tables in Databricks, configures the data model logic, foreign-key joins, and reloads the model automatically.',
      kpis: ['Uses generated 4 gold tables', 'Zero Celonis UI clicks', 'Full audit trail and log'],
      feasibility: 'High (pycelonis API is extremely stable)',
      solution: 'Saves 45-90 minutes of manual clicking in Celonis Studio per use case.'
    },
    agent3: {
      label: 'Agent 3: SQL → PQL Translation Agent',
      category: 'Process Query Translation',
      color: '#B8963A',
      details: 'A specialized code translation agent. It ingests complex nested SQL queries and DAX measures, translating them into implicit Celonis PQL syntax (e.g., mapping SUM(CASE WHEN...) / COUNT(...) to standard PQL operators).',
      kpis: ['DAX/SQL to PQL Translation', 'Subquery to TOTAL() mapping', 'Strict syntax validation pass'],
      feasibility: 'Medium (Requires subquery structural translation rules)',
      solution: 'Eliminates weeks of manual translation of complex SQL KPI rules.'
    },
    agent4: {
      label: 'Agent 4: TMDL → Celonis YAML Generator',
      category: 'Metadata Extraction',
      color: '#A6802B',
      details: 'Reads exported Power BI plain-text TMDL metadata files, extracts relationships, and embeds the PQL outputs from Agent 3 to generate the final Generated Celonis Yaml.txt file.',
      kpis: ['Generates final Celonis YAML', 'Embeds translated PQL KPIs', 'Ready for direct Celonis upload'],
      feasibility: 'High (Automated via script)',
      solution: 'Allows instant loading of BI measures into Celonis Studio with zero re-writing.'
    },
    celonis_ems: {
      label: 'Celonis EMS Studio',
      category: 'Target Live',
      color: '#22C55E',
      details: 'The final destination. Process analytics dashboards and process models run instantly based on the automated Data Pools, Foreign Key joins, and the uploaded Celonis YAML containing original KPIs.',
      kpis: ['Live process mining dashboard', 'PQL definitions live instantly', 'Fully auditable automated pipeline'],
      feasibility: 'Production Ready',
      solution: 'Delivers a live process mining platform in weeks rather than months.'
    }
  };

  const handleNodeClick = useCallback((event, node) => {
    const details = nodeDetailsDict[node.id];
    if (details) {
      setSelectedNode({ id: node.id, ...details });
    }
  }, []);

  return (
    <div className="fc-page">
      <TopHeader onSelectAgent={setSelectedAgent} />

      <div className="fc-page__body" style={{ display: 'flex', height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
        <main className="fc-page__main" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Page Title Header */}
          <div className="fc-page-title" style={{ marginBottom: 0 }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity color="var(--ofi-gold, #CCA23E)" size={24} />
              Intelligent Migration Dashboard
            </h1>
            <p style={{ color: 'var(--ofi-text-sec, #A0A0A0)', marginTop: '4px' }}>
              Automated end-to-end AI agent pipeline migrating Databricks Silver layer to live Celonis EMS process intelligence.
            </p>
          </div>

          {/* Migration Core Stats Row */}
          <div className="kpi-efficiency-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="kpi-card hover-lift" style={{ borderLeft: '3px solid var(--ofi-gold, #CCA23E)', background: 'var(--ofi-surface, #0A0A0A)' }}>
              <div className="kpi-card__value" style={{ color: '#CCA23E' }}>26 SAP</div>
              <div className="kpi-card__label" style={{ color: 'var(--ofi-text-sec, #A0A0A0)' }}>Silver Tables Consolidated</div>
            </div>
            <div className="kpi-card hover-lift" style={{ borderLeft: '3px solid var(--ofi-gold, #CCA23E)', background: 'var(--ofi-surface, #0A0A0A)' }}>
              <div className="kpi-card__value" style={{ color: 'var(--ofi-gold, #CCA23E)' }}>4 Target</div>
              <div className="kpi-card__label" style={{ color: 'var(--ofi-text-sec, #A0A0A0)' }}>Gold Layer Tables Generated</div>
            </div>
            <div className="kpi-card hover-lift" style={{ borderLeft: '3px solid #22C55E', background: 'var(--ofi-surface, #0A0A0A)' }}>
              <div className="kpi-card__value" style={{ color: '#CCA23E' }}>2-4 Mins</div>
              <div className="kpi-card__label" style={{ color: 'var(--ofi-text-sec, #CCA23E)' }}>Data Model Ingestion Time</div>
            </div>
            <div className="kpi-card hover-lift" style={{ borderLeft: '3px solid #22C55E', background: 'var(--ofi-surface, #0A0A0A)' }}>
              <div className="kpi-card__value" style={{ color: '#CCA23E' }}>Few UI Clicks</div>
              <div className="kpi-card__label" style={{ color: 'var(--ofi-text-sec, #A0A0A0)' }}>Celonis EMS Setup Effort</div>
            </div>
          </div>

          {/* Flowchart + Information Split Layout */}
          <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: '400px' }} className="responsive-split">

            {/* Left Box: Flowchart Panel */}
            <div style={{
              flex: 2,
              background: 'var(--ofi-surface, #0A0A0A)',
              borderRadius: '16px',
              border: '1px solid var(--ofi-border, #1F1F1F)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minHeight: '380px',
              position: 'relative'
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ofi-border, #1F1F1F)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: '#FFFFFF', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlayCircle size={16} color="var(--ofi-gold, #CCA23E)" />
                  Intelligent Agent Pipeline Architecture
                </span>
                <span style={{ fontSize: '11px', color: 'var(--ofi-text-sec, #A0A0A0)' }}>
                  🖱️ Click nodes to explore details
                </span>
              </div>

              <div style={{ flex: 1, height: '100%', minHeight: '300px' }}>
                <ReactFlow
                  nodes={initialNodes}
                  edges={initialEdges}
                  nodeTypes={nodeTypes}
                  onNodeClick={handleNodeClick}
                  fitView
                  fitViewOptions={{ padding: 0.15 }}
                  zoomOnScroll={false}
                  zoomOnPinch={false}
                  zoomOnDoubleClick={false}
                  panOnDrag={true}
                  proOptions={{ hideAttribution: true }}
                >
                  <Background color="#1F1F1F" gap={16} size={1} />
                </ReactFlow>
              </div>
            </div>

            {/* Right Box: Selected Node Details Drawer */}
            <div style={{
              flex: 1,
              background: 'var(--ofi-surface, #0A0A0A)',
              borderRadius: '16px',
              border: '1px solid var(--ofi-border, #1F1F1F)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              minWidth: '300px'
            }}>
              {/* Header Title */}
              <div style={{ borderBottom: '1px solid var(--ofi-border, #1F1F1F)', paddingBottom: '12px' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: selectedNode.color, fontWeight: 'bold', marginBottom: '4px' }}>
                  {selectedNode.category}
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF' }}>{selectedNode.label}</h2>
              </div>

              {/* Description */}
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ofi-text-muted, #555555)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                  Overview
                </span>
                <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--ofi-text-sec, #A0A0A0)' }}>
                  {selectedNode.details}
                </p>
              </div>

              {/* Bullet Metrics */}
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ofi-text-muted, #555555)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  Key Capabilities
                </span>
                <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedNode.kpis.map((kpi, index) => (
                    <li key={index} style={{ fontSize: '12.5px', color: '#FFFFFF', lineHeight: '1.4' }}>
                      {kpi}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Feasibility Rating */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--ofi-border, #1F1F1F)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--ofi-text-sec, #A0A0A0)' }}>Migration Feasibility:</span>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: selectedNode.color }}>{selectedNode.feasibility}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ofi-text-muted, #555555)', lineHeight: '1.4' }}>
                  {selectedNode.solution}
                </div>
              </div>

              {/* Action Button */}
              {selectedNode.id.startsWith('agent') && (
                <button
                  className="btn btn-outline btn-full"
                  onClick={() => navigate('/agents')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderColor: selectedNode.color,
                    color: selectedNode.color,
                    marginTop: 'auto'
                  }}
                >
                  <Info size={14} /> View Agent Playground
                </button>
              )}
            </div>
          </div>

          {/* End-to-End Visual Transformation */}
          <div style={{ marginTop: '10px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity color="var(--ofi-gold, #CCA23E)" size={20} />
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#adcbd3ff', margin: 0 }}>
                PowerBI To Celonis Dashboard Migration
              </h2>
            </div>

            <div style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--ofi-surface, #0A0A0A)',
              padding: '30px',
              borderRadius: '16px',
              border: '1px solid var(--ofi-border, #1F1F1F)'
            }} className="responsive-split">

              {/* Source Power BI */}
              <div style={{ flex: 1, textAlign: 'center', position: 'relative' }} className="source-bi-anim">
                <div style={{ marginBottom: '12px', color: 'var(--ofi-text-sec, #A0A0A0)', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Source: Power BI Dashboard
                </div>
                <div style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid #D4AF37',
                  boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)',
                  aspectRatio: '16/9'
                }}>
                  <img src={PowerBIDashboardImg} alt="Power BI Input" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>

              {/* Migration Engine Indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }} className="process-engine-anim">
                <div style={{
                  background: 'linear-gradient(90deg, #D4AF37 0%, #22C55E 100%)',
                  borderRadius: '20px',
                  padding: '8px 24px',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  marginBottom: '16px',
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
                }}>
                  Migration Engine
                </div>
                <ArrowRight size={40} color="#22C55E" style={{ filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.6))' }} />
              </div>

              {/* Target Celonis EMS */}
              <div style={{ flex: 1, textAlign: 'center' }} className="target-result-anim">
                <div style={{ marginBottom: '12px', color: '#22C55E', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Target: Celonis EMS Studio
                </div>
                <div style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid #22C55E',
                  boxShadow: '0 0 30px rgba(34, 197, 94, 0.2)',
                  aspectRatio: '16/9'
                }}>
                  <img src={CelonisDashboardImg} alt="Celonis Output" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
