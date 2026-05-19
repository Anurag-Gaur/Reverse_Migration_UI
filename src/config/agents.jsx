import React from 'react';
import { Network, Code, Languages, Database, ShieldCheck } from 'lucide-react';

export const AGENTS = [
  { 
    id: 'agent1',
    icon: <Network size={20} color="#CCA23E" />,
    iconNode: <Network size={28} strokeWidth={1.5} color="#CCA23E" />, 
    title: 'Agent 1: Silver → Gold Orchestrator', 
    subtitle: 'Table Schema & Joining',
    desc: 'Reads data model spec, groups 30 SAP tables by process, resolves join keys, casts, aggregates, and flattens nested SQL into 4 clean Gold tables.',
    features: ['Schema Mapping', 'Join Resolution', 'KPI Pre-computing'],
    color: '#CCA23E',
    gradient: 'linear-gradient(135deg, #CCA23E 0%, #D4AF37 100%)',
    bgColor: '#0A0A0A'
  },
  { 
    id: 'agent2',
    icon: <Database size={20} color="#D4AF37" />,
    iconNode: <Database size={28} strokeWidth={1.5} color="#D4AF37" />, 
    title: 'Agent 2: Automated Data Model',    
    subtitle: 'Celonis EMS Automated Setup',
    desc: 'Automates creation of Celonis Data Pools, adds Databricks tables, establishes foreign keys, configures case/activity parameters, and triggers model reloads.',
    features: ['Data Pool Creation', 'API-driven Joins', 'Case/Activity Setup'],
    color: '#D4AF37',
    gradient: 'linear-gradient(135deg, #A6802B 0%, #CCA23E 100%)',
    bgColor: '#0A0A0A'
  },
  { 
    id: 'agent3',
    icon: <Languages size={20} color="#B8963A" />,
    iconNode: <Languages size={28} strokeWidth={1.5} color="#B8963A" />, 
    title: 'Agent 3: SQL → PQL Translator',    
    subtitle: 'Process Mining Query Translation',
    desc: 'Translates complex nested SQL queries and subqueries into Celonis Process Query Language (PQL) using advanced RAG and strict mapping rules.',
    features: ['RAG on PQL Docs', 'Syntax Validation Pass', 'Event-log Column Awareness'],
    color: '#B8963A',
    gradient: 'linear-gradient(135deg, #CCA23E 0%, #85641C 100%)',
    bgColor: '#0A0A0A'
  },
  { 
    id: 'agent4',
    icon: <Code size={20} color="#A6802B" />,
    iconNode: <Code size={28} strokeWidth={1.5} color="#A6802B" />, 
    title: 'Agent 4: TMDL → Celonis YAML',  
    subtitle: 'PBI Dashboard KPI Extractor',
    desc: 'Parses Power BI .tmdl/.bim files, extracts DAX measures, structures tables/relationships, and generates Celonis Knowledge Model YAML definitions.',
    features: ['DAX to PQL Dict Mapping', 'YAML Template Generation', 'pycelonis YAML Push'],
    color: '#A6802B',
    gradient: 'linear-gradient(135deg, #D4AF37 0%, #85641C 100%)',
    bgColor: '#0A0A0A'
  }
];
