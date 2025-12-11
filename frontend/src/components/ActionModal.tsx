import { useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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

export function ActionModal({ open, onClose, recommendation }: ActionModalProps) {
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
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setOperatorId('');
      onClose();
    }, 2000);
    
    setLoading(false);
  };

  const handleReject = () => {
    setOperatorId('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!recommendation) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-mono text-lg text-foreground">
              Action Recommendation
            </DialogTitle>
            <span className="rounded border border-border bg-secondary px-2 py-0.5 font-mono text-xs text-foreground">
              {(recommendation.confidence * 100).toFixed(0)}% CONF
            </span>
          </div>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-foreground">
              <CheckCircle className="h-8 w-8 text-foreground" />
            </div>
            <p className="font-mono text-sm text-foreground">Action Approved</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {/* Action Type */}
              <div className="rounded-lg border border-border bg-secondary p-4">
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Action Type
                </p>
                <p className="mt-1 font-mono text-lg font-semibold text-foreground">
                  {recommendation.type.replace(/_/g, ' ').toUpperCase()}
                </p>
              </div>

              {/* Description */}
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Description
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {recommendation.description}
                </p>
              </div>

              {/* Parameters */}
              {Object.keys(recommendation.params).length > 0 && (
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Parameters
                  </p>
                  <div className="mt-2 space-y-2">
                    {Object.entries(recommendation.params).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded border border-border bg-background px-3 py-2"
                      >
                        <span className="font-mono text-xs text-muted-foreground">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono text-xs text-foreground">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Operator ID */}
              <div className="space-y-2">
                <Label htmlFor="operatorId" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Operator ID
                </Label>
                <Input
                  id="operatorId"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  placeholder="Enter your operator ID"
                  className="border-border bg-background font-mono"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleReject}
                className="flex-1 border-border"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 bg-foreground text-background hover:bg-foreground/90"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {loading ? 'Processing...' : 'Approve'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
