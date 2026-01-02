import React, { useState, useRef, useEffect } from 'react';
import { Buffer } from 'buffer';
import CryptoJS from 'crypto-js';
import crc from 'crc';
import { Copy, CheckCircle, XCircle, Search, FileUp, Hash as HashIcon, RefreshCw } from 'lucide-react';

enum HashAlgorithm {
  MD5 = 'MD5',
  SHA1 = 'SHA1',
  SHA256 = 'SHA256',
  SHA512 = 'SHA512',
  SHA224 = 'SHA224',
  SHA384 = 'SHA384',
  SHA3 = 'SHA3',
  RIPEMD160 = 'RIPEMD160',
  CRC32 = 'CRC32',
}

const algorithms = Object.values(HashAlgorithm);

export const HashGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [inputText, setInputText] = useState('');
  const [selectedAlgo, setSelectedAlgo] = useState<HashAlgorithm>(HashAlgorithm.MD5);
  const [generatedHash, setGeneratedHash] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [checksum, setChecksum] = useState('');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculateHash = async (content: string | ArrayBuffer, algo: HashAlgorithm): Promise<string> => {
    if (typeof content === 'string') {
      switch (algo) {
        case HashAlgorithm.MD5: return CryptoJS.MD5(content).toString();
        case HashAlgorithm.SHA1: return CryptoJS.SHA1(content).toString();
        case HashAlgorithm.SHA256: return CryptoJS.SHA256(content).toString();
        case HashAlgorithm.SHA512: return CryptoJS.SHA512(content).toString();
        case HashAlgorithm.SHA224: return CryptoJS.SHA224(content).toString();
        case HashAlgorithm.SHA384: return CryptoJS.SHA384(content).toString();
        case HashAlgorithm.SHA3: return CryptoJS.SHA3(content).toString();
        case HashAlgorithm.RIPEMD160: return CryptoJS.RIPEMD160(content).toString();
        case HashAlgorithm.CRC32: return crc.crc32(content).toString(16);
        default: return '';
      }
    } else {
        // For ArrayBuffer (Files), we need to use WordArray for CryptoJS
        const wordArray = CryptoJS.lib.WordArray.create(content as any); // CryptoJS supports ArrayBuffer mostly via this cast or explicit conversion
        // Note: For large files, this approach might be slow or consume memory. Optimally strictly text for large files or specialized streaming.
        // For browser efficiency with CryptoJS and large files, we should stick to smaller files or progressive hashing.
        // For this implementation, we will assume reasonable file sizes or warn user.
        
        // However, for CRC, it works with buffers directly usually, or strings.
        // Let's optimize: convert ArrayBuffer to WordArray
        
        switch (algo) {
            case HashAlgorithm.MD5: return CryptoJS.MD5(wordArray).toString();
            case HashAlgorithm.SHA1: return CryptoJS.SHA1(wordArray).toString();
            case HashAlgorithm.SHA256: return CryptoJS.SHA256(wordArray).toString();
            case HashAlgorithm.SHA512: return CryptoJS.SHA512(wordArray).toString();
            case HashAlgorithm.SHA224: return CryptoJS.SHA224(wordArray).toString();
            case HashAlgorithm.SHA384: return CryptoJS.SHA384(wordArray).toString();
            case HashAlgorithm.SHA3: return CryptoJS.SHA3(wordArray).toString();
            case HashAlgorithm.RIPEMD160: return CryptoJS.RIPEMD160(wordArray).toString();
            case HashAlgorithm.CRC32: return crc.crc32(Buffer.from(content)).toString(16);
            default: return '';
        }
    }
  };

  const handleTextHash = async () => {
    setIsHashing(true);
    // Add small delay to allow UI to update if operation is blocking
    setTimeout(async () => {
        try {
            const hash = await calculateHash(inputText, selectedAlgo);
            setGeneratedHash(hash);
        } catch (e) {
            console.error(e);
            setGeneratedHash("Error calculating hash");
        }
        setIsHashing(false);
    }, 10);
  };

  const handleFileHash = async () => {
    if (!file) return;
    setIsHashing(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        if (e.target?.result) {
            try {
                const hash = await calculateHash(e.target.result as ArrayBuffer, selectedAlgo);
                setGeneratedHash(hash);
                if (checksum) {
                    verifyChecksum(hash, checksum);
                }
            } catch (error) {
                 console.error(error);
                 setGeneratedHash("Error calculating hash");
            }
            setIsHashing(false);
        }
    };
    reader.onerror = () => {
        setGeneratedHash("Error reading file");
        setIsHashing(false);
    }
    reader.readAsArrayBuffer(file);
  };

  const verifyChecksum = (calculated: string, expected: string) => {
    if (!expected) {
        setVerificationResult(null);
        return;
    }
    setVerificationResult(calculated.toLowerCase() === expected.toLowerCase().trim());
  };

  // Trigger text hash when input changes
  useEffect(() => {
    if (activeTab === 'text' && inputText) {
       const timer = setTimeout(handleTextHash, 300); // Debounce
       return () => clearTimeout(timer);
    }
  }, [inputText, selectedAlgo, activeTab]);

  // Trigger file hash when algorithm changes or file selected
  useEffect(() => {
      if (activeTab === 'file' && file) {
          handleFileHash();
      }
  }, [selectedAlgo, file, activeTab]);

  // Verify checksum when checksum input changes
  useEffect(() => {
      if (activeTab === 'file' && generatedHash && checksum) {
          verifyChecksum(generatedHash, checksum);
      } else if (!checksum) {
          setVerificationResult(null);
      }
  }, [checksum, generatedHash]);


  const copyToClipboard = () => {
    if (generatedHash) {
      navigator.clipboard.writeText(generatedHash);
    }
  };

  const filteredAlgorithms = algorithms.filter(algo => 
    algo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
          <HashIcon className="w-8 h-8 text-blue-400" />
          Hash Generator
        </h2>
        <p className="text-slate-400">Generate secure hashes and verify file integrity.</p>
      </div>

      <div className="flex gap-4 border-b border-slate-800">
        <button
          onClick={() => { setActiveTab('text'); setGeneratedHash(''); }}
          className={`px-4 py-3 font-medium text-sm transition-all relative ${
            activeTab === 'text' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Text String
          {activeTab === 'text' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => { setActiveTab('file'); setGeneratedHash(''); }}
          className={`px-4 py-3 font-medium text-sm transition-all relative ${
            activeTab === 'file' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          File
          {activeTab === 'file' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* Algorithm Selector */}
        <div className="relative space-y-2" ref={dropdownRef}>
            <label className="block text-sm font-medium text-slate-400">Hashing Algorithm</label>
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between bg-slate-900 border border-slate-700 hover:border-blue-500/50 rounded-lg px-4 py-3 text-slate-200 transition-all text-left"
            >
                <span className="font-mono font-bold text-blue-400">{selectedAlgo}</span>
                <Search className="w-4 h-4 text-slate-500" />
            </button>
            
            {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-2 border-b border-slate-800">
                        <input 
                            type="text"
                            placeholder="Search algorithm..."
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {filteredAlgorithms.map(algo => (
                            <button
                                key={algo}
                                onClick={() => {
                                    setSelectedAlgo(algo);
                                    setIsDropdownOpen(false);
                                    setSearchTerm(''); // Clear search on select
                                }}
                                className={`w-full text-left px-3 py-2 rounded text-sm font-mono ${
                                    selectedAlgo === algo 
                                    ? 'bg-blue-500/20 text-blue-400' 
                                    : 'text-slate-300 hover:bg-slate-800'
                                }`}
                            >
                                {algo}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Input Area */}
        {activeTab === 'text' ? (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-400">Input Text</label>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type something to hash..."
                    className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 resize-y placeholder-slate-600 transition-all"
                />
            </div>
        ) : (
            <div className="space-y-6">
                <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Upload File</label>
                        <div 
                        className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50 rounded-lg p-8 transition-all text-center cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileUp className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-slate-200 font-medium">{file ? file.name : "Click to upload a file"}</p>
                                <p className="text-slate-500 text-sm mt-1">{file ? `${(file.size / 1024).toFixed(2)} KB` : "Any file type supported"}</p>
                            </div>
                        </div>
                        </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Expected Hash (Checksum)</label>
                    <input 
                        type="text" 
                        placeholder="Paste original hash to verify integrity..."
                        value={checksum}
                        onChange={(e) => setChecksum(e.target.value)}
                        className={`w-full bg-slate-900 border rounded-lg px-4 py-3 font-mono text-sm text-slate-200 focus:outline-none focus:ring-2 transition-all ${
                            verificationResult === true 
                            ? 'border-green-500/50 focus:ring-green-500/20' 
                            : verificationResult === false 
                                ? 'border-red-500/50 focus:ring-red-500/20'
                                : 'border-slate-700 focus:ring-blue-500/20 focus:border-blue-500/50'
                        }`}
                    />
                        {verificationResult !== null && (
                        <div className={`flex items-center gap-2 text-sm ${verificationResult ? 'text-green-400' : 'text-red-400'}`}>
                            {verificationResult ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {verificationResult ? 'Valid Checksum - File is secure' : 'Invalid Checksum - Hash does not match'}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Output Area - Full Width */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4 flex justify-between items-center">
                <span>Output</span>
                {generatedHash && <span className="text-xs normal-case bg-slate-800 px-2 py-1 rounded text-slate-500">{generatedHash.length} chars</span>}
            </h3>
            
            {isHashing ? (
                <div className="flex flex-col items-center py-8 text-slate-500">
                    <RefreshCw className="w-8 h-8 animate-spin mb-3" />
                    <p>Calculating hash...</p>
                </div>
            ) : generatedHash ? (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <label className="text-xs text-slate-500 font-mono">{selectedAlgo} HASH</label>
                    <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 break-all font-mono text-base text-blue-100 shadow-inner relative group">
                        {generatedHash}
                        <button 
                            onClick={copyToClipboard}
                            className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-blue-600 rounded-lg text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                            title="Copy to clipboard"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="py-8 text-center text-slate-600 text-sm">
                    Output will appear here...
                </div>
            )}

            {activeTab === 'file' && file && (
                <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 grid grid-cols-3 gap-4">
                    <div>
                        <span className="block text-slate-500 mb-1">File Name</span>
                        <span className="text-slate-300 truncate block" title={file.name}>{file.name}</span>
                    </div>
                    <div>
                        <span className="block text-slate-500 mb-1">File Size</span>
                        <span className="text-slate-300">{file.size} bytes</span>
                    </div>
                    <div>
                        <span className="block text-slate-500 mb-1">Type</span>
                        <span className="text-slate-300 truncate block">{file.type || 'Unknown'}</span>
                    </div>
                </div>
            )}
            </div>
      </div>
    </div>
  );
};
