import React, { useState, useMemo } from 'react';
import { ToolId, ToolDefinition } from '../types';
import { Clock, AlignLeft, Braces, GitCompare, X, Mail, Binary, Link, Key, Search, ShieldCheck, RefreshCw, Hash as HashIcon, Calendar, Fingerprint } from 'lucide-react';

interface SidebarProps {
  currentTool: ToolId;
  onToolSelect: (id: ToolId) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const tools: ToolDefinition[] = [
  { id: ToolId.SIGNATURE, name: 'Email Signature', description: 'Generate HTML signatures', icon: Mail },
  { id: ToolId.JWT, name: 'JWT Debugger', description: 'Decode & Verify JWTs', icon: ShieldCheck },
  { id: ToolId.CRON, name: 'Crontab Explainer', description: 'Parse cron expressions', icon: Clock },
  { id: ToolId.NGINX, name: 'Nginx Beautifier', description: 'Format nginx configs', icon: AlignLeft },
  { id: ToolId.JSON, name: 'JSON Editor', description: 'Validate & Format JSON', icon: Braces },
  { id: ToolId.DIFF, name: 'Text Diff', description: 'Compare texts', icon: GitCompare },
  { id: ToolId.BASE64, name: 'Base64 Converter', description: 'Encode/Decode Base64', icon: Binary },
  { id: ToolId.URL, name: 'URL Encoder', description: 'Url Encode/Decode', icon: Link },
  { id: ToolId.PASSWORD, name: 'Password Generator', description: 'Secure random strings', icon: Key },
  { id: ToolId.CONVERTER, name: 'Universal Converter', description: 'Convert between formats', icon: RefreshCw },
  { id: ToolId.HASH, name: 'Hash Generator', description: 'Generate & Verify Hash', icon: HashIcon },
  { id: ToolId.DATE_TIME, name: 'Date Converter', description: 'Epoch <-> Human Date', icon: Calendar },
  { id: ToolId.UUID, name: 'UUID Generator', description: 'Generate UUID/GUID', icon: Fingerprint },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentTool, onToolSelect, isOpen, setIsOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = useMemo(() => {
    return tools.filter(tool => 
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? 'w-64 translate-x-0' : 'w-20 translate-x-0'}
        max-md:${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className={`p-6 pb-4 border-b border-slate-800 ${!isOpen && 'hidden md:block md:p-4'}`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-xl font-bold text-white tracking-tight flex items-center gap-2 ${!isOpen && 'md:justify-center md:w-full'}`}>
              <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
              {isOpen && 'OnDesk'}
            </h1>
            <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Search Bar - hide when collapsed */}
          {isOpen && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search tools..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = currentTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    onToolSelect(tool.id);
                    // Don't auto-close sidebar - keep state
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }
                    ${!isOpen && 'md:justify-center md:px-2'}
                  `}
                  title={!isOpen ? tool.name : undefined}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                  {isOpen && (
                    <div>
                      <div className="font-medium text-sm">{tool.name}</div>
                    </div>
                  )}
                </button>
              );
            })
          ) : (
            isOpen && (
              <div className="text-center text-slate-500 text-sm py-4">
                No tools found.
              </div>
            )
          )}
        </nav>

        {/* Footer - hide when collapsed */}
        {isOpen && (
          <div className="p-6 border-t border-slate-800 mt-auto">
            <div className="text-xs text-slate-500">
              <p>100% Offline.</p>
              <p>No data leaves your browser.</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};