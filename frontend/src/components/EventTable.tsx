import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { exportToCSV } from '../utils/exportCSV';

interface Event {
  id: number;
  camera_id: string;
  track_id: string;
  class: string;
  timestamp: string;
  lane_id?: string;
  confidence: number;
}

interface EventTableProps {
  events: Event[];
  loading?: boolean;
}

const EventTable: React.FC<EventTableProps> = ({ events, loading = false }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [cameraFilter, setCameraFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [laneFilter, setLaneFilter] = useState('');

  // Apply filters
  const filteredEvents = events.filter((event) => {
    if (cameraFilter && event.camera_id !== cameraFilter) return false;
    if (classFilter && event.class !== classFilter) return false;
    if (laneFilter && event.lane_id !== laneFilter) return false;
    return true;
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = () => {
    exportToCSV(filteredEvents, `vehicle_events_${new Date().toISOString()}.csv`);
  };

  // Get unique values for filters
  const cameras = Array.from(new Set(events.map((e) => e.camera_id)));
  const classes = Array.from(new Set(events.map((e) => e.class)));
  const lanes = Array.from(new Set(events.map((e) => e.lane_id).filter(Boolean)));

  const getClassColor = (cls: string) => {
    const colorMap: Record<string, string> = {
      'car': '#0ea5e9',
      'truck': '#f59e0b',
      'bus': '#6366f1',
      'motorcycle': '#ef4444',
    };
    return colorMap[cls.toLowerCase()] || '#94a3b8';
  };

  return (
    <Card 
      sx={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'none',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        boxShadow: 'none',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography 
            variant="h6"
            sx={{ 
              fontWeight: 700,
              color: '#ffffff'
            }}
          >
            Recent Events
          </Typography>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={filteredEvents.length === 0}
            sx={{
              bgcolor: '#ffffff',
              color: '#000000',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
              '&:disabled': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Export CSV
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Camera</InputLabel>
            <Select 
              value={cameraFilter} 
              onChange={(e) => setCameraFilter(e.target.value)} 
              label="Camera"
              sx={{
                color: '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <MenuItem value="">All Cameras</MenuItem>
              {cameras.map((cam) => (
                <MenuItem key={cam} value={cam}>
                  {cam}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Class</InputLabel>
            <Select 
              value={classFilter} 
              onChange={(e) => setClassFilter(e.target.value)} 
              label="Class"
              sx={{
                color: '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <MenuItem value="">All Classes</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls} value={cls}>
                  {cls}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Lane</InputLabel>
            <Select 
              value={laneFilter} 
              onChange={(e) => setLaneFilter(e.target.value)} 
              label="Lane"
              sx={{
                color: '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <MenuItem value="">All Lanes</MenuItem>
              {lanes.map((lane) => (
                <MenuItem key={lane} value={lane}>
                  {lane}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.08)' }}>
                <TableCell sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700 }}>Camera</TableCell>
                <TableCell sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700 }}>Track ID</TableCell>
                <TableCell sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700 }}>Class</TableCell>
                <TableCell sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700 }}>Timestamp</TableCell>
                <TableCell sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700 }}>Lane</TableCell>
                <TableCell align="right" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700 }}>Confidence</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'rgba(255, 255, 255, 0.5)' }}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'rgba(255, 255, 255, 0.5)' }}>
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((event) => (
                  <TableRow 
                    key={event.id}
                    sx={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      }
                    }}
                  >
                    <TableCell sx={{ color: '#ffffff' }}>{event.camera_id}</TableCell>
                    <TableCell sx={{ color: '#ffffff' }}>{event.track_id}</TableCell>
                    <TableCell>
                      <Chip 
                        label={event.class}
                        size="small"
                        sx={{
                          backgroundColor: `${getClassColor(event.class)}20`,
                          color: getClassColor(event.class),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                      {new Date(event.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: '#ffffff' }}>{event.lane_id || '-'}</TableCell>
                    <TableCell 
                      align="right" 
                      sx={{ 
                        color: '#ffffff',
                        fontWeight: 600
                      }}
                    >
                      {(event.confidence * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredEvents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              margin: 0,
            }
          }}
        />
      </CardContent>
    </Card>
  );
};

export default EventTable;
