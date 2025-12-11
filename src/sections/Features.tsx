import { Camera, Clock, AlertTriangle, Activity, Zap, Monitor, Wifi, BarChart, Moon, TrendingUp, Sparkles } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';

export default function Features() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">Powerful Features</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
          Comprehensive AI-Powered <span className="gradient-text">Capabilities</span>
        </h1>
        <p className="text-lg text-slate-600">
          Intelligent traffic management and analysis powered by cutting-edge technology
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          icon={Camera}
          title="Vehicle Detection & Tracking"
          description="Advanced YOLOv8-based multi-object detection and tracking with unique ID assignment, trajectory analysis, and vehicle classification across multiple camera feeds."
        />

        <FeatureCard
          icon={Clock}
          title="Queue Time Analysis"
          description="Real-time calculation of vehicle queue lengths, average wait times, and service rates per lane with predictive queue growth modeling."
        />

        <FeatureCard
          icon={AlertTriangle}
          title="Emergency Vehicle Detection"
          description="Automatic identification and prioritization of ambulances, fire trucks, and police vehicles with instant alert generation and lane clearance recommendations."
        />

        <FeatureCard
          icon={Activity}
          title="Accident Detection Alerts"
          description="AI-powered detection of stopped vehicles, unusual traffic patterns, and potential accident scenarios with automated notification systems."
        />

        <FeatureCard
          icon={Zap}
          title="Real-time Optimization Engine"
          description="Dynamic lane management recommendations, traffic signal optimization suggestions, and automated congestion mitigation strategies based on live traffic data."
        />

        <FeatureCard
          icon={Monitor}
          title="Multi-camera Support"
          description="Simultaneous processing of multiple camera feeds with synchronized analytics, cross-camera vehicle tracking, and centralized monitoring dashboard."
        />

        <FeatureCard
          icon={Wifi}
          title="WebSocket Live Metrics"
          description="Real-time data streaming via WebSockets for instant dashboard updates, live alerts, and sub-second latency performance metrics delivery."
        />

        <FeatureCard
          icon={BarChart}
          title="Business Insights & Reporting"
          description="Comprehensive analytics dashboards, automated report generation, traffic pattern analysis, and customizable KPI tracking for operational decision-making."
        />

        <FeatureCard
          icon={Moon}
          title="Night-time Enhancements"
          description="Advanced image preprocessing including deglare algorithms, adaptive noise reduction, gamma correction, and contrast enhancement for reliable 24/7 detection."
        />

        <FeatureCard
          icon={TrendingUp}
          title="Traffic Forecasting"
          description="Machine learning-based traffic prediction models using historical data analysis, seasonal patterns, and real-time trends to forecast congestion and optimize operations."
        />
      </div>

      {/* Feature Highlights */}
      <section className="mt-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Feature Highlights</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Advanced Computer Vision Pipeline</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Our proprietary computer vision pipeline combines YOLOv8 object detection with custom tracking
              algorithms to achieve industry-leading accuracy rates.
            </p>
            <ul className="space-y-2 text-slate-700 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Real-time object detection with sub-100ms latency
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Multi-object tracking with ID persistence
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Vehicle classification into 8+ categories
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
              <BarChart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Intelligent Analytics Engine</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Transform raw detection data into actionable business intelligence with our analytics engine.
            </p>
            <ul className="space-y-2 text-slate-700 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                Automated anomaly detection and alerting
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                Historical trend analysis and patterns
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                Customizable dashboards and KPI tracking
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 shadow-lg hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Enterprise-Grade Infrastructure</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Built for scale and reliability with automatic load balancing and distributed processing.
            </p>
            <ul className="space-y-2 text-slate-700 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                Horizontal scaling for unlimited cameras
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                99.9% uptime SLA with redundant systems
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                Real-time data replication and backup
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
