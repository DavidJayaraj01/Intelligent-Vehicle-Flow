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
  { id: 'analytics', label: 'Analytics', icon: Timeline, path: '/analytics' },
  { id: 'reports', label: 'Reports', icon: Assessment, path: '/reports' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle, selectedCamera, onCameraSelect }) => {
  const drawerWidth = 200;
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
              <ListItem key={item.id} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: '8px',
                    py: 1,
                    px: 1.5,
                    minHeight: 40,
                    justifyContent: open ? 'flex-start' : 'center',
                    color: isActive ? '#0ea5e9' : 'rgba(255, 255, 255, 0.6)',
                    bgcolor: isActive ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                    '&:hover': {
                      color: '#ffffff',
                      bgcolor: 'rgba(14, 165, 233, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'inherit',
                      minWidth: open ? 36 : 0,
                      justifyContent: 'center',
                    }}
                  >
                    <Icon sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 600 : 400,
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
        <Box sx={{ py: 1, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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
            Camera Feeds
          </Typography>
          <List sx={{ px: 1, flex: 1, overflow: 'auto' }}>
            {cameras.map((camera) => {
              const isSelected = selectedCamera === camera.id;
              return (
                <ListItem key={camera.id} disablePadding sx={{ mb: 0.25 }}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => onCameraSelect(camera.id)}
                    sx={{
                      borderRadius: '8px',
                      py: 0.75,
                      px: 1.5,
                      color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                      bgcolor: isSelected ? 'rgba(14, 165, 233, 0.12)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(14, 165, 233, 0.08)',
                        color: '#ffffff',
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(14, 165, 233, 0.12)',
                        '&:hover': {
                          bgcolor: 'rgba(14, 165, 233, 0.15)',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                      <Videocam sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 500 : 400,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {camera.name}
                      </Typography>
                      <Chip
                        label={camera.status}
                        size="small"
                        sx={{
                          mt: 0.25,
                          height: 16,
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          bgcolor:
                            camera.status === 'active'
                              ? 'rgba(34, 197, 94, 0.15)'
                              : 'rgba(251, 191, 36, 0.15)',
                          color: camera.status === 'active' ? '#22c55e' : '#fbbf24',
                          '& .MuiChip-label': {
                            px: 0.75,
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

