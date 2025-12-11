import { Users, Github, Linkedin, Mail } from 'lucide-react';

export default function Contributors() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Contributors</h1>
      <p className="text-slate-600 mb-8">
        Meet the team behind Vehicle Flow Analyzer
      </p>

      <section className="mb-10">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white text-center mb-8">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-3">Built with collaboration</h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Vehicle Flow Analyzer is developed and maintained by a dedicated team of engineers,
            researchers, and contributors from around the world.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Core Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-blue-600">JD</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-slate-900">John Doe</h3>
                <p className="text-sm text-slate-600 mb-3">Lead Developer & Architect</p>
                <p className="text-slate-700 text-sm mb-3">
                  Core architecture, backend development, and ML model integration
                </p>
                <div className="flex gap-3">
                  <a href="https://github.com" className="text-slate-600 hover:text-slate-900">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="https://linkedin.com" className="text-slate-600 hover:text-slate-900">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="mailto:john@example.com" className="text-slate-600 hover:text-slate-900">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-green-600">JS</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-slate-900">Jane Smith</h3>
                <p className="text-sm text-slate-600 mb-3">ML Engineer</p>
                <p className="text-slate-700 text-sm mb-3">
                  Computer vision models, training pipelines, and accuracy optimization
                </p>
                <div className="flex gap-3">
                  <a href="https://github.com" className="text-slate-600 hover:text-slate-900">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="https://linkedin.com" className="text-slate-600 hover:text-slate-900">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="mailto:jane@example.com" className="text-slate-600 hover:text-slate-900">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-purple-600">AJ</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-slate-900">Alex Johnson</h3>
                <p className="text-sm text-slate-600 mb-3">Frontend Developer</p>
                <p className="text-slate-700 text-sm mb-3">
                  UI/UX design, dashboard development, and real-time visualization
                </p>
                <div className="flex gap-3">
                  <a href="https://github.com" className="text-slate-600 hover:text-slate-900">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="https://linkedin.com" className="text-slate-600 hover:text-slate-900">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="mailto:alex@example.com" className="text-slate-600 hover:text-slate-900">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-amber-600">MC</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-slate-900">Maria Chen</h3>
                <p className="text-sm text-slate-600 mb-3">DevOps Engineer</p>
                <p className="text-slate-700 text-sm mb-3">
                  Infrastructure, deployment pipelines, and system reliability
                </p>
                <div className="flex gap-3">
                  <a href="https://github.com" className="text-slate-600 hover:text-slate-900">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="https://linkedin.com" className="text-slate-600 hover:text-slate-900">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="mailto:maria@example.com" className="text-slate-600 hover:text-slate-900">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Contributors</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-700 mb-4">
            We're grateful to all contributors who have helped improve Vehicle Flow Analyzer:
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">@contributor1</span>
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">@contributor2</span>
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">@contributor3</span>
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">@contributor4</span>
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">@contributor5</span>
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">@contributor6</span>
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">@contributor7</span>
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">@contributor8</span>
          </div>
          <p className="text-slate-600 text-sm">
            View all contributors on{' '}
            <a href="https://github.com/your-org/vehicle-flow-analyzer/graphs/contributors" className="text-blue-600 hover:underline">
              GitHub
            </a>
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Acknowledgments</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Open Source Projects</h3>
          <p className="text-slate-700 mb-4">
            This project builds upon excellent open-source work:
          </p>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span><strong>Ultralytics YOLOv8</strong> - State-of-the-art object detection</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span><strong>FastAPI</strong> - High-performance Python API framework</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span><strong>React</strong> - Modern UI library</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span><strong>PostgreSQL</strong> - Robust relational database</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span><strong>OpenCV</strong> - Computer vision library</span>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Join the Team</h2>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 p-8 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-3">Want to contribute?</h3>
          <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
            We welcome contributions from developers, researchers, and traffic management experts.
            Check out our contribution guidelines and join our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/your-org/vehicle-flow-analyzer"
              className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </a>
            <a
              href="#contributing"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Contribution Guide
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
