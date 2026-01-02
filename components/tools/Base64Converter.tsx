import React, { useState } from 'react';
import { Binary, Upload, Download, Copy, Check, FileText, File as FileIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { CodeEditor } from '../ui/CodeEditor';

type Mode = 'encode' | 'decode';
type InputType = 'text' | 'file';

export const Base64Converter: React.FC = () => {
  const [mode, setMode] = useState<Mode>('encode');
  const [inputType, setInputType] = useState<InputType>('text');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [fileName, setFileName] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const process = () => {
      setError('');
      try {
          if (mode === 'encode') {
              // Encode is handled via useEffect or file upload immediately, but for text input:
              if (inputType === 'text') {
                  setOutput(btoa(input));
              }
          } else {
              // Decode
              if (inputType === 'text') {
                  setOutput(atob(input));
              }
          }
      } catch (e) {
          setError('Invalid input for operation.');
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    if (mode === 'encode') {
        const reader = new FileReader();
        reader.onload = () => {
            const res = reader.result as string;
            // Split to get just base64 data if needed, or keep full data URI
            // Usually Base64 tools return the raw base64 string without mime prefix
            const base64 = res.split(',')[1] || res; 
            setOutput(base64);
        };
        reader.onerror = () => setError('Error reading file');
        reader.readAsDataURL(file);
    } else {
        // Decode file? Usually files are encoded TO base64. 
        // If decoding a file containing base64 text:
        const reader = new FileReader();
        reader.onload = () => {
             try {
                const text = reader.result as string;
                setOutput(atob(text.trim()));
             } catch(err) {
                 setError('File does not contain valid Base64 string');
             }
        };
        reader.readAsText(file);
    }
  };

  // Auto process text
  React.useEffect(() => {
      if (inputType === 'text') process();
  }, [input, mode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
      // Create a blob from output
      // If decoding, output might be binary, but here output is string.
      // If we decoded base64 to binary, we should use Uint8Array.
      // For simplicity in this text-based tool, we download as text file.
      // Advanced: specific mime type.
      
      const element = document.createElement("a");
      let file: Blob;
      
      if (mode === 'decode') {
         // Attempt to detect if it's binary? 
         // For now, save as .txt or .bin
         const byteCharacters = atob(input);
         const byteNumbers = new Array(byteCharacters.length);
         for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
         }
         const byteArray = new Uint8Array(byteNumbers);
         file = new Blob([byteArray], {type: 'application/octet-stream'});
      } else {
         file = new Blob([output], {type: 'text/plain'});
      }

      element.href = URL.createObjectURL(file);
      element.download = mode === 'encode' ? 'encoded.txt' : (fileName ? `decoded_${fileName}` : 'decoded.bin');
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Binary className="w-6 h-6 text-orange-400" />
            Base64 Encoder / Decoder
          </h2>
          <p className="text-slate-400 text-sm">Convert text or files to Base64 and back.</p>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg">
             <button 
                onClick={() => { setMode('encode'); setInput(''); setOutput(''); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${mode === 'encode' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
                 Encoder
             </button>
             <button 
                onClick={() => { setMode('decode'); setInput(''); setOutput(''); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${mode === 'decode' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
                 Decoder
             </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-4">
          <div className="flex gap-4 border-b border-slate-800 pb-4">
              <label className={`flex items-center gap-2 cursor-pointer ${inputType === 'text' ? 'text-blue-400' : 'text-slate-400'}`}>
                  <input type="radio" name="inputType" checked={inputType === 'text'} onChange={() => setInputType('text')} className="hidden"/>
                  <FileText className="w-4 h-4" /> Text Source
              </label>
              <label className={`flex items-center gap-2 cursor-pointer ${inputType === 'file' ? 'text-blue-400' : 'text-slate-400'}`}>
                  <input type="radio" name="inputType" checked={inputType === 'file'} onChange={() => setInputType('file')} className="hidden"/>
                  <FileIcon className="w-4 h-4" /> File Source
              </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
              {/* INPUT COLUMN */}
              <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300">
                      {mode === 'encode' ? 'Input (Plain)' : 'Input (Base64)'}
                  </label>
                  
                  {inputType === 'text' ? (
                      <CodeEditor 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={mode === 'encode' ? "Type text to encode..." : "Paste Base64 string..."}
                        className="flex-1"
                      />
                  ) : (
                      <div className="flex-1 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center bg-slate-900/50 hover:bg-slate-900 transition">
                          <input type="file" onChange={handleFileUpload} className="hidden" id="fileUpload"/>
                          <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center p-8 text-center">
                              <Upload className="w-10 h-10 text-slate-500 mb-2" />
                              <span className="text-slate-300 font-medium">Click to upload a file</span>
                              <span className="text-slate-500 text-sm mt-1">{fileName || 'No file selected'}</span>
                          </label>
                      </div>
                  )}
              </div>

              {/* OUTPUT COLUMN */}
              <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-300">
                        {mode === 'encode' ? 'Output (Base64)' : 'Output (Plain)'}
                    </label>
                    <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={handleDownload} icon={<Download className="w-3 h-3"/>}>Download</Button>
                        <Button size="sm" variant="primary" onClick={handleCopy} icon={copied ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}>Copy</Button>
                    </div>
                  </div>

                  <div className="relative flex-1">
                     <textarea 
                        readOnly
                        value={output}
                        className={`w-full h-full bg-slate-950 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-lg p-4 font-mono text-sm text-slate-200 focus:outline-none resize-none`}
                     />
                     {error && (
                         <div className="absolute bottom-4 left-4 right-4 bg-red-900/80 text-red-100 px-3 py-2 rounded text-sm">
                             {error}
                         </div>
                     )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};