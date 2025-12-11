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
          backgroundColor: '#1e293b',
          color: 'white',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Toggle Button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-end' : 'center',
          p: 2,
        }}
      >
        <IconButton onClick={onToggle} sx={{ color: 'white' }}>
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Box>

      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation Menu */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/dashboard')}>
            <ListItemIcon sx={{ color: 'white', minWidth: open ? 56 : 'auto' }}>
              <DashboardIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Dashboard" />}
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/upload')}>
            <ListItemIcon sx={{ color: 'white', minWidth: open ? 56 : 'auto' }}>
              <CloudUpload />
            </ListItemIcon>
            {open && <ListItemText primary="Upload" />}
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: 'white', minWidth: open ? 56 : 'auto' }}>
              <Timeline />
            </ListItemIcon>
            {open && <ListItemText primary="Analytics" />}
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: 'white', minWidth: open ? 56 : 'auto' }}>
              <Assessment />
            </ListItemIcon>
            {open && <ListItemText primary="Reports" />}
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: 'white', minWidth: open ? 56 : 'auto' }}>
              <Settings />
            </ListItemIcon>
            {open && <ListItemText primary="Settings" />}
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', my: 2 }} />

      {/* Camera List */}
      {open && (
        <>
          <Box sx={{ px: 2, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              CAMERA FEEDS
            </Typography>
          </Box>

          <List>
            {cameras.map((camera) => (
              <ListItem key={camera.id} disablePadding>
                <ListItemButton
                  selected={selectedCamera === camera.id}
                  onClick={() => onCameraSelect(camera.id)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.3)',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 56 }}>
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
