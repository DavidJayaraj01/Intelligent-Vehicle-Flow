import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Button, Container } from '@mui/material';
import { Logout, Refresh, Dashboard as DashboardIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { removeApiKey } from '../utils/auth';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    onRefresh?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Vehicle Flow Analyzer', onRefresh }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        removeApiKey();
        navigate('/');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'transparent' }}>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <DashboardIcon sx={{ color: '#38bdf8' }} />
                        <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#f8fafc' }}>
                            {title}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {onRefresh && (
                            <IconButton onClick={onRefresh} sx={{ color: '#94a3b8', '&:hover': { color: '#f8fafc' } }}>
                                <Refresh />
                            </IconButton>
                        )}
                        <Button
                            onClick={handleLogout}
                            startIcon={<Logout />}
                            sx={{
                                color: '#94a3b8',
                                '&:hover': { color: '#f8fafc', bgcolor: 'rgba(255,255,255,0.05)' }
                            }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
                {children}
            </Container>
        </Box>
    );
};

export default Layout;
