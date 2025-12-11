import { Scale, Check } from 'lucide-react';

export default function License() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">License</h1>
      <p className="text-slate-600 mb-8">
        Open source licensing information for Vehicle Flow Analyzer
      </p>

      <section className="mb-10">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">MIT License</h2>
              <p className="text-slate-600">Free and open source software</p>
            </div>
          </div>
          <p className="text-slate-700 leading-relaxed">
            Vehicle Flow Analyzer is released under the MIT License, one of the most permissive
            open source licenses. You're free to use, modify, and distribute this software for
            personal or commercial purposes.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What You Can Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Commercial Use</h3>
                <p className="text-slate-600 text-sm">
                  Use this software for commercial purposes without any restrictions or fees.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Modification</h3>
                <p className="text-slate-600 text-sm">
                  Modify the source code to suit your needs and create derivative works.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Distribution</h3>
                <p className="text-slate-600 text-sm">
                  Distribute copies of the original or modified software to anyone.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Private Use</h3>
                <p className="text-slate-600 text-sm">
                  Use and modify the software privately without sharing your changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Requirements</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-700 mb-4">
            When using or distributing this software, you must:
          </p>
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">•</span>
              <span>
                <strong>Include the license:</strong> The MIT license and copyright notice must be
                included in all copies or substantial portions of the software.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">•</span>
              <span>
                <strong>Preserve copyright:</strong> Keep the original copyright notice intact when
                distributing.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Disclaimer</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <p className="text-amber-900 text-sm leading-relaxed">
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
            INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
            PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
            FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
            OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
            DEALINGS IN THE SOFTWARE.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Full License Text</h2>
        <div className="bg-slate-900 rounded-lg p-6 text-slate-100 text-sm font-mono overflow-x-auto">
          <pre>{`MIT License

Copyright (c) 2024 Vehicle Flow Analyzer Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}</pre>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Third-Party Licenses</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-700 mb-4">
            This project includes or depends on several open-source libraries, each with their own licenses:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Library</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">License</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-4 py-3 text-slate-900">YOLOv8 (Ultralytics)</td>
                  <td className="px-4 py-3 text-slate-600">AGPL-3.0</td>
                  <td className="px-4 py-3 text-slate-600">Object detection</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-slate-900">FastAPI</td>
                  <td className="px-4 py-3 text-slate-600">MIT</td>
                  <td className="px-4 py-3 text-slate-600">API framework</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-slate-900">React</td>
                  <td className="px-4 py-3 text-slate-600">MIT</td>
                  <td className="px-4 py-3 text-slate-600">UI library</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-slate-900">PyTorch</td>
                  <td className="px-4 py-3 text-slate-600">BSD-3</td>
                  <td className="px-4 py-3 text-slate-600">Deep learning</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-slate-900">OpenCV</td>
                  <td className="px-4 py-3 text-slate-600">Apache 2.0</td>
                  <td className="px-4 py-3 text-slate-600">Computer vision</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-slate-900">PostgreSQL</td>
                  <td className="px-4 py-3 text-slate-600">PostgreSQL License</td>
                  <td className="px-4 py-3 text-slate-600">Database</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-600 text-sm mt-4">
            Note: YOLOv8 uses AGPL-3.0, which requires derivative works to also be open-sourced under
            AGPL. For commercial closed-source use, consider Ultralytics Enterprise License.
          </p>
        </div>
      </section>
    </div>
  );
}
