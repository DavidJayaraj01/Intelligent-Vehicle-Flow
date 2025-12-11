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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Action Recommendation
          <Chip
            label={`${(recommendation.confidence * 100).toFixed(0)}% Confidence`}
            color={recommendation.confidence > 0.8 ? 'success' : 'warning'}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Action submitted successfully!
          </Alert>
        ) : (
          <>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 1 }}>
              Recommended Action: {recommendation.type}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {recommendation.description}
            </Typography>

            {recommendation.camera_id && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Camera: {recommendation.camera_id}
              </Typography>
            )}

            {Object.keys(recommendation.params).length > 0 && (
              <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Parameters:
                </Typography>
                {Object.entries(recommendation.params).map(([key, value]) => (
                  <Typography key={key} variant="body2">
                    <strong>{key}:</strong> {JSON.stringify(value)}
                  </Typography>
                ))}
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Your Operator ID"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              variant="outlined"
              sx={{ mt: 2 }}
              autoFocus
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReject} startIcon={<Cancel />} disabled={loading}>
          Reject
        </Button>
        <Button
          onClick={handleApprove}
          variant="contained"
          startIcon={<CheckCircle />}
          disabled={loading || success}
        >
          {loading ? 'Submitting...' : 'Approve'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActionModal;
