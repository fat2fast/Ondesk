import React, { useState, useMemo } from 'react';
import { GitCompare } from 'lucide-react';
import { CodeEditor } from '../ui/CodeEditor';
import { Button } from '../ui/Button';
import { computeDiff, diffChars } from '../../utils/tools';
import { DiffRow } from '../../types';

export const TextDiff: React.FC = () => {
  const [leftText, setLeftText] = useState('Hello World\nThis is a test file.\nIt has multiple lines.\nSome lines will stay the same.\nSome will change.\nDelete this line.');
  const [rightText, setRightText] = useState('Hello React\nThis is a test file.\nIt has many lines.\nSome lines will stay the same.\nSome will be modified completely.\nAdd this new line.');
  const [showDiff, setShowDiff] = useState(false);

  const diffRows: DiffRow[] = useMemo(() => {
    if (!showDiff) return [];
    
    const lines = computeDiff(leftText, rightText);
    const rows: DiffRow[] = [];
    
    for (let i = 0; i < lines.length; i++) {
        const current = lines[i];
        
        // Check for Modification Block (Delete followed by Insert)
        // Only merge if they are effectively replacing each other.
        if (current.type === 'delete' && i + 1 < lines.length && lines[i+1].type === 'insert') {
            const next = lines[i+1];
            rows.push({
                left: { line: current.lineNumberLeft!, content: current.content, type: 'delete' },
                right: { line: next.lineNumberRight!, content: next.content, type: 'insert' },
                isChangeBlock: true
            });
            i++; // Skip next
        } 
        // Equal
        else if (current.type === 'equal') {
            rows.push({
                left: { line: current.lineNumberLeft!, content: current.content, type: 'equal' },
                right: { line: current.lineNumberRight!, content: current.content, type: 'equal' }
            });
        }
        // Insert only (Right side has content, Left side is empty)
        else if (current.type === 'insert') {
             rows.push({
                right: { line: current.lineNumberRight!, content: current.content, type: 'insert' },
                left: { line: -1, content: '', type: 'empty' } // Mark left as empty
            });
        }
        // Delete only (Left side has content, Right side is empty)
        else if (current.type === 'delete') {
            rows.push({
                left: { line: current.lineNumberLeft!, content: current.content, type: 'delete' },
                right: { line: -1, content: '', type: 'empty' } // Mark right as empty
            });
        }
    }
    return rows;
  }, [leftText, rightText, showDiff]);

  const renderHighlightedContent = (text: string, comparison: string | undefined, isDelete: boolean) => {
      if (comparison === undefined) return <span>{text}</span>;
      
      const chars = diffChars(isDelete ? text : comparison, isDelete ? comparison : text);
      
      return (
          <span>
              {chars.map((c, idx) => {
                  if (c.type === 'equal') return <span key={idx}>{c.value}</span>;
                  if (isDelete && c.type === 'delete') return <span key={idx} className="bg-red-500/40 text-white rounded-[1px]">{c.value}</span>;
                  if (!isDelete && c.type === 'insert') return <span key={idx} className="bg-green-500/40 text-white rounded-[1px]">{c.value}</span>;
                  return null;
              })}
          </span>
      );
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-purple-400" />
            Diff & Compare
          </h2>
          <p className="text-slate-400 text-sm">Visual side-by-side comparison. Deleted lines are red, added lines are green.</p>
        </div>
        <div className="flex gap-2">
            {!showDiff ? (
                 <Button onClick={() => setShowDiff(true)} variant="primary">
                    Compare
                 </Button>
            ) : (
                <Button onClick={() => setShowDiff(false)} variant="secondary">
                    Edit Inputs
                 </Button>
            )}
        </div>
      </header>

      {!showDiff ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[500px]">
          <CodeEditor 
            label="Original Text (Left)"
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="Paste original text..."
            className="h-full"
          />
          <CodeEditor 
            label="Modified Text (Right)"
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="Paste modified text..."
            className="h-full"
          />
        </div>
      ) : (
        <div className="flex-1 bg-slate-950 rounded-lg border border-slate-700 flex flex-col overflow-hidden">
          <div className="grid grid-cols-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="p-2 border-r border-slate-800 text-center">Original</div>
              <div className="p-2 text-center">Modified</div>
          </div>
          
          <div className="overflow-auto flex-1 font-mono text-sm leading-6">
             <table className="w-full border-collapse table-fixed">
                <colgroup>
                    <col className="w-10 bg-slate-900" />
                    <col />
                    <col className="w-10 bg-slate-900" />
                    <col />
                </colgroup>
                <tbody>
                    {diffRows.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-800/50">
                            {/* LEFT SIDE */}
                            {row.left?.type === 'empty' ? (
                                <>
                                    <td className="bg-slate-900 border-r border-slate-800"></td>
                                    <td className="bg-[linear-gradient(45deg,transparent_25%,#1e293b_25%,#1e293b_50%,transparent_50%,transparent_75%,#1e293b_75%,#1e293b_100%)] bg-[length:10px_10px] opacity-50"></td>
                                </>
                            ) : (
                                <>
                                    <td className="text-right pr-2 text-slate-500 border-r border-slate-800 select-none text-xs align-top pt-1">
                                        {row.left?.line}
                                    </td>
                                    <td className={`pl-2 pr-1 break-all align-top pt-1 ${
                                        row.left?.type === 'delete' 
                                            ? (row.isChangeBlock ? 'bg-red-900/10' : 'bg-red-900/20') 
                                            : ''
                                    }`}>
                                        <div className={`relative ${row.left?.type === 'delete' ? 'text-slate-300' : 'text-slate-400'}`}>
                                            {row.left?.type === 'delete' && row.isChangeBlock ? (
                                                 renderHighlightedContent(row.left.content, row.right?.content, true)
                                            ) : (
                                                <span className={row.left?.type === 'delete' && !row.isChangeBlock ? 'bg-red-900/30 text-red-100 block w-full' : ''}>
                                                    {row.left?.content}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </>
                            )}

                            {/* RIGHT SIDE */}
                            {row.right?.type === 'empty' ? (
                                <>
                                    <td className="bg-slate-900 border-l border-slate-800"></td>
                                    <td className="bg-[linear-gradient(45deg,transparent_25%,#1e293b_25%,#1e293b_50%,transparent_50%,transparent_75%,#1e293b_75%,#1e293b_100%)] bg-[length:10px_10px] opacity-50"></td>
                                </>
                            ) : (
                                <>
                                    <td className="text-right pr-2 text-slate-500 border-l border-slate-800 select-none text-xs align-top pt-1">
                                        {row.right?.line}
                                    </td>
                                    <td className={`pl-2 pr-1 break-all align-top pt-1 ${
                                        row.right?.type === 'insert' 
                                            ? (row.isChangeBlock ? 'bg-green-900/10' : 'bg-green-900/20') 
                                            : ''
                                    }`}>
                                        <div className={`relative ${row.right?.type === 'insert' ? 'text-slate-100' : 'text-slate-400'}`}>
                                            {row.right?.type === 'insert' && row.isChangeBlock ? (
                                                 renderHighlightedContent(row.right.content, row.left?.content, false)
                                            ) : (
                                                 <span className={row.right?.type === 'insert' && !row.isChangeBlock ? 'bg-green-900/30 text-green-100 block w-full' : ''}>
                                                    {row.right?.content}
                                                 </span>
                                            )}
                                        </div>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
             </table>
             {diffRows.length === 0 && (
                 <div className="p-12 text-center text-slate-500">
                    Texts are identical.
                 </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};