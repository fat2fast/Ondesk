import React, { useState } from 'react';
import { Braces, Minimize2, Maximize2, AlertCircle, Copy, Check } from 'lucide-react';
import { CodeEditor } from '../ui/CodeEditor';
import { Button } from '../ui/Button';

export const JsonEditor: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const processJson = (action: 'format' | 'minify') => {
    try {
      if (!jsonInput.trim()) {
          setError(null);
          setStats('');
          return;
      }
      const parsed = JSON.parse(jsonInput);
      const result = action === 'format' ? JSON.stringify(parsed, null, 4) : JSON.stringify(parsed);
      setJsonInput(result);
      setError(null);
      setStats(`${(new Blob([result]).size / 1024).toFixed(2)} KB • ${Object.keys(parsed).length} keys (top level)`);
    } catch (err: any) {
      setError(err.message || "Invalid JSON");
      setStats('');
    }
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(jsonInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Braces className="w-6 h-6 text-yellow-400" />
            JSON Editor
          </h2>
          <p className="text-slate-400 text-sm">Validate, Format, and Minify JSON data.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 sticky top-0 z-10 bg-slate-900/80 backdrop-blur p-2 rounded-lg">
          <Button onClick={() => processJson('format')} variant="secondary" icon={<Maximize2 className="w-4 h-4" />}>
            Beautify
          </Button>
          <Button onClick={() => processJson('minify')} variant="secondary" icon={<Minimize2 className="w-4 h-4" />}>
            Minify
          </Button>
           <Button onClick={handleCopy} variant="primary" icon={copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}>
            Copy
          </Button>
        </div>
      </header>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex-1 relative">
        <CodeEditor 
          value={jsonInput}
          onChange={(e) => {
              setJsonInput(e.target.value);
              if(error) setError(null);
          }}
          placeholder='{"key": "value"}'
          className={`h-full ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        />
        {stats && (
            <div className="absolute bottom-4 right-4 text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded opacity-80 pointer-events-none">
                {stats}
            </div>
        )}
      </div>
    </div>
  );
};