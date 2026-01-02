import React, { useState, useEffect } from 'react';
import { Clock, Copy, RefreshCw, Calendar } from 'lucide-react';

export const DateTimeConverter: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
    const [timestampInput, setTimestampInput] = useState<string>('');
    const [humanDateOutput, setHumanDateOutput] = useState<string>('');
    const [humanDateInput, setHumanDateInput] = useState<string>('');
    const [timestampOutput, setTimestampOutput] = useState<string>('');
    const [isMilliseconds, setIsMilliseconds] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleTimestampConvert = (value: string) => {
        setTimestampInput(value);
        if (!value) {
            setHumanDateOutput('');
            return;
        }

        const numericValue = parseInt(value, 10);
        if (isNaN(numericValue)) return;

        // Simple heuristic to detect milliseconds (if > 10000000000, likely ms, though not perfect for old dates)
        // Usually timestamps are currently ~17xxxxxxxxx (10 digits) for seconds, 13 digits for ms.
        const isMs = value.length > 10;
        setIsMilliseconds(isMs);

        const date = new Date(isMs ? numericValue : numericValue * 1000);
        setHumanDateOutput(date.toLocaleString() + ' (Local) / ' + date.toISOString() + ' (UTC)');
    };

    const handleHumanDateConvert = (value: string) => {
        setHumanDateInput(value);
        if (!value) {
            setTimestampOutput('');
            return;
        }
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            setTimestampOutput(Math.floor(date.getTime() / 1000).toString());
        } else {
            setTimestampOutput('Invalid Date');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-blue-400" />
                    <h2 className="text-lg font-semibold text-white">Current Epoch Time</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-3xl font-mono text-blue-400 font-bold tracking-wider">
                        {currentTime}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <RefreshCw className="w-5 h-5 text-purple-400" />
                        <h3 className="font-semibold text-slate-200">Timestamp to Human Date</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Epoch Timestamp</label>
                            <input
                                type="number"
                                value={timestampInput}
                                onChange={(e) => handleTimestampConvert(e.target.value)}
                                placeholder="e.g. 1702200000"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50 font-mono"
                            />
                            {timestampInput && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Detected unit: <span className="text-purple-400">{isMilliseconds ? 'Milliseconds' : 'Seconds'}</span>
                                </p>
                            )}
                        </div>

                        {humanDateOutput && (
                            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="text-sm font-mono break-all text-slate-300">{humanDateOutput}</div>
                                    <button 
                                        onClick={() => copyToClipboard(humanDateOutput)}
                                        className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300"
                                        title="Copy"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-5 h-5 text-green-400" />
                        <h3 className="font-semibold text-slate-200">Human Date to Timestamp</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Date Time</label>
                            <div className="flex gap-2">
                                <input
                                    type="datetime-local"
                                    value={humanDateInput}
                                    onChange={(e) => handleHumanDateConvert(e.target.value)}
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-green-500/50 min-w-0"
                                />
                                <button
                                    onClick={() => {
                                        const now = new Date();
                                        // datetime-local expects YYYY-MM-DDThh:mm
                                        const safeNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                                        handleHumanDateConvert(safeNow);
                                    }}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-sm font-medium transition-colors whitespace-nowrap"
                                >
                                    Now
                                </button>
                            </div>
                        </div>

                        {timestampOutput && (
                            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 transition-all animate-in fade-in duration-200">
                                <div className="flex justify-between items-center">
                                    <div className="text-lg font-mono text-green-400">{timestampOutput}</div>
                                    <button 
                                        onClick={() => copyToClipboard(timestampOutput)}
                                        className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300"
                                        title="Copy"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Seconds</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
