import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeContextProvider } from './contexts/ThemeContext';
import Dashboard from './components/Dashboard';
import Upload from './pages/Upload';
import QueueDetection from './pages/QueueDetection';
import EmergencyDetection from './pages/EmergencyDetection';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/queue-detection" element={<QueueDetection />} />
          <Route path="/emergency" element={<EmergencyDetection />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </ThemeContextProvider>
  );
}

export default App;
