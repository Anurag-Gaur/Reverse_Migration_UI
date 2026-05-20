import React, { useState, useEffect, useRef } from 'react';
import TopHeader from '../components/TopHeader';
import { AGENTS } from '../config/agents.jsx';
import { ACTUAL_CELONIS_YAML } from '../config/yamlData.js';
import DataModelImage from '../assets/Data_Model_View.png';
import {
  Play, Terminal, CheckCircle2, Code, Database, Languages, Cpu, ArrowRight
} from 'lucide-react';
import '../styles/dashboard.css';

// Pre-defined translation data for Agent 3 Playground (SQL -> PQL)
const agent3Queries = {
  vendor_match_rate: {
    name: 'Three-Way Match Rate',
    sql: `SELECT VENDOR_ID,\n       SUM(CASE WHEN MATCH_3WAY = TRUE THEN 1 ELSE 0 END) / COUNT(*) * 100 AS match_rate\nFROM T1_PROCUREMENT_EVENTS\nGROUP BY VENDOR_ID`,
    pql: `-- PQL Translation (Event-Log Aware)\nSUM(\n  CASE WHEN "T1_PROCUREMENT_EVENTS"."KPI_THREE_WAY_MATCH" = 1\n  THEN 1 ELSE 0 END\n)\n/\nCOUNT(DISTINCT "T1_PROCUREMENT_EVENTS"."PO_NUMBER") * 100`,
    rules: [
      { rule: 'Subquery / CTE conversion', desc: 'Translated outer aggregate ratios into standard Celonis PQL window metrics.' },
      { rule: 'Implicit GROUP BY logic', desc: 'Removed SQL GROUP BY clause since PQL automatically groups by the process case dimensions.' },
      { rule: 'Filter mapping', desc: 'Mapped boolean SQL filters into standard PQL 1 or 0 CASE evaluation.' }
    ]
  },
  po_rejection_ratios: {
    name: 'On-Time Delivery Rate',
    sql: `SELECT COMPANY_CODE,\n       SUM(CASE WHEN IS_ON_TIME = TRUE THEN 1 ELSE 0 END) / COUNT(*) * 100 AS otd_pct\nFROM T1_PROCUREMENT_EVENTS\nGROUP BY COMPANY_CODE`,
    pql: `-- PQL Translation (Case-Statement Mapping)\nSUM(\n  CASE WHEN "T1_PROCUREMENT_EVENTS"."KPI_ON_TIME_DELIVERY" = 1\n  THEN 1 ELSE 0 END\n)\n/\nCOUNT(DISTINCT "T1_PROCUREMENT_EVENTS"."PO_NUMBER") * 100`,
    rules: [
      { rule: 'SUM(CASE WHEN...) mapping', desc: 'Translated standard SQL boolean sums into standard PQL aggregations.' },
      { rule: 'GROUP BY mapping', desc: 'Implicit grouping based on Celonis Data Model primary keys.' }
    ]
  },
  average_days_to_pay_grouped: {
    name: 'Average Days to Pay',
    sql: `SELECT INVOICE_DOC_NUMBER,\n       AVG(DAYS_TO_PAY) * -1 AS avg_days\nFROM T2_FINANCE_EVENTS`,
    pql: `-- PQL Process Throughput Translation\nAVG("T2_FINANCE_EVENTS"."KPI_DAYS_TO_PAY")*-1`,
    rules: [
      { rule: 'SQL Aggregation mapping', desc: 'Mapped direct column average with multiplier.' },
      { rule: 'Step filter configuration', desc: 'No manual join required, Celonis Data Model implicitly joins Finance to Procurement.' }
    ]
  }
};

// Console logger statements for Agent 2 Playground (Data Model Auto-Creator)
const agent2Logs = [
  { text: '>>> [sys] Starting Automated pycelonis Data Transformation & Ingestion...', delay: 400 },
  { text: '>>> [API] Connecting to Celonis EMS Tenant: https://ofi-benelux-partner-sandbox.eu-1.celonis.cloud/', delay: 1000 },
  { text: '>>> [sys] Identifying source tables from Converted Gold Data...', delay: 1600 },
  { text: '>>> [sys] Found: dim_master.csv, gold_invoicing_finance.csv, gold_procurement_inventory.csv', delay: 2200 },
  { text: '>>> [sys] Executing transformations to generate final target tables...', delay: 2800 },
  { text: '>>> [SQL] Creating Activity Table Event Log.csv...', delay: 3200 },
  { text: '>>> [SQL] Creating T1_PROCUREMENT_EVENTS.csv...', delay: 3700 },
  { text: '>>> [SQL] Creating T2_FINANCE_EVENTS.csv...', delay: 4000 },
  { text: '>>> [SQL] Creating T3_VENDOR_MASTER.csv...', delay: 4500 },
  { text: '>>> [SQL] Creating T4_MATERIAL_MASTER.csv...', delay: 5000 },
  { text: '>>> [API] Creating target Data Pool inside Celonis...', delay: 5800 },
  { text: '>>> [pycelonis] Calling: celonis.data_integration.create_data_pool(name="reverse_code_migration_18May")', delay: 6400 },
  { text: '>>> [pycelonis] SUCCESS: Data Pool ID "a5df1891-959f-48d8-9d44-3ee9cd48b91e" provisioned.', delay: 7000 },
  { text: '>>> [API] Adding 4 Transformed tables from Databricks connection...', delay: 7600 },
  { text: '>>> [pycelonis] Calling: pool.create_table(name="T1_PROCUREMENT_EVENTS")', delay: 8100 },
  { text: '>>> [pycelonis] Calling: pool.create_table(name="T3_VENDOR_MASTER")', delay: 8500 },
  { text: '>>> [API] Resolving referential integrity & establishing foreign key joins based on datamodel logic...', delay: 9200 },
  { text: '>>> [pycelonis] Calling: dm.create_foreign_key(source="T1_PROCUREMENT_EVENTS", target="T3_VENDOR_MASTER", columns=[("VENDOR_ID", "VENDOR_ID")])', delay: 9900 },
  { text: '>>> [pycelonis] SUCCESS: Inferred 1-to-N cardinality join. Foreign keys established.', delay: 10500 },
  { text: '>>> [pycelonis] Calling: dm.reload()', delay: 11200 },
  { text: '>>> [sys] SUCCESS: Data Model complete! Elapsed: 118s. Celonis Studio ready.', delay: 12000 }
];

const ERNode = ({ title, color, fields }) => (
  <div style={{
    background: '#0A0A0A',
    border: `1px solid ${color}`,
    borderRadius: '8px',
    minWidth: '150px',
    boxShadow: `0 0 10px ${color}33`,
    zIndex: 2,
    position: 'relative'
  }}>
    <div style={{
      background: `${color}1A`,
      padding: '6px 10px',
      borderBottom: `1px solid ${color}`,
      borderTopLeftRadius: '7px',
      borderTopRightRadius: '7px',
      fontSize: '10px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      <Database size={10} color={color} /> {title}
    </div>
    <div style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {fields.map(f => (
        <div key={f.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
          <span style={{ color: f.isKey ? color : '#A0A0A0', fontWeight: f.isKey ? 'bold' : 'normal' }}>
            {f.isKey && '🔑 '}{f.name}
          </span>
          <span style={{ color: '#555555' }}>{f.type}</span>
        </div>
      ))}
    </div>
  </div>
);

function AgentsPage({ setSelectedAgent }) {
  const [activeTab, setActiveTab] = useState('agent1');

  // Agent 1 Playground State
  const [isAgent1Running, setIsAgent1Running] = useState(false);
  const [hasAgent1Run, setHasAgent1Run] = useState(false);
  const [agent1VisibleTables, setAgent1VisibleTables] = useState([]);

  const runAgent1Pipeline = () => {
    if (isAgent1Running) return;
    setIsAgent1Running(true);
    setHasAgent1Run(false);
    setAgent1VisibleTables([]);
    setTimeout(() => {
      setIsAgent1Running(false);
      setHasAgent1Run(true);

      const tables = ['dim_master.csv', 'gold_invoicing_finance.csv', 'gold_procurement_inventory.csv'];
      tables.forEach((t, i) => {
        setTimeout(() => setAgent1VisibleTables(prev => [...prev, t]), i * 500);
      });
    }, 2500);
  };

  // Agent 2 Playground State
  const [terminalConsole, setTerminalConsole] = useState(['Click "Run pycelonis DM Creator" to simulate the automated transformation and ingest pipeline.']);
  const [isConsoleRunning, setIsConsoleRunning] = useState(false);
  const [hasConsoleRun, setHasConsoleRun] = useState(false);
  const [agent2VisibleTables, setAgent2VisibleTables] = useState([]);
  const terminalBottomRef = useRef(null);

  // Agent 2 Top Block State
  const [isAgent2TopRunning, setIsAgent2TopRunning] = useState(false);
  const [hasAgent2TopRun, setHasAgent2TopRun] = useState(false);
  const [agent2TopVisibleTables, setAgent2TopVisibleTables] = useState([]);

  const runAgent2TopPipeline = () => {
    if (isAgent2TopRunning) return;
    setIsAgent2TopRunning(true);
    setHasAgent2TopRun(false);
    setAgent2TopVisibleTables([]);
    setTimeout(() => {
      setIsAgent2TopRunning(false);
      setHasAgent2TopRun(true);

      const tables = ['Activity Table Event Log.csv', 'T1 Procurement Events.csv', 'T2 Finance Events.csv', 'T3 Vendor Master.csv', 'T4 Material Master.csv'];
      tables.forEach((t, i) => {
        setTimeout(() => setAgent2TopVisibleTables(prev => [...prev, t]), i * 500);
      });
    }, 2500);
  };

  // Agent 3 Playground State
  const [selectedA3Query, setSelectedA3Query] = useState('vendor_match_rate');
  const [a3Output, setA3Output] = useState('');
  const [a3Rules, setA3Rules] = useState([]);
  const [a3Loading, setA3Loading] = useState(false);

  // Agent 4 Playground State
  const [a4Loading, setA4Loading] = useState(false);
  const [a4Output, setA4Output] = useState('');

  // Auto Scroll Terminal
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalConsole]);

  // Run Agent 2 console simulator
  const runAgent2Console = () => {
    if (isConsoleRunning) return;
    setIsConsoleRunning(true);
    setHasConsoleRun(false);
    setAgent2VisibleTables([]);
    setTerminalConsole(['[sys] Initializing pycelonis transformation pipeline...']);

    agent2Logs.forEach((log) => {
      setTimeout(() => {
        setTerminalConsole(prev => [...prev, log.text]);
        if (log.text.includes('Activity Table Event Log.csv')) setAgent2VisibleTables(prev => [...prev, 'Activity Table Event Log.csv']);
        if (log.text.includes('Creating T1_PROCUREMENT_EVENTS.csv')) setAgent2VisibleTables(prev => [...prev, 'T1 Procurement Events.csv']);
        if (log.text.includes('Creating T2_FINANCE_EVENTS.csv')) setAgent2VisibleTables(prev => [...prev, 'T2 Finance Events.csv']);
        if (log.text.includes('Creating T3_VENDOR_MASTER.csv')) setAgent2VisibleTables(prev => [...prev, 'T3 Vendor Master.csv']);
        if (log.text.includes('Creating T4_MATERIAL_MASTER.csv')) setAgent2VisibleTables(prev => [...prev, 'T4 Material Master.csv']);

        if (log.text.includes('SUCCESS: Data Model complete!')) {
          setIsConsoleRunning(false);
          setHasConsoleRun(true);
        }
      }, log.delay);
    });
  };

  // Run Agent 3 translation
  const runAgent3Translate = () => {
    if (a3Loading) return;
    setA3Loading(true);
    setA3Output('');
    setA3Rules([]);
    setTimeout(() => {
      setA3Output(agent3Queries[selectedA3Query].pql);
      agent3Queries[selectedA3Query].rules.forEach((rule, i) => {
        setTimeout(() => setA3Rules(prev => [...prev, rule]), i * 400);
      });
      setA3Loading(false);
    }, 1100);
  };

  // Run Agent 4 YAML generation
  const runAgent4Generate = () => {
    setA4Loading(true);
    setA4Output('');
    setTimeout(() => {
      setA4Output(ACTUAL_CELONIS_YAML);
      setA4Loading(false);
    }, 1500);
  };

  return (
    <div className="fc-page">
      <TopHeader onSelectAgent={setSelectedAgent} />

      <div className="fc-page__body" style={{ display: 'flex', height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
        <main className="fc-page__main" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Header Title */}
          <div className="fc-page-title" style={{ marginBottom: 0 }}>
            <p style={{ color: 'var(--ofi-text-sec, #A0A0A0)', marginTop: '4px' }}>
              Interact directly with our intelligent, modular AI agents that automate every step of the Databricks to Celonis process migration.
            </p>
          </div>

          {/* Navigation Tabs Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            background: 'var(--ofi-surface, #0A0A0A)',
            padding: '8px',
            borderRadius: '12px',
            border: '1px solid var(--ofi-border, #1F1F1F)'
          }}
            className="responsive-split"
          >
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setActiveTab(agent.id)}
                style={{
                  padding: '12px 8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === agent.id ? 'var(--ofi-gold-dim, rgba(204, 162, 62, 0.15))' : 'transparent',
                  color: activeTab === agent.id ? 'var(--ofi-gold, #CCA23E)' : 'var(--ofi-text-sec, #A0A0A0)',
                  fontWeight: activeTab === agent.id ? '700' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  transition: 'all 0.2s ease',
                  borderBottom: activeTab === agent.id ? '2px solid var(--ofi-gold, #CCA23E)' : 'none'
                }}
              >
                {React.cloneElement(agent.icon, { size: 16, color: activeTab === agent.id ? 'var(--ofi-gold, #CCA23E)' : 'var(--ofi-text-sec, #A0A0A0)' })}
                {agent.title.split(':')[0]}
              </button>
            ))}
          </div>

          {/* Tab Content Rendering Container */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Agent Info Card */}
            {AGENTS.filter(a => a.id === activeTab).map((agent) => (
              <div
                key={agent.id}
                style={{
                  background: 'var(--ofi-surface, #0A0A0A)',
                  borderRadius: '16px',
                  border: '1px solid var(--ofi-border, #1F1F1F)',
                  padding: '24px',
                  display: 'flex',
                  gap: '24px',
                  alignItems: 'flex-start'
                }}
                className="responsive-split"
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: agent.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {React.cloneElement(agent.iconNode, { size: 36, color: '#000000' })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>{agent.title}</h2>
                    <span style={{
                      fontSize: '11px',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      border: '1px solid var(--ofi-border, #1F1F1F)',
                      color: agent.color
                    }}>
                      {agent.subtitle}
                    </span>
                  </div>

                  <p style={{ fontSize: '13.5px', color: 'var(--ofi-text-sec, #A0A0A0)', lineHeight: '1.6', margin: 0 }}>
                    {agent.desc}
                  </p>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }} className="responsive-split">
                    {agent.features.map((feat, index) => (
                      <span key={index} style={{ fontSize: '12px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={14} color={agent.color} /> {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Agent 1 Tab: Silver -> Gold Playground */}
            {activeTab === 'agent1' && (
              <div style={{
                background: 'var(--ofi-surface, #0A0A0A)',
                borderRadius: '16px',
                border: '1px solid var(--ofi-border, #1F1F1F)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Database size={18} color="var(--ofi-gold, #CCA23E)" /> Raw SAP to Converted Gold Architecture
                  </h3>
                  <button
                    className="btn"
                    onClick={runAgent1Pipeline}
                    disabled={isAgent1Running}
                    style={{
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid var(--ofi-gold, #CCA23E)',
                      color: 'var(--ofi-gold, #CCA23E)',
                      fontWeight: '700',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isAgent1Running ? 'Converting...' : 'Convert Tables'} <Play size={12} fill="var(--ofi-gold, #CCA23E)" />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '20px', minHeight: '300px', alignItems: 'center', justifyContent: 'space-between' }} className="responsive-split">

                  {/* Source Silver SAP Tables */}
                  <div style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                    <div style={{ marginBottom: '12px', color: 'var(--ofi-text-sec, #A0A0A0)', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Input: Silver SAP tables
                    </div>
                    <div style={{ background: '#050505', padding: '20px', borderRadius: '12px', border: '1px solid var(--ofi-border, #1F1F1F)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '8px' }}>
                        {['BKPF.xlsx', 'BSAK.xlsx', 'BSEG.xlsx', 'BSIK.xlsx', 'EBAN.xlsx', 'EBKN.xlsx', 'EINA.xlsx', 'EINE.xlsx', 'EKBE.xlsx', 'EKKN.xlsx', 'EKKO.xlsx', 'EKPO.xlsx', 'FEBEP.xlsx', 'LFA1.xlsx', 'LFB1.xlsx', 'LFM1.xlsx', 'MARA.xlsx', 'MARC.xlsx', 'MARD.xlsx', 'MKPF.xlsx', 'MSEG.xlsx', 'PAYR.xlsx', 'RBKPF.xlsx', 'REGUH.xlsx', 'REGUP.xlsx', 'RSEG.xlsx'].map(t => (
                          <div key={t} style={{ fontSize: '10px', background: '#111', padding: '6px', borderRadius: '4px', color: '#ccc', border: '1px solid #222' }}>{t}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Migration Engine Indicator */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }} className={isAgent1Running ? 'process-engine-anim' : ''}>
                    <div style={{
                      background: 'linear-gradient(90deg, #D4AF37 0%, #A6802B 100%)',
                      borderRadius: '20px',
                      padding: '8px 24px',
                      color: '#000',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      marginBottom: '16px',
                      boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
                    }}>
                      Agent 1 Engine
                    </div>
                    <ArrowRight size={40} color="#D4AF37" style={{ filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.6))' }} />
                  </div>

                  {/* Target Converted Gold Data */}
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ marginBottom: '12px', color: 'var(--ofi-gold, #CCA23E)', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Output: Converted Gold Data
                    </div>
                    <div style={{ background: '#0A0A0A', padding: '16px', borderRadius: '12px', border: '1px solid #1F1F1F', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {!hasAgent1Run && !isAgent1Running && (
                        <div style={{ textAlign: 'center', color: '#555' }}>
                          <Database size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
                          <div style={{ fontSize: '12px' }}>Click "Convert to Gold Data" to process the 26 SAP tables.</div>
                        </div>
                      )}

                      {isAgent1Running && (
                        <div style={{ textAlign: 'center', color: '#CCA23E' }}>
                          <Cpu size={32} style={{ marginBottom: '8px', animation: 'pulse 1.5s infinite' }} />
                          <div style={{ fontSize: '12px', fontWeight: '600', animation: 'pulse 1.5s infinite' }}>Converting 26 tables...</div>
                        </div>
                      )}

                      {hasAgent1Run && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '8px' }}>
                          {agent1VisibleTables.map(t => (
                            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#141414', padding: '12px 16px', borderRadius: '8px', border: '1px solid #222', animation: 'fadeIn 0.5s ease-out' }}>
                              <span style={{ fontSize: '16px' }}>🗂️</span>
                              <span style={{ fontSize: '13px', color: '#E2E8F0', fontWeight: '500' }}>{t}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Agent 2 Tab: Automated Data Model Simulator */}
            {activeTab === 'agent2' && (
              <div style={{
                background: 'var(--ofi-surface, #0A0A0A)',
                borderRadius: '16px',
                border: '1px solid var(--ofi-border, #1F1F1F)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={18} color="var(--ofi-gold, #CCA23E)" /> Interactive Data Model Transformation Console
                  </h3>
                  <button
                    className="btn"
                    onClick={runAgent2TopPipeline}
                    disabled={isAgent2TopRunning}
                    style={{
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid var(--ofi-gold, #CCA23E)',
                      color: 'var(--ofi-gold, #CCA23E)',
                      fontWeight: '700',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isAgent2TopRunning ? 'Transforming...' : 'Transform Data'} <Play size={12} fill="var(--ofi-gold, #CCA23E)" />
                  </button>
                </div>

                {/* Static Flow for Agent 2 */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid var(--ofi-border, #1F1F1F)' }} className="responsive-split">
                  {/* Source Converted Gold Tables */}
                  <div style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                    <div style={{ marginBottom: '12px', color: 'var(--ofi-text-sec, #A0A0A0)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Converted Gold Data
                    </div>
                    <div style={{ background: '#0A0A0A', padding: '16px', borderRadius: '12px', border: '1px solid #1F1F1F', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                      {['dim_master.csv', 'gold_invoicing_finance.csv', 'gold_procurement_inventory.csv'].map(t => (
                        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#141414', padding: '10px 14px', borderRadius: '8px', border: '1px solid #222' }}>
                          <span style={{ fontSize: '14px' }}>🗂️</span>
                          <span style={{ fontSize: '12px', color: '#E2E8F0', fontWeight: '500' }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Migration Engine Indicator */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
                    {isAgent2TopRunning ? (
                      <div style={{ textAlign: 'center', color: '#CCA23E' }}>
                        <Cpu size={32} style={{ marginBottom: '8px', animation: 'pulse 1.5s infinite' }} />
                        <div style={{ fontSize: '12px', fontWeight: '600', animation: 'pulse 1.5s infinite' }}>Transforming...</div>
                      </div>
                    ) : (
                      <ArrowRight size={32} color="#D4AF37" style={{ filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.6))' }} />
                    )}
                  </div>

                  {/* Target Transformed Gold Tables */}
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ marginBottom: '12px', color: '#22C55E', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Transformed Gold Tables
                    </div>
                    <div style={{ background: '#111', padding: '16px', borderRadius: '12px', border: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '180px' }}>
                      {!isAgent2TopRunning && !hasAgent2TopRun && (
                        <div style={{ textAlign: 'center', color: '#555', paddingTop: '20px' }}>
                          <div>Click "Transform Data" to begin.</div>
                        </div>
                      )}
                      {agent2TopVisibleTables.map(t => (
                        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#141414', padding: '12px 16px', borderRadius: '8px', border: '1px solid #222', animation: 'fadeIn 0.5s ease-out' }}>
                          <span style={{ fontSize: '16px' }}>🗂️</span>
                          <span style={{ fontSize: '13px', color: '#E2E8F0', fontWeight: '500' }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Terminal and ER Diagram */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '20px' }}>
                  {/* Console Terminal Screen */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                      background: '#020202',
                      border: '1px solid var(--ofi-border, #1F1F1F)',
                      borderRadius: '12px',
                      fontFamily: 'var(--font-mono)',
                      padding: '20px',
                      height: '350px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.9)'
                    }}>
                      <span style={{ fontSize: '11px', color: 'var(--ofi-text-muted, #555555)', display: 'block', marginBottom: '8px' }}>AGENT 2 EXECUTION LOG:</span>
                      {terminalConsole.map((line, index) => (
                        <div
                          key={index}
                          style={{
                            fontSize: '12px',
                            lineHeight: '1.6',
                            color: line.startsWith('>>> [API]')
                              ? '#3B82F6'
                              : line.startsWith('>>> [pycelonis]')
                                ? '#CCA23E'
                                : line.startsWith('>>> [SQL]')
                                  ? '#A6802B'
                                  : line.includes('SUCCESS')
                                    ? '#22C55E'
                                    : line.startsWith('>>> [sys]')
                                      ? '#E2E8F0'
                                      : '#888888',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {line}
                        </div>
                      ))}
                      <div ref={terminalBottomRef} />
                    </div>

                    <button
                      className="btn"
                      onClick={runAgent2Console}
                      disabled={isConsoleRunning}
                      style={{
                        background: 'var(--ofi-gold, #CCA23E)',
                        color: '#000000',
                        fontWeight: '700',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%'
                      }}
                    >
                      {isConsoleRunning ? 'Executing Pipeline...' : 'Run pycelonis DM Creator'} <Play size={14} fill="#000000" />
                    </button>
                  </div>

                  {/* ER Diagram Image */}
                  <div style={{ background: '#050505', padding: '16px', borderRadius: '12px', border: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#A0A0A0', fontWeight: 'bold', marginBottom: '12px', display: 'block' }}>
                      Data Model
                    </span>
                    <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--ofi-border, #1F1F1F)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', position: 'relative' }}>
                      {!hasConsoleRun ? (
                        <div style={{ color: 'var(--ofi-text-muted, #555555)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                          Execute the DM Creator to generate and view the Data Model.
                        </div>
                      ) : (
                        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '440px' }}>
                          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                            <line x1="50%" y1="50%" x2="25%" y2="20%" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4" opacity="0.6" />
                            <line x1="50%" y1="50%" x2="25%" y2="80%" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4" opacity="0.6" />
                            <line x1="50%" y1="50%" x2="75%" y2="20%" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4" opacity="0.6" />
                            <line x1="50%" y1="50%" x2="75%" y2="80%" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4" opacity="0.6" />
                          </svg>

                          <div style={{ position: 'absolute', top: '15px', left: '15px', transform: 'scale(0.95)', transformOrigin: 'top left' }}>
                            <ERNode title="ACTIVITY_TABLE" color="#3B82F6" fields={[{ name: 'CASE_ID', type: 'PK', isKey: true }]} />
                          </div>

                          <div style={{ position: 'absolute', bottom: '15px', left: '15px', transform: 'scale(0.95)', transformOrigin: 'bottom left' }}>
                            <ERNode title="T2_FINANCE_EVENTS" color="#22C55E" fields={[{ name: 'PO_NUMBER', type: 'FK', isKey: true }]} />
                          </div>

                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 3 }}>
                            <ERNode title="T1_PROCUREMENT_EVENTS" color="#D4AF37" fields={[{ name: 'PO_NUMBER', type: 'PK', isKey: true }, { name: 'VENDOR_NUMBER', type: 'FK', isKey: true }, { name: 'PO_NUMBER', type: 'PK', isKey: true }, { name: 'MATERIAL_NUMBER', type: 'FK', isKey: true }]} />
                          </div>

                          <div style={{ position: 'absolute', top: '15px', right: '15px', transform: 'scale(0.95)', transformOrigin: 'top right' }}>
                            <ERNode title="T3_VENDOR_MASTER" color="#A855F7" fields={[{ name: 'VENDOR_NUMBER', type: 'PK', isKey: true }]} />
                          </div>

                          <div style={{ position: 'absolute', bottom: '15px', right: '15px', transform: 'scale(0.95)', transformOrigin: 'bottom right' }}>
                            <ERNode title="T4_MATERIAL_MASTER" color="#EC4899" fields={[{ name: 'MATERIAL_NUMBER', type: 'PK', isKey: true }]} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Agent 3 Tab: SQL -> PQL Translation Playground */}
            {activeTab === 'agent3' && (
              <div style={{
                background: 'var(--ofi-surface, #0A0A0A)',
                borderRadius: '16px',
                border: '1px solid var(--ofi-border, #1F1F1F)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Languages size={18} color="var(--ofi-gold, #CCA23E)" /> Interactive SQL → Celonis PQL Translator
                </h3>

                <div style={{ display: 'flex', gap: '20px' }} className="responsive-split">

                  {/* Left Block: SQL Selector & Input */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--ofi-text-sec, #A0A0A0)', fontWeight: 'bold' }}>
                        Select Source SQL DAX Measure:
                      </span>
                      <select
                        value={selectedA3Query}
                        onChange={(e) => {
                          setSelectedA3Query(e.target.value);
                          setA3Output('');
                          setA3Rules([]);
                        }}
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          color: '#FFFFFF',
                          border: '1px solid var(--ofi-border, #1F1F1F)',
                          padding: '12px',
                          borderRadius: '8px',
                          fontSize: '13px'
                        }}
                      >
                        <option value="vendor_match_rate">Three-Way Match Rate (SQL Aggregate)</option>
                        <option value="po_rejection_ratios">On-Time Delivery Rate (SUM CASE WHEN)</option>
                        <option value="average_days_to_pay_grouped">Average Days to Pay (Direct Average)</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--ofi-text-muted, #555555)', fontWeight: 'bold' }}>
                        Source SQL Logic:
                      </span>
                      <pre style={{
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid var(--ofi-border, #1F1F1F)',
                        padding: '16px',
                        borderRadius: '8px',
                        color: '#E2E8F0',
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        whiteSpace: 'pre-wrap',
                        overflowX: 'auto',
                        lineHeight: '1.4',
                        flex: 1
                      }}>
                        {agent3Queries[selectedA3Query].sql}
                      </pre>
                    </div>

                    <button
                      className="btn"
                      onClick={runAgent3Translate}
                      disabled={a3Loading}
                      style={{
                        background: 'var(--ofi-gold, #CCA23E)',
                        color: '#000000',
                        fontWeight: '700',
                        padding: '14px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {a3Loading ? 'Running translation engine...' : 'Translate to PQL'} <Play size={14} fill="#000000" />
                    </button>
                  </div>

                  {/* Right Block: Translated PQL Output & Translation Rules */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--ofi-text-sec, #A0A0A0)', fontWeight: 'bold' }}>
                        Target Celonis Process Query Language (PQL):
                      </span>
                      <div style={{
                        background: '#040404',
                        border: '1px solid var(--ofi-border, #1F1F1F)',
                        borderRadius: '8px',
                        padding: '16px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12.5px',
                        color: '#22C55E',
                        lineHeight: '1.5',
                        minHeight: '180px',
                        position: 'relative'
                      }}>
                        {a3Loading && (
                          <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', gap: '12px'
                          }}>
                            <div className="typing-dot" style={{ width: '10px', height: '10px', background: 'var(--ofi-gold, #CCA23E)' }} />
                            <span style={{ fontSize: '11px', color: 'var(--ofi-text-sec, #A0A0A0)' }}>Querying PQL Knowledge Base (RAG)...</span>
                          </div>
                        )}

                        {!a3Loading && !a3Output && (
                          <div style={{ color: 'var(--ofi-text-muted, #555555)', textAlign: 'center', paddingTop: '60px' }}>
                            Click "Translate to PQL" to compile.
                          </div>
                        )}

                        {!a3Loading && a3Output && (
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {a3Output}
                          </pre>
                        )}
                      </div>
                    </div>

                    {/* Key Translation Rules */}
                    {a3Rules.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--ofi-text-sec, #A0A0A0)', fontWeight: 'bold' }}>
                          Applied AI Mapping Rules:
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {a3Rules.map((rule, idx) => (
                            <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--ofi-border, #1F1F1F)' }}>
                              <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--ofi-gold, #CCA23E)', display: 'block', marginBottom: '2px' }}>
                                {idx + 1}. {rule.rule}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--ofi-text-sec, #A0A0A0)', lineHeight: '1.3' }}>
                                {rule.desc}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Agent 4 Tab: TMDL -> YAML Playground */}
            {activeTab === 'agent4' && (
              <div style={{
                background: 'var(--ofi-surface, #0A0A0A)',
                borderRadius: '16px',
                border: '1px solid var(--ofi-border, #1F1F1F)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Code size={18} color="var(--ofi-gold, #CCA23E)" /> Final Dashboard YAML Generator
                  </h3>
                  <button
                    className="btn"
                    onClick={runAgent4Generate}
                    disabled={a4Loading}
                    style={{
                      background: 'var(--ofi-gold, #CCA23E)',
                      color: '#000000',
                      fontWeight: '700',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '13px'
                    }}
                  >
                    {a4Loading ? 'Parsing TMDL & PQL...' : 'Generate Full Celonis YAML'} <Play size={14} fill="#000000" />
                  </button>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--ofi-text-sec, #A0A0A0)', marginBottom: '8px' }}>
                  Agent 4 ingests the structural definitions from PowerBI and the translated metrics from Agent 3 to generate the massive native Knowledge Model definition code.
                </p>

                {/* YAML Output Editor Box */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{
                    background: '#040404',
                    border: '1px solid var(--ofi-border, #1F1F1F)',
                    borderRadius: '8px',
                    padding: '16px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: '#E2E8F0',
                    lineHeight: '1.5',
                    height: '400px',
                    position: 'relative',
                    overflowY: 'auto'
                  }}>
                    {a4Loading && (
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '12px'
                      }}>
                        <div className="typing-dot" style={{ width: '10px', height: '10px', background: 'var(--ofi-gold, #CCA23E)' }} />
                        <span style={{ fontSize: '11px', color: 'var(--ofi-text-sec, #A0A0A0)' }}>Agent 4 compiling 724 lines of YAML definition...</span>
                      </div>
                    )}

                    {!a4Loading && !a4Output && (
                      <div style={{ color: 'var(--ofi-text-muted, #555555)', textAlign: 'center', paddingTop: '150px' }}>
                        Click "Generate Full Celonis YAML" to extract and view the final result.
                      </div>
                    )}

                    {!a4Loading && a4Output && (
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#D4AF37' }}>
                        {a4Output}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

        </main>
      </div>
    </div>
  );
}

export default AgentsPage;
