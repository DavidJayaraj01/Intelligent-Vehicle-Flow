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
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Recent Events</Typography>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={filteredEvents.length === 0}
          >
            Export CSV
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Camera</InputLabel>
            <Select value={cameraFilter} onChange={(e) => setCameraFilter(e.target.value)} label="Camera">
              <MenuItem value="">All</MenuItem>
              {cameras.map((cam) => (
                <MenuItem key={cam} value={cam}>
                  {cam}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Class</InputLabel>
            <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} label="Class">
              <MenuItem value="">All</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls} value={cls}>
                  {cls}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Lane</InputLabel>
            <Select value={laneFilter} onChange={(e) => setLaneFilter(e.target.value)} label="Lane">
              <MenuItem value="">All</MenuItem>
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
              <TableRow>
                <TableCell>Camera</TableCell>
                <TableCell>Track ID</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Lane</TableCell>
                <TableCell>Confidence</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.camera_id}</TableCell>
                    <TableCell>{event.track_id}</TableCell>
                    <TableCell>{event.class}</TableCell>
                    <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{event.lane_id || '-'}</TableCell>
                    <TableCell>{(event.confidence * 100).toFixed(1)}%</TableCell>
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
        />
      </CardContent>
    </Card>
  );
};

export default EventTable;
