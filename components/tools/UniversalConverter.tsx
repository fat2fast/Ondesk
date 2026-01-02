import React, { useState } from 'react';
import { RefreshCw, Upload, Download, Copy, Check, ArrowRightLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { CodeEditor } from '../ui/CodeEditor';
import * as yaml from 'js-yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import Papa from 'papaparse';

type Format = 'json' | 'env' | 'csv' | 'yaml' | 'xml';
type ConversionPair = 'json-env' | 'json-csv' | 'json-yaml' | 'json-xml';

interface PairOption {
  value: ConversionPair;
  label: string;
  left: Format;
  right: Format;
}

const pairOptions: PairOption[] = [
  { value: 'json-env', label: 'JSON ↔ ENV', left: 'json', right: 'env' },
  { value: 'json-csv', label: 'JSON ↔ CSV', left: 'json', right: 'csv' },
  { value: 'json-yaml', label: 'JSON ↔ YAML', left: 'json', right: 'yaml' },
  { value: 'json-xml', label: 'JSON ↔ XML', left: 'json', right: 'xml' },
];

const getExtension = (format: Format): string => {
  const map: Record<Format, string> = {
    json: '.json',
    env: '.env',
    csv: '.csv',
    yaml: '.yml',
    xml: '.xml'
  };
  return map[format];
};

export const UniversalConverter: React.FC = () => {
  const [activePair, setActivePair] = useState<ConversionPair>('json-env');
  const [isSwapped, setIsSwapped] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const currentPair = pairOptions.find(p => p.value === activePair)!;
  const sourceFormat = isSwapped ? currentPair.right : currentPair.left;
  const targetFormat = isSwapped ? currentPair.left : currentPair.right;

  // Conversion functions
  const jsonToEnv = (data: any): string => {
    const flatten = (obj: any, prefix = ''): Record<string, string> => {
      return Object.keys(obj).reduce((acc, key) => {
        const pre = prefix.length ? `${prefix}_` : '';
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(acc, flatten(obj[key], pre + key.toUpperCase()));
        } else {
          acc[pre + key.toUpperCase()] = String(obj[key]);
        }
        return acc;
      }, {} as Record<string, string>);
    };

    const flattened = flatten(data);
    return Object.entries(flattened)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
  };

  const envToJson = (envString: string): any => {
    const lines = envString.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    const result: Record<string, any> = {};

    lines.forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        result[key.trim()] = value.trim();
      }
    });

    return result;
  };

  const jsonToCsv = (data: any): string => {
    // If input is a single object, wrap it in an array
    const arrayData = Array.isArray(data) ? data : [data];
    return Papa.unparse(arrayData);
  };

  const csvToJson = (csvString: string): any => {
    const result = Papa.parse(csvString, { header: true, skipEmptyLines: true });
    if (result.errors.length > 0) {
      throw new Error(`CSV parsing error: ${result.errors[0].message}`);
    }
    return result.data;
  };

  const jsonToYaml = (data: any): string => {
    return yaml.dump(data);
  };

  const yamlToJson = (yamlString: string): any => {
    return yaml.load(yamlString);
  };

  const jsonToXml = (data: any): string => {
    const builder = new XMLBuilder({
        format: true,
        ignoreAttributes: false,
        suppressEmptyNode: true
    });
    
    // Wrap in root to ensure valid XML for multiple top-level keys
    const wrapped = {
        '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
        root: data
    };
    return builder.build(wrapped);
  };

  const xmlToJson = (xmlString: string): any => {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
    });
    const result = parser.parse(xmlString);
    
    // Unwrap 'root'
    if (result.root) { 
        return result.root;
    }
    return result;
  };

  // Main conversion logic
  const convert = () => {
    setError('');
    setOutput('');

    try {
      if (!input.trim()) {
        setError('Please enter some input data');
        return;
      }

      let intermediateData: any;

      // Logic: Always convert Source -> JSON (if not JSON) -> Target
      // If Source is JSON, intermediate is just parsed JSON.
      
      // Step 1: Parse Input to JSON Object
      if (sourceFormat === 'json') {
          intermediateData = JSON.parse(input);
      } else {
          switch (sourceFormat) {
              case 'env': intermediateData = envToJson(input); break;
              case 'csv': intermediateData = csvToJson(input); break;
              case 'yaml': intermediateData = yamlToJson(input); break;
              case 'xml': intermediateData = xmlToJson(input); break;
          }
      }

      // Step 2: Convert JSON Object to Output String
      let result: string;
      if (targetFormat === 'json') {
          result = JSON.stringify(intermediateData, null, 2);
      } else {
          switch (targetFormat) {
              case 'env': result = jsonToEnv(intermediateData); break;
              case 'csv': result = jsonToCsv(intermediateData); break;
              case 'yaml': result = jsonToYaml(intermediateData); break;
              case 'xml': result = jsonToXml(intermediateData); break;
              default: result = ''; // Should not happen
          }
      }

      setOutput(result);
    } catch (err: any) {
      setError(err.message || 'Conversion failed. Please check your input format.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput(content);
    };
    reader.onerror = () => setError('Error reading file');
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!output) return;

    const targetExt = getExtension(targetFormat);
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted${targetExt}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
      setIsSwapped(!isSwapped);
      // Swap input/output content as well for better UX?
      // Usually users want to reverse the process with the SAME data? 
      // i.e. Output becomes Input. 
      // But if Output is empty, maybe keep Input?
      // Let's trying swapping content if output exists.
      if (output) {
          setInput(output);
          setOutput('');
          // Re-convert happens automatically via useEffect
      }
  };

  // Auto convert when input changes
  React.useEffect(() => {
    if (input.trim()) {
      const timer = setTimeout(() => convert(), 500);
      return () => clearTimeout(timer);
    } else {
      setOutput('');
      setError('');
    }
  }, [input, activePair, isSwapped]);

  return (
    <div className="flex flex-col h-full space-y-6">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Universal Converter</h2>
        </div>
        <p className="text-slate-400 text-sm">
          Seamlessly convert between data formats.
        </p>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex-1 w-full md:w-auto">
              <label className="block text-xs font-semibold text-slate-400 mb-2">Conversion Mode</label>
              <select
                value={activePair}
                onChange={(e) => setActivePair(e.target.value as ConversionPair)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-medium"
              >
                {pairOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
          </div>

           {/* Direction Indicator / Swap */}
           <div className="flex items-center gap-4 mt-4 md:mt-0 bg-slate-950 px-4 py-2 rounded-full border border-slate-800">
              <span className={`text-sm font-bold ${!isSwapped ? 'text-purple-400' : 'text-slate-500'}`}>
                  {currentPair.left.toUpperCase()}
              </span>
              
              <button 
                onClick={handleSwap}
                className="p-1.5 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                title="Swap Direction"
              >
                  <ArrowRightLeft className="w-4 h-4" />
              </button>

              <span className={`text-sm font-bold ${isSwapped ? 'text-purple-400' : 'text-slate-500'}`}>
                  {currentPair.right.toUpperCase()}
              </span>
           </div>
      </div>

      {/* Input/Output Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* INPUT COLUMN */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-300">
              Input ({sourceFormat.toUpperCase()})
            </label>
            <div className="flex gap-2">
              <label htmlFor="fileUpload">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Upload className="w-3 h-3" />}
                  onClick={() => document.getElementById('fileUpload')?.click()}
                >
                  Upload
                </Button>
              </label>
              <input
                type="file"
                id="fileUpload"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <CodeEditor
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste your ${sourceFormat.toUpperCase()} here...`}
            className="flex-1"
          />
        </div>

        {/* OUTPUT COLUMN */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-300">
              Output ({targetFormat.toUpperCase()})
            </label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDownload}
                icon={<Download className="w-3 h-3" />}
                disabled={!output}
              >
                Download
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleCopy}
                icon={copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                disabled={!output}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="relative flex-1">
            <textarea
              readOnly
              value={output}
              className={`w-full h-full bg-slate-950 border ${
                error ? 'border-red-500' : 'border-slate-700'
              } rounded-lg p-4 font-mono text-sm text-slate-200 focus:outline-none resize-none`}
              placeholder="Converted output will appear here..."
            />
            {error && (
              <div className="absolute bottom-4 left-4 right-4 bg-red-900/90 text-red-100 px-4 py-3 rounded-lg text-sm border border-red-700">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
