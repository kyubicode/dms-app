import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    api: {
      dbCheckStatus: () => Promise<any>;
      dbBackup: () => Promise<any>;
      dbExecute: (sql: string) => Promise<any>;
      [key: string]: any;
    };
  }
}

interface SQLiteTerminalProps { isMaximized: boolean; }

export const SQLiteTerminal: React.FC<SQLiteTerminalProps> = ({ isMaximized }) => {
  const [lines, setLines] = useState<{ text: string; type: string }[]>([
    { 
      text: `ZenTE ${import.meta.env.VITE_APP_VERSION} - Active`, 
      type: 'info' 
    },
    { text: 'SQL Engine Ready. (Try "SHOW TABLES")', type: 'warn' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  const formatTable = (data: any[]) => {
    if (!data || data.length === 0) return 'No rows returned.';
    const headers = Object.keys(data[0]);
    const colWidths = headers.map(h => Math.max(h.length, ...data.map(row => String(row[h]).length)) + 2);
    
    const divider = (s:string, m:string, e:string) => s + colWidths.map(w => '─'.repeat(w)).join(m) + e;
    const rowStr = (vals: string[]) => '│' + vals.map((v, i) => v.padEnd(colWidths[i])).join('│') + '│';

    const headerLine = rowStr(headers.map(h => h.toUpperCase()));
    const bodyLines = data.map(row => rowStr(headers.map(h => String(row[h] ?? 'NULL'))));

    return [divider('┌','┬','┐'), headerLine, divider('├','┼','┤'), ...bodyLines, divider('└','┴','┘')].join('\n');
  };

  const executeCommand = async (cmdText: string) => {
    const val = cmdText.trim();
    if (!val) return;

    setLines(prev => [...prev, { text: `user@dms_core:~$ ${val}`, type: 'cmd' }]);
    setHistory(prev => [val, ...prev]);

    try {
      if (val.toUpperCase() === 'CLEAR') { setLines([]); return; }
      
      const res = val.toUpperCase() === 'STATUS' ? await window.api.dbCheckStatus() : await window.api.dbExecute(val);

      if (res.success) {
        const output = res.type === 'TABLE' ? formatTable(res.data) : `> ${JSON.stringify(res.data)}`;
        setLines(prev => [...prev, { text: output, type: res.type === 'TABLE' ? 'table' : 'info' }]);
      } else {
        setLines(prev => [...prev, { text: `[!] ERR: ${res.error}`, type: 'err' }]);
      }
    } catch (err: any) {
      setLines(prev => [...prev, { text: `[!] CRITICAL: ${err.message}`, type: 'err' }]);
    }
  };

  return (
    <div className="terminal-window" style={{ height: isMaximized ? 'calc(100vh - 42px)' : '550px' }} onClick={() => inputRef.current?.focus()}>
      <div className="terminal-content" ref={scrollRef}>
        {lines.map((l, i) => <pre key={i} className={`line-${l.type} terminal-line`}>{l.text}</pre>)}
        <div className="input-area">
          <span className="prompt-label">root@dms_core:~$</span>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} 
            onKeyDown={e => {
              if(e.key === 'Enter') { executeCommand(input); setInput(''); }
            }} spellCheck={false} autoComplete="off" autoFocus />
        </div>
      </div>
      <style>{`
        .terminal-window { background: #05070a; display: flex; flex-direction: column; width: 100%; border-top: 1px solid #1f2937; }
        .terminal-content { flex: 1; padding: 15px; overflow: auto; }
        .terminal-line { margin: 0; font-family: 'Fira Code', monospace; font-size: 12px; white-space: pre; line-height: 1.5; }
        .line-info { color: #4ade80; } .line-cmd { color: #63b3ed; } .line-err { color: #f56565; } .line-table { color: #cbd5e1; font-size: 11px; }
        .input-area { display: flex; align-items: center; margin-top: 5px; }
        .prompt-label { color: #63b3ed; margin-right: 8px; font-weight: bold; }
        input { background: transparent; border: none; outline: none; color: #fff; width: 100%; font-family: inherit; }
      `}</style>
    </div>
  );
};