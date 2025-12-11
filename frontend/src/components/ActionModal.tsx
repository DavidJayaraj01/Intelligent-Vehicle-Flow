import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  Alert,
  Chip,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { postAction } from '../services/api';

interface Recommendation {
  type: string;
  description: string;
  params: Record<string, any>;
  confidence: number;
  camera_id?: string;
}

interface ActionModalProps {
  open: boolean;
  onClose: () => void;
  recommendation: Recommendation | null;
}

const ActionModal: React.FC<ActionModalProps> = ({ open, onClose, recommendation }) => {
  const [operatorId, setOperatorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleApprove = async () => {
    if (!operatorId.trim()) {
      setError('Please enter your operator ID');
      return;
    }

    if (!recommendation) return;

    setLoading(true);
    setError('');
    try {
      await postAction({
        operator_id: operatorId,
        action_type: recommendation.type,
        params: recommendation.params,
        camera_id: recommendation.camera_id,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setOperatorId('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit action');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    setOperatorId('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!recommendation) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
        }
      }}
    >
      <DialogTitle sx={{ color: '#ffffff', fontWeight: 700 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Action Recommendation
          <Chip
            label={`${(recommendation.confidence * 100).toFixed(0)}% Confidence`}
            sx={{
              backgroundColor: recommendation.confidence > 0.8 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: recommendation.confidence > 0.8 ? '#22c55e' : '#f59e0b',
              fontWeight: 600,
            }}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent sx={{ color: '#ffffff' }}>
        {success ? (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2,
              bgcolor: 'rgba(34, 197, 94, 0.1)',
              color: '#22c55e',
              '& .MuiAlert-icon': { color: '#22c55e' }
            }}
          >
            Action submitted successfully!
          </Alert>
        ) : (
          <>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ fontWeight: 700, mt: 2, color: '#f8fafc' }}
            >
              {recommendation.type}
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8', mb: 2 }}>
              {recommendation.description}
            </Typography>

            {recommendation.camera_id && (
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                <strong>Camera:</strong> {recommendation.camera_id}
              </Typography>
            )}

            {Object.keys(recommendation.params).length > 0 && (
              <Box sx={{ 
                mt: 2, 
                mb: 2, 
                p: 2, 
                bgcolor: 'rgba(14, 165, 233, 0.1)',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                borderRadius: '8px'
              }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700, color: '#0ea5e9' }}>
                  Parameters:
                </Typography>
                {Object.entries(recommendation.params).map(([key, value]) => (
                  <Typography key={key} variant="body2" sx={{ color: '#94a3b8' }}>
                    <strong>{key}:</strong> {JSON.stringify(value)}
                  </Typography>
                ))}
              </Box>
            )}

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  color: '#fca5a5',
                  '& .MuiAlert-icon': { color: '#fca5a5' }
                }}
              >
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Your Operator ID"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              variant="outlined"
              sx={{ 
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  color: '#f8fafc',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#0ea5e9',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#64748b',
                  opacity: 1,
                },
              }}
              autoFocus
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={handleReject} 
          startIcon={<Cancel />} 
          disabled={loading}
          sx={{
            color: '#94a3b8',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
          }}
        >
          Reject
        </Button>
        <Button
          onClick={handleApprove}
          variant="contained"
          startIcon={<CheckCircle />}
          disabled={loading || success}
          sx={{
            bgcolor: '#0ea5e9',
            color: '#fff',
            '&:hover': { bgcolor: '#0284c7' }
          }}
        >
          {loading ? 'Submitting...' : 'Approve'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActionModal;
