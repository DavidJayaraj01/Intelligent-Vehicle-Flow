import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
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

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle, selectedCamera, onCameraSelect }) => {
  const drawerWidth = 280;
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 72,
        flexShrink: 0,
        transition: 'width 0.3s',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 72,
          boxSizing: 'border-box',
          transition: 'width 0.3s',
          backgroundColor: '#000000',
          backdropFilter: 'none',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          color: 'white',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Header with Toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'transparent',
        }}
      >
        {open && (
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem', letterSpacing: '0.8px' }}>
            NAVIGATION
          </Typography>
        )}
        <IconButton 
          onClick={onToggle} 
          size="small"
          sx={{ 
            color: '#64748b',
            transition: 'all 0.3s ease',
            '&:hover': { 
              color: '#0ea5e9',
              background: 'rgba(14, 165, 233, 0.1)',
            }
          }}
        >
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => navigate('/dashboard')}
            sx={{
              borderRadius: '8px',
              mb: 1,
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: open ? 56 : 'auto' }}>
              <DashboardIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Dashboard" />}
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => navigate('/upload')}
            sx={{
              borderRadius: '8px',
              mb: 1,
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: open ? 56 : 'auto' }}>
              <CloudUpload />
            </ListItemIcon>
            {open && <ListItemText primary="Upload" />}
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            sx={{
              borderRadius: '8px',
              mb: 1,
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: open ? 56 : 'auto' }}>
              <Timeline />
            </ListItemIcon>
            {open && <ListItemText primary="Analytics" />}
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            sx={{
              borderRadius: '8px',
              mb: 1,
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: open ? 56 : 'auto' }}>
              <Assessment />
            </ListItemIcon>
            {open && <ListItemText primary="Reports" />}
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            sx={{
              borderRadius: '8px',
              mb: 1,
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: open ? 56 : 'auto' }}>
              <Settings />
            </ListItemIcon>
            {open && <ListItemText primary="Settings" />}
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.08)', my: 2 }} />

      {/* Camera List */}
      {open && (
        <>
          <Box sx={{ px: 2, mb: 2 }}>
            <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, letterSpacing: '0.5px' }}>
              Camera Feeds
            </Typography>
          </Box>

          <List sx={{ px: 1 }}>
            {cameras.map((camera) => (
              <ListItem key={camera.id} disablePadding>
                <ListItemButton
                  selected={selectedCamera === camera.id}
                  onClick={() => onCameraSelect(camera.id)}
                  sx={{
                    borderRadius: '8px',
                    mb: 1,
                    transition: 'all 0.2s ease',
                    color: selectedCamera === camera.id ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                    backgroundColor: selectedCamera === camera.id ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    border: selectedCamera === camera.id ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 56 }}>
                    <Videocam />
                  </ListItemIcon>
                  <ListItemText
                    primary={camera.name}
                    secondary={
                      <Chip
                        label={camera.status}
                        size="small"
                        sx={{
                          mt: 0.5,
                          height: 20,
                          backgroundColor:
                            camera.status === 'active'
                              ? 'rgba(34, 197, 94, 0.2)'
                              : 'rgba(251, 191, 36, 0.2)',
                          color: camera.status === 'active' ? '#22c55e' : '#fbbf24',
                          fontWeight: 600,
                        }}
                      />
                    }
                    secondaryTypographyProps={{
                      component: 'div',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Drawer>
  );
};

export default Sidebar;
