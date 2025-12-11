import { Code2, Database, Palette, Cloud, Shield, Zap } from 'lucide-react';

export default function TechStack() {
  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full mb-4">
          <Code2 className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">Technology Stack</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
          Modern <span className="gradient-text">Tech Stack</span>
        </h1>
        <p className="text-lg text-slate-600">
          Production-grade technologies powering the Vehicle Flow Analyzer platform
        </p>
      </div>

      <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          Backend Technologies
        </h2>
        <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Technology</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Version</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">FastAPI</td>
                <td className="px-6 py-4 text-sm text-slate-600">0.109.0</td>
                <td className="px-6 py-4 text-sm text-slate-600">High-performance async API framework</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Python</td>
                <td className="px-6 py-4 text-sm text-slate-600">3.11+</td>
                <td className="px-6 py-4 text-sm text-slate-600">Core backend programming language</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">PyTorch</td>
                <td className="px-6 py-4 text-sm text-slate-600">2.1.0</td>
                <td className="px-6 py-4 text-sm text-slate-600">Deep learning framework for model inference</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">YOLOv8</td>
                <td className="px-6 py-4 text-sm text-slate-600">Ultralytics 8.0</td>
                <td className="px-6 py-4 text-sm text-slate-600">Object detection and tracking model</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">OpenCV</td>
                <td className="px-6 py-4 text-sm text-slate-600">4.8.1</td>
                <td className="px-6 py-4 text-sm text-slate-600">Computer vision and image processing</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">PostgreSQL</td>
                <td className="px-6 py-4 text-sm text-slate-600">15.4</td>
                <td className="px-6 py-4 text-sm text-slate-600">Primary relational database</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Redis</td>
                <td className="px-6 py-4 text-sm text-slate-600">7.2</td>
                <td className="px-6 py-4 text-sm text-slate-600">In-memory cache and message broker</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">SQLAlchemy</td>
                <td className="px-6 py-4 text-sm text-slate-600">2.0</td>
                <td className="px-6 py-4 text-sm text-slate-600">Database ORM and query builder</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Pydantic</td>
                <td className="px-6 py-4 text-sm text-slate-600">2.5</td>
                <td className="px-6 py-4 text-sm text-slate-600">Data validation and serialization</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">NumPy</td>
                <td className="px-6 py-4 text-sm text-slate-600">1.25.0</td>
                <td className="px-6 py-4 text-sm text-slate-600">Numerical computing and array operations</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          Frontend Technologies
        </h2>
        <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Technology</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Version</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">React</td>
                <td className="px-6 py-4 text-sm text-slate-600">19.0</td>
                <td className="px-6 py-4 text-sm text-slate-600">UI component library and framework</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">TypeScript</td>
                <td className="px-6 py-4 text-sm text-slate-600">5.5.3</td>
                <td className="px-6 py-4 text-sm text-slate-600">Type-safe JavaScript development</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Vite</td>
                <td className="px-6 py-4 text-sm text-slate-600">5.4.2</td>
                <td className="px-6 py-4 text-sm text-slate-600">Next-generation frontend build tool</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Material-UI</td>
                <td className="px-6 py-4 text-sm text-slate-600">5.15.0</td>
                <td className="px-6 py-4 text-sm text-slate-600">React component library</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Tailwind CSS</td>
                <td className="px-6 py-4 text-sm text-slate-600">3.4.1</td>
                <td className="px-6 py-4 text-sm text-slate-600">Utility-first CSS framework</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Recharts</td>
                <td className="px-6 py-4 text-sm text-slate-600">2.10.0</td>
                <td className="px-6 py-4 text-sm text-slate-600">Data visualization and charting</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Axios</td>
                <td className="px-6 py-4 text-sm text-slate-600">1.6.0</td>
                <td className="px-6 py-4 text-sm text-slate-600">HTTP client for API requests</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">React Router</td>
                <td className="px-6 py-4 text-sm text-slate-600">6.20.0</td>
                <td className="px-6 py-4 text-sm text-slate-600">Client-side routing</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Lucide React</td>
                <td className="px-6 py-4 text-sm text-slate-600">0.344.0</td>
                <td className="px-6 py-4 text-sm text-slate-600">Icon library</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Infrastructure & DevOps</h2>
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Technology</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Version</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Docker</td>
                <td className="px-6 py-4 text-sm text-slate-600">24.0</td>
                <td className="px-6 py-4 text-sm text-slate-600">Containerization platform</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Docker Compose</td>
                <td className="px-6 py-4 text-sm text-slate-600">2.23</td>
                <td className="px-6 py-4 text-sm text-slate-600">Multi-container orchestration</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Nginx</td>
                <td className="px-6 py-4 text-sm text-slate-600">1.25</td>
                <td className="px-6 py-4 text-sm text-slate-600">Reverse proxy and load balancer</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">WebSockets</td>
                <td className="px-6 py-4 text-sm text-slate-600">Protocol</td>
                <td className="px-6 py-4 text-sm text-slate-600">Real-time bidirectional communication</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Render</td>
                <td className="px-6 py-4 text-sm text-slate-600">Cloud</td>
                <td className="px-6 py-4 text-sm text-slate-600">Cloud hosting and deployment</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">GitHub Actions</td>
                <td className="px-6 py-4 text-sm text-slate-600">CI/CD</td>
                <td className="px-6 py-4 text-sm text-slate-600">Continuous integration/deployment</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">AI & Machine Learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Object Detection</h3>
            <ul className="space-y-2 text-slate-700 text-sm">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>YOLOv8:</strong> Primary detection model with custom training</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>TPH-YOLOv5:</strong> Specialized tiny person/vehicle detection</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>Custom NMS:</strong> Non-maximum suppression optimization</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Classification</h3>
            <ul className="space-y-2 text-slate-700 text-sm">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span><strong>EfficientNet:</strong> Emergency vehicle classification</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span><strong>ResNet50:</strong> Vehicle type classification</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span><strong>Custom CNN:</strong> Accident detection model</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Tracking</h3>
            <ul className="space-y-2 text-slate-700 text-sm">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span><strong>DeepSORT:</strong> Multi-object tracking algorithm</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span><strong>ByteTrack:</strong> Enhanced tracking for occlusions</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span><strong>Kalman Filter:</strong> Motion prediction and smoothing</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Image Processing</h3>
            <ul className="space-y-2 text-slate-700 text-sm">
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span><strong>Deglare:</strong> Adaptive glare removal algorithms</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span><strong>Denoise:</strong> Non-local means denoising</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span><strong>CLAHE:</strong> Contrast-limited adaptive histogram equalization</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Development Tools</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Code Quality</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• ESLint (JavaScript linting)</li>
                <li>• Pylint (Python linting)</li>
                <li>• Black (Python formatter)</li>
                <li>• Prettier (Code formatter)</li>
                <li>• MyPy (Static type checking)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Testing</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• Pytest (Python testing)</li>
                <li>• Jest (JavaScript testing)</li>
                <li>• React Testing Library</li>
                <li>• Postman (API testing)</li>
                <li>• Locust (Load testing)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Documentation</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• Swagger/OpenAPI</li>
                <li>• TypeDoc (TS docs)</li>
                <li>• Sphinx (Python docs)</li>
                <li>• Storybook (Component docs)</li>
                <li>• Markdown (General docs)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
