import { GitPullRequest, GitBranch, Code, Bug, Lightbulb, MessageSquare } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

export default function Contributing() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Contributing</h1>
      <p className="text-slate-600 mb-8">
        Guidelines for contributing to Vehicle Flow Analyzer
      </p>

      <section className="mb-10">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white mb-8">
          <GitPullRequest className="w-12 h-12 mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-3">We Welcome Contributions</h2>
          <p className="text-blue-100 leading-relaxed">
            Whether you're fixing bugs, adding features, improving documentation, or sharing ideas,
            your contributions help make Vehicle Flow Analyzer better for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Code className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Code Contributions</h3>
            <p className="text-slate-600 text-sm">
              Submit bug fixes, new features, or performance improvements
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Bug className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Bug Reports</h3>
            <p className="text-slate-600 text-sm">
              Report issues, edge cases, or unexpected behavior
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Feature Requests</h3>
            <p className="text-slate-600 text-sm">
              Suggest new features or enhancements to existing ones
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Getting Started</h2>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">1. Fork and Clone</h3>
            <CodeBlock
              code={`# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/vehicle-flow-analyzer.git
cd vehicle-flow-analyzer

# Add upstream remote
git remote add upstream https://github.com/original-org/vehicle-flow-analyzer.git`}
              language="bash"
            />
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">2. Set Up Development Environment</h3>
            <CodeBlock
              code={`# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development dependencies

# Frontend setup
cd ../frontend
npm install

# Run tests to verify setup
npm test
pytest`}
              language="bash"
            />
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">3. Create a Branch</h3>
            <CodeBlock
              code={`# Create a feature branch
git checkout -b feature/your-feature-name

# Or a bug fix branch
git checkout -b fix/bug-description

# Branch naming conventions:
# - feature/feature-name  (new features)
# - fix/bug-description   (bug fixes)
# - docs/topic            (documentation)
# - refactor/component    (code refactoring)
# - test/feature          (test additions)`}
              language="bash"
            />
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Development Guidelines</h2>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Code Style</h3>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start">
                <GitBranch className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Python:</strong> Follow PEP 8. Use Black for formatting, Pylint for linting,
                  and type hints for all functions.
                </span>
              </li>
              <li className="flex items-start">
                <GitBranch className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>TypeScript/JavaScript:</strong> Follow Airbnb style guide. Use ESLint and
                  Prettier. Prefer functional components and hooks.
                </span>
              </li>
              <li className="flex items-start">
                <GitBranch className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Commits:</strong> Use conventional commits format:
                  <code className="bg-slate-100 px-2 py-0.5 rounded ml-1">type(scope): description</code>
                </span>
              </li>
            </ul>
            <CodeBlock
              code={`# Format code before committing
# Python
black .
pylint app/

# Frontend
npm run lint
npm run format`}
              language="bash"
            />
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Commit Message Format</h3>
            <CodeBlock
              code={`# Format: type(scope): description

# Types:
feat: New feature
fix: Bug fix
docs: Documentation changes
style: Code style (formatting, no logic change)
refactor: Code refactoring
test: Adding or updating tests
chore: Maintenance tasks

# Examples:
feat(detection): add support for bicycle detection
fix(queue): correct wait time calculation for empty lanes
docs(api): update authentication endpoint examples
test(emergency): add unit tests for ambulance classifier`}
              language="bash"
            />
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Testing Requirements</h3>
            <ul className="space-y-2 text-slate-700 mb-4">
              <li className="flex items-start">
                <span className="text-green-600 mr-3">•</span>
                <span>All new features must include unit tests</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-3">•</span>
                <span>Bug fixes should include regression tests</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-3">•</span>
                <span>Maintain or improve code coverage (target: 80%+)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-3">•</span>
                <span>All tests must pass before submitting PR</span>
              </li>
            </ul>
            <CodeBlock
              code={`# Run tests
pytest                    # Backend tests
pytest --cov=app          # With coverage
npm test                  # Frontend tests
npm test -- --coverage    # With coverage`}
              language="bash"
            />
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Submitting Changes</h2>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Before Submitting</h3>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span>Code follows project style guidelines</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span>All tests pass</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span>New tests added for new features</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span>Documentation updated</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span>Commit messages follow conventions</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span>Branch is up-to-date with main</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Create Pull Request</h3>
            <CodeBlock
              code={`# Push your branch
git push origin feature/your-feature-name

# Go to GitHub and create a Pull Request
# Fill out the PR template with:
# - Clear description of changes
# - Link to related issues
# - Screenshots/videos if UI changes
# - Testing instructions`}
              language="bash"
            />
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Pull Request Template</h3>
            <CodeBlock
              code={`## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123

## Testing
Describe testing performed

## Screenshots (if applicable)
Add screenshots

## Checklist
- [ ] Tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No new warnings`}
              language="markdown"
            />
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Reporting Bugs</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-700 mb-4">
            When reporting bugs, please include:
          </p>
          <ul className="space-y-2 text-slate-700 mb-4">
            <li className="flex items-start">
              <span className="text-red-600 mr-3">•</span>
              <span><strong>Clear description:</strong> What happened vs. what you expected</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-3">•</span>
              <span><strong>Steps to reproduce:</strong> Detailed steps to trigger the bug</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-3">•</span>
              <span><strong>Environment:</strong> OS, Python/Node version, GPU info</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-3">•</span>
              <span><strong>Logs:</strong> Relevant error messages and stack traces</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-3">•</span>
              <span><strong>Screenshots:</strong> If applicable</span>
            </li>
          </ul>
          <a
            href="https://github.com/your-org/vehicle-flow-analyzer/issues/new?template=bug_report.md"
            className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Report a Bug
          </a>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Feature Requests</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-700 mb-4">
            We love new ideas! When requesting features:
          </p>
          <ul className="space-y-2 text-slate-700 mb-4">
            <li className="flex items-start">
              <span className="text-purple-600 mr-3">•</span>
              <span>Describe the feature and why it's valuable</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-3">•</span>
              <span>Provide use cases and examples</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-3">•</span>
              <span>Consider implementation complexity</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-3">•</span>
              <span>Check if similar features exist</span>
            </li>
          </ul>
          <a
            href="https://github.com/your-org/vehicle-flow-analyzer/issues/new?template=feature_request.md"
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
          >
            Request a Feature
          </a>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Community</h2>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100 p-6">
          <div className="flex items-start gap-4 mb-4">
            <MessageSquare className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Join the Discussion</h3>
              <p className="text-slate-700 mb-4">
                Connect with other contributors, ask questions, and share ideas.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="https://discord.gg/your-invite" className="text-blue-600 hover:underline text-sm">
                  Discord Community
                </a>
                <span className="text-slate-400">•</span>
                <a href="https://github.com/your-org/vehicle-flow-analyzer/discussions" className="text-blue-600 hover:underline text-sm">
                  GitHub Discussions
                </a>
                <span className="text-slate-400">•</span>
                <a href="https://twitter.com/your-handle" className="text-blue-600 hover:underline text-sm">
                  Twitter
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
