import React, { useState, useEffect, useRef } from 'react';

// 1. Perbaikan Error 'electron' (Memberitahu TS bahwa window.electron itu ada)
declare global {
  interface Window {
    electron: any;
  }
}

// 2. Perbaikan Error 'SQLiteTerminalProps' (Diekspor agar bisa diimport file lain)
export interface SQLiteTerminalProps { 
  isMaximized: boolean; 
}

export const SQLiteTerminal: React.FC<SQLiteTerminalProps> = ({ isMaximized }) => {
  const [lines, setLines] = useState<{ text: string; type: string }[]>([
    { text: `DS Core System - Terminal Active ${import.meta.env.VITE_APP_VERSION || '2.0.0'}`, type: 'info' },
    { text: 'SQL Engine Ready. (Try "SHOW TABLES" or "STATUS")', type: 'warn' },
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const formatTable = (data: any[]) => {
    if (!data || data.length === 0) return 'Query executed successfully. (No rows returned)';
    const headers = Object.keys(data[0]);
    const colWidths = headers.map(h => 
      Math.max(h.length, ...data.map(row => String(row[h] ?? 'NULL').length)) + 2
    );
    const divider = (s: string, m: string, e: string) => 
      s + colWidths.map(w => '─'.repeat(w)).join(m) + e;
    const rowStr = (vals: string[]) => 
      '│' + vals.map((v, i) => v.padEnd(colWidths[i])).join('│') + '│';

    return [
      divider('┌', '┬', '┐'),
      rowStr(headers.map(h => h.toUpperCase())),
      divider('├', '┼', '┤'),
      ...data.map(row => rowStr(headers.map(h => String(row[h] ?? 'NULL')))),
      divider('└', '┴', '┘')
    ].join('\n');
  };

  const executeCommand = async (cmdText: string) => {
    const val = cmdText.trim();
    if (!val) return;
    setLines(prev => [...prev, { text: `root@dms_core:~$ ${val}`, type: 'cmd' }]);

    try {
      if (val.toUpperCase() === 'CLEAR') { setLines([]); return; }
      const res = val.toUpperCase() === 'STATUS' 
        ? await window.electron.dbCheckStatus() 
        : await window.electron.dbExecute(val);

      if (res.success) {
        if (res.type === 'TABLE') {
          setLines(prev => [...prev, { text: formatTable(res.data), type: 'table' }]);
        } else {
          setLines(prev => [...prev, { text: `> ${res.data}`, type: 'info' }]);
        }
      } else {
        setLines(prev => [...prev, { text: `[!] SQL_ERROR: ${res.error}`, type: 'err' }]);
      }
    } catch (err: any) {
      setLines(prev => [...prev, { text: `[!] SYSTEM_CRITICAL: ${err.message}`, type: 'err' }]);
    }
  };

  return (
    <div className="terminal-container" 
         style={{ height: isMaximized ? '100%' : '550px' }} 
         onClick={() => inputRef.current?.focus()}>
      <div className="terminal-scroll-area" ref={scrollRef}>
        {lines.map((l, i) => (
          <pre key={i} className={`line-${l.type} terminal-line`}>
            {l.text}
          </pre>
        ))}
        <div className="input-row">
          <span className="prompt">root@dms_core:~$</span>
          <input 
            ref={inputRef} 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => {
              if (e.key === 'Enter') { executeCommand(input); setInput(''); }
            }} 
            spellCheck={false} 
            autoComplete="off" 
            autoFocus 
          />
        </div>
      </div>
      <style>{`
        .terminal-container { background: #0d1117; width: 100%; cursor: text; display: flex; flex-direction: column; }
        .terminal-scroll-area { flex: 1; padding: 20px; overflow-y: auto; overflow-x: auto; }
        .terminal-line { margin: 0; font-family: monospace; font-size: 13px; white-space: pre; line-height: 1.5; }
        .line-info { color: #3fb950; } 
        .line-cmd { color: #58a6ff; font-weight: bold; } 
        .line-err { color: #f85149; background: rgba(248, 81, 73, 0.1); padding: 2px 4px; } 
        .line-table { color: #c9d1d9; border-left: 2px solid #30363d; padding-left: 10px; margin: 10px 0; } 
        .line-warn { color: #d29922; }
        .input-row { display: flex; align-items: center; margin-top: 10px; padding-bottom: 30px; }
        .prompt { color: #58a6ff; margin-right: 10px; font-family: monospace; font-weight: bold; }
        .input-row input { background: transparent; border: none; outline: none; color: #fff; width: 100%; font-family: monospace; font-size: 13px; }
      `}</style>
    </div>
  );
};