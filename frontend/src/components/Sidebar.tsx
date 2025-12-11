import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Videocam,
  Timeline,
  Assessment,
  Settings,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  QueuePlayNext,
  LocalHospital,
} from '@mui/icons-material';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  selectedCamera: string | null;
  onCameraSelect: (cameraId: string) => void;
}

const cameras = [
  { id: 'cam01', name: 'Main Intersection North', status: 'active' },
  { id: 'cam02', name: 'Highway Entry Point', status: 'active' },
  { id: 'cam03', name: 'City Center Junction', status: 'active' },
  { id: 'cam04', name: 'Airport Road Gate', status: 'maintenance' },
];

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { id: 'upload', label: 'Upload', icon: CloudUpload, path: '/upload' },
  { id: 'queue-detection', label: 'Queue Detection', icon: QueuePlayNext, path: '/queue-detection' },
  { id: 'emergency', label: 'Emergency', icon: LocalHospital, path: '/emergency' },
  { id: 'analytics', label: 'Analytics', icon: Timeline, path: '/analytics' },
  { id: 'reports', label: 'Reports', icon: Assessment, path: '/reports' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle, selectedCamera, onCameraSelect }) => {
  const drawerWidth = 280;
  const collapsedWidth = 64;
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          boxSizing: 'border-box',
          transition: 'width 0.2s ease-in-out',
          backgroundColor: '#0f172a',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          color: 'white',
          overflowX: 'hidden',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        },
      }}
    >
      {/* Logo & Toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: open ? 2 : 1,
          py: 2,
          minHeight: 64,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>VF</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2 }}>
                Vehicle Flow
              </Typography>
              <Typography sx={{ color: '#22c55e', fontWeight: 600, fontSize: '0.75rem', lineHeight: 1.2 }}>
                Analyzer
              </Typography>
            </Box>
          </Box>
        )}
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
            '&:hover': {
              color: '#0ea5e9',
              bgcolor: 'rgba(14, 165, 233, 0.1)',
            },
          }}
        >
          {open ? <ChevronLeft fontSize="small" /> : <ChevronRight fontSize="small" />}
        </IconButton>
      </Box>

      {/* Navigation */}
      <Box sx={{ py: 1 }}>
        {open && (
          <Typography
            sx={{
              px: 2,
              py: 1,
              fontSize: '0.65rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.35)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Menu
          </Typography>
        )}
        <List sx={{ px: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: '12px',
                    py: 1.5,
                    px: 2,
                    minHeight: 48,
                    justifyContent: open ? 'flex-start' : 'center',
                    color: isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)',
                    background: isActive ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.1))' : 'transparent',
                    border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      color: '#ffffff',
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(139, 92, 246, 0.08))',
                      borderColor: 'rgba(59, 130, 246, 0.2)',
                      transform: 'translateX(4px)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '3px',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      opacity: isActive ? 1 : 0,
                      transition: 'opacity 0.3s',
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'inherit',
                      minWidth: open ? 40 : 0,
                      justifyContent: 'center',
                    }}
                  >
                    <Icon sx={{ fontSize: 22 }} />
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        fontWeight: isActive ? 700 : 500,
                        letterSpacing: '0.02em',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Camera Feeds */}
      {open && (
        <Box sx={{ py: 2, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Typography
            sx={{
              px: 2,
              py: 1,
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.4)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Camera Feeds
          </Typography>
          <List sx={{ px: 1, flex: 1, overflow: 'auto' }}>
            {cameras.map((camera) => {
              const isSelected = selectedCamera === camera.id;
              return (
                <ListItem key={camera.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => onCameraSelect(camera.id)}
                    sx={{
                      borderRadius: '12px',
                      py: 1.25,
                      px: 2,
                      color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                      background: isSelected ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1))' : 'transparent',
                      border: isSelected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
                        borderColor: 'rgba(16, 185, 129, 0.2)',
                        color: '#ffffff',
                        transform: 'translateX(4px)',
                      },
                      '&.Mui-selected': {
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1))',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(6, 182, 212, 0.12))',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                      <Videocam sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: '0.85rem',
                          fontWeight: isSelected ? 600 : 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          mb: 0.5,
                        }}
                      >
                        {camera.name}
                      </Typography>
                      <Chip
                        label={camera.status}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          background:
                            camera.status === 'active'
                              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.15))'
                              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.15))',
                          color: camera.status === 'active' ? '#10b981' : '#f59e0b',
                          border: `1px solid ${camera.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          '& .MuiChip-label': {
                            px: 1,
                          },
                        }}
                      />
                    </Box>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
      
      {/* Spacer for collapsed state */}
      {!open && <Box sx={{ flex: 1 }} />}
    </Drawer>
  );
};

export default Sidebar;

