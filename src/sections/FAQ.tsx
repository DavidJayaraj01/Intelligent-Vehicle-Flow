export default function FAQ() {
  const faqs = [
    {
      category: "General",
      questions: [
        {
          q: "What is Vehicle Flow Analyzer?",
          a: "Vehicle Flow Analyzer is an AI-powered traffic monitoring and optimization platform that uses computer vision and deep learning to detect vehicles, analyze traffic patterns, identify emergency vehicles, detect accidents, and provide real-time insights for traffic management."
        },
        {
          q: "What are the system requirements?",
          a: "Minimum: 8GB RAM, 4-core CPU, 20GB storage. Recommended: 16GB RAM, 8-core CPU, NVIDIA GPU with 6GB+ VRAM, 50GB SSD storage. For production: 32GB+ RAM, GPU acceleration, and scalable cloud infrastructure."
        },
        {
          q: "Is GPU required?",
          a: "No, but highly recommended. The system works on CPU but will process videos much slower. A GPU (CUDA-compatible) provides 10-30x faster processing speeds, enabling real-time analysis."
        },
        {
          q: "What video formats are supported?",
          a: "The platform supports common formats including MP4 (H.264/H.265), AVI, MOV, and WebM. Live streams via RTSP, RTMP, and HTTP are also supported for real-time monitoring."
        }
      ]
    },
    {
      category: "Performance",
      questions: [
        {
          q: "How many cameras can the system handle simultaneously?",
          a: "With proper hardware, the system can process 10-50+ camera feeds concurrently. The exact number depends on resolution, frame rate, hardware specifications, and whether GPU acceleration is available. The architecture supports horizontal scaling for unlimited cameras."
        },
        {
          q: "What is the processing speed?",
          a: "With GPU acceleration: 30-60 FPS for 1080p video. On CPU: 3-8 FPS depending on model size. Processing speed scales with hardware and can be optimized by reducing resolution, frame rate, or using smaller models."
        },
        {
          q: "How accurate is the vehicle detection?",
          a: "YOLOv8 achieves 90-95% accuracy in optimal conditions (good lighting, clear view). Accuracy may decrease to 75-85% in challenging conditions like heavy rain, night-time, or severe occlusion. The system includes preprocessing to improve accuracy in difficult conditions."
        },
        {
          q: "Can it work in real-time?",
          a: "Yes, with GPU acceleration the system processes video in real-time or near real-time. Results are streamed via WebSocket with sub-second latency. For multiple high-resolution streams, consider horizontal scaling or frame skipping strategies."
        }
      ]
    },
    {
      category: "Features & Capabilities",
      questions: [
        {
          q: "How does emergency vehicle detection work?",
          a: "The system uses a two-stage approach: YOLOv8 detects all vehicles, then an EfficientNet classifier identifies emergency vehicles (ambulances, fire trucks, police cars) based on visual features like light bars, color schemes, and markings. Accuracy is typically 85-92%."
        },
        {
          q: "What types of vehicles can be detected?",
          a: "The system classifies vehicles into 8+ categories: cars, trucks, buses, motorcycles, bicycles, ambulances, fire trucks, and police vehicles. Custom categories can be added by training on specific datasets."
        },
        {
          q: "How is queue time calculated?",
          a: "Queue time is calculated by tracking vehicle entry and exit from defined regions of interest (ROI). The system measures time from when a vehicle enters the queue until it exits, then aggregates data to provide average wait times per lane."
        },
        {
          q: "Can it detect accidents automatically?",
          a: "Yes, the system detects potential accidents by identifying stopped vehicles, unusual traffic patterns, and vehicles remaining stationary for extended periods in unexpected locations. It generates alerts for manual verification."
        },
        {
          q: "Does it work at night?",
          a: "Yes, with advanced preprocessing including deglare, denoise, gamma correction, and CLAHE enhancement. The system automatically detects low-light conditions and applies appropriate enhancements. For best results, cameras should have infrared capabilities."
        }
      ]
    },
    {
      category: "Deployment & Scaling",
      questions: [
        {
          q: "Can I deploy this in the cloud?",
          a: "Yes, the platform is cloud-ready with Docker support. It can be deployed on AWS, Google Cloud, Azure, Render, or any platform supporting Docker containers. The architecture supports auto-scaling and load balancing."
        },
        {
          q: "How do I scale for multiple locations?",
          a: "Use horizontal scaling with multiple backend instances behind a load balancer. Each instance can process different camera feeds. Shared PostgreSQL and Redis instances ensure data consistency across all nodes."
        },
        {
          q: "What's the estimated cloud hosting cost?",
          a: "For a small deployment (5-10 cameras): $100-300/month. Medium (25-50 cameras): $500-1500/month. Enterprise (100+ cameras): $2000+/month. Costs include compute, storage, database, and bandwidth. GPU instances significantly increase costs."
        },
        {
          q: "Is there a managed/SaaS version available?",
          a: "Currently, this is a self-hosted solution. A managed SaaS version is under development. Contact the team for early access or enterprise hosting options."
        }
      ]
    },
    {
      category: "Customization",
      questions: [
        {
          q: "Can I train my own detection model?",
          a: "Yes, the platform includes training scripts. You can fine-tune YOLOv8 on your custom dataset to improve accuracy for specific environments, vehicle types, or conditions. Training requires labeled data and GPU resources."
        },
        {
          q: "Can I customize the analytics?",
          a: "Yes, the analytics engine is modular. You can add custom metrics, modify queue analysis algorithms, or integrate additional AI models for specialized detection tasks."
        },
        {
          q: "How do I add support for new vehicle types?",
          a: "Train a new classification model on your vehicle types or extend the existing EfficientNet classifier. Update the vehicle type configuration and retrain with labeled examples of the new categories."
        },
        {
          q: "Can I integrate with existing systems?",
          a: "Yes, the platform provides a comprehensive REST API and WebSocket interface. You can integrate with existing traffic management systems, alerting platforms, or business intelligence tools."
        }
      ]
    },
    {
      category: "Data & Privacy",
      questions: [
        {
          q: "Is video data stored permanently?",
          a: "No, by default processed videos and raw uploads are retained for 30 days then automatically deleted. Retention policies are configurable. Only metadata and analytics are stored long-term in the database."
        },
        {
          q: "Is the system GDPR compliant?",
          a: "The platform provides tools for GDPR compliance including data anonymization, retention policies, and right-to-deletion. However, compliance is ultimately the responsibility of the deployer based on their specific use case and jurisdiction."
        },
        {
          q: "Can faces or license plates be blurred?",
          a: "Yes, optional privacy filters can blur faces and license plates in processed video output while maintaining vehicle detection and tracking capabilities."
        },
        {
          q: "How is data secured?",
          a: "Data is encrypted in transit (TLS/SSL) and at rest. Database credentials are environment-variable based. API endpoints support authentication. Follow security best practices for production deployment including firewall configuration and regular updates."
        }
      ]
    },
    {
      category: "Technical",
      questions: [
        {
          q: "What's the difference between YOLOv8n, YOLOv8s, and YOLOv8m?",
          a: "YOLOv8n (nano): Fastest, smallest (6MB), good for edge devices, 85-88% accuracy. YOLOv8s (small): Balanced speed/accuracy, 22MB, 88-91% accuracy. YOLOv8m (medium): Higher accuracy (91-94%), slower, 50MB, best for server deployment."
        },
        {
          q: "Why use Redis in addition to PostgreSQL?",
          a: "Redis provides high-speed caching for real-time metrics, WebSocket session management, and rate limiting. PostgreSQL stores persistent data like vehicle records, queue history, and analytics. This separation optimizes both real-time performance and data persistence."
        },
        {
          q: "Can I use a different database?",
          a: "PostgreSQL is recommended, but the codebase uses SQLAlchemy ORM which supports MySQL, SQLite, and other databases. Redis is essential for caching and real-time features and cannot be easily replaced."
        },
        {
          q: "What's the API rate limit?",
          a: "Default: 100 requests per minute per IP. Configurable based on deployment needs. WebSocket connections are limited to 1000 concurrent connections per instance. Rate limiting can be disabled for internal/trusted networks."
        }
      ]
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Frequently Asked Questions</h1>
      <p className="text-slate-600 mb-8">
        Common questions and answers about Vehicle Flow Analyzer
      </p>

      {faqs.map((category, idx) => (
        <section key={idx} className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{category.category}</h2>
          <div className="space-y-4">
            {category.questions.map((faq, qIdx) => (
              <div key={qIdx} className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{faq.q}</h3>
                <p className="text-slate-700 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-12">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Still have questions?</h2>
          <p className="text-slate-700 mb-6">
            Can't find the answer you're looking for? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/your-org/vehicle-flow-analyzer/discussions"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Ask on GitHub Discussions
            </a>
            <a
              href="https://discord.gg/your-invite"
              className="bg-slate-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Join Discord Community
            </a>
            <a
              href="mailto:support@vehicleflowanalyzer.com"
              className="bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
