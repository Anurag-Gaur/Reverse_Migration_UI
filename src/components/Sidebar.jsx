import React, { useState } from 'react';
import { LayoutDashboard, Compass, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/sidebar.css';

import { AGENTS } from '../config/agents.jsx';

function Sidebar({ collapsed = false, setCollapsed, onSelectAgent }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [agentsOpen, setAgentsOpen] = useState(false);

  // Compute active navigation page
  const activePage = 
    location.pathname === '/' || location.pathname === '/dashboard' 
      ? 'dashboard' 
      : 'agents';

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Header with Brand Logo and Sidebar Toggle */}
      <div className="sidebar__logo-header">
        {!collapsed && (
          <div className="sidebar__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="sidebar__brand-container" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="sidebar__brand">
                <span className="sidebar__brand-akzo" style={{ color: 'var(--ofi-gold, #CCA23E)' }}>OFI</span>
                <span className="sidebar__brand-nobel">Services</span>
              </div>
              <div className="sidebar__tagline">Intelligent Migration</div>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="sidebar__brand-mini" onClick={() => navigate('/')} style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '20px' }}>
            <span style={{ color: 'var(--ofi-gold, #CCA23E)' }}>O</span>
            <span style={{ color: '#FFFFFF' }}>F</span>
            <span style={{ color: '#FFFFFF' }}>I</span>
          </div>
        )}

        <button
          className="sidebar__toggle-v2"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Open sidebar" : "Close sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="sidebar__nav">
        {/* Overview Dashboard */}
        <button
          className={`nav-item ${activePage === 'dashboard' ? 'nav-item--active' : ''}`}
          onClick={() => navigate('/')}
          title={collapsed ? "Overview Dashboard" : ""}
        >
          <div className="nav-icon-wrapper">
            <LayoutDashboard size={20} />
          </div>
          {!collapsed && <span>Overview Dashboard</span>}
        </button>

        {/* Agents Showroom */}
        <button
          className={`nav-item ${activePage === 'agents' ? 'nav-item--active' : ''}`}
          onClick={() => navigate('/agents')}
          title={collapsed ? "Agents Showroom" : ""}
        >
          <div className="nav-icon-wrapper">
            <Compass size={20} />
          </div>
          {!collapsed && <span>Agents Showroom</span>}
        </button>


      </div>

      {/* Spacer to push footer down */}
      <div style={{ flex: 1 }} />

      {/* Footer Branding */}
      <div className="sidebar__footer" style={{ borderTop: '1px solid var(--ofi-border, #1F1F1F)', padding: '16px' }}>
        {!collapsed ? (
          <div className="sidebar__user-card" style={{ background: 'transparent', padding: '0px' }}>
            <div className="sidebar__user-email" style={{ fontSize: '11px', color: 'var(--ofi-text-sec, #A0A0A0)' }}>OFI Services Practice</div>
            <div className="sidebar__user-role" style={{ color: 'var(--ofi-gold, #CCA23E)', fontWeight: 'bold', fontSize: '10px' }}>PROCESS INTELLIGENCE</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--ofi-gold, #CCA23E)', fontSize: '10px', fontWeight: 'bold' }}>
            OFI
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
