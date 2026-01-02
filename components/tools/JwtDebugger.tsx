
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle, XCircle, Copy, Check, Trash2 } from 'lucide-react';
import { CodeEditor } from '../ui/CodeEditor';
import { Button } from '../ui/Button';
import { base64UrlDecode, base64UrlEncode, arrayBufferToBase64Url } from '../../utils/tools';

type Algo = 'HS256' | 'HS384' | 'HS512';

const ALGO_MAP: Record<string, { name: string; hash: string }> = {
  'HS256': { name: 'HMAC', hash: 'SHA-256' },
  'HS384': { name: 'HMAC', hash: 'SHA-384' },
  'HS512': { name: 'HMAC', hash: 'SHA-512' },
};

export const JwtDebugger: React.FC = () => {
  const [mode, setMode] = useState<'decode' | 'encode'>('decode');
  const [copied, setCopied] = useState<string | null>(null);

  // DECODER STATE
  const [decoderToken, setDecoderToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  const [decoderSecret, setDecoderSecret] = useState('your-256-bit-secret');
  const [decoderHeader, setDecoderHeader] = useState('');
  const [decoderPayload, setDecoderPayload] = useState('');
  const [decoderSignatureStatus, setDecoderSignatureStatus] = useState<'valid' | 'invalid' | 'unknown'>('unknown');
  const [decoderError, setDecoderError] = useState<string | null>(null);
  const [detectedAlgo, setDetectedAlgo] = useState<string>('HS256');

  // ENCODER STATE
  const [encoderAlgo, setEncoderAlgo] = useState<Algo>('HS256');
  const [encoderPayload, setEncoderPayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}');
  const [encoderSecret, setEncoderSecret] = useState('secret');
  const [encoderToken, setEncoderToken] = useState('');
  const [encoderError, setEncoderError] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // --- DECODER LOGIC ---
  useEffect(() => {
    setDecoderError(null);
    if (!decoderToken) {
        setDecoderHeader('');
        setDecoderPayload('');
        setDecoderSignatureStatus('unknown');
        return;
    }

    const parts = decoderToken.split('.');
    if (parts.length !== 3) {
      setDecoderError("Invalid Token Format: Must contain 3 parts separated by dots.");
      setDecoderHeader('');
      setDecoderPayload('');
      setDecoderSignatureStatus('unknown');
      return;
    }

    try {
      const headerStr = base64UrlDecode(parts[0]);
      const headerObj = JSON.parse(headerStr);
      setDecoderHeader(JSON.stringify(headerObj, null, 2));
      
      const payloadStr = base64UrlDecode(parts[1]);
      const payloadObj = JSON.parse(payloadStr);
      setDecoderPayload(JSON.stringify(payloadObj, null, 2));

      // Auto-detect algo from header
      if (headerObj.alg && ALGO_MAP[headerObj.alg]) {
          setDetectedAlgo(headerObj.alg);
      } else {
          setDetectedAlgo('HS256'); // Fallback
      }

    } catch (e) {
      setDecoderError("Failed to decode token parts. Check Base64 format.");
    }
  }, [decoderToken]);

  // Verify Signature (Decoder)
  useEffect(() => {
    const verify = async () => {
      const parts = decoderToken.split('.');
      if (parts.length !== 3 || !decoderSecret) {
        setDecoderSignatureStatus('unknown');
        return;
      }

      const algoConfig = ALGO_MAP[detectedAlgo];
      if (!algoConfig) {
          // If we can't verify this algo offline (like RS256 without pub key input), unknown.
          setDecoderSignatureStatus('unknown'); 
          return; 
      }

      try {
        const enc = new TextEncoder();
        const key = await window.crypto.subtle.importKey(
          "raw",
          enc.encode(decoderSecret),
          algoConfig,
          false,
          ["verify"]
        );

        const data = enc.encode(`${parts[0]}.${parts[1]}`);
        
        // Convert base64url signature to Uint8Array
        const sigStr = parts[2].replace(/-/g, "+").replace(/_/g, "/");
        const binStr = atob(sigStr);
        const signature = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) {
          signature[i] = binStr.charCodeAt(i);
        }

        const isValid = await window.crypto.subtle.verify(
          algoConfig,
          key,
          signature,
          data
        );

        setDecoderSignatureStatus(isValid ? 'valid' : 'invalid');
      } catch (e) {
        setDecoderSignatureStatus('unknown');
      }
    };

    if (decoderToken && decoderSecret) {
      verify();
    }
  }, [decoderToken, decoderSecret, detectedAlgo]);


  // --- ENCODER LOGIC ---
  useEffect(() => {
      const generate = async () => {
          setEncoderError(null);
          try {
              // 1. Prepare Header
              const header = { alg: encoderAlgo, typ: "JWT" };
              const encodedHeader = base64UrlEncode(JSON.stringify(header));

              // 2. Prepare Payload (Validate JSON first)
              const parsedPayload = JSON.parse(encoderPayload); // Check validity
              const encodedPayload = base64UrlEncode(JSON.stringify(parsedPayload));

              // 3. Sign
              const enc = new TextEncoder();
              const algoConfig = ALGO_MAP[encoderAlgo];
              const key = await window.crypto.subtle.importKey(
                  "raw",
                  enc.encode(encoderSecret),
                  algoConfig,
                  false,
                  ["sign"]
              );
              
              const data = enc.encode(`${encodedHeader}.${encodedPayload}`);
              const signatureBuffer = await window.crypto.subtle.sign(
                  algoConfig,
                  key,
                  data
              );
              const encodedSignature = arrayBufferToBase64Url(signatureBuffer);

              setEncoderToken(`${encodedHeader}.${encodedPayload}.${encodedSignature}`);
          } catch (e: any) {
              setEncoderError(e.message || "Encoding failed");
              setEncoderToken('');
          }
      };

      if (encoderPayload && encoderSecret) {
          generate();
      }
  }, [encoderAlgo, encoderPayload, encoderSecret]);


  return (
    <div className="flex flex-col h-full space-y-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-pink-500" />
            JWT Debugger
          </h2>
          <p className="text-slate-400 text-sm">Decode, verify, and generate JSON Web Tokens.</p>
        </div>
        
        <div className="bg-slate-800 p-1 rounded-lg flex">
             <button 
                onClick={() => setMode('decode')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${mode === 'decode' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
                 Decoder
             </button>
             <button 
                onClick={() => setMode('encode')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${mode === 'encode' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
                 Encoder
             </button>
        </div>
      </header>

      {/* --- DECODER UI --- */}
      {mode === 'decode' && (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
            <div className="flex-1 flex flex-col h-full gap-2">
               <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-300">Encoded Token</label>
                    <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setDecoderToken('')} icon={<Trash2 className="w-3 h-3"/>}>
                             Clear
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleCopy(decoderToken, 'token')} icon={copied === 'token' ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}>
                            {copied === 'token' ? 'Copied' : 'Copy'}
                        </Button>
                    </div>
               </div>
               <textarea 
                  value={decoderToken}
                  onChange={(e) => setDecoderToken(e.target.value)}
                  className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-lg p-6 font-mono text-base md:text-lg leading-relaxed text-slate-300 focus:outline-none focus:border-pink-500 resize-none selection:bg-pink-500/30 break-all"
                  spellCheck={false}
                  placeholder="Paste JWT here..."
               />
               {decoderError && (
                 <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg flex items-center gap-3 text-red-300 text-sm">
                   <AlertTriangle className="w-5 h-5 shrink-0" />
                   {decoderError}
                 </div>
               )}
            </div>

            <div className="flex-1 flex flex-col h-full overflow-y-auto space-y-4 pr-1">
                <div className="text-sm font-bold text-slate-300">Decoded</div>
                
                {/* HEADER */}
                <div className="flex flex-col relative group">
                   <div className="bg-slate-900 border-l-4 border-red-500 rounded-r-lg p-2 px-4 flex justify-between items-center">
                      <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Header</span>
                      <button onClick={() => handleCopy(decoderHeader, 'header')} className="text-slate-500 hover:text-white">
                         {copied === 'header' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                   </div>
                   <CodeEditor 
                      value={decoderHeader} 
                      readOnly 
                      className="h-28 text-red-300 border-l-4 border-red-500/20" 
                   />
                </div>

                {/* PAYLOAD */}
                <div className="flex flex-col flex-1 relative group">
                   <div className="bg-slate-900 border-l-4 border-purple-500 rounded-r-lg p-2 px-4 flex justify-between items-center">
                      <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Payload</span>
                      <button onClick={() => handleCopy(decoderPayload, 'payload')} className="text-slate-500 hover:text-white">
                         {copied === 'payload' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                   </div>
                   <CodeEditor 
                      value={decoderPayload} 
                      readOnly 
                      className="h-full min-h-[150px] text-purple-300 border-l-4 border-purple-500/20" 
                   />
                </div>

                {/* SIGNATURE VERIFICATION */}
                <div className="flex flex-col">
                   <div className="bg-slate-900 border-l-4 border-blue-400 rounded-r-lg p-2 px-4 flex justify-between items-center">
                      <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Verify Signature ({detectedAlgo})</span>
                   </div>
                   
                   <div className="bg-slate-950 border border-slate-700 border-l-4 border-l-blue-400/20 rounded-lg p-4 space-y-4">
                      <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <Lock className="h-4 w-4 text-slate-500" />
                          </div>
                          <input 
                            type="text" 
                            value={decoderSecret}
                            onChange={(e) => setDecoderSecret(e.target.value)}
                            placeholder="Enter secret to verify..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400 placeholder-slate-600 font-mono"
                          />
                      </div>

                      {decoderSignatureStatus !== 'unknown' && (
                         <div className={`flex items-center gap-2 text-sm font-bold ${decoderSignatureStatus === 'valid' ? 'text-green-500' : 'text-red-500'}`}>
                            {decoderSignatureStatus === 'valid' ? <CheckCircle className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>}
                            {decoderSignatureStatus === 'valid' ? 'Signature Verified' : 'Invalid Signature'}
                         </div>
                      )}
                      {!ALGO_MAP[detectedAlgo] && (
                          <div className="text-yellow-500 text-xs mt-1">
                              Verification for {detectedAlgo} is not supported in browser mode.
                          </div>
                      )}
                   </div>
                </div>

            </div>
        </div>
      )}

      {/* --- ENCODER UI --- */}
      {mode === 'encode' && (
          <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
              {/* LEFT: CONTROLS */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
                  
                  {/* HEADER CONFIG */}
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Algorithm</label>
                      <select 
                        value={encoderAlgo}
                        onChange={(e) => setEncoderAlgo(e.target.value as Algo)}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-pink-500"
                      >
                          <option value="HS256">HS256 (HMAC with SHA-256)</option>
                          <option value="HS384">HS384 (HMAC with SHA-384)</option>
                          <option value="HS512">HS512 (HMAC with SHA-512)</option>
                      </select>
                  </div>

                  {/* PAYLOAD CONFIG */}
                  <div className="flex-1 flex flex-col min-h-[300px]">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-slate-300">Payload (JSON)</label>
                         <Button size="sm" variant="ghost" onClick={() => setEncoderPayload('{}')}>Clear</Button>
                      </div>
                      <CodeEditor 
                        value={encoderPayload}
                        onChange={(e) => setEncoderPayload(e.target.value)}
                        className={`flex-1 border-l-4 border-l-purple-500/20 text-purple-100 ${encoderError ? 'border-red-500' : ''}`}
                      />
                  </div>

                  {/* SECRET CONFIG */}
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Secret Key</label>
                      <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <Lock className="h-4 w-4 text-slate-500" />
                          </div>
                          <input 
                            type="text" 
                            value={encoderSecret}
                            onChange={(e) => setEncoderSecret(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400 font-mono"
                          />
                      </div>
                  </div>
              </div>

              {/* RIGHT: OUTPUT */}
              <div className="flex-1 flex flex-col h-full gap-2">
                  <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-300">Generated Token</label>
                        <Button size="sm" variant="secondary" onClick={() => handleCopy(encoderToken, 'encToken')} icon={copied === 'encToken' ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}>
                             {copied === 'encToken' ? 'Copied' : 'Copy Token'}
                        </Button>
                   </div>
                   
                   {encoderError ? (
                       <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg text-red-300 text-sm flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <div>
                                <div className="font-bold">Encoding Failed</div>
                                <div>{encoderError}</div>
                            </div>
                       </div>
                   ) : (
                        <textarea 
                            value={encoderToken}
                            readOnly
                            className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-lg p-6 font-mono text-base md:text-lg leading-relaxed text-slate-300 focus:outline-none resize-none selection:bg-pink-500/30 break-all"
                        />
                   )}
                   
                   <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 text-xs text-slate-500">
                       <p className="mb-1"><span className="font-bold text-slate-400">Header:</span> {encoderAlgo}</p>
                       <p className="mb-1"><span className="font-bold text-slate-400">Payload Chars:</span> {encoderPayload.length}</p>
                       <p><span className="font-bold text-slate-400">Secret Strength:</span> {encoderSecret.length * 8} bits (approx)</p>
                   </div>
              </div>
          </div>
      )}
    </div>
  );
};
