/**
 * Application settings and configuration panel.
 */
import React, { useEffect, useState } from 'react';
import { copyToClipboard } from '../utils/helpers';

const SETTINGS_STORAGE_KEY = 'mara_settings';

interface SettingsState {
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  enableCitations: boolean;
}

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    defaultModel: 'deepseek/deepseek-v4-flash',
    temperature: 0.3,
    maxTokens: 4000,
    enableCitations: true,
  });

  const [apiKey, setApiKey] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const rawValue = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!rawValue) return;

      const parsed = JSON.parse(rawValue) as Partial<SettingsState> & {
        apiKey?: string;
        groqApiKey?: string;
        customModel?: string;
      };

      setSettings((prev) => ({
        ...prev,
        ...parsed,
      }));
      setApiKey(parsed.apiKey ?? '');
      setCustomModel(parsed.customModel ?? '');
    } catch {
      // Keep defaults when local storage is malformed
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        ...settings,
        apiKey: apiKey.trim(),
        customModel: customModel.trim(),
      })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };


  return (
    <div className="h-full overflow-y-auto bg-slate-950 p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-100">Settings</h2>
        <p className="text-slate-400 mt-2">
          Configure your research assistant preferences
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* API Configuration */}
        <Section title="API Configuration">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                OpenRouter API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => copyToClipboard(apiKey)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Get your free API key at{' '}
                <a
                  href="https://openrouter.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  openrouter.ai
                </a>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Leave this blank to use the backend default API key.
              </p>
            </div>
          </div>
          <div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Custom Model Identifier (Optional)
              </label>
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="e.g. meta-llama/llama-3.2-3b-instruct:free"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-slate-500 mt-2">
                If provided, this model will be used regardless of the dropdown selection.
              </p>
            </div>
          </div>
        </Section>

        {/* Model Configuration */}
        <Section title="Inference Settings">
          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Temperature: {settings.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    temperature: parseFloat(e.target.value),
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-1">
                Lower = More focused, Higher = More creative
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Max Tokens: {settings.maxTokens}
              </label>
              <input
                type="range"
                min="500"
                max="32000"
                step="500"
                value={settings.maxTokens}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxTokens: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-1">
                Maximum length of generated reports
              </p>
            </div>
          </div>
        </Section>

        {/* Research Settings */}
        <Section title="Research Preferences">
          <div className="space-y-4">
            <ToggleSetting
              label="Enable Citations"
              description="Include inline citations in research reports"
              checked={settings.enableCitations}
              onChange={(checked) =>
                setSettings({ ...settings, enableCitations: checked })
              }
            />
          </div>
        </Section>

        {/* About */}
        <Section title="About MARA">
          <div className="space-y-3 text-sm text-slate-400">
            <p>
              <strong className="text-slate-300">Version:</strong> 1.0.0
            </p>
            <p>
              <strong className="text-slate-300">Framework:</strong> LangGraph +
              FastAPI + React
            </p>
            <p>
              <strong className="text-slate-300">License:</strong> MIT
            </p>
            <div className="pt-4 border-t border-slate-800">
              <p className="text-slate-500 text-xs">
                Built with ❤️ for comprehensive research automation
              </p>
            </div>
          </div>
        </Section>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-semibold"
          >
            {saved ? '✓ Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
    <h3 className="text-xl font-semibold text-slate-200 mb-4">{title}</h3>
    {children}
  </div>
);

interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({
  label,
  description,
  checked,
  onChange,
}) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-slate-300 font-medium">{label}</p>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-700'
        }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'
          }`}
      />
    </button>
  </div>
);