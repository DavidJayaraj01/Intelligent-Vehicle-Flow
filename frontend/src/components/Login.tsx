import React, { useState } from 'react';
import { Card, CardContent, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
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
        background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background effects */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '300px',
          height: '300px',
          background: 'rgba(14, 165, 233, 0.2)',
          filter: 'blur(100px)',
          borderRadius: '50%',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '20%',
          width: '300px',
          height: '300px',
          background: 'rgba(99, 102, 241, 0.2)',
          filter: 'blur(100px)',
          borderRadius: '50%',
        }}
      />

      <Card
        className="glass-card"
        sx={{
          maxWidth: 400,
          width: '100%',
          m: 2,
          bgcolor: 'transparent',
          color: 'text.primary'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                bgcolor: 'rgba(14, 165, 233, 0.1)',
                mb: 2
              }}
            >
              <LockIcon sx={{ fontSize: 40, color: '#38bdf8' }} />
            </Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your API key to access the dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}>
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
              mb: 3,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(15, 23, 42, 0.6)',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
              },
              '& .MuiInputLabel-root': { color: '#94a3b8' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#38bdf8' },
              '& .MuiInputBase-input': { color: '#f8fafc' },
            }}
            autoFocus
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
            sx={{
              py: 1.5,
              bgcolor: '#0ea5e9',
              '&:hover': { bgcolor: '#0284c7' },
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Login
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block', textAlign: 'center' }}>
            Demo key: demo-api-key-12345
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
