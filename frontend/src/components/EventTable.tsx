import { useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

export function EventTable({ events, loading = false }: EventTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [cameraFilter, setCameraFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  const filteredEvents = events.filter((event) => {
    if (cameraFilter !== 'all' && event.camera_id !== cameraFilter) return false;
    if (classFilter !== 'all' && event.class !== classFilter) return false;
    return true;
  });

  const paginatedEvents = filteredEvents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const cameras = Array.from(new Set(events.map((e) => e.camera_id)));
  const classes = Array.from(new Set(events.map((e) => e.class)));

  const handleExport = () => {
    const csv = [
      ['ID', 'Camera', 'Track ID', 'Class', 'Timestamp', 'Lane', 'Confidence'].join(','),
      ...filteredEvents.map((e) =>
        [e.id, e.camera_id, e.track_id, e.class, e.timestamp, e.lane_id || '', e.confidence].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicle_events_${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="animate-fade-in rounded-xl border border-border bg-card" style={{ animationDelay: '300ms' }}>
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Event Log
          </h3>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {filteredEvents.length} Events
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={cameraFilter} onValueChange={setCameraFilter}>
              <SelectTrigger className="w-32 border-border bg-secondary text-foreground">
                <SelectValue placeholder="Camera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cameras</SelectItem>
                {cameras.map((cam) => (
                  <SelectItem key={cam} value={cam}>
                    {cam.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-28 border-border bg-secondary text-foreground">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls.charAt(0).toUpperCase() + cls.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2 border-border text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase text-muted-foreground">ID</TableHead>
              <TableHead className="font-mono text-xs uppercase text-muted-foreground">Camera</TableHead>
              <TableHead className="font-mono text-xs uppercase text-muted-foreground">Track</TableHead>
              <TableHead className="font-mono text-xs uppercase text-muted-foreground">Class</TableHead>
              <TableHead className="font-mono text-xs uppercase text-muted-foreground">Time</TableHead>
              <TableHead className="font-mono text-xs uppercase text-muted-foreground">Lane</TableHead>
              <TableHead className="font-mono text-xs uppercase text-muted-foreground text-right">Conf.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Loading events...
                </TableCell>
              </TableRow>
            ) : paginatedEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              paginatedEvents.map((event) => (
                <TableRow
                  key={event.id}
                  className="border-border transition-colors hover:bg-accent/50"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{event.id}
                  </TableCell>
                  <TableCell>
                    <span className="rounded border border-border bg-secondary px-2 py-0.5 font-mono text-xs text-foreground">
                      {event.camera_id.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground">
                    {event.track_id}
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full border border-foreground/20 bg-foreground/10 px-2 py-0.5 font-mono text-xs text-foreground">
                      {event.class}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {event.lane_id || '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-foreground">
                    {(event.confidence * 100).toFixed(0)}%
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border px-6 py-4">
        <p className="font-mono text-xs text-muted-foreground">
          Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredEvents.length)} of {filteredEvents.length}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="border-border"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={(page + 1) * rowsPerPage >= filteredEvents.length}
            className="border-border"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
