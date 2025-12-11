import { useState } from 'react';
import { BookOpen, Zap, Box, Layers, Rocket, Settings, Code, FileText, Folder, Terminal, AlertCircle, HelpCircle, Users, Scale, GitPullRequest, Menu, X, Car } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: 'introduction', label: 'Introduction', icon: BookOpen },
  { id: 'features', label: 'Features', icon: Zap },
  { id: 'architecture', label: 'Architecture', icon: Box },
  { id: 'tech-stack', label: 'Tech Stack', icon: Layers },
  { id: 'quick-start', label: 'Quick Start', icon: Rocket },
  { id: 'setup-options', label: 'Setup Options', icon: Settings },
  { id: 'configuration', label: 'Configuration', icon: Settings },
  { id: 'api-documentation', label: 'API Documentation', icon: Code },
  { id: 'project-structure', label: 'Project Structure', icon: Folder },
  { id: 'scripts', label: 'Scripts', icon: Terminal },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertCircle },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'contributors', label: 'Contributors', icon: Users },
  { id: 'license', label: 'License', icon: Scale },
  { id: 'contributing', label: 'Contributing', icon: GitPullRequest },
];

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSectionChange = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg hover:bg-slate-800 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white overflow-y-auto border-r border-slate-700 shadow-2xl z-40 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-blue-600/10 to-indigo-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Vehicle Flow</h1>
              <p className="text-xs text-blue-300 font-medium">Analyzer</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">AI Traffic Intelligence Platform</p>
        </div>

        <nav className="px-3 py-4">
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
              Documentation
            </p>
          </div>
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all mb-1 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                <span className="flex-1 text-left">{section.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 m-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-500/20">
          <p className="text-xs text-slate-400 mb-2">Version 2.0.0</p>
          <p className="text-xs text-slate-500">© 2025 All rights reserved</p>
        </div>
      </aside>
    </>
  );
}
