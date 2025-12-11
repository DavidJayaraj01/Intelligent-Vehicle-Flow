import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Introduction from './sections/Introduction';
import Features from './sections/Features';
import Architecture from './sections/Architecture';
import TechStack from './sections/TechStack';
import QuickStart from './sections/QuickStart';
import SetupOptions from './sections/SetupOptions';
import Configuration from './sections/Configuration';
import ApiDocumentation from './sections/ApiDocumentation';
import ProjectStructure from './sections/ProjectStructure';
import Scripts from './sections/Scripts';
import Troubleshooting from './sections/Troubleshooting';
import FAQ from './sections/FAQ';
import Contributors from './sections/Contributors';
import License from './sections/License';
import Contributing from './sections/Contributing';

function App() {
  const [activeSection, setActiveSection] = useState('introduction');

  const renderSection = () => {
    switch (activeSection) {
      case 'introduction':
        return <Introduction />;
      case 'features':
        return <Features />;
      case 'architecture':
        return <Architecture />;
      case 'tech-stack':
        return <TechStack />;
      case 'quick-start':
        return <QuickStart />;
      case 'setup-options':
        return <SetupOptions />;
      case 'configuration':
        return <Configuration />;
      case 'api-documentation':
        return <ApiDocumentation />;
      case 'project-structure':
        return <ProjectStructure />;
      case 'scripts':
        return <Scripts />;
      case 'troubleshooting':
        return <Troubleshooting />;
      case 'faq':
        return <FAQ />;
      case 'contributors':
        return <Contributors />;
      case 'license':
        return <License />;
      case 'contributing':
        return <Contributing />;
      default:
        return <Introduction />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="lg:ml-72 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto animate-fade-in">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}

export default App;
