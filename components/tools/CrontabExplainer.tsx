import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Clock, Search, ChevronDown } from 'lucide-react';
import { explainCron } from '../../utils/tools';
import parser from 'cron-parser';

const PartRow = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
  <div className="bg-slate-800/50 p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 transition-colors">
    <span className="text-xs font-semibold text-slate-400">{label}</span>
    <span className="text-sm font-mono text-slate-200 text-right break-all">{value}</span>
  </div>
);

const getTzOffset = (tz: string) => {
  try {
    const date = new Date();
    const str = date.toLocaleTimeString('en-US', { timeZone: tz, timeZoneName: 'longOffset' });
    const match = str.match(/GMT([+-]\d{2}:?\d{2}?)/);
    if (match) {
       let offset = match[1];
       if (offset.endsWith(':00')) offset = offset.replace(':00', '');
       if (offset.startsWith('+0')) offset = '+' + offset.substring(2); 
       return `UTC${offset}`;
    }
  } catch (e) {}
  return '';
};

// Custom Searchable Select Component
const TimezoneSelect = ({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: { value: string, label: string }[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase()) || 
    opt.value.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch('');
        }}
        className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1 min-w-[200px] max-w-[240px] hover:border-slate-600 focus:border-blue-500 outline-none transition-colors"
      >
        <span className="truncate">{selectedOption?.label || value}</span>
        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-[280px] bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search timezone..."
                className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-800 rounded px-2 pl-7 py-1.5 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 transition-colors flex items-center justify-between group ${value === opt.value ? 'bg-slate-800/50 text-blue-400' : 'text-slate-300'}`}
                >
                   <span>{opt.label.split(' - ')[0]}</span>
                   <span className={`text-[10px] ${value === opt.value ? 'text-blue-500/70' : 'text-slate-600 group-hover:text-slate-500'}`}>
                    {opt.label.split(' - ')[1]}
                   </span>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-slate-500">
                No timezone found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const CrontabExplainer: React.FC = () => {
  const [cron, setCron] = useState<string>('*/5 * * * *');
  const [explanation, setExplanation] = useState<string>('');
  const [nextRun, setNextRun] = useState<string>('');
  const [timezone, setTimezone] = useState<string>(() => {
    const sysTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return sysTz === 'Asia/Saigon' ? 'Asia/Ho_Chi_Minh' : sysTz;
  });
  
  const [parts, setParts] = useState({
    minutes: '', hours: '', dom: '', months: '', dow: ''
  });
  
  // Get timezones with offsets
  const timezoneOptions = useMemo(() => {
    let tzs: string[] = [];
    try {
      // @ts-ignore
      tzs = Intl.supportedValuesOf('timeZone');
    } catch (e) {
      tzs = [Intl.DateTimeFormat().resolvedOptions().timeZone, 'UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Asia/Ho_Chi_Minh', 'Asia/Seoul'];
    }

    // Force rename Asia/Saigon to Asia/Ho_Chi_Minh if needed and ensure Ho_Chi_Minh is in list
    if (tzs.includes('Asia/Saigon')) {
       tzs = tzs.filter(t => t !== 'Asia/Saigon');
    }
    if (!tzs.includes('Asia/Ho_Chi_Minh')) {
       tzs.push('Asia/Ho_Chi_Minh');
    }
    
    return tzs.map(tz => {
        const offset = getTzOffset(tz);
        return { 
            value: tz, 
            label: offset ? `${tz} - ${offset}` : tz 
        };
    }).sort((a, b) => a.value.localeCompare(b.value));
  }, []);

  useEffect(() => {
    if (!cron.trim()) {
      setExplanation('Enter a cron expression to see the schedule.');
      setNextRun('-');
      setParts({ minutes: '', hours: '', dom: '', months: '', dow: '' });
      return;
    }

    // Human Readable
    setExplanation(explainCron(cron));

    // Parsing for Next Run and Parts
    try {
      const options = { tz: timezone };
      const interval = parser.parseExpression(cron, options);
      
      const nextDateCron = interval.next();
      
      // Formatting the date in the SELECTED timezone explicitly
      const dateInTz = nextDateCron.toDate().toLocaleString('en-US', {
        timeZone: timezone,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      // Append timezone info for clarity
      const offset = getTzOffset(timezone);
      setNextRun(`${dateInTz} (${offset})`);

      // Extract fields
      const fields = (interval as any).fields; 
      
      if (!fields) throw new Error("No fields found");

      const formatField = (arr: number[], max: number) => {
         if (!arr || arr.length === 0) return '-';
         if (arr.length >= max) return 'All';
         return arr.join(', ');
      };

      setParts({
        minutes: formatField(fields.minute, 60),
        hours: formatField(fields.hour, 24),
        dom: formatField(fields.dayOfMonth, 31),
        months: formatField(fields.month, 12),
        dow: formatField(fields.dayOfWeek, 7) 
      });

    } catch (err: any) {
      setNextRun('-');
      setParts({ minutes: '-', hours: '-', dom: '-', months: '-', dow: '-' });
    }

  }, [cron, timezone]);

  const examples = [
    { label: 'Every 5 mins', val: '*/5 * * * *' },
    { label: 'Daily at midnight', val: '0 0 * * *' },
    { label: 'Every Monday', val: '0 0 * * 1' },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-400" />
          Crontab Explainer
        </h2>
        <p className="text-slate-400">Parse standard cron expressions into human-readable descriptions.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
           {/* Input Section */}
           <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
             <label className="block text-sm font-medium text-slate-300 mb-2">Cron Expression</label>
             <input 
                type="text" 
                value={cron}
                onChange={(e) => setCron(e.target.value)}
                className="w-full bg-slate-950 border border-slate-600 rounded-lg px-4 py-3 font-mono text-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="* * * * *"
             />
             <div className="flex flex-wrap gap-2 mt-3">
               {examples.map(ex => (
                 <button 
                  key={ex.label}
                  onClick={() => setCron(ex.val)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded transition"
                 >
                   {ex.label}
                 </button>
               ))}
             </div>
           </div>

           {/* Explanation & Details Section */}
           <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-800/50 space-y-6">
             {/* Human Readable */}
             <div>
               <h3 className="text-sm uppercase tracking-wider text-blue-400 font-bold mb-2">Human Readable</h3>
               <p className="text-2xl font-light text-white leading-relaxed">
                 {explanation}
               </p>
             </div>

             {/* Expression Parts */}
             <div className="space-y-4 pt-4 border-t border-blue-800/30">
               <div className="flex justify-between items-center flex-wrap gap-2">
                 <h3 className="text-sm font-bold text-slate-300">Expression parts</h3>
                 <div className="flex items-center gap-2 max-w-full">
                    <span className="text-xs text-slate-500 whitespace-nowrap">Timezone:</span>
                    <TimezoneSelect 
                      value={timezone}
                      onChange={setTimezone}
                      options={timezoneOptions}
                    />
                 </div>
               </div>
               
               <div className="grid grid-cols-1 gap-px bg-slate-700/50 rounded-lg overflow-hidden border border-slate-700/50">
                  <PartRow label="Minutes" value={parts.minutes} />
                  <PartRow label="Hours" value={parts.hours} />
                  <PartRow label="Day of month" value={parts.dom} />
                  <PartRow label="Months" value={parts.months} />
                  <PartRow label="Day of week" value={parts.dow} />
                  
                  {/* Next Execution Row */}
                  <div className="bg-slate-800/50 p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-xs font-semibold text-slate-400">Next execution</span>
                    <span className="text-sm font-mono text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 break-all text-right">
                      {nextRun}
                    </span>
                  </div>
               </div>
             </div>
           </div>
        </div>

        {/* Cheatsheet Section */}
        <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700 h-fit space-y-6">
          {/* Examples Section */}
          <div>
            <h3 className="flex items-center gap-2 font-bold text-slate-200 mb-4 text-base">
              Examples
            </h3>
            <div className="space-y-3">
              {[
                { code: '0 * * * *', desc: 'every hour' },
                { code: '*/15 * * * *', desc: 'every 15 mins' },
                { code: '0 */2 * * *', desc: 'every 2 hours' },
                { code: '0 18 * * 0-6', desc: 'Mon-Sat at 6pm' },
                { code: '10 2 * * 6,7', desc: 'Sat, Sun at 2:10am' },
                { code: '0 0 * * 0', desc: 'every Sun midnight' },
              ].map((item) => (
                <div 
                  key={item.code} 
                  onClick={() => setCron(item.code)}
                  className="group flex flex-col xl:flex-row xl:items-center justify-between gap-1 xl:gap-4 cursor-pointer hover:bg-slate-700/30 p-1.5 -mx-1.5 rounded transition-colors"
                >
                  <code className="bg-slate-900 text-slate-300 px-2 py-1 rounded text-xs font-mono border border-slate-700 group-hover:border-blue-500/50 transition-colors whitespace-nowrap">
                    {item.code}
                  </code>
                  <span className="text-slate-500 text-xs text-right group-hover:text-slate-300 transition-colors">
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700/50" />

          {/* Operators Section */}
          <div>
            <h3 className="flex items-center gap-2 font-bold text-slate-200 mb-4 text-base">
              Operators
            </h3>
            <ul className="space-y-3">
              {[
                { op: '*', desc: 'all values' },
                { op: ',', desc: 'separate values' },
                { op: '-', desc: 'range of values' },
                { op: '/', desc: 'step values' },
              ].map((item) => (
                <li key={item.op} className="flex justify-between items-center text-xs">
                  <code className="bg-slate-700/50 text-slate-200 w-6 h-6 flex items-center justify-center rounded border border-slate-600 font-mono">
                     {item.op}
                  </code>
                  <span className="text-slate-500">{item.desc}</span>
                </li>
              ))}
            </ul>
             <div className="mt-4 pt-4 border-t border-slate-700/50 text-[10px] text-slate-500 font-mono text-center tracking-wide">
              MIN HOUR DAY MONTH WEEKDAY
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};