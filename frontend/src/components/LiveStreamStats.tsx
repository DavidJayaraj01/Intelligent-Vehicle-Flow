import React, { useState, useEffect } from 'react';
import { Activity, Car, Truck, Bus, Bike } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveStreamStatsProps {
  cameraId: string;
  latestAnalysis: any;
}

interface VehicleCounts {
  car: number;
  truck: number;
  bus: number;
  motorcycle: number;
}

export function LiveStreamStats({ cameraId, latestAnalysis }: LiveStreamStatsProps) {
  const [counts, setCounts] = useState<VehicleCounts>({
    car: 0,
    truck: 0,
    bus: 0,
    motorcycle: 0,
  });
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Update counts when new analysis results come in
  useEffect(() => {
    if (latestAnalysis && latestAnalysis.vehicle_counts) {
      const newCounts = {
        car: latestAnalysis.vehicle_counts.car || 0,
        truck: latestAnalysis.vehicle_counts.truck || 0,
        bus: latestAnalysis.vehicle_counts.bus || 0,
        motorcycle: latestAnalysis.vehicle_counts.motorcycle || 0,
      };
      
      setCounts(newCounts);
      setTotalVehicles(latestAnalysis.total_vehicles || 0);
      setLastUpdate(new Date());
      setLoading(false);
    }
  }, [latestAnalysis]);

  const vehicleTypes = [
    { key: 'car', label: 'Cars', icon: Car, color: 'text-blue-400' },
    { key: 'truck', label: 'Trucks', icon: Truck, color: 'text-orange-400' },
    { key: 'bus', label: 'Buses', icon: Bus, color: 'text-purple-400' },
    { key: 'motorcycle', label: 'Motorcycles', icon: Bike, color: 'text-green-400' },
  ];

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Live Stream Detection</h3>
          </div>
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Total Vehicles */}
            <div className="text-center pb-4 border-b border-border">
              <div className="text-4xl font-bold text-foreground mb-1">
                {totalVehicles.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">
                Total Vehicles Detected
              </div>
            </div>

            {/* Vehicle Type Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              {vehicleTypes.map(({ key, label, icon: Icon, color }) => (
                <div
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border"
                >
                  <Icon className={cn('h-8 w-8', color)} />
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {counts[key as keyof VehicleCounts]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
              Real-time data from {cameraId.toUpperCase()} live stream analysis
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
