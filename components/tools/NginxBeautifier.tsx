import React, { useState } from 'react';
import { AlignLeft, Copy, Check } from 'lucide-react';
import { CodeEditor } from '../ui/CodeEditor';
import { Button } from '../ui/Button';
import { beautifyNginx } from '../../utils/tools';

export const NginxBeautifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleBeautify = () => {
    const formatted = beautifyNginx(input);
    setInput(formatted);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
       <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlignLeft className="w-6 h-6 text-green-400" />
            Nginx Beautifier
          </h2>
          <p className="text-slate-400 text-sm">Format and indent Nginx configuration files.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleBeautify} variant="primary" icon={<AlignLeft className="w-4 h-4"/>}>
            Beautify
          </Button>
          <Button onClick={handleCopy} variant="secondary" icon={copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </header>

      <div className="flex-1 min-h-[500px]">
        <CodeEditor 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your nginx.conf content here..."
          className="h-full"
        />
      </div>
    </div>
  );
};