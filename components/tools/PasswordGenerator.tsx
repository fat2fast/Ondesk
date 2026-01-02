import React, { useState } from 'react';
import { Key, RefreshCw, Copy, Settings, Check } from 'lucide-react';
import { generateRandomString } from '../../utils/tools';

export const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState<number>(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [count, setCount] = useState<number>(1);
  const [generated, setGenerated] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = () => {
    if (!useUpper && !useLower && !useNumbers && !useSymbols) {
        setGenerated([]);
        return;
    }
    const newPasswords = [];
    for(let i=0; i<Math.min(count, 50); i++) {
        newPasswords.push(generateRandomString(length, useUpper, useLower, useNumbers, useSymbols));
    }
    setGenerated(newPasswords);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const Checkbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
    <label className="flex items-center space-x-3 cursor-pointer group">
      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-green-600 border-green-600' : 'border-slate-600 bg-slate-900 group-hover:border-slate-500'}`}>
        {checked && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="hidden" />
      <span className="text-slate-300 group-hover:text-white select-none">{label}</span>
    </label>
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      <header>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Key className="w-6 h-6 text-green-400" />
          Password Generator
        </h2>
        <p className="text-slate-400 text-sm">Generate secure, random passwords and strings with customizable options.</p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Settings Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-8 shadow-sm">
          <div className="flex items-center gap-2 text-green-500 font-semibold border-b border-slate-800 pb-2">
            <Settings className="w-5 h-5" />
            <h3>Settings</h3>
          </div>

          {/* Length Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 font-medium">Password Length</label>
              <div className="flex items-center">
                 <input 
                    type="number" 
                    value={length}
                    onChange={(e) => setLength(Math.max(1, Math.min(128, parseInt(e.target.value) || 1)))}
                    className="w-16 bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-center text-white focus:outline-none focus:border-green-500"
                 />
              </div>
            </div>
            <input 
              type="range" 
              min="1" 
              max="64" 
              value={length} 
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
             <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Character Types</div>
             <Checkbox label="Uppercase Letters (A-Z)" checked={useUpper} onChange={setUseUpper} />
             <Checkbox label="Lowercase Letters (a-z)" checked={useLower} onChange={setUseLower} />
             <Checkbox label="Numbers (0-9)" checked={useNumbers} onChange={setUseNumbers} />
             <Checkbox label="Special Symbols (!@#$%^&*)" checked={useSymbols} onChange={setUseSymbols} />
          </div>

          {/* Count */}
          <div className="space-y-2">
             <label className="text-slate-300 font-medium block">Number of Passwords</label>
             <input 
                type="number" 
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
             />
          </div>

          <button 
            onClick={handleGenerate}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 active:scale-[0.98]"
          >
            <RefreshCw className="w-5 h-5" />
            Generate Password
          </button>
        </div>

        {/* Result Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 min-h-[400px] flex flex-col shadow-sm">
           <div className="flex items-center gap-2 text-green-600 font-semibold border-b border-gray-100 pb-2 mb-4">
             <Key className="w-5 h-5" />
             <h3>Result</h3>
           </div>

           {generated.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                   <Key className="w-8 h-8 text-gray-300" />
                </div>
                <p>No password generated yet</p>
                <p className="text-sm">Click 'Generate Password' to start</p>
             </div>
           ) : (
             <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar-light">
                {generated.map((pwd, idx) => (
                    <div key={idx} className="group relative bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all hover:border-green-300 hover:bg-green-50/30">
                       <div className="font-mono text-lg text-gray-800 break-all pr-10">
                          {pwd}
                       </div>
                       <button 
                          onClick={() => handleCopy(pwd, idx)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-md transition-colors"
                          title="Copy to clipboard"
                       >
                          {copiedIndex === idx ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                       </button>
                    </div>
                ))}
             </div>
           )}
        </div>

      </div>
    </div>
  );
};
