import React, { useState } from 'react';
import { v1 as uuidv1, v4 as uuidv4, v7 as uuidv7 } from 'uuid';
import { Fingerprint, Copy, Download, RefreshCw } from 'lucide-react';

type UuidVersion = 'v1' | 'v4' | 'v7' | 'guid';

export const UuidGenerator: React.FC = () => {
    const [version, setVersion] = useState<UuidVersion>('v4');
    const [count, setCount] = useState<number>(1);
    const [generatedIds, setGeneratedIds] = useState<string>('');
    const [lastCount, setLastCount] = useState<number>(0);
    const [removeHyphens, setRemoveHyphens] = useState<boolean>(false);

    const generateUuid = () => {
        const ids: string[] = [];
        for (let i = 0; i < count; i++) {
            let id = '';
            switch (version) {
                case 'v1':
                    id = uuidv1();
                    break;
                case 'v4':
                    id = uuidv4();
                    break;
                case 'v7':
                    // @ts-ignore - v7 might not be in types yet depending on version, generic fallback or ignore
                    id = uuidv7 ? uuidv7() : uuidv4(); 
                    break;
                case 'guid':
                    id = uuidv4().toUpperCase();
                    // Optional: Add braces {} if typically requested for GUIDs, but uppercase is the main distinction often used.
                    break;
            }
            if (removeHyphens) {
                id = id.replace(/-/g, '');
            }
            ids.push(id);
        }
        setGeneratedIds(ids.join('\n'));
        setLastCount(ids.length);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedIds);
    };

    const downloadTxt = () => {
        const element = document.createElement("a");
        const file = new Blob([generatedIds], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "uuids.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <Fingerprint className="w-6 h-6 text-orange-400" />
                    <h2 className="text-xl font-semibold text-white">UUID / GUID Generator</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Version / Format</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['v4', 'v1', 'v7', 'guid'] as UuidVersion[]).map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setVersion(v)}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all
                                        ${version === v 
                                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' 
                                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-slate-300'
                                        }`}
                                >
                                    {v === 'v4' && 'UUID v4 (Random)'}
                                    {v === 'v1' && 'UUID v1 (Time)'}
                                    {v === 'v7' && 'UUID v7 (Sorted)'}
                                    {v === 'guid' && 'GUID (Uppercase)'}
                                </button>
                            ))}
                        </div>
                        
                        <div className="mt-4 flex items-center">
                             <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={removeHyphens}
                                    onChange={(e) => setRemoveHyphens(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-offset-slate-900 focus:ring-orange-500/50"
                                />
                                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remove Hyphens</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Quantity (Bulk Generation)</label>
                        <input
                            type="number"
                            min="1"
                            max="5000"
                            value={count}
                            onChange={(e) => setCount(Math.max(1, Math.min(5000, parseInt(e.target.value) || 1)))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-orange-500/50 font-mono"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={generateUuid}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Generate
                        </button>
                    </div>
                </div>

                {generatedIds && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-slate-400">
                            <span>Generated {lastCount} IDs</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-300"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy
                                </button>
                                <button
                                    onClick={downloadTxt}
                                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-300"
                                >
                                    <Download className="w-4 h-4" />
                                    Download .txt
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={generatedIds}
                            readOnly
                            className="w-full h-80 bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-300 focus:outline-none resize-none"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
