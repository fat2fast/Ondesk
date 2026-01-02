import { LucideIcon } from 'lucide-react';

export enum ToolId {
  CRON = 'cron',
  NGINX = 'nginx',
  JSON = 'json',
  DIFF = 'diff',
  SIGNATURE = 'signature',
  BASE64 = 'base64',
  URL = 'url',
  PASSWORD = 'password',
  JWT = 'jwt',
  CONVERTER = 'converter',
  DATE_TIME = 'date_time',
  UUID = 'uuid',
  HASH = 'hash',
}

export interface ToolDefinition {
  id: ToolId;
  name: string;
  description: string;
  icon: LucideIcon;
}

export type DiffLineType = 'equal' | 'insert' | 'delete' | 'empty';

export interface DiffLine {
  type: DiffLineType;
  content: string;
  lineNumberLeft?: number;
  lineNumberRight?: number;
}

export interface DiffChar {
  type: 'equal' | 'insert' | 'delete';
  value: string;
}

export interface DiffRow {
  left?: { line: number, content: string, type: DiffLineType };
  right?: { line: number, content: string, type: DiffLineType };
  isChangeBlock?: boolean; // True if this row represents a modification (delete + insert)
}