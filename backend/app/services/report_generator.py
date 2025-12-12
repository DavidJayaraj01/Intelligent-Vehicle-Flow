import os
import google.generativeai as genai
from datetime import datetime, timezone
from typing import Dict, List, Any
import logging
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from io import BytesIO

logger = logging.getLogger(__name__)

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class ReportGenerator:
    """Generate professional reports using Gemini AI and ReportLab"""
    
    def __init__(self):
        self.model = None
        if GEMINI_API_KEY:
            try:
                self.model = genai.GenerativeModel('gemini-pro')
                logger.info("Gemini AI model initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini AI: {e}")
    
    async def generate_report_content(
        self,
        report_type: str,
        metrics: Dict[str, Any],
        events: List[Any]
    ) -> Dict[str, str]:
        """Generate report content using Gemini AI"""
        
        if not self.model:
            logger.warning("Gemini AI not available, using template")
            return self._generate_template_content(report_type, metrics, events)
        
        try:
            prompt = self._create_prompt(report_type, metrics, events)
            response = self.model.generate_content(prompt)
            
            return {
                'summary': response.text[:500],
                'full_content': response.text,
                'recommendations': self._extract_recommendations(response.text)
            }
        except Exception as e:
            logger.error(f"Gemini AI generation failed: {e}")
            return self._generate_template_content(report_type, metrics, events)
    
    def _create_prompt(self, report_type: str, metrics: Dict, events: List) -> str:
        """Create AI prompt based on report type and data"""
        
        base_prompt = f"""
You are a traffic management analyst. Generate a professional, detailed report.

Report Type: {report_type}
Total Vehicles Detected: {metrics.get('total_vehicles', 0)}
Time Period: {metrics.get('start_date', 'N/A')} to {metrics.get('end_date', 'N/A')}
Camera: {metrics.get('camera_id', 'N/A')}

Vehicle Breakdown:
- Cars: {metrics.get('cars', 0)}
- Trucks: {metrics.get('trucks', 0)}
- Buses: {metrics.get('buses', 0)}
- Motorcycles: {metrics.get('motorcycles', 0)}

Please generate a comprehensive report with:
1. Executive Summary (2-3 paragraphs)
2. Key Findings (bullet points)
3. Traffic Pattern Analysis
4. Peak Hours and Trends
5. Recommendations for Traffic Management
6. Conclusion

Use professional language and provide actionable insights.
"""
        return base_prompt
    
    def _generate_template_content(self, report_type: str, metrics: Dict, events: List) -> Dict[str, str]:
        """Generate template-based content when AI is unavailable"""
        
        summary = f"""
This {report_type} report analyzes traffic data from {metrics.get('camera_id', 'N/A')} 
between {metrics.get('start_date', 'N/A')} and {metrics.get('end_date', 'N/A')}. 
A total of {metrics.get('total_vehicles', 0)} vehicles were detected during this period.
"""
        
        full_content = f"""
EXECUTIVE SUMMARY
{summary}

KEY METRICS
- Total Vehicles: {metrics.get('total_vehicles', 0)}
- Cars: {metrics.get('cars', 0)} ({metrics.get('car_percentage', 0):.1f}%)
- Trucks: {metrics.get('trucks', 0)} ({metrics.get('truck_percentage', 0):.1f}%)
- Buses: {metrics.get('buses', 0)} ({metrics.get('bus_percentage', 0):.1f}%)
- Motorcycles: {metrics.get('motorcycles', 0)} ({metrics.get('motorcycle_percentage', 0):.1f}%)

TRAFFIC PATTERNS
The analysis shows consistent traffic flow throughout the monitoring period. 
Peak traffic hours were observed during typical commute times.

RECOMMENDATIONS
1. Continue monitoring traffic patterns for trend analysis
2. Consider infrastructure improvements for high-traffic periods
3. Implement real-time traffic management during peak hours
"""
        
        return {
            'summary': summary.strip(),
            'full_content': full_content.strip(),
            'recommendations': 'Monitor trends, optimize signal timing, consider capacity improvements'
        }
    
    def _extract_recommendations(self, content: str) -> str:
        """Extract recommendations section from AI response"""
        if 'RECOMMENDATIONS' in content.upper():
            parts = content.upper().split('RECOMMENDATIONS')
            if len(parts) > 1:
                return parts[1][:500]
        return "Continue monitoring and analysis for optimization opportunities"
    
    def generate_pdf(
        self,
        title: str,
        content: Dict[str, str],
        metrics: Dict[str, Any]
    ) -> BytesIO:
        """Generate PDF report using ReportLab"""
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.75*inch, bottomMargin=0.75*inch)
        
        # Container for PDF elements
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Title'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Title
        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Metadata table
        metadata_data = [
            ['Report Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            ['Camera:', metrics.get('camera_id', 'N/A')],
            ['Period:', f"{metrics.get('start_date', 'N/A')} to {metrics.get('end_date', 'N/A')}"],
            ['Total Vehicles:', str(metrics.get('total_vehicles', 0))],
        ]
        
        metadata_table = Table(metadata_data, colWidths=[2*inch, 4*inch])
        metadata_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        
        story.append(metadata_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Vehicle breakdown table
        story.append(Paragraph('Vehicle Type Distribution', heading_style))
        
        vehicle_data = [
            ['Vehicle Type', 'Count', 'Percentage'],
            ['Cars', str(metrics.get('cars', 0)), f"{metrics.get('car_percentage', 0):.1f}%"],
            ['Trucks', str(metrics.get('trucks', 0)), f"{metrics.get('truck_percentage', 0):.1f}%"],
            ['Buses', str(metrics.get('buses', 0)), f"{metrics.get('bus_percentage', 0):.1f}%"],
            ['Motorcycles', str(metrics.get('motorcycles', 0)), f"{metrics.get('motorcycle_percentage', 0):.1f}%"],
        ]
        
        vehicle_table = Table(vehicle_data, colWidths=[2*inch, 1.5*inch, 1.5*inch])
        vehicle_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(vehicle_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Report content
        story.append(Paragraph('Executive Summary', heading_style))
        story.append(Paragraph(content.get('summary', ''), styles['BodyText']))
        story.append(Spacer(1, 0.2*inch))
        
        story.append(Paragraph('Detailed Analysis', heading_style))
        
        # Split content into paragraphs
        full_content = content.get('full_content', '')
        for para in full_content.split('\n\n'):
            if para.strip():
                story.append(Paragraph(para.strip(), styles['BodyText']))
                story.append(Spacer(1, 0.1*inch))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer


# Global instance
report_generator = ReportGenerator()
