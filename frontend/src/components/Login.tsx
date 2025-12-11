import React, { useState } from 'react';
import { Card, CardContent, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { Lock as LockIcon, ArrowForward } from '@mui/icons-material';
import { saveApiKey } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    saveApiKey(apiKey);
    navigate('/dashboard');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0a0e1a 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Effects */}
      <Box className="animated-gradient"
        sx={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)',
          filter: 'blur(80px)',
          borderRadius: '50%',
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '15%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
          filter: 'blur(80px)',
          borderRadius: '50%',
          animation: 'pulse 5s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
          filter: 'blur(90px)',
          borderRadius: '50%',
          animation: 'pulse 6s ease-in-out infinite',
        }}
      />

      <Card
        className="glass-card fade-in"
        sx={{
          maxWidth: 480,
          width: '100%',
          m: 2,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <CardContent sx={{ p: 5 }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 3,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
                mb: 3,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                  boxShadow: '0 12px 32px rgba(59, 130, 246, 0.6)',
                }
              }}
            >
              <LockIcon sx={{ fontSize: 48, color: '#ffffff' }} />
            </Box>
            <Typography 
              variant="h3" 
              component="h1" 
              className="text-gradient"
              sx={{ 
                fontWeight: 900, 
                mb: 1.5,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
              Intelligent Vehicle Flow Analyzer
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', mt: 1 }}>
              Enter your API key to access the dashboard
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              className="slide-in"
              sx={{ 
                mb: 3, 
                bgcolor: 'rgba(239, 68, 68, 0.15)', 
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                '& .MuiAlert-icon': {
                  color: '#ef4444'
                }
              }}
            >
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="API Key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            sx={{
              mb: 4,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '14px',
                fontSize: '1rem',
                transition: 'all 0.3s',
                '& fieldset': { 
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  borderWidth: '2px',
                },
                '&:hover fieldset': { 
                  borderColor: 'rgba(59, 130, 246, 0.5)',
                },
                '&.Mui-focused': {
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                },
                '&.Mui-focused fieldset': { 
                  borderColor: '#3b82f6',
                  boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
                },
              },
              '& .MuiInputLabel-root': { 
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 600,
              },
              '& .MuiInputLabel-root.Mui-focused': { 
                color: '#3b82f6',
                fontWeight: 700,
              },
              '& .MuiInputBase-input': { 
                color: '#f8fafc',
                fontWeight: 500,
                py: 2,
              },
            }}
            autoFocus
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
            endIcon={<ArrowForward />}
            sx={{
              py: 2,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1.1rem',
              borderRadius: '14px',
              transition: 'all 0.3s',
              '&:hover': { 
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                boxShadow: '0 12px 32px rgba(59, 130, 246, 0.6)',
                transform: 'translateY(-2px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              }
            }}
          >
            Access Dashboard
          </Button>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.4)', 
                display: 'block',
                mb: 1,
              }}
            >
              Demo Credentials
            </Typography>
            <Box
              sx={{
                bgcolor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '10px',
                px: 3,
                py: 1.5,
                display: 'inline-block',
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#3b82f6', 
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                demo-api-key-12345
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
