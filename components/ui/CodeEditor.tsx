import React from 'react';

interface CodeEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col h-full w-full">
      {label && <label className="mb-2 text-sm font-semibold text-slate-300">{label}</label>}
      <textarea
        className={`flex-1 w-full bg-slate-950 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-lg p-4 font-mono text-sm text-slate-200 focus:outline-none focus:border-blue-500 resize-none leading-relaxed ${className}`}
        spellCheck={false}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};