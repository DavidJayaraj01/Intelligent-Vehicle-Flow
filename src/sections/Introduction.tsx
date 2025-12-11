import { Camera, Activity, AlertTriangle, BarChart3, Zap, Shield, TrendingUp, Clock } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';

export default function Introduction() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-white space-y-6">
              <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-2">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  AI-Powered Platform
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Vehicle Flow <br />
                <span className="text-blue-200">Analyzer</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-blue-100 leading-relaxed max-w-2xl">
                Transform traffic management with cutting-edge AI, computer vision, and real-time analytics 
                for intelligent urban mobility solutions.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm font-medium">Real-time Processing</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                  <Shield className="w-5 h-5 text-green-300" />
                  <span className="text-sm font-medium">99.9% Uptime</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-300" />
                  <span className="text-sm font-medium">AI-Powered Insights</span>
                </div>
              </div>
            </div>

            {/* Illustration */}
            <div className="flex-1 max-w-md lg:max-w-lg">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl blur-3xl"></div>
                <div className="relative bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                      <Camera className="w-8 h-8 text-white mb-3" />
                      <div className="text-white text-2xl font-bold mb-1">24/7</div>
                      <div className="text-blue-100 text-xs">Monitoring</div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                      <Activity className="w-8 h-8 text-white mb-3" />
                      <div className="text-white text-2xl font-bold mb-1">98%</div>
                      <div className="text-indigo-100 text-xs">Accuracy</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                      <Clock className="w-8 h-8 text-white mb-3" />
                      <div className="text-white text-2xl font-bold mb-1">&lt;100ms</div>
                      <div className="text-purple-100 text-xs">Latency</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                      <BarChart3 className="w-8 h-8 text-white mb-3" />
                      <div className="text-white text-2xl font-bold mb-1">1000+</div>
                      <div className="text-pink-100 text-xs">Vehicles/min</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Overview */}
      <section className="animate-slide-up">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Platform Overview
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Vehicle Flow Analyzer is an enterprise-grade traffic intelligence platform designed to transform
            raw traffic video feeds into actionable insights. Built on cutting-edge computer vision and
            deep learning technologies, the platform provides real-time vehicle detection, tracking,
            queue analysis, and predictive analytics.
          </p>
          <p className="text-slate-700 leading-relaxed">
            The system processes live camera feeds and recorded videos with advanced preprocessing capabilities,
            including night-time enhancement, glare removal, and adaptive image optimization. Using YOLOv8
            for object detection and custom neural networks for specialized tasks, the platform delivers
            accurate, real-time traffic intelligence.
          </p>
        </div>
      </section>

      {/* Use Cases */}
      <section className="animate-slide-up">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <FeatureCard
            icon={Camera}
            title="Toll Plaza Management"
            description="Optimize toll booth operations with real-time queue monitoring, lane utilization analysis, and automated congestion alerts."
          />
          <FeatureCard
            icon={Activity}
            title="Parking Facility Optimization"
            description="Monitor parking lot occupancy, analyze entry/exit patterns, and provide real-time availability data to drivers."
          />
          <FeatureCard
            icon={AlertTriangle}
            title="Gated Community Security"
            description="Enhance security with vehicle tracking, emergency vehicle detection, and automated access control systems."
          />
          <FeatureCard
            icon={BarChart3}
            title="Traffic Checkpoints"
            description="Analyze traffic flow patterns, detect violations, identify emergency situations, and generate compliance reports."
          />
        </div>
      </section>

      {/* System Capabilities */}
      <section className="animate-slide-up">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">System Capabilities</h2>
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl border border-slate-200 p-6 sm:p-8 shadow-lg">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <span className="w-3 h-3 bg-white rounded-full"></span>
              </div>
              <div>
                <strong className="text-slate-900 text-lg block mb-1">Real-time Vehicle Detection & Tracking</strong>
                <p className="text-slate-600 text-sm leading-relaxed">Multi-object tracking with unique ID assignment and trajectory analysis</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <span className="w-3 h-3 bg-white rounded-full"></span>
              </div>
              <div>
                <strong className="text-slate-900 text-lg block mb-1">Intelligent Queue Analysis</strong>
                <p className="text-slate-600 text-sm leading-relaxed">Calculate wait times, queue lengths, and service rate metrics per lane</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <span className="w-3 h-3 bg-white rounded-full"></span>
              </div>
              <div>
                <strong className="text-slate-900 text-lg block mb-1">Emergency Vehicle Detection</strong>
                <p className="text-slate-600 text-sm leading-relaxed">Automatic identification of ambulances, fire trucks, and police vehicles with priority alerts</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <span className="w-3 h-3 bg-white rounded-full"></span>
              </div>
              <div>
                <strong className="text-slate-900 text-lg block mb-1">Accident Detection System</strong>
                <p className="text-slate-600 text-sm leading-relaxed">AI-powered detection of stopped vehicles and potential accident scenarios</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <span className="w-3 h-3 bg-white rounded-full"></span>
              </div>
              <div>
                <strong className="text-slate-900 text-lg block mb-1">Advanced Night Vision</strong>
                <p className="text-slate-600 text-sm leading-relaxed">Deglare, denoise, and gamma correction for 24/7 reliable detection</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <span className="w-3 h-3 bg-white rounded-full"></span>
              </div>
              <div>
                <strong className="text-slate-900 text-lg block mb-1">Business Intelligence & Reporting</strong>
                <p className="text-slate-600 text-sm leading-relaxed">Comprehensive analytics, traffic forecasting, and automated insight generation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Purpose & Vision */}
      <section className="animate-slide-up">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 sm:p-8 text-white shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Purpose & Vision</h2>
          <p className="text-blue-50 leading-relaxed text-base sm:text-lg">
            The Vehicle Flow Analyzer platform was built to address the growing need for intelligent
            traffic management solutions in modern urban environments. By combining state-of-the-art
            AI technologies with real-time data processing, the platform empowers traffic managers,
            city planners, and facility operators to make data-driven decisions that improve traffic
            flow, enhance safety, and optimize resource allocation.
          </p>
        </div>
      </section>
    </div>
  );
}
