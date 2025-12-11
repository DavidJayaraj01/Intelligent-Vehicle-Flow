# Vehicle Flow Analyzer

A comprehensive AI-powered traffic monitoring and analysis system for real-time vehicle detection, queue management, and emergency vehicle identification.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11-blue.svg)
![React](https://img.shields.io/badge/react-19.2.0-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.104.1-green.svg)

## 🚀 Overview

Vehicle Flow Analyzer is a full-stack application that combines computer vision, deep learning, and real-time data processing to monitor traffic patterns, detect vehicles, and provide actionable insights for traffic management systems.

### Key Features

- **🚗 Vehicle Detection & Tracking**: Real-time vehicle detection using YOLOv8 with multi-object tracking
- **⏱️ Queue Analysis**: Measure vehicle wait times between entry/exit lines with detailed statistics
- **🚑 Emergency Vehicle Detection**: Specialized detection for ambulances, fire trucks, and police cars
- **📊 Real-time Dashboard**: Live KPI monitoring with interactive charts and visualizations
- **🔔 Smart Alerts**: Automated recommendations based on traffic patterns
- **📹 Multi-Camera Support**: Monitor multiple camera feeds simultaneously
- **🌐 WebSocket Updates**: Real-time event streaming for instant updates
- **📈 Historical Analytics**: Time-series analysis with aggregated metrics

## 🏗️ Architecture

```
vehicle-flow-analyzer/
├── backend/              # FastAPI backend service
│   ├── app/
│   │   ├── api/         # REST API endpoints
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic validation schemas
│   │   ├── services/    # Business logic & ML services
│   │   └── core/        # Core utilities (Redis, WebSocket)
│   └── outputs/         # Processed videos/images
├── frontend/            # React TypeScript frontend
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components
│       ├── services/    # API & WebSocket clients
│       └── utils/       # Helper functions
├── database/            # Database schema and setup
├── EfficientNet/        # Custom EfficientNet implementation
├── TPHYolov5/          # Custom YOLOv5 variant
└── weights/            # Pre-trained model weights
```

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 15 (hosted on Render)
- **Cache**: Redis 7
- **ML/CV**: PyTorch, OpenCV, Ultralytics YOLOv8
- **ORM**: SQLAlchemy
- **WebSocket**: FastAPI WebSockets

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS + Emotion

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Database Hosting**: Render PostgreSQL

## 📋 Prerequisites

- **Docker** and **Docker Compose** (recommended)
- **Python 3.11+** (for local development)
- **Node.js 18+** (for local development)
- **PostgreSQL 15** (if not using Render)
- **Redis 7**

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vehicle-flow-analyzer
   ```

2. **Configure environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your settings
   
   # Frontend
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your API URL
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Manual Setup

See detailed instructions in:
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

## 📊 Database Setup

1. **Initialize the database schema**
   ```bash
   cd database
   python setup_database.py
   ```

2. **Seed test data** (optional)
   ```bash
   cd backend
   python scripts/seed_data.py
   ```

## 🎯 Usage

### Queue Detection

1. Navigate to the Queue Detection page
2. Upload a video or image
3. The system will:
   - Detect vehicles crossing entry/exit lines
   - Calculate wait times
   - Provide statistics (total vehicles, queue length, avg wait time)

### Emergency Vehicle Detection

1. Navigate to the Emergency Detection page
2. Upload a video or image
3. The system will identify:
   - Ambulances
   - Fire trucks
   - Police cars
4. View detection statistics and annotated output

### Real-time Monitoring

1. Access the Dashboard
2. Monitor live metrics:
   - Vehicle count
   - Average dwell time
   - Queue length
   - Traffic patterns
3. View real-time charts and event tables
4. Respond to automated recommendations

## 🔧 Configuration

### Line Setup for Queue Detection

Use the interactive line setup tool to configure entry/exit lines:

```bash
python setup_lines.py
```

Controls:
- **Drag lines**: Position entry (green) and exit (red) boundaries
- **SPACE**: Pause/Play video
- **LEFT/RIGHT**: Step through frames
- **'s'**: Save line positions
- **'d'**: Toggle detection overlay

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📡 API Documentation

Once the backend is running, access the interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

- `POST /api/v1/events/` - Ingest vehicle events
- `GET /api/v1/metrics/` - Get aggregated metrics
- `POST /api/v1/queue/detect` - Detect queues in video/image
- `POST /api/v1/emergency/detect` - Detect emergency vehicles
- `WS /ws/metrics` - WebSocket for real-time updates

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://localhost:6379/0
API_KEY_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws/metrics
```

## 🚢 Deployment

### Production Deployment

1. **Update environment variables** for production
2. **Build Docker images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```
3. **Deploy containers**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Database Migration

For production database setup, ensure you:
1. Create the database on your PostgreSQL instance
2. Run the schema setup: `psql -f database/schema.sql`
3. Update `DATABASE_URL` in backend/.env

## 📁 Model Weights

Pre-trained model weights should be placed in:
- `yolov8n.pt` - Base YOLOv8 nano model (root & backend/)
- `best_emergency_model.pt` - Emergency vehicle model (root)
- `weights/yolo/best.pt` - Custom trained YOLO weights
- `weights/efficientnet/best_weights_256x256_v2.pt` - EfficientNet weights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- YOLOv8 by Ultralytics
- TPHYOLOv5 custom implementation
- Material-UI team
- FastAPI framework

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the [Backend README](backend/README.md) for API details
- Check the [Frontend README](frontend/README.md) for UI details

## 🗺️ Roadmap

- [ ] Real-time camera feed integration
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Multi-language support
- [ ] Cloud deployment templates
- [ ] Enhanced ML model training pipeline

---

**Built with ❤️ for smarter traffic management**
