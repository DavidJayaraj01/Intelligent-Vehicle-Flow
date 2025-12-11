# Vehicle Flow Analyzer - Frontend

Modern React TypeScript frontend for real-time traffic monitoring and vehicle detection visualization.

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── App.tsx               # Root component with routing
│   ├── App.css               # Global styles
│   ├── index.css             # Base styles with Tailwind
│   ├── components/           # Reusable UI components
│   │   ├── Dashboard.tsx    # Main dashboard view
│   │   ├── KPITiles.tsx     # Metric cards
│   │   ├── RealtimeChart.tsx # Live data charts
│   │   ├── EventTable.tsx   # Event data table
│   │   ├── CameraFeed.tsx   # Camera visualization
│   │   ├── ReplayPanel.tsx  # Video replay controls
│   │   ├── ActionModal.tsx  # Action confirmation dialog
│   │   ├── Layout.tsx       # Page layout wrapper
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   └── Login.tsx        # Authentication component
│   ├── pages/               # Page components
│   │   ├── Upload.tsx       # File upload page
│   │   ├── QueueDetection.tsx      # Queue analysis page
│   │   └── EmergencyDetection.tsx  # Emergency vehicle detection page
│   ├── services/            # External service integrations
│   │   ├── api.ts          # REST API client
│   │   └── websocket.ts    # WebSocket client
│   ├── utils/              # Helper functions
│   │   ├── auth.ts         # Authentication utilities
│   │   └── exportCSV.ts    # Data export utilities
│   └── assets/             # Static assets
├── public/                  # Public assets
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies
└── Dockerfile              # Production Docker build
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see [Backend README](../backend/README.md))

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🛠️ Configuration

### Environment Variables (.env)

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000

# WebSocket URL
VITE_WS_URL=ws://localhost:8000/ws/metrics
```

## 📱 Pages & Features

### Dashboard (`/dashboard`)

Main monitoring interface with real-time updates.

**Components:**
- **KPI Tiles**: Total events, average dwell time, queue length, active cameras
- **Real-time Charts**: Traffic flow over time with live updates
- **Event Table**: Recent vehicle detections with filtering
- **Camera Feeds**: Multi-camera grid view with live detections
- **Recommendation Modal**: AI-generated traffic recommendations

**Features:**
- Live WebSocket updates
- Auto-refresh metrics
- Interactive charts (Recharts)
- Camera switching
- Data export to CSV

### Queue Detection (`/queue-detection`)

Upload videos or images for queue analysis.

**Features:**
- Drag-and-drop file upload
- Video/image preview
- Processing with progress indicator
- Statistics display:
  - Total vehicles
  - Currently in queue
  - Completed queue
  - Average wait time
  - Max/min wait times
- Individual vehicle details
- Video playback controls
- Download processed output

**Supported Formats:**
- Videos: MP4, AVI, MOV
- Images: JPG, PNG
- Max size: 500MB

### Emergency Detection (`/emergency`)

Detect and identify emergency vehicles.

**Features:**
- File upload interface
- Real-time processing
- Detection categories:
  - 🚑 Ambulances
  - 🚒 Fire Trucks
  - 🚓 Police Cars
- Statistics:
  - Detection counts per category
  - Total detections
  - Confidence scores
  - Processing time
- Annotated output with bounding boxes
- Video/image preview
- Download results

### Upload (`/upload`)

General file upload interface for detection services.

## 🎨 UI Components

### KPITiles

Displays key performance indicators in a card grid.

```tsx
<KPITiles
  totalEvents={metrics.total_events}
  avgDwellTime={metrics.avg_dwell_time}
  queueLength={metrics.queue_length}
  activeCameras={4}
/>
```

### RealtimeChart

Interactive line chart with live data updates.

```tsx
<RealtimeChart
  data={chartData}
  title="Vehicle Flow"
  dataKey="vehicles"
/>
```

### EventTable

Sortable, filterable table of vehicle events.

```tsx
<EventTable
  events={events}
  onRefresh={handleRefresh}
/>
```

### CameraFeed

Live camera view with detection overlays.

```tsx
<CameraFeed
  cameraId="cam01"
  detections={detections}
  onCameraChange={handleCameraChange}
/>
```

## 🌐 API Integration

### REST API Client (`services/api.ts`)

Pre-configured Axios client with interceptors.

```typescript
import { getEvents, postEvents, getMetrics } from './services/api';

// Fetch events
const response = await getEvents({ limit: 100 });

// Post events
await postEvents({ camera_id: 'cam01', events: [...] });

// Get metrics
const metrics = await getMetrics({ camera_id: 'cam01' });
```

**Available Methods:**
- `getEvents(params)` - Fetch vehicle events
- `postEvents(data)` - Submit events
- `getMetrics(params)` - Get aggregated metrics
- `getMetricsTimeSeries(params)` - Get time-series data
- `getTracks(trackId, cameraId)` - Get track details
- `postAction(data)` - Submit operator action
- `getActions(params)` - Get action history
- `checkHealth()` - Backend health check

### WebSocket Client (`services/websocket.ts`)

Real-time event streaming.

```typescript
import wsService from './services/websocket';

// Connect
wsService.connect();

// Listen for messages
wsService.onMessage((message) => {
  console.log('Received:', message);
});

// Disconnect
wsService.disconnect();
```

**Message Types:**
- `events_ingested` - New events received
- `recommendation` - AI recommendation
- `action_requested` - Action triggered
- `kpi_update` - Metric update

## 🎨 Styling

### Theme

Dark theme with Material-UI customization:

```typescript
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#0ea5e9' },    // Sky blue
    secondary: { main: '#6366f1' },   // Indigo
    background: {
      default: '#0f172a',  // Slate 900
      paper: '#1e293b',    // Slate 800
    },
  },
});
```

### Tailwind CSS

Utility-first CSS framework for rapid styling.

```jsx
<div className="flex items-center justify-between p-4 bg-slate-800">
  <h1 className="text-2xl font-bold">Title</h1>
</div>
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

## 🏗️ Building for Production

### Development Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Docker Build
```bash
docker build -t vehicle-flow-frontend .
docker run -p 3000:80 vehicle-flow-frontend
```

## 🐳 Docker Deployment

### Multi-stage Build

The Dockerfile uses a two-stage build:

1. **Build stage**: Compiles TypeScript and bundles assets
2. **Production stage**: Serves static files with Nginx

### Build & Run
```bash
docker build -t vehicle-flow-frontend .
docker run -d -p 80:80 vehicle-flow-frontend
```

### Nginx Configuration

Custom Nginx config in `nginx.conf`:
- SPA routing support
- Gzip compression
- Cache headers
- Reverse proxy for API (optional)

## 📦 Dependencies

### Core
- **react** (19.2.0) - UI library
- **react-dom** - React DOM rendering
- **react-router-dom** - Client-side routing
- **typescript** - Type safety

### UI Framework
- **@mui/material** - Material-UI components
- **@mui/icons-material** - Material icons
- **@emotion/react** - CSS-in-JS
- **@emotion/styled** - Styled components

### Data & HTTP
- **axios** - HTTP client
- **recharts** - Chart library

### Build Tools
- **vite** - Build tool and dev server
- **tailwindcss** - Utility CSS
- **autoprefixer** - CSS vendor prefixes
- **postcss** - CSS processing

## 🔧 Scripts

```json
{
  "dev": "vite",              // Start dev server
  "build": "tsc -b && vite build",  // Production build
  "lint": "eslint .",         // Run ESLint
  "preview": "vite preview"   // Preview production build
}
```

## 🎯 Development Tips

### Hot Module Replacement (HMR)

Vite provides fast HMR out of the box. Changes reflect instantly without full page reload.

### VS Code Extensions

Recommended:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

### TypeScript Configuration

Strict mode enabled for type safety:
```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in package.json or vite.config.ts
# Or kill the process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows
```

### API Connection Issues

1. Check backend is running: `curl http://localhost:8000/health`
2. Verify `VITE_API_BASE_URL` in `.env`
3. Check CORS settings in backend
4. Open browser DevTools → Network tab

### WebSocket Connection Failed

1. Verify `VITE_WS_URL` is correct
2. Check backend WebSocket endpoint is accessible
3. Look for CORS or firewall issues

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

## 📊 Performance Optimization

- **Code Splitting**: Routes lazy-loaded with React.lazy()
- **Tree Shaking**: Unused code eliminated in production
- **Asset Optimization**: Images and fonts optimized
- **Gzip Compression**: Nginx gzip enabled
- **CDN Ready**: Static assets can be served from CDN

## 🌍 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## 🔐 Security

- XSS Protection via React's automatic escaping
- HTTPS in production
- Environment variables for sensitive data
- API key authentication
- CSP headers in Nginx

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Recharts Documentation](https://recharts.org/)

---

**For backend API details, see [Backend README](../backend/README.md)**
