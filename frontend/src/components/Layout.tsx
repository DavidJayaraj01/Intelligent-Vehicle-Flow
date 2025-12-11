import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    onRefresh?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Vehicle Flow Analyzer' }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#000000' }}>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    background: '#000000',
                    backdropFilter: 'none',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    mb: 0,
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', py: 2.5, px: { xs: 2, md: 4 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 48,
                                height: 48,
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                                boxShadow: '0 8px 24px rgba(14, 165, 233, 0.25)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 12px 32px rgba(14, 165, 233, 0.35)',
                                    transform: 'translateY(-2px)',
                                },
                            }}
                        >
                            <DashboardIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />
                        </Box>
                        <Box>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    fontWeight: 900,
                                    fontSize: '1.35rem',
                                    color: '#ffffff',
                                    letterSpacing: '-0.5px',
                                }}
                            >
                                {title}
                            </Typography>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    letterSpacing: '0.3px',
                                }}
                            >
                                Intelligent Traffic Intelligence
                            </Typography>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, py: 6, flex: 1, bgcolor: '#000000' }}>
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
