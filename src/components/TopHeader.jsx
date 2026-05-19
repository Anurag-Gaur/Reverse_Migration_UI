import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Compass, Menu, X
} from 'lucide-react';
import OfiLogo from './OfiLogo';
import '../styles/topheader.css';

function TopHeader({ onSelectAgent }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Compute active navigation page
  const activePage =
    location.pathname === '/' || location.pathname === '/dashboard'
      ? 'dashboard'
      : 'agents';

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest('.fc-hamburger-btn')
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Top Header Navigation */}
      <header className="fc-header">
        <div className="fc-main-nav">
          <div className="fc-main-nav__inner">

            {/* Brand Logo */}
            <OfiLogo
              size="default"
              showTagline
              onClick={() => navigate('/dashboard')}
            />

            {/* Desktop Navigation Links */}
            <nav className="fc-nav">
              <button
                className={`fc-nav__item ${activePage === 'dashboard' ? 'fc-nav__item--active' : ''}`}
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>

              <button
                className={`fc-nav__item ${activePage === 'agents' ? 'fc-nav__item--active' : ''}`}
                onClick={() => navigate('/agents')}
              >
                AI Agents
              </button>


            </nav>

            {/* Hamburger Button for Mobile View */}
            <div className="fc-nav__right">
              <button
                className="fc-hamburger-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title="Menu"
                aria-label="Open sidebar menu"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Decorative design wave line */}
          <div className="fc-header__wave" style={{ background: 'var(--ofi-gold, #CCA23E)' }} />
        </div>
      </header>

      {/* Mobile Slide-in Backdrop */}
      {sidebarOpen && (
        <div
          className="fc-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Slide-in Mobile Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fc-sidebar ${sidebarOpen ? 'fc-sidebar--open' : ''}`}
      >
        <div className="fc-sidebar__header">
          <OfiLogo size="small" showTagline={false} />
          <button
            className="fc-sidebar__close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="fc-sidebar__divider" />

        {/* Mobile Navigation Links */}
        <div className="fc-sidebar__section-label">Navigation</div>
        <nav className="fc-sidebar__nav">
          <button
            className={`fc-sidebar__item ${activePage === 'dashboard' ? 'fc-sidebar__item--active' : ''}`}
            onClick={() => handleNav('/dashboard')}
          >
            <div className="fc-sidebar__item-icon">
              <LayoutDashboard size={18} />
            </div>
            <span>Dashboard Overview</span>
          </button>

          <button
            className={`fc-sidebar__item ${activePage === 'agents' ? 'fc-sidebar__item--active' : ''}`}
            onClick={() => handleNav('/agents')}
          >
            <div className="fc-sidebar__item-icon">
              <Compass size={18} />
            </div>
            <span>Agents Showroom</span>
          </button>


        </nav>

        <div className="fc-sidebar__divider" />

        <div className="fc-sidebar__footer" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--ofi-gold, #CCA23E)', fontWeight: 'bold' }}>
            OFI Services Practice
          </div>
          <div style={{ fontSize: '10px', color: 'var(--ofi-text-sec, #A0A0A0)', marginTop: '4px' }}>
            © 2026 Process Intelligence
          </div>
        </div>
      </aside>
    </>
  );
}

export default TopHeader;
