import React, { useState, useEffect } from 'react';
import { 
  Settings, ChevronDown, ChevronUp, Play, Sparkles, Terminal, 
  HelpCircle, RefreshCw, FileText, Globe, Eye, EyeOff, ShieldCheck, Clock
} from 'lucide-react';
import { 
  AutomationTool, ProgrammingLanguage, InputMode, GeneratorConfig 
} from '../types';
import { 
  TOOLS, PLAYWRIGHT_LANGUAGES, SELENIUM_LANGUAGES, INPUT_MODES, SAMPLES 
} from '../data';

interface ConfigPanelProps {
  config: GeneratorConfig;
  onChangeConfig: (newConfig: GeneratorConfig) => void;
  onGenerate: () => void;
  loading: boolean;
}

export default function ConfigPanel({ config, onChangeConfig, onGenerate, loading }: ConfigPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState('Initializing SDET engine...');

  const phrases = [
    'Configuring browser environment...',
    'Structuring Page Object Model directory...',
    'Synthesizing locator strategies (data-testid fallback)...',
    'Applying synchronization wait protocols...',
    'Injecting error handling & screenshot hook listeners...',
    'Writing idiomatic test suite assertions...',
    'Generating pipeline CI/CD readiness matrices...'
  ];

  useEffect(() => {
    if (loading) {
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % phrases.length;
        setLoadingPhrase(phrases[index]);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setLoadingPhrase('Initializing SDET engine...');
    }
  }, [loading]);

  const activeLanguages = config.tool === 'playwright' ? PLAYWRIGHT_LANGUAGES : SELENIUM_LANGUAGES;
  const currentLanguageInfo = activeLanguages.find(l => l.id === config.language) || activeLanguages[0];

  // When tool changes, reset language and framework to defaults
  const handleToolChange = (tool: AutomationTool) => {
    const defaultLang = tool === 'playwright' ? PLAYWRIGHT_LANGUAGES[0] : SELENIUM_LANGUAGES[0];
    onChangeConfig({
      ...config,
      tool,
      language: defaultLang.id,
      framework: defaultLang.defaultFramework
    });
  };

  // When language changes, reset framework to default
  const handleLanguageChange = (language: ProgrammingLanguage) => {
    const langInfo = activeLanguages.find(l => l.id === language);
    if (langInfo) {
      onChangeConfig({
        ...config,
        language,
        framework: langInfo.defaultFramework
      });
    }
  };

  const handleInputModeChange = (inputMode: InputMode) => {
    onChangeConfig({
      ...config,
      inputMode,
      inputContent: SAMPLES[inputMode] // Automatically load the sample on mode switch!
    });
  };

  const loadSample = () => {
    onChangeConfig({
      ...config,
      inputContent: SAMPLES[config.inputMode]
    });
  };

  return (
    <div className="flex flex-col h-full bg-brand-panel border border-brand-border rounded-lg overflow-hidden shadow-xl" id="config-panel">
      {/* Panel Header */}
      <div className="flex items-center gap-2 px-5 py-4 bg-brand-panel border-b border-brand-border shrink-0">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">SDET Architect Panel</h2>
      </div>

      {/* Content Form Scrollable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {/* 1. Automation Tool Selection */}
        <div className="space-y-2" id="section-tool">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">1. Select Automation Tool</label>
          <div className="grid grid-cols-2 gap-3">
            {TOOLS.map((t) => {
              const active = config.tool === t.id;
              return (
                <button
                  key={t.id}
                  id={`btn-tool-${t.id}`}
                  type="button"
                  onClick={() => handleToolChange(t.id)}
                  className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/5'
                      : 'bg-brand-code border-brand-border hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="font-semibold text-sm">{t.name}</span>
                  <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{t.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Programming Language & Framework */}
        <div className="grid grid-cols-2 gap-4" id="section-language">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">2. Language</label>
            <select
              id="select-language"
              value={config.language}
              onChange={(e) => handleLanguageChange(e.target.value as ProgrammingLanguage)}
              className="w-full bg-brand-code border border-brand-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {activeLanguages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">3. Test Framework</label>
            <select
              id="select-framework"
              value={config.framework}
              onChange={(e) => onChangeConfig({ ...config, framework: e.target.value })}
              className="w-full bg-brand-code border border-brand-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {currentLanguageInfo.frameworks.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. POM vs Single Script toggle */}
        <div className="space-y-2" id="section-architecture">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">4. Architecture Model</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              id="btn-arch-script"
              type="button"
              onClick={() => onChangeConfig({ ...config, usePom: false })}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all cursor-pointer ${
                !config.usePom
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 font-medium'
                  : 'bg-brand-code border-brand-border text-slate-400 hover:border-slate-700'
              }`}
            >
              <FileText className="w-4 h-4 mb-1" />
              <span className="text-xs">Single Script</span>
            </button>

            <button
              id="btn-arch-pom"
              type="button"
              onClick={() => onChangeConfig({ ...config, usePom: true })}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all cursor-pointer ${
                config.usePom
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 font-medium'
                  : 'bg-brand-code border-brand-border text-slate-400 hover:border-slate-700'
              }`}
            >
              <Settings className="w-4 h-4 mb-1" />
              <span className="text-xs">Page Object Model Suite</span>
            </button>
          </div>
        </div>

        {/* 4. Requirements & Steps Input */}
        <div className="space-y-2" id="section-requirements">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">5. Test Requirements</label>
            <button
              id="btn-load-sample"
              type="button"
              onClick={loadSample}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold uppercase tracking-wide flex items-center gap-1 bg-brand-code px-2 py-1 rounded border border-brand-border hover:border-indigo-500/50 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 animate-spin-hover" />
              Load Sample
            </button>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex border-b border-brand-border text-xs">
            {INPUT_MODES.map((mode) => (
              <button
                key={mode.id}
                id={`tab-input-${mode.id}`}
                type="button"
                onClick={() => handleInputModeChange(mode.id)}
                className={`py-2 px-3 border-b-2 font-medium transition-colors cursor-pointer ${
                  config.inputMode === mode.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {mode.name}
              </button>
            ))}
          </div>

          <textarea
            id="textarea-requirements"
            value={config.inputContent}
            onChange={(e) => onChangeConfig({ ...config, inputContent: e.target.value })}
            placeholder={INPUT_MODES.find(m => m.id === config.inputMode)?.placeholder}
            className="w-full h-44 bg-brand-code border border-brand-border rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 resize-none custom-scrollbar"
          />
        </div>

        {/* Collapsible Advanced Settings */}
        <div className="border-t border-brand-border pt-4" id="section-advanced">
          <button
            id="btn-toggle-advanced"
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-indigo-500" />
              Advanced Runner Settings
            </span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-5 animate-fade-in" id="advanced-settings-body">
              {/* Browser Choice */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wide flex items-center gap-1">
                    <Globe className="w-3 h-3 text-indigo-400" />
                    Target Browser
                  </label>
                  <select
                    id="advanced-browser"
                    value={config.browser}
                    onChange={(e) => onChangeConfig({ ...config, browser: e.target.value as any })}
                    className="w-full bg-brand-code border border-brand-border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="chrome">Chromium / Chrome</option>
                    <option value="firefox">Firefox</option>
                    <option value="webkit">WebKit / Safari</option>
                    <option value="edge">Microsoft Edge</option>
                  </select>
                </div>

                {/* Headless toggle */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wide flex items-center gap-1">
                    {config.headless ? <EyeOff className="w-3 h-3 text-indigo-400" /> : <Eye className="w-3 h-3 text-indigo-400" />}
                    Execution Mode
                  </label>
                  <button
                    id="advanced-headless"
                    type="button"
                    onClick={() => onChangeConfig({ ...config, headless: !config.headless })}
                    className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      config.headless
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 font-medium'
                        : 'bg-brand-code border-brand-border text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{config.headless ? 'Headless (No GUI)' : 'Headed (With GUI)'}</span>
                  </button>
                </div>
              </div>

              {/* Timeout & Assertion Style */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wide flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    Timeout (Seconds)
                  </label>
                  <input
                    id="advanced-timeout"
                    type="number"
                    min="1"
                    max="120"
                    value={config.timeout}
                    onChange={(e) => onChangeConfig({ ...config, timeout: parseInt(e.target.value) || 10 })}
                    className="w-full bg-brand-code border border-brand-border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wide flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-400" />
                    Assertion Style
                  </label>
                  <select
                    id="advanced-assertions"
                    value={config.assertionStyle}
                    onChange={(e) => onChangeConfig({ ...config, assertionStyle: e.target.value as any })}
                    className="w-full bg-brand-code border border-brand-border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="native">Native Framework</option>
                    <option value="bdd">BDD Fluent Assertions</option>
                  </select>
                </div>
              </div>

              {/* Toggles Group: Failure Screenshots, CI/CD, Data Driven, Parallel */}
              <div className="space-y-3 pt-2 bg-brand-code p-3 rounded-lg border border-brand-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Screenshot on Failure</span>
                  <input
                    id="toggle-screenshots"
                    type="checkbox"
                    checked={config.includeScreenshots}
                    onChange={(e) => onChangeConfig({ ...config, includeScreenshots: e.target.checked })}
                    className="w-4 h-4 rounded border-brand-border text-indigo-500 focus:ring-indigo-500 accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Data-Driven Parameters (CSV/JSON)</span>
                  <input
                    id="toggle-datadriven"
                    type="checkbox"
                    checked={config.dataDriven}
                    onChange={(e) => onChangeConfig({ ...config, dataDriven: e.target.checked })}
                    className="w-4 h-4 rounded border-brand-border text-indigo-500 focus:ring-indigo-500 accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Parallel Run Config</span>
                  <input
                    id="toggle-parallel"
                    type="checkbox"
                    checked={config.parallelExecution}
                    onChange={(e) => onChangeConfig({ ...config, parallelExecution: e.target.checked })}
                    className="w-4 h-4 rounded border-brand-border text-indigo-500 focus:ring-indigo-500 accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">CI/CD Pipeline Readiness</span>
                  <select
                    id="advanced-cicd"
                    value={config.ciCdProvider}
                    onChange={(e) => onChangeConfig({ ...config, ciCdProvider: e.target.value as any })}
                    className="w-full bg-brand-code border border-brand-border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="none">Disabled / Local Only</option>
                    <option value="github">GitHub Actions (.github/workflows)</option>
                    <option value="gitlab">GitLab CI/CD (.gitlab-ci.yml)</option>
                    <option value="jenkins">Jenkins Pipeline (Jenkinsfile)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate CTA Button */}
      <div className="p-5 border-t border-brand-border bg-brand-code/40 shrink-0">
        <button
          id="btn-generate-suite"
          type="button"
          disabled={loading || !config.inputContent.trim()}
          onClick={onGenerate}
          className={`w-full py-3.5 px-4 rounded-lg font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
            loading || !config.inputContent.trim()
              ? 'bg-brand-border text-slate-500 cursor-not-allowed border border-brand-border/20'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold hover:shadow-lg hover:shadow-indigo-900/30 active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white shrink-0" />
              <div className="flex flex-col items-center min-w-0">
                <span className="truncate text-xs text-white">{loadingPhrase}</span>
              </div>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-white fill-white shrink-0" />
              <span>GENERATE AUTOMATION SUITE</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
