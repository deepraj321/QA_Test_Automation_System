import React, { useState } from 'react';
import { 
  Sparkles, Terminal, Download, Code2, Info, AlertTriangle, 
  CheckCircle2, RefreshCw, Cpu, BookOpen, Layers, Lightbulb, Play
} from 'lucide-react';
import JSZip from 'jszip';
import { GeneratorConfig, GenerationResult } from './types';
import { INITIAL_PRESET_RESULT } from './data';
import ConfigPanel from './components/ConfigPanel';
import FileTree from './components/FileTree';
import CodePlayground from './components/CodePlayground';

const defaultConfig: GeneratorConfig = {
  tool: 'playwright',
  language: 'typescript',
  framework: 'Playwright Test',
  inputMode: 'text',
  inputContent: '',
  usePom: true,
  browser: 'chrome',
  headless: true,
  timeout: 30,
  assertionStyle: 'native',
  includeScreenshots: true,
  ciCdProvider: 'github',
  dataDriven: false,
  parallelExecution: true
};

export default function App() {
  const [config, setConfig] = useState<GeneratorConfig>(() => {
    // Start with default config but prepopulate requirements with the text sample
    return {
      ...defaultConfig,
      inputContent: `1. Navigate to "https://ecommerce-playground.lambdatest.io/index.php?route=account/login"
2. Login with email "qa_test_user@example.com" and password "SecurePass123!"
3. Click login button and verify user is on account page
4. Search for product "iPhone" and click first product
5. Click Add to Cart and verify product added successfully`
    };
  });
  
  const [result, setResult] = useState<GenerationResult | null>(INITIAL_PRESET_RESULT);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('tests/cart.test.ts');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'setup'>('editor');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [zipDownloading, setZipDownloading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error generating code.');
      }

      const data: GenerationResult = await response.json();
      setResult(data);
      
      // Auto-select the first test file or readme if available
      if (data.files && data.files.length > 0) {
        const testFile = data.files.find(f => f.path.includes('test') || f.path.includes('spec')) || data.files[0];
        setSelectedFilePath(testFile.path);
      }
      setActiveTab('editor');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeFile = result?.files.find(f => f.path === selectedFilePath) || null;

  const handleDownloadZip = async () => {
    if (!result) return;
    setZipDownloading(true);
    try {
      const zip = new JSZip();
      
      // Add files in respective folder paths
      result.files.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Generate visual zip file
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.tool}-${config.language}-suite.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating ZIP archive:', err);
    } finally {
      setZipDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-brand-bg text-slate-100 font-sans overflow-hidden" id="app-root-container">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-brand-header border-b border-brand-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white shrink-0 shadow-lg shadow-indigo-600/20">
            QA
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white uppercase flex items-center gap-2">
              Auto-SDET <span className="text-indigo-400">Architect</span>
              <span className="text-[9px] px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold rounded-full uppercase tracking-widest font-mono">
                Stable v4.0
              </span>
            </h1>
            <p className="text-xs text-slate-400">Generate fully functional Page Object Model suites & run scripts on Playwright or Selenium</p>
          </div>
        </div>

        {/* Header Right */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-border border border-brand-border text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-400">Engine:</span>
            <span className="text-indigo-400 font-mono font-bold">gemini-3.5-flash</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Configurations */}
        <section className="w-[420px] shrink-0 border-r border-brand-border h-full bg-brand-panel">
          <ConfigPanel 
            config={config} 
            onChangeConfig={setConfig} 
            onGenerate={handleGenerate} 
            loading={loading} 
          />
        </section>

        {/* Right Area: Output Workspace */}
        <section className="flex-1 flex flex-col h-full bg-brand-bg overflow-hidden">
          {/* Output Header Nav */}
          <div className="flex items-center justify-between px-6 py-3 bg-brand-header border-b border-brand-border shrink-0">
            <div className="flex gap-2 text-xs">
              <button
                id="tab-view-editor"
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-brand-border text-indigo-400 shadow border border-brand-border'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-brand-border/30'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Workspace Code Playpen</span>
              </button>

              <button
                id="tab-view-setup"
                type="button"
                onClick={() => setActiveTab('setup')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'setup'
                    ? 'bg-brand-border text-indigo-400 shadow border border-brand-border'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-brand-border/30'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Runner Setup & CI/CD</span>
              </button>
            </div>

            {/* Actions for active results */}
            {result && (
              <button
                id="btn-download-zip"
                type="button"
                onClick={handleDownloadZip}
                disabled={zipDownloading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all text-xs cursor-pointer shadow hover:shadow-emerald-600/10 active:scale-[0.98]"
              >
                {zipDownloading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-white" />
                )}
                <span>EXPORT ZIP</span>
              </button>
            )}
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="mx-6 mt-4 p-4 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-start gap-3 text-xs text-rose-300 animate-fade-in" id="error-message-box">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <span className="font-bold">Execution Error: </span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Workspace Body */}
          <div className="flex-1 overflow-hidden relative flex flex-col">
            {loading ? (
              /* Loading Backdrop */
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-bg/90 z-20" id="loading-backdrop">
                <div className="relative flex items-center justify-center mb-6">
                  <div className="w-16 h-16 border-4 border-brand-border border-t-indigo-500 rounded-full animate-spin" />
                  <Cpu className="w-6 h-6 text-indigo-400 absolute animate-pulse" />
                </div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-white mb-2">Synthesizing Automation Environment</h3>
                <p className="text-xs text-slate-400 animate-pulse text-center max-w-sm px-4">Our server-side SDET intelligence is drafting Page Object Classes, robust element locators, and running setup files.</p>
              </div>
            ) : null}

            <div className="flex-1 overflow-hidden">
              {result ? (
                activeTab === 'editor' ? (
                  /* Interactive Code Workspace (Split Screen) */
                  <div className="h-full flex p-5 gap-5 animate-fade-in" id="editor-tab-body">
                    {/* Left Column (1/3 Width): File Tree */}
                    <div className="w-1/3 min-w-[240px] max-w-[320px] h-full flex flex-col">
                      <FileTree 
                        files={result.files} 
                        selectedFilePath={selectedFilePath} 
                        onSelectFile={setSelectedFilePath} 
                      />
                    </div>

                    {/* Right Column (2/3 Width): Interactive Editor */}
                    <div className="flex-1 h-full min-w-0">
                      <CodePlayground file={activeFile} />
                    </div>
                  </div>
                ) : (
                  /* Setup Instructions, Summary, and Next Steps View */
                  <div className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar animate-fade-in" id="setup-tab-body">
                    {/* Summary & Assumptions row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Summary Card */}
                      <div className="bg-brand-panel border border-brand-border rounded-lg p-5 flex flex-col shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Generation Summary</h3>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed bg-brand-code p-4 rounded-lg border border-brand-border/60 flex-1 font-sans">
                          {result.summary}
                        </p>
                      </div>

                      {/* Assumptions Card */}
                      <div className="bg-brand-panel border border-brand-border rounded-lg p-5 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Architectural Assumptions</h3>
                        </div>
                        <ul className="space-y-2.5 bg-brand-code p-4 rounded-lg border border-brand-border/60 text-xs text-slate-300 font-sans">
                          {result.assumptions.map((item, index) => (
                            <li key={index} className="flex gap-2">
                              <span className="text-indigo-400 font-semibold">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Execution Instructions */}
                    <div className="bg-brand-panel border border-brand-border rounded-lg p-5 space-y-4 shadow-lg">
                      <div className="flex items-center gap-2 border-b border-brand-border pb-3">
                        <Terminal className="w-5 h-5 text-indigo-400 shrink-0" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Shell Setup & Execution</h3>
                      </div>

                      <div className="space-y-4 text-xs">
                        {/* Prerequisites */}
                        <div>
                          <h4 className="font-bold text-indigo-400/80 mb-1.5 uppercase tracking-wide text-[10px]">1. Local Prerequisites</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.setupInstructions.preRequisites.map((req, i) => (
                              <span key={i} className="px-2.5 py-1 rounded bg-brand-code border border-brand-border/80 text-slate-300 font-mono text-[11px]">
                                {req}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Dependency Install */}
                        <div className="space-y-1.5">
                          <h4 className="font-bold text-indigo-400/80 uppercase tracking-wide text-[10px]">2. Install Dependencies</h4>
                          <div className="relative">
                            <pre className="p-3.5 rounded-lg bg-brand-code border border-brand-border/80 font-mono text-xs text-emerald-400 overflow-x-auto">
                              {result.setupInstructions.installCmd}
                            </pre>
                            <button
                              onClick={() => navigator.clipboard.writeText(result.setupInstructions.installCmd)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-brand-border hover:bg-brand-border/80 border border-brand-border/60 rounded text-slate-300 hover:text-white transition-colors text-[10px] cursor-pointer"
                            >
                              Copy
                            </button>
                          </div>
                        </div>

                        {/* Run Command */}
                        <div className="space-y-1.5">
                          <h4 className="font-bold text-indigo-400/80 uppercase tracking-wide text-[10px]">3. Execute Tests</h4>
                          <div className="relative">
                            <pre className="p-3.5 rounded-lg bg-brand-code border border-brand-border/80 font-mono text-xs text-emerald-400 overflow-x-auto">
                              {result.setupInstructions.runCmd}
                            </pre>
                            <button
                              onClick={() => navigator.clipboard.writeText(result.setupInstructions.runCmd)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-brand-border hover:bg-brand-border/80 border border-brand-border/60 rounded text-slate-300 hover:text-white transition-colors text-[10px] cursor-pointer"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations and scaling tips */}
                    <div className="bg-brand-panel border border-brand-border rounded-lg p-5 shadow-lg">
                      <div className="flex items-center gap-2 mb-3 border-b border-brand-border pb-3">
                        <Lightbulb className="w-5 h-5 text-indigo-400 shrink-0" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">SDET Architectural Recommendations</h3>
                      </div>
                      <ul className="space-y-3 text-xs text-slate-300 font-sans">
                        {result.notes.map((note, index) => (
                          <li key={index} className="flex gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] shrink-0 font-bold">
                              {index + 1}
                            </div>
                            <span className="leading-relaxed">{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              ) : (
                /* Preset Placeholder */
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-brand-code/10" id="preset-placeholder">
                  <Code2 className="w-16 h-16 text-indigo-500/40 mb-4 animate-bounce" />
                  <h3 className="text-base font-bold text-slate-300 uppercase tracking-wider">Ready for Automation Synthesis</h3>
                  <p className="text-xs text-slate-500 max-w-md mt-2 leading-relaxed">
                    Provide custom test requirements or steps in the architect panel, then click "Generate Automation Suite" to design a fully structured, Page Object Model framework.
                  </p>
                </div>
              )}
            </div>

            {/* Design Status Footer bar */}
            <footer className="h-10 bg-brand-header border-t border-brand-border flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-[10px] text-gray-400 uppercase font-bold">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div> Engine Ready
                </span>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">
                  Target: {config.browser} / {config.headless ? 'Headless' : 'Headed'}
                </span>
              </div>
              <div className="text-[10px] text-gray-500 uppercase font-bold">
                Language: <span className="text-indigo-400 font-mono font-bold">{config.language}</span>
              </div>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
