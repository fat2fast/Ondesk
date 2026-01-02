import React, { useState, useEffect } from 'react';
import { Link, Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { CodeEditor } from '../ui/CodeEditor';

export const UrlConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
        if (!input) {
            setOutput('');
            return;
        }
        if (mode === 'encode') {
            setOutput(encodeURIComponent(input));
        } else {
            setOutput(decodeURIComponent(input));
        }
    } catch (e) {
        setOutput('Error: Invalid URI');
    }
  }, [input, mode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
       <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Link className="w-6 h-6 text-cyan-400" />
            URL Encoder / Decoder
          </h2>
          <p className="text-slate-400 text-sm">Encode to UTF-8 percent-encoding or decode back to text.</p>
        </div>
        <div className="bg-slate-800 p-1 rounded-lg flex">
             <button 
                onClick={() => setMode('encode')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${mode === 'encode' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
                 Encode
             </button>
             <button 
                onClick={() => setMode('decode')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${mode === 'decode' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
                 Decode
             </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[400px]">
          <CodeEditor 
             label={mode === 'encode' ? 'Decoded String' : 'Encoded String'}
             value={input}
             onChange={(e) => setInput(e.target.value)}
             placeholder={mode === 'encode' ? "Enter text..." : "Enter %20url%20encoded..."}
          />
          <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-2">
                 <label className="text-sm font-semibold text-slate-300">Result</label>
                 <Button size="sm" variant="secondary" onClick={handleCopy} icon={copied ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}>
                    {copied ? 'Copied' : 'Copy'}
                 </Button>
              </div>
              <textarea 
                className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-200 focus:outline-none resize-none"
                readOnly
                value={output}
              />
          </div>
      </div>
    </div>
  );
};