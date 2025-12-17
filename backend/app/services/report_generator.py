import os
import google.generativeai as genai
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any
from collections import Counter, defaultdict
import logging
from app.config import settings
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.barcharts import VerticalBarChart
from io import BytesIO
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.gridspec import GridSpec
import numpy as np
import seaborn as sns
from io import BytesIO

logger = logging.getLogger(__name__)

# Set modern minimal style for all plots
sns.set_style("whitegrid")
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Arial', 'Helvetica', 'DejaVu Sans']
plt.rcParams['axes.edgecolor'] = '#e0e0e0'
plt.rcParams['grid.color'] = '#f0f0f0'
plt.rcParams['grid.linewidth'] = 0.5

# Configure Gemini API
GEMINI_API_KEY = settings.GEMINI_API_KEY
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class ReportGenerator:
    """Generate professional reports using Gemini AI and ReportLab"""
    
    def __init__(self):
        self.model = None
        if GEMINI_API_KEY:
            try:
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                logger.info("Gemini AI model initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini AI: {e}")
    
    def _analyze_business_insights(self, metrics: Dict[str, Any], events: List[Any]) -> Dict[str, Any]:
        """Extract comprehensive business insights from real vehicle detection data"""
        
        total = metrics.get('total_vehicles', 0)
        if total == 0 or not events:
            return {
                'peak_hour': 'N/A',
                'peak_count': 0,
                'busiest_period': 'No data available',
                'congestion_score': 0,
                'vehicle_mix': 'N/A',
                'commercial_ratio': 0,
                'recommendations': ['Insufficient data for analysis'],
                'trends': 'No detectable trends with current data',
                'traffic_velocity': 0,
                'capacity_utilization': 0,
                'flow_efficiency': 0,
                'peak_to_average_ratio': 0,
                'commercial_impact_score': 0
            }
        
        # Analyze hourly patterns
        hourly_counts = defaultdict(int)
        daily_counts = defaultdict(int)
        vehicle_by_hour = defaultdict(lambda: {'car': 0, 'truck': 0, 'bus': 0, 'motorcycle': 0})
        vehicle_by_day = defaultdict(lambda: {'car': 0, 'truck': 0, 'bus': 0, 'motorcycle': 0})
        timestamps = []
        
        for event in events:
            if hasattr(event, 'timestamp') and event.timestamp:
                hour = event.timestamp.hour
                date = event.timestamp.date()
                vehicle_type = (event.class_ or '').lower()
                timestamps.append(event.timestamp)
                
                hourly_counts[hour] += 1
                daily_counts[date] += 1
                
                if vehicle_type in vehicle_by_hour[hour]:
                    vehicle_by_hour[hour][vehicle_type] += 1
                if vehicle_type in vehicle_by_day[date]:
                    vehicle_by_day[date][vehicle_type] += 1
        
        # Find peak hour
        if hourly_counts:
            peak_hour = max(hourly_counts.items(), key=lambda x: x[1])
            peak_hour_str = f"{peak_hour[0]:02d}:00"
            peak_count = peak_hour[1]
            average_hourly = sum(hourly_counts.values()) / len(hourly_counts)
            peak_to_average_ratio = peak_count / average_hourly if average_hourly > 0 else 0
        else:
            peak_hour_str = 'N/A'
            peak_count = 0
            average_hourly = 0
            peak_to_average_ratio = 0
        
        # Determine busiest period
        morning_rush = sum(hourly_counts.get(h, 0) for h in range(7, 10))
        evening_rush = sum(hourly_counts.get(h, 0) for h in range(17, 20))
        midday = sum(hourly_counts.get(h, 0) for h in range(10, 17))
        night = sum(hourly_counts.get(h, 0) for h in list(range(20, 24)) + list(range(0, 7)))
        
        periods = {
            'Morning Rush (7AM-10AM)': morning_rush,
            'Midday (10AM-5PM)': midday,
            'Evening Rush (5PM-8PM)': evening_rush,
            'Night (8PM-7AM)': night
        }
        busiest_period = max(periods.items(), key=lambda x: x[1])[0] if periods else 'N/A'
        
        # Calculate advanced metrics
        cars = metrics.get('cars', 0)
        trucks = metrics.get('trucks', 0)
        buses = metrics.get('buses', 0)
        motorcycles = metrics.get('motorcycles', 0)
        
        commercial = trucks + buses
        commercial_ratio = (commercial / total * 100) if total > 0 else 0
        
        # Traffic Velocity (vehicles per hour across active hours)
        active_hours = len([h for h, count in hourly_counts.items() if count > 0])
        traffic_velocity = total / active_hours if active_hours > 0 else 0
        
        # Capacity Utilization (based on peak vs average)
        capacity_utilization = (average_hourly / peak_count * 100) if peak_count > 0 else 0
        
        # Flow Efficiency (personal vehicles as % - higher is more efficient)
        flow_efficiency = (cars / total * 100) if total > 0 else 0
        
        # Commercial Impact Score (0-100, higher means more commercial disruption)
        commercial_impact_score = min(commercial_ratio * 2, 100)
        
        # Congestion factors: high commercial ratio + high total volume + low capacity utilization
        volume_factor = min(total / 1000, 1.0) * 40  # Max 40 points for volume
        commercial_factor = min(commercial_ratio / 30, 1.0) * 30  # Max 30 points
        capacity_factor = (1 - (capacity_utilization / 100)) * 30  # Max 30 points for low capacity
        congestion_score = int(volume_factor + commercial_factor + capacity_factor)
        
        # Vehicle mix analysis
        car_pct = (cars / total * 100) if total > 0 else 0
        if car_pct > 70:
            vehicle_mix = 'Personal Vehicle Dominant'
        elif commercial_ratio > 30:
            vehicle_mix = 'High Commercial Traffic'
        elif motorcycles / total > 0.3:
            vehicle_mix = 'Two-Wheeler Dominant'
        else:
            vehicle_mix = 'Mixed Traffic'
        
        # Time-based analysis
        if timestamps:
            timestamps.sort()
            time_span_hours = (timestamps[-1] - timestamps[0]).total_seconds() / 3600
            actual_throughput = total / time_span_hours if time_span_hours > 0 else 0
        else:
            time_span_hours = 0
            actual_throughput = 0
        
        # Day-over-day analysis
        daily_trend = 'Stable'
        growth_rate = 0
        if len(daily_counts) > 1:
            daily_values = sorted(daily_counts.items())
            first_half_avg = sum(count for _, count in daily_values[:len(daily_values)//2]) / (len(daily_values)//2)
            second_half_avg = sum(count for _, count in daily_values[len(daily_values)//2:]) / (len(daily_values) - len(daily_values)//2)
            
            if second_half_avg > first_half_avg * 1.15:
                daily_trend = 'Increasing'
                growth_rate = ((second_half_avg - first_half_avg) / first_half_avg * 100) if first_half_avg > 0 else 0
            elif first_half_avg > second_half_avg * 1.15:
                daily_trend = 'Decreasing'
                growth_rate = -((first_half_avg - second_half_avg) / first_half_avg * 100) if first_half_avg > 0 else 0
        
        # Generate enhanced recommendations
        recommendations = []
        
        # Congestion-based recommendations
        if congestion_score > 75:
            recommendations.append('🚨 CRITICAL: Severe congestion detected - Immediate intervention required')
            recommendations.append('💡 Implement dynamic lane allocation and traffic signal coordination')
        elif congestion_score > 50:
            recommendations.append('⚠️ HIGH: Moderate congestion - Deploy traffic management strategies')
            recommendations.append('💡 Consider peak-hour pricing or alternative route promotion')
        
        # Commercial traffic recommendations
        if commercial_ratio > 30:
            recommendations.append(f'🚛 CRITICAL: {commercial_ratio:.1f}% commercial traffic - Dedicated truck lanes essential')
            recommendations.append('💡 Implement time-based restrictions for heavy vehicles during peak hours')
        elif commercial_ratio > 20:
            recommendations.append(f'🚛 HIGH: {commercial_ratio:.1f}% commercial vehicles - Monitor impact on flow')
        
        # Peak hour recommendations
        if peak_to_average_ratio > 2.5:
            recommendations.append(f'⏰ CRITICAL: Peak traffic {peak_to_average_ratio:.1f}x average - Severe capacity imbalance')
            recommendations.append('💡 Implement congestion pricing and encourage flexible work hours')
        elif peak_to_average_ratio > 1.8:
            recommendations.append(f'⏰ HIGH: Peak at {peak_hour_str} is {peak_to_average_ratio:.1f}x average volume')
        
        # Capacity utilization recommendations
        if capacity_utilization < 40:
            recommendations.append(f'📊 LOW EFFICIENCY: Only {capacity_utilization:.1f}% capacity utilization')
            recommendations.append('💡 Optimize traffic signal timing and implement smart traffic management')
        
        # Directional flow recommendations
        if morning_rush > evening_rush * 1.5 or evening_rush > morning_rush * 1.5:
            recommendations.append('🔄 IMBALANCE: Significant directional traffic difference detected')
            recommendations.append('💡 Consider reversible lanes or asymmetric signal timing')
        
        # Two-wheeler safety
        if motorcycles / total > 0.25:
            recommendations.append(f'🏍️ HIGH: {motorcycles} motorcycles ({motorcycles/total*100:.1f}%) - Enhanced safety measures needed')
            recommendations.append('💡 Install dedicated two-wheeler lanes and improved road markings')
        
        # Growth trend recommendations
        if daily_trend == 'Increasing':
            recommendations.append(f'📈 GROWTH: Traffic increasing at {abs(growth_rate):.1f}% - Plan capacity expansion')
            recommendations.append('💡 Accelerate infrastructure upgrades and public transit expansion')
        elif daily_trend == 'Decreasing':
            recommendations.append(f'📉 DECLINE: Traffic decreasing {abs(growth_rate):.1f}% - Monitor for seasonal patterns')
        
        # Efficiency recommendations
        if flow_efficiency < 60:
            recommendations.append(f'⚡ LOW EFFICIENCY: Only {flow_efficiency:.1f}% personal vehicles')
            recommendations.append('💡 Promote carpooling and public transportation incentives')
        
        if len(recommendations) == 0:
            recommendations.append('✅ OPTIMAL: Traffic flow within acceptable parameters')
            recommendations.append('💡 Continue monitoring for pattern changes and maintain current infrastructure')
        
        # Trend analysis summary
        trends_summary = f"{daily_trend} traffic pattern"
        if growth_rate != 0:
            trends_summary += f" ({abs(growth_rate):.1f}% {'growth' if growth_rate > 0 else 'decline'})"
        
        return {
            'peak_hour': peak_hour_str,
            'peak_count': peak_count,
            'average_hourly': round(average_hourly, 1),
            'busiest_period': busiest_period,
            'congestion_score': congestion_score,
            'vehicle_mix': vehicle_mix,
            'commercial_ratio': round(commercial_ratio, 1),
            'traffic_velocity': round(traffic_velocity, 1),
            'capacity_utilization': round(capacity_utilization, 1),
            'flow_efficiency': round(flow_efficiency, 1),
            'peak_to_average_ratio': round(peak_to_average_ratio, 2),
            'commercial_impact_score': round(commercial_impact_score, 1),
            'actual_throughput': round(actual_throughput, 1),
            'daily_trend': daily_trend,
            'growth_rate': round(growth_rate, 1),
            'recommendations': recommendations,
            'trends': trends_summary,
            'hourly_distribution': dict(hourly_counts),
            'daily_distribution': {str(k): v for k, v in daily_counts.items()},
            'period_breakdown': periods,
            'vehicle_by_hour': {h: dict(v) for h, v in vehicle_by_hour.items()},
            'vehicle_by_day': {str(k): dict(v) for k, v in vehicle_by_day.items()}
        }
    
    async def generate_report_content(
        self,
        report_type: str,
        metrics: Dict[str, Any],
        events: List[Any]
    ) -> Dict[str, str]:
        """Generate report content using Gemini AI"""
        
        # Always generate insights from real data
        insights = self._analyze_business_insights(metrics, events)
        metrics['insights'] = insights
        
        if not self.model:
            logger.warning("Gemini AI not available, using template")
            return self._generate_template_content(report_type, metrics, events)
        
        try:
            prompt = self._create_prompt(report_type, metrics, events, insights)
            response = self.model.generate_content(prompt)
            
            return {
                'summary': response.text[:500],
                'full_content': response.text,
                'recommendations': insights['recommendations'],
                'insights': insights
            }
        except Exception as e:
            logger.error(f"Gemini AI generation failed: {e}")
            return self._generate_template_content(report_type, metrics, events)
    
    def _create_prompt(self, report_type: str, metrics: Dict, events: List, insights: Dict) -> str:
        """Create AI prompt based on report type and data"""
        
        base_prompt = f"""
You are a traffic management analyst. Generate a professional, detailed report.

Report Type: {report_type}
Total Vehicles Detected: {metrics.get('total_vehicles', 0)}
Time Period: {metrics.get('start_date', 'N/A')} to {metrics.get('end_date', 'N/A')}
Camera: {metrics.get('camera_id', 'N/A')}

Vehicle Breakdown:
- Cars: {metrics.get('cars', 0)} ({metrics.get('car_percentage', 0):.1f}%)
- Trucks: {metrics.get('trucks', 0)} ({metrics.get('truck_percentage', 0):.1f}%)
- Buses: {metrics.get('buses', 0)} ({metrics.get('bus_percentage', 0):.1f}%)
- Motorcycles: {metrics.get('motorcycles', 0)} ({metrics.get('motorcycle_percentage', 0):.1f}%)

Traffic Insights:
- Peak Hour: {insights.get('peak_hour')} with {insights.get('peak_count')} vehicles
- Busiest Period: {insights.get('busiest_period')}
- Congestion Score: {insights.get('congestion_score')}/100
- Vehicle Mix: {insights.get('vehicle_mix')}
- Commercial Ratio: {insights.get('commercial_ratio')}%

Trends: {insights.get('trends')}

Please generate a comprehensive report with:
1. Executive Summary (2-3 paragraphs highlighting key findings)
2. Key Findings (bullet points with specific data)
3. Traffic Pattern Analysis (detailed breakdown of patterns)
4. Peak Hours and Trends Analysis
5. Business Impact Assessment
6. Actionable Recommendations for Traffic Management
7. Conclusion

Use professional language and provide actionable insights based on the real data above.
"""
        return base_prompt
    
    
    def _generate_template_content(self, report_type: str, metrics: Dict, events: List) -> Dict[str, str]:
        """Generate template-based content when AI is unavailable"""
        
        insights = metrics.get('insights', {})
        total = metrics.get('total_vehicles', 0)
        
        summary = f"""
This {report_type} report presents a comprehensive analysis of traffic patterns from 
{metrics.get('camera_id', 'N/A')} between {metrics.get('start_date', 'N/A')} and 
{metrics.get('end_date', 'N/A')}. Our intelligent vehicle detection system captured and 
analyzed {total:,} vehicles during this period, providing valuable insights into traffic 
flow, composition, and congestion patterns.
"""
        
        full_content = f"""
📊 EXECUTIVE SUMMARY
{summary}

Key highlights include peak traffic at {insights.get('peak_hour', 'N/A')} with {insights.get('peak_count', 0)} vehicles, 
a congestion score of {insights.get('congestion_score', 0)}/100, and a {insights.get('vehicle_mix', 'N/A')} traffic pattern.

🔑 KEY METRICS
• Total Vehicles Detected: {total:,}
• Cars: {metrics.get('cars', 0):,} ({metrics.get('car_percentage', 0):.1f}%)
• Trucks: {metrics.get('trucks', 0):,} ({metrics.get('truck_percentage', 0):.1f}%)
• Buses: {metrics.get('buses', 0):,} ({metrics.get('bus_percentage', 0):.1f}%)
• Motorcycles: {metrics.get('motorcycles', 0):,} ({metrics.get('motorcycle_percentage', 0):.1f}%)
• Commercial Vehicles: {metrics.get('trucks', 0) + metrics.get('buses', 0):,} ({insights.get('commercial_ratio', 0):.1f}%)

🚦 TRAFFIC PATTERNS & INSIGHTS
Peak Hour: {insights.get('peak_hour', 'N/A')} with {insights.get('peak_count', 0)} vehicles detected
Busiest Period: {insights.get('busiest_period', 'N/A')}
Vehicle Mix: {insights.get('vehicle_mix', 'N/A')}
Congestion Level: {insights.get('congestion_score', 0)}/100 ({'Low' if insights.get('congestion_score', 0) < 30 else 'Medium' if insights.get('congestion_score', 0) < 70 else 'High'})

📈 TRENDS ANALYSIS
{insights.get('trends', 'Data analysis in progress')}

The traffic composition shows a {insights.get('commercial_ratio', 0):.1f}% commercial vehicle presence, 
which {'exceeds the typical 20% threshold and may impact traffic flow' if insights.get('commercial_ratio', 0) > 20 else 'remains within normal parameters'}.

💡 RECOMMENDATIONS
Based on the comprehensive analysis of real-time vehicle detection data, we recommend the following actions:

{chr(10).join('• ' + rec for rec in insights.get('recommendations', ['Continue monitoring']))}

🎯 CONCLUSION
This analysis provides actionable intelligence for traffic management optimization. The real-time 
vehicle detection system continues to monitor patterns 24/7, enabling data-driven decisions for 
infrastructure planning and traffic flow optimization.
"""
        
        return {
            'summary': summary.strip(),
            'full_content': full_content.strip(),
            'recommendations': insights.get('recommendations', []),
            'insights': insights
        }
    
    
    def _extract_recommendations(self, content: str) -> str:
        """Extract recommendations section from AI response"""
        if 'RECOMMENDATIONS' in content.upper():
            parts = content.upper().split('RECOMMENDATIONS')
            if len(parts) > 1:
                return parts[1][:500]
        return "Continue monitoring and analysis for optimization opportunities"
    
    def _create_pie_chart(self, metrics: Dict) -> BytesIO:
        """Create modern minimal vehicle distribution pie chart"""
        try:
            fig, ax = plt.subplots(figsize=(7, 7), facecolor='white')
            
            # Modern color palette
            colors_map = {
                'cars': '#3b82f6',      # Blue
                'trucks': '#f59e0b',    # Amber
                'buses': '#10b981',     # Emerald
                'motorcycles': '#8b5cf6' # Purple
            }
            
            # Data
            labels = []
            sizes = []
            colors_list = []
            
            for vehicle_type, color in colors_map.items():
                count = metrics.get(vehicle_type, 0)
                if count > 0:
                    labels.append(f"{vehicle_type.title()}")
                    sizes.append(count)
                    colors_list.append(color)
            
            # Create modern pie chart with minimal design
            wedges, texts, autotexts = ax.pie(
                sizes, 
                labels=labels, 
                colors=colors_list,
                autopct=lambda pct: f'{pct:.1f}%\n({int(pct/100*sum(sizes)):,})',
                startangle=90,
                textprops={'fontsize': 11, 'weight': 'bold', 'color': '#1f2937'},
                pctdistance=0.75,
                labeldistance=1.15
            )
            
            # Style percentage text
            for autotext in autotexts:
                autotext.set_color('white')
                autotext.set_fontsize(10)
                autotext.set_weight('bold')
            
            # Add total in center
            total = sum(sizes)
            ax.text(0, 0, f'{total:,}\nTotal', ha='center', va='center',
                   fontsize=16, weight='bold', color='#374151')
            
            ax.set_title('Vehicle Distribution by Type', fontsize=14, weight='bold', 
                        pad=20, color='#111827')
            
            # Save to buffer
            buffer = BytesIO()
            plt.tight_layout()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight', facecolor='white')
            plt.close()
            buffer.seek(0)
            
            return buffer
        except Exception as e:
            logger.error(f"Error creating pie chart: {e}")
            return None
    
    def _create_hourly_chart(self, insights: Dict) -> BytesIO:
        """Create modern hourly traffic distribution bar chart"""
        try:
            hourly_dist = insights.get('hourly_distribution', {})
            if not hourly_dist:
                return None
            
            fig, ax = plt.subplots(figsize=(12, 4.5), facecolor='white')
            
            # Prepare data for all 24 hours
            hours = list(range(24))
            counts = [hourly_dist.get(h, 0) for h in hours]
            
            # Create gradient colors based on intensity
            max_count = max(counts) if counts else 1
            colors_bars = ['#ef4444' if count == max_count and count > 0 
                          else f'#{int(59 + (130-59)*(count/max_count)):02x}'
                               f'{int(130 + (246-130)*(count/max_count)):02x}'
                               f'f6' 
                          for count in counts]
            
            # Create bar chart
            bars = ax.bar(hours, counts, color=colors_bars, alpha=0.85, 
                         edgecolor='#1e40af', linewidth=1.2, width=0.8)
            
            ax.set_xlabel('Hour of Day', fontsize=12, weight='bold', color='#374151')
            ax.set_ylabel('Vehicle Count', fontsize=12, weight='bold', color='#374151')
            ax.set_title('24-Hour Traffic Distribution Pattern', fontsize=14, 
                        weight='bold', pad=15, color='#111827')
            ax.set_xticks(hours)
            ax.set_xticklabels([f'{h:02d}:00' for h in hours], fontsize=9, rotation=45, ha='right')
            ax.grid(axis='y', alpha=0.3, linestyle='--', linewidth=0.5)
            ax.set_axisbelow(True)
            
            # Add value labels on bars (only if significant)
            threshold = max_count * 0.1
            for i, (bar, count) in enumerate(zip(bars, counts)):
                if count > threshold:
                    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + max_count*0.02, 
                           str(count), ha='center', va='bottom', fontsize=8, weight='bold')
            
            # Add average line
            avg = sum(counts) / len([c for c in counts if c > 0]) if any(counts) else 0
            if avg > 0:
                ax.axhline(y=avg, color='#6b7280', linestyle='--', linewidth=1.5, 
                          alpha=0.7, label=f'Average: {avg:.0f}')
                ax.legend(loc='upper right', fontsize=9)
            
            plt.tight_layout()
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight', facecolor='white')
            plt.close()
            buffer.seek(0)
            
            return buffer
        except Exception as e:
            logger.error(f"Error creating hourly chart: {e}")
            return None
    
    def _create_daily_trend_chart(self, insights: Dict) -> BytesIO:
        """Create daily trend line chart showing traffic evolution"""
        try:
            daily_dist = insights.get('daily_distribution', {})
            if not daily_dist or len(daily_dist) < 2:
                return None
            
            fig, ax = plt.subplots(figsize=(12, 4), facecolor='white')
            
            # Sort by date
            sorted_days = sorted(daily_dist.items())
            dates = [datetime.strptime(d, '%Y-%m-%d').strftime('%m/%d') for d, _ in sorted_days]
            counts = [c for _, c in sorted_days]
            
            # Create line chart with area fill
            ax.plot(dates, counts, color='#3b82f6', linewidth=3, 
                   marker='o', markersize=8, markerfacecolor='#1e40af', 
                   markeredgecolor='white', markeredgewidth=2)
            ax.fill_between(range(len(dates)), counts, alpha=0.2, color='#3b82f6')
            
            # Add trend line
            if len(counts) > 2:
                z = np.polyfit(range(len(counts)), counts, 1)
                p = np.poly1d(z)
                ax.plot(dates, p(range(len(counts))), "--", 
                       color='#ef4444', linewidth=2, alpha=0.7, label='Trend')
            
            ax.set_xlabel('Date', fontsize=12, weight='bold', color='#374151')
            ax.set_ylabel('Total Vehicles', fontsize=12, weight='bold', color='#374151')
            ax.set_title('Daily Traffic Trend Analysis', fontsize=14, 
                        weight='bold', pad=15, color='#111827')
            ax.grid(True, alpha=0.3, linestyle='--', linewidth=0.5)
            ax.set_axisbelow(True)
            
            # Rotate x-axis labels
            plt.xticks(rotation=45, ha='right')
            
            # Add values on points
            for i, (date, count) in enumerate(zip(dates, counts)):
                ax.text(i, count + max(counts)*0.03, f'{count:,}', 
                       ha='center', va='bottom', fontsize=9, weight='bold')
            
            if len(counts) > 2:
                ax.legend(loc='upper left', fontsize=10)
            
            plt.tight_layout()
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight', facecolor='white')
            plt.close()
            buffer.seek(0)
            
            return buffer
        except Exception as e:
            logger.error(f"Error creating daily trend chart: {e}")
            return None
    
    def _create_heatmap(self, insights: Dict) -> BytesIO:
        """Create traffic intensity heatmap showing patterns by day and hour"""
        try:
            vehicle_by_hour = insights.get('vehicle_by_hour', {})
            vehicle_by_day = insights.get('vehicle_by_day', {})
            
            if not vehicle_by_hour or len(vehicle_by_day) < 2:
                return None
            
            # Create matrix for heatmap (hours x days)
            days = sorted(vehicle_by_day.keys())
            hours = list(range(24))
            
            # For simplicity, if we have hourly data, create a simple hourly heatmap
            hourly_totals = [sum(vehicle_by_hour.get(h, {}).values()) for h in hours]
            
            fig, ax = plt.subplots(figsize=(12, 3), facecolor='white')
            
            # Create heatmap data
            data = np.array(hourly_totals).reshape(1, -1)
            
            # Plot heatmap
            im = ax.imshow(data, cmap='YlOrRd', aspect='auto', interpolation='nearest')
            
            # Set ticks
            ax.set_xticks(range(24))
            ax.set_xticklabels([f'{h:02d}' for h in hours], fontsize=9)
            ax.set_yticks([])
            
            # Add colorbar
            cbar = plt.colorbar(im, ax=ax, orientation='horizontal', pad=0.08, aspect=40)
            cbar.set_label('Traffic Intensity (Vehicles/Hour)', fontsize=10, weight='bold')
            
            ax.set_title('Traffic Intensity Heatmap (24-Hour Pattern)', 
                        fontsize=14, weight='bold', pad=15, color='#111827')
            ax.set_xlabel('Hour of Day', fontsize=11, weight='bold', color='#374151')
            
            plt.tight_layout()
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight', facecolor='white')
            plt.close()
            buffer.seek(0)
            
            return buffer
        except Exception as e:
            logger.error(f"Error creating heatmap: {e}")
            return None
    
    def _create_comparison_chart(self, insights: Dict, metrics: Dict) -> BytesIO:
        """Create comparison bar chart for vehicle types and periods"""
        try:
            periods = insights.get('period_breakdown', {})
            if not periods:
                return None
            
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4), facecolor='white')
            
            # Chart 1: Period Comparison
            period_names = list(periods.keys())
            period_values = list(periods.values())
            colors_period = ['#f59e0b', '#3b82f6', '#ef4444', '#6366f1']
            
            bars1 = ax1.barh(period_names, period_values, color=colors_period, 
                            alpha=0.85, edgecolor='#374151', linewidth=1.2)
            ax1.set_xlabel('Vehicle Count', fontsize=11, weight='bold', color='#374151')
            ax1.set_title('Traffic by Time Period', fontsize=13, weight='bold', color='#111827')
            ax1.grid(axis='x', alpha=0.3, linestyle='--', linewidth=0.5)
            ax1.set_axisbelow(True)
            
            # Add value labels
            for bar in bars1:
                width = bar.get_width()
                ax1.text(width, bar.get_y() + bar.get_height()/2, 
                        f'{int(width):,}', ha='left', va='center', 
                        fontsize=9, weight='bold', color='#374151')
            
            # Chart 2: Vehicle Type Breakdown
            vehicle_types = ['Cars', 'Trucks', 'Buses', 'Motorcycles']
            vehicle_counts = [
                metrics.get('cars', 0),
                metrics.get('trucks', 0),
                metrics.get('buses', 0),
                metrics.get('motorcycles', 0)
            ]
            colors_vehicles = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6']
            
            bars2 = ax2.bar(vehicle_types, vehicle_counts, color=colors_vehicles, 
                           alpha=0.85, edgecolor='#374151', linewidth=1.2)
            ax2.set_ylabel('Count', fontsize=11, weight='bold', color='#374151')
            ax2.set_title('Vehicle Type Breakdown', fontsize=13, weight='bold', color='#111827')
            ax2.grid(axis='y', alpha=0.3, linestyle='--', linewidth=0.5)
            ax2.set_axisbelow(True)
            plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45, ha='right')
            
            # Add value labels
            for bar in bars2:
                height = bar.get_height()
                ax2.text(bar.get_x() + bar.get_width()/2, height + max(vehicle_counts)*0.02,
                        f'{int(height):,}', ha='center', va='bottom', 
                        fontsize=9, weight='bold', color='#374151')
            
            plt.tight_layout()
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight', facecolor='white')
            plt.close()
            buffer.seek(0)
            
            return buffer
        except Exception as e:
            logger.error(f"Error creating comparison chart: {e}")
            return None
    
    
    def generate_pdf(
        self,
        title: str,
        content: Dict[str, str],
        metrics: Dict[str, Any]
    ) -> BytesIO:
        """Generate ultra-professional PDF report with comprehensive visualizations and insights"""
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=letter, 
            topMargin=0.4*inch, 
            bottomMargin=0.6*inch,
            leftMargin=0.6*inch,
            rightMargin=0.6*inch
        )
        
        # Container for PDF elements
        story = []
        styles = getSampleStyleSheet()
        
        # Modern Minimal Styles
        title_style = ParagraphStyle(
            'ModernTitle',
            parent=styles['Title'],
            fontSize=32,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=8,
            spaceBefore=15,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            leading=38
        )
        
        subtitle_style = ParagraphStyle(
            'ModernSubtitle',
            parent=styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#64748b'),
            alignment=TA_CENTER,
            spaceAfter=25,
            fontName='Helvetica'
        )
        
        heading_style = ParagraphStyle(
            'ModernHeading',
            parent=styles['Heading1'],
            fontSize=15,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=10,
            spaceBefore=18,
            fontName='Helvetica-Bold',
            borderWidth=0,
            leftIndent=0,
            borderPadding=8,
            backColor=colors.HexColor('#f8fafc')
        )
        
        subheading_style = ParagraphStyle(
            'ModernSubHeading',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#334155'),
            spaceAfter=6,
            spaceBefore=10,
            fontName='Helvetica-Bold'
        )
        
        body_style = ParagraphStyle(
            'ModernBody',
            parent=styles['BodyText'],
            fontSize=9,
            leading=13,
            alignment=TA_JUSTIFY,
            spaceAfter=6,
            textColor=colors.HexColor('#475569')
        )
        
        highlight_style = ParagraphStyle(
            'Highlight',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#0f172a'),
            backColor=colors.HexColor('#f1f5f9'),
            borderPadding=8,
            spaceAfter=10,
            fontName='Helvetica-Bold'
        )
        
        # ===== COVER PAGE =====
        story.append(Spacer(1, 0.5*inch))
        story.append(Paragraph('TRAFFIC INTELLIGENCE REPORT', title_style))
        story.append(Paragraph('Advanced Analytics & Business Insights', subtitle_style))
        
        # Sleek metadata card
        now = datetime.now()
        insights = content.get('insights', {})
        
        metadata_data = [
            ['REPORT DETAILS', ''],
            ['Report ID', f"RPT-{now.strftime('%Y%m%d-%H%M%S')}"],
            ['Generated', now.strftime('%B %d, %Y  •  %I:%M %p')],
            ['Camera Location', metrics.get('camera_id', 'N/A')],
            ['Analysis Period', f"{metrics.get('start_date', 'N/A')} → {metrics.get('end_date', 'N/A')}"],
            ['', ''],
            ['SUMMARY METRICS', ''],
            ['Total Vehicles Detected', f"{metrics.get('total_vehicles', 0):,}"],
            ['Peak Traffic Hour', f"{insights.get('peak_hour', 'N/A')} ({insights.get('peak_count', 0)} vehicles)"],
            ['Congestion Level', f"{insights.get('congestion_score', 0)}/100 ({'Low' if insights.get('congestion_score', 0) < 30 else 'Medium' if insights.get('congestion_score', 0) < 70 else 'High'})"],
            ['Traffic Velocity', f"{insights.get('traffic_velocity', 0):.1f} vehicles/hour"],
            ['Flow Efficiency', f"{insights.get('flow_efficiency', 0):.1f}%"],
        ]
        
        metadata_table = Table(metadata_data, colWidths=[2.3*inch, 4.2*inch])
        metadata_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
            ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#0f172a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('TEXTCOLOR', (0, 6), (-1, 6), colors.white),
            ('TEXTCOLOR', (0, 1), (0, -1), colors.HexColor('#475569')),
            ('TEXTCOLOR', (1, 1), (1, -1), colors.HexColor('#0f172a')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 6), (-1, 6), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica'),
            ('FONTNAME', (1, 1), (1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 7),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('LINEABOVE', (0, 6), (-1, 6), 1, colors.HexColor('#e2e8f0')),
            ('LINEBELOW', (0, 0), (-1, 0), 1.5, colors.HexColor('#0f172a')),
            ('LINEBELOW', (0, 6), (-1, 6), 1.5, colors.HexColor('#0f172a')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1'))
        ]))
        
        story.append(metadata_table)
        story.append(Spacer(1, 0.4*inch))
        
        # ===== ADVANCED KPI DASHBOARD =====
        story.append(Paragraph('📊 COMPREHENSIVE PERFORMANCE METRICS', heading_style))
        story.append(Spacer(1, 0.12*inch))
        
        # Enhanced KPI grid
        total = metrics.get('total_vehicles', 0)
        kpi_data = [
            ['METRIC', 'VALUE', 'INDICATOR', 'BENCHMARK'],
            ['Total Vehicles', f"{total:,}", 
             '✓', 'Monitored'],
            ['Average/Hour', f"{insights.get('average_hourly', 0):.1f}", 
             '↗' if insights.get('daily_trend', '') == 'Increasing' else '↘' if insights.get('daily_trend', '') == 'Decreasing' else '→',
             f"Peak {insights.get('peak_to_average_ratio', 0):.1f}x"],
            ['Congestion Index', f"{insights.get('congestion_score', 0)}/100",
             '🟢' if insights.get('congestion_score', 0) < 30 else '🟡' if insights.get('congestion_score', 0) < 70 else '🔴',
             'Target <50'],
            ['Commercial %', f"{insights.get('commercial_ratio', 0):.1f}%",
             '⚠' if insights.get('commercial_ratio', 0) > 25 else '✓',
             'Optimal <20%'],
            ['Capacity Util.', f"{insights.get('capacity_utilization', 0):.1f}%",
             '⚠' if insights.get('capacity_utilization', 0) < 40 else '✓',
             'Target >60%'],
            ['Flow Efficiency', f"{insights.get('flow_efficiency', 0):.1f}%",
             '✓' if insights.get('flow_efficiency', 0) > 60 else '⚠',
             'Good >65%'],
            ['Traffic Velocity', f"{insights.get('traffic_velocity', 0):.1f} v/h",
             '📈' if insights.get('actual_throughput', 0) > insights.get('average_hourly', 0) else '📊',
             f"Actual {insights.get('actual_throughput', 0):.1f}"],
        ]
        
        kpi_table = Table(kpi_data, colWidths=[1.9*inch, 1.4*inch, 0.8*inch, 1.9*inch])
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 7),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('LINEBELOW', (0, 0), (-1, 0), 1.5, colors.HexColor('#0f172a'))
        ]))
        
        story.append(kpi_table)
        story.append(Spacer(1, 0.25*inch))
        
        # ===== VISUALIZATIONS PAGE =====
        story.append(PageBreak())
        story.append(Paragraph('📈 VISUAL ANALYTICS & PATTERNS', heading_style))
        story.append(Spacer(1, 0.12*inch))
        
        # Pie Chart - Vehicle Distribution
        pie_chart_buffer = self._create_pie_chart(metrics)
        if pie_chart_buffer:
            try:
                story.append(Paragraph('Vehicle Type Composition', subheading_style))
                img = Image(pie_chart_buffer, width=4*inch, height=4*inch)
                story.append(img)
                story.append(Spacer(1, 0.15*inch))
            except Exception as e:
                logger.error(f"Error adding pie chart: {e}")
        
        # Hourly Distribution Bar Chart
        hourly_chart_buffer = self._create_hourly_chart(insights)
        if hourly_chart_buffer:
            try:
                story.append(Paragraph('24-Hour Traffic Distribution', subheading_style))
                img = Image(hourly_chart_buffer, width=6.8*inch, height=2.7*inch)
                story.append(img)
                story.append(Spacer(1, 0.15*inch))
            except Exception as e:
                logger.error(f"Error adding hourly chart: {e}")
        
        # Daily Trend Chart
        daily_trend_buffer = self._create_daily_trend_chart(insights)
        if daily_trend_buffer:
            try:
                story.append(Paragraph('Multi-Day Trend Analysis', subheading_style))
                img = Image(daily_trend_buffer, width=6.8*inch, height=2.4*inch)
                story.append(img)
                story.append(Spacer(1, 0.15*inch))
            except Exception as e:
                logger.error(f"Error adding trend chart: {e}")
        
        # Traffic Intensity Heatmap
        heatmap_buffer = self._create_heatmap(insights)
        if heatmap_buffer:
            try:
                story.append(Paragraph('Traffic Intensity Heatmap', subheading_style))
                img = Image(heatmap_buffer, width=6.8*inch, height=1.8*inch)
                story.append(img)
                story.append(Spacer(1, 0.15*inch))
            except Exception as e:
                logger.error(f"Error adding heatmap: {e}")
        
        # Comparison Charts
        comparison_buffer = self._create_comparison_chart(insights, metrics)
        if comparison_buffer:
            try:
                story.append(Paragraph('Comparative Analysis', subheading_style))
                img = Image(comparison_buffer, width=6.8*inch, height=2.4*inch)
                story.append(img)
                story.append(Spacer(1, 0.2*inch))
            except Exception as e:
                logger.error(f"Error adding comparison chart: {e}")
        
        # ===== DETAILED BREAKDOWN TABLE =====
        story.append(PageBreak())
        story.append(Paragraph('🚗 DETAILED VEHICLE BREAKDOWN', heading_style))
        story.append(Spacer(1, 0.12*inch))
        
        vehicle_data = [
            ['Type', 'Count', '%', 'Category', 'Impact'],
            ['Cars', f"{metrics.get('cars', 0):,}", 
             f"{metrics.get('car_percentage', 0):.1f}%", 
             'Personal', 
             'Low congestion'],
            ['Trucks', f"{metrics.get('trucks', 0):,}", 
             f"{metrics.get('truck_percentage', 0):.1f}%", 
             'Commercial', 
             'High impact'],
            ['Buses', f"{metrics.get('buses', 0):,}", 
             f"{metrics.get('bus_percentage', 0):.1f}%", 
             'Commercial', 
             'Moderate impact'],
            ['Motorcycles', f"{metrics.get('motorcycles', 0):,}", 
             f"{metrics.get('motorcycle_percentage', 0):.1f}%", 
             'Two-Wheeler', 
             'Low space usage'],
        ]
        
        vehicle_table = Table(vehicle_data, colWidths=[1.5*inch, 1.2*inch, 0.9*inch, 1.4*inch, 1.5*inch])
        vehicle_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 7),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#eff6ff'), colors.white]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('LINEBELOW', (0, 0), (-1, 0), 1.5, colors.HexColor('#0f172a'))
        ]))
        
        story.append(vehicle_table)
        story.append(Spacer(1, 0.25*inch))
        
        # ===== BUSINESS INTELLIGENCE INSIGHTS =====
        story.append(Paragraph('💡 BUSINESS INTELLIGENCE & INSIGHTS', heading_style))
        story.append(Spacer(1, 0.12*inch))
        
        # Key Findings Box
        key_findings = f"""
<b>TRAFFIC PATTERN:</b> {insights.get('vehicle_mix', 'N/A')} | 
<b>TREND:</b> {insights.get('daily_trend', 'Stable')} {f"({insights.get('growth_rate', 0):.1f}%)" if insights.get('growth_rate', 0) != 0 else ''}<br/>
<b>PEAK PERIOD:</b> {insights.get('busiest_period', 'N/A')} | 
<b>CRITICAL HOUR:</b> {insights.get('peak_hour', 'N/A')} with {insights.get('peak_count', 0)} vehicles<br/>
<b>COMMERCIAL IMPACT:</b> {insights.get('commercial_impact_score', 0):.1f}/100 | 
<b>CAPACITY USAGE:</b> {insights.get('capacity_utilization', 0):.1f}% efficiency
"""
        story.append(Paragraph(key_findings, highlight_style))
        story.append(Spacer(1, 0.15*inch))
        
        # Executive Summary
        story.append(Paragraph('Executive Summary', subheading_style))
        summary_text = content.get('summary', 'Analysis in progress')
        for para in summary_text.split('\n\n'):
            if para.strip():
                story.append(Paragraph(para.strip(), body_style))
                story.append(Spacer(1, 0.06*inch))
        
        story.append(Spacer(1, 0.15*inch))
        
        # ===== STRATEGIC RECOMMENDATIONS =====
        story.append(Paragraph('🎯 STRATEGIC RECOMMENDATIONS', heading_style))
        story.append(Spacer(1, 0.12*inch))
        
        story.append(Paragraph(
            '<b>Priority Actions Based on Data Analysis:</b>',
            subheading_style
        ))
        story.append(Spacer(1, 0.08*inch))
        
        recommendations = content.get('recommendations', [])
        if isinstance(recommendations, list):
            for i, rec in enumerate(recommendations, 1):
                # Parse priority from emoji
                priority = 'HIGH' if any(x in rec for x in ['🚨', 'CRITICAL']) else 'MEDIUM' if any(x in rec for x in ['⚠️', 'HIGH']) else 'NORMAL'
                priority_color = '#ef4444' if priority == 'HIGH' else '#f59e0b' if priority == 'MEDIUM' else '#10b981'
                
                rec_text = f'<font color="{priority_color}"><b>[{priority}]</b></font> {rec}'
                story.append(Paragraph(rec_text, body_style))
                story.append(Spacer(1, 0.08*inch))
        
        story.append(Spacer(1, 0.2*inch))
        
        # ===== DETAILED ANALYSIS =====
        story.append(PageBreak())
        story.append(Paragraph('📋 COMPREHENSIVE ANALYSIS', heading_style))
        story.append(Spacer(1, 0.12*inch))
        
        full_content = content.get('full_content', '')
        sections = full_content.split('\n\n')
        for section in sections:
            section = section.strip()
            if not section:
                continue
            
            if any(emoji in section for emoji in ['📊', '🔑', '🚦', '📈', '💡', '🎯']) or (section.isupper() and len(section) < 100):
                story.append(Paragraph(section, subheading_style))
            else:
                lines = section.split('\n')
                for line in lines:
                    line = line.strip()
                    if line:
                        story.append(Paragraph(line, body_style))
            
            story.append(Spacer(1, 0.06*inch))
        
        # ===== FOOTER =====
        story.append(Spacer(1, 0.3*inch))
        
        footer_style = ParagraphStyle(
            'ModernFooter',
            parent=styles['Normal'],
            fontSize=7,
            textColor=colors.HexColor('#94a3b8'),
            alignment=TA_CENTER,
            leading=10
        )
        
        divider = Paragraph('─' * 90, footer_style)
        story.append(divider)
        story.append(Spacer(1, 0.08*inch))
        story.append(Paragraph(
            f'<b>INTELLIGENT VEHICLE FLOW SYSTEM</b> • Automated Traffic Intelligence Report<br/>'
            f'AI-Powered Analytics • Real-Time Detection • Predictive Insights<br/>'
            f'Generated: {now.strftime("%B %d, %Y at %I:%M %p")} • '
            f'Confidential Business Intelligence • © {now.year} IVF Analytics',
            footer_style
        ))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer


# Global instance
report_generator = ReportGenerator()
