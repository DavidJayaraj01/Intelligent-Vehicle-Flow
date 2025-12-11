import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  Activity,
  AlertTriangle,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  selectedCamera: string | null;
  onCameraSelect: (cameraId: string) => void;
}

const cameras = [
  { id: 'cam01', name: 'Main Intersection North', status: 'active' as const },
  { id: 'cam02', name: 'Highway Entry Point', status: 'active' as const },
  { id: 'cam03', name: 'City Center Junction', status: 'active' as const },
  { id: 'cam04', name: 'Airport Road Gate', status: 'maintenance' as const },
];

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'upload', label: 'Upload', icon: Upload, path: '/upload' },
  { id: 'queue-detection', label: 'Queue Detection', icon: Activity, path: '/queue-detection' },
  { id: 'emergency', label: 'Emergency', icon: AlertTriangle, path: '/emergency' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle, selectedCamera, onCameraSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const content = (
    <div className="flex flex-col h-full bg-card text-foreground">
      {/* Logo & Toggle */}
      <div className={cn(
        "flex items-center border-b border-border px-4 py-4 min-h-16",
        open ? "justify-between" : "justify-center"
      )}>
        {open && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-green-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm font-mono">VFA</span>
            </div>
            <div>
              <div className="text-sm font-bold leading-none mb-1 font-mono">VFA</div>
              <div className="text-xs text-green-400 leading-none font-mono">VEHICLE FLOW</div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hover:bg-muted"
        >
          {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="py-2 flex-1 overflow-y-auto">
        {open && (
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Menu
          </div>
        )}
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-mono text-sm",
                  "hover:bg-accent hover:text-accent-foreground hover:translate-x-1",
                  open ? "justify-start" : "justify-center",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/30 shadow-lg shadow-primary/20"
                    : "text-muted-foreground border border-transparent"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {open && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Camera Feeds */}
        {open && (
          <div className="mt-6">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              Cameras
            </div>
            <div className="px-2 space-y-1">
              {cameras.map((camera) => {
                const isSelected = selectedCamera === camera.id;
                return (
                  <button
                    key={camera.id}
                    onClick={() => onCameraSelect(camera.id)}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      "hover:bg-accent hover:translate-x-1",
                      isSelected
                        ? "bg-green-500/10 border border-green-500/30"
                        : "border border-transparent"
                    )}
                  >
                    <Video className={cn(
                      "h-5 w-5 flex-shrink-0 mt-0.5",
                      isSelected ? "text-green-400" : "text-muted-foreground"
                    )} />
                    <div className="flex-1 min-w-0 text-left">
                      <div className={cn(
                        "text-sm font-mono truncate",
                        isSelected ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
                        {camera.id.toUpperCase()}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {camera.name}
                      </div>
                      <div className={cn(
                        "inline-block mt-1 px-2 py-0.5 rounded text-xs font-mono uppercase",
                        camera.status === 'active'
                          ? "bg-green-500/10 text-green-400 border border-green-500/30"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                      )}>
                        {camera.status}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* System Status */}
      {open && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground font-mono">SYSTEM ACTIVE</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono mt-1">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:block fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-40",
          open ? "w-[280px]" : "w-16"
        )}
      >
        {content}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          onClick={onToggle}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "md:hidden fixed left-0 top-0 h-screen w-[280px] bg-card border-r border-border transition-transform duration-300 z-50",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {content}
      </aside>
    </>
  );
};

export default Sidebar;

