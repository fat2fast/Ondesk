
/**
 * NGINX BEAUTIFIER LOGIC
 * Refined to better handle nested blocks, comments, and spacing.
 */
export const beautifyNginx = (source: string): string => {
  // 1. Remove multiple empty lines and trim
  let cleanSource = source.trim();

  // 2. Add newlines around brackets and semicolons to normalize structure,
  //    BUT we must be careful not to touch characters inside quotes or comments.
  let formatted = '';
  let inQuote = false;
  let quoteChar = '';
  let inComment = false;

  for (let i = 0; i < cleanSource.length; i++) {
    const char = cleanSource[i];

    // Handle Quotes
    if ((char === '"' || char === "'") && !inComment && (i === 0 || cleanSource[i - 1] !== '\\')) {
      if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuote = false;
      }
    }

    // Handle Comments
    if (char === '#' && !inQuote) {
      inComment = true;
    }
    if (char === '\n' && inComment) {
      inComment = false;
    }

    // Structural Logic (only if not in quote or comment)
    if (!inQuote && !inComment) {
      if (char === '{') {
        formatted += ' {\n';
      } else if (char === '}') {
        formatted += '\n}\n';
      } else if (char === ';') {
        formatted += ';\n';
      } else if (char === '\n') {
        formatted += '\n'; 
      } else {
        formatted += char;
      }
    } else {
      formatted += char;
    }
  }

  // 3. Split into lines and apply indentation
  const lines = formatted.split('\n');
  let output = '';
  let indentLevel = 0;
  const indentStr = '    '; // 4 spaces

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Skip empty lines if previous was empty (collapse multiple newlines)
    if (!line) {
        if (output.endsWith('\n\n')) continue;
        // output += '\n'; // Preserve single empty lines for readability
        continue;
    }

    // Adjust indent for closing brace BEFORE adding the line
    if (line.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Append line with current indentation
    output += indentStr.repeat(indentLevel) + line + '\n';

    // Adjust indent for opening brace AFTER adding the line
    if (line.endsWith('{')) {
      indentLevel++;
    }
  }

  return output.trim();
};


import cronstrue from 'cronstrue';

export const explainCron = (expression: string): string => {
  try {
    return cronstrue.toString(expression);
  } catch (e) {
    return "Invalid cron expression";
  }
};


/**
 * TEXT DIFF LOGIC (Line Diff + Char Diff)
 */
import { DiffLine, DiffChar } from '../types';

export const computeDiff = (text1: string, text2: string): DiffLine[] => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    
    // Matrix
    const n = lines1.length;
    const m = lines2.length;
    const dp: number[][] = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (lines1[i - 1] === lines2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Backtrack to find diff
    const result: DiffLine[] = [];
    let i = n, j = m;
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
            result.unshift({ type: 'equal', content: lines1[i - 1], lineNumberLeft: i, lineNumberRight: j });
            i--; j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            result.unshift({ type: 'insert', content: lines2[j - 1], lineNumberRight: j });
            j--;
        } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
            result.unshift({ type: 'delete', content: lines1[i - 1], lineNumberLeft: i });
            i--;
        }
    }
    return result;
};

// Character Level Diff (Simple)
export const diffChars = (str1: string, str2: string): DiffChar[] => {
    const n = str1.length;
    const m = str2.length;
    const dp: number[][] = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    const result: DiffChar[] = [];
    let i = n, j = m;
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && str1[i - 1] === str2[j - 1]) {
            result.unshift({ type: 'equal', value: str1[i - 1] });
            i--; j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            result.unshift({ type: 'insert', value: str2[j - 1] });
            j--;
        } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
            result.unshift({ type: 'delete', value: str1[i - 1] });
            i--;
        }
    }
    return result;
};

/**
 * RANDOM STRING GENERATOR LOGIC
 */
export const generateRandomString = (
  length: number,
  useUpper: boolean,
  useLower: boolean,
  useNumbers: boolean,
  useSymbols: boolean
): string => {
  let charset = '';
  if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (useNumbers) charset += '0123456789';
  if (useSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

  if (charset === '') return '';

  let result = '';
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    result += charset[array[i] % charset.length];
  }
  return result;
};

/**
 * JWT UTILS
 */
export const base64UrlDecode = (str: string): string => {
  try {
    // Replace non-url compatible chars
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with standard base64 requirement
    switch (output.length % 4) {
      case 0: break;
      case 2: output += '=='; break;
      case 3: output += '='; break;
      default: throw 'Illegal base64url string!';
    }
    return decodeURIComponent(escape(window.atob(output))); // escape for utf8 support
  } catch (e) {
    throw new Error("Invalid Base64Url");
  }
};

export const base64UrlEncode = (str: string): string => {
  // Unicode safe encoding
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const arrayBufferToBase64Url = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};