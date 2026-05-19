import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/Dashboard';
import AgentsPage from './pages/Agents';
import { AGENTS } from './config/agents.jsx';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);

  // Auto-collapse sidebar when an agent is selected (helps on small screens or focused chats)
  useEffect(() => {
    if (selectedAgent && window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    }
  }, [selectedAgent]);

  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <DashboardPage
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            setSelectedAgent={setSelectedAgent}
          />
        }
      />
      <Route
        path="/agents"
        element={
          <AgentsPage
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
          />
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
