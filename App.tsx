import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { CrontabExplainer } from './components/tools/CrontabExplainer';
import { NginxBeautifier } from './components/tools/NginxBeautifier';
import { JsonEditor } from './components/tools/JsonEditor';
import { TextDiff } from './components/tools/TextDiff';
import { EmailSignatureGenerator } from './components/tools/EmailSignatureGenerator';
import { Base64Converter } from './components/tools/Base64Converter';
import { UrlConverter } from './components/tools/UrlConverter';
import { PasswordGenerator } from './components/tools/PasswordGenerator';
import { JwtDebugger } from './components/tools/JwtDebugger';
import { UniversalConverter } from './components/tools/UniversalConverter';
import { HashGenerator } from './components/tools/HashGenerator';
import { DateTimeConverter } from './components/tools/DateTimeConverter';
import { UuidGenerator } from './components/tools/UuidGenerator';
import { ToolId } from './types';
import { Menu, PanelLeftClose, PanelLeftOpen, Bug } from 'lucide-react';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolId>(ToolId.SIGNATURE);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderTool = () => {
    switch (activeTool) {
      case ToolId.CRON:
        return <CrontabExplainer />;
      case ToolId.NGINX:
        return <NginxBeautifier />;
      case ToolId.JSON:
        return <JsonEditor />;
      case ToolId.JWT:
        return <JwtDebugger />;
      case ToolId.DIFF:
        return <TextDiff />;
      case ToolId.BASE64:
        return <Base64Converter />;
      case ToolId.URL:
        return <UrlConverter />;
      case ToolId.PASSWORD:
        return <PasswordGenerator />;
      case ToolId.SIGNATURE:
        return <EmailSignatureGenerator />;
      case ToolId.CONVERTER:
        return <UniversalConverter />;
      case ToolId.HASH:
        return <HashGenerator />;
      case ToolId.DATE_TIME:
        return <DateTimeConverter />;
      case ToolId.UUID:
        return <UuidGenerator />;
      default:
        return <EmailSignatureGenerator />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <Sidebar 
        currentTool={activeTool} 
        onToolSelect={setActiveTool} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className={`flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-all"
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            <span className="text-xs font-medium">{sidebarOpen ? 'Đóng Menu' : 'Mở Menu'}</span>
          </button>

          <a
            href="https://github.com/fat2fast/Ondesk/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-all"
          >
            <Bug className="w-4 h-4" />
            <span className="text-xs font-medium">Báo lỗi</span>
          </a>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="ml-4 font-bold text-white">OnDesk</span>
          </div>
          
          <a
            href="https://github.com/fat2fast/Ondesk/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            title="Báo lỗi"
          >
            <Bug className="w-6 h-6" />
          </a>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
           {renderTool()}
        </div>
      </main>
    </div>
  );
};

export default App;