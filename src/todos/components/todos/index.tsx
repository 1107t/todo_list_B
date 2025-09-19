import React, { useState, useEffect, useCallback, useMemo } from 'react';

type Todo = {
  title: string;
  readonly id: number;
  completed_flg: boolean;
  delete_flg: boolean;
  progress: number;
  start_date: string;
  due_date: string;
  description: string;
  start_note: string;
  images?: { name: string; url: string }[];
};

type Filter = 'all' | 'completed' | 'unchecked' | 'delete';

const TodoApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  const [expandedTodos, setExpandedTodos] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [markdownTodo, setMarkdownTodo] = useState<Todo | null>(null);
  const [showMarkdown, setShowMarkdown] = useState<boolean>(false);
  
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const getSearchedTodos = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    
    const query = searchQuery.toLowerCase().replace(/\s+/g, '');
    return todos.filter(todo => 
      !todo.delete_flg && (
        todo.title.toLowerCase().replace(/\s+/g, '').includes(query) ||
        (todo.description || '').toLowerCase().replace(/\s+/g, '').includes(query)
      )
    );
  }, [searchQuery, todos]);

  const handleMarkClick = useCallback((todo: Todo) => {
    setMarkdownTodo(todo);
    setShowMarkdown(true);
  }, []);

  const handleCloseMarkdown = useCallback(() => {
    setShowMarkdown(false);
    setMarkdownTodo(null);
  }, []);

  interface MarkdownRendererProps {
    description: string;
    onBack: () => void;
  }

  const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ description, onBack }) => {
    const renderDescription = (description: string): React.ReactNode => {
      if (!description || typeof description !== 'string') {
        return (
          <div style={{ 
            fontSize: '14px', 
            color: '#666', 
            padding: '20px', 
            textAlign: 'center' 
          }}>
            内容がありません
          </div>
        );
      }
      
      const lines = description.split('\n');
      const elements: React.ReactNode[] = [];
      let codeBlockContent: string[] = [];
      let inCodeBlock = false;
      let listItems: { bullet: string; text: string; indent: string }[] = [];
      
      const flushList = () => {
        if (listItems.length > 0) {
          elements.push(
            <div key={`list-${elements.length}`} style={{ marginBottom: '15px' }}>
              {listItems.map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '5px',
                  marginLeft: item.indent,
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  <span style={{ 
                    marginRight: '8px',
                    color: '#333',
                    minWidth: '16px',
                    fontSize: '14px',
                    fontFamily: 'monospace'
                  }}>
                    {item.bullet}
                  </span>
                  <span 
                    style={{ color: '#333' }}
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  />
                </div>
              ))}
            </div>
          );
          listItems = [];
        }
      };
      
      lines.forEach((line, index) => {
        // コードブロック処理
        if (line.trim().startsWith('```')) {
          flushList();
          if (inCodeBlock) {
            elements.push(
              <pre key={`code-${index}`} style={{ 
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '12px',
                fontSize: '13px',
                fontFamily: '"Courier New", Consolas, monospace',
                overflow: 'auto',
                margin: '15px 0',
                lineHeight: '1.4'
              }}>
                <code>{codeBlockContent.join('\n')}</code>
              </pre>
            );
            codeBlockContent = [];
            inCodeBlock = false;
          } else {
            inCodeBlock = true;
          }
          return;
        }
        
        if (inCodeBlock) {
          codeBlockContent.push(line);
          return;
        }
        
        // セキュリティガイドライン行の処理（最優先）
        if (line.trim().includes('セキュリティガイドライン')) {
          flushList();
          
          // 注意ヘッダー表示
          elements.push(
            <div 
              key={`security-title-${index}`} 
              style={{ 
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '12px',
                marginTop: '20px',
                lineHeight: '1.6',
                display: 'block',
                width: '100%',
                backgroundColor: '#f0f0f0',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              注意
            </div>
          );
          
          // セキュリティガイドライン内容表示
          elements.push(
            <div 
              key={`security-content-${index}`} 
              style={{ 
                fontSize: '14px',
                color: '#333',
                marginBottom: '8px',
                lineHeight: '1.6',
                display: 'block',
                width: '100%'
              }}
            >
              :
              <a 
                href="https://example.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  color: '#0066cc', 
                  textDecoration: 'underline',
                  marginLeft: '0px',
                  marginRight: '0px'
                }}
              >
                セキュリティーガイドライン
              </a>
              に準拠すること
            </div>
          );
          return;
        }
        
        // 空行処理
        if (line.trim() === '') {
          flushList();
          if (elements.length > 0) {
            elements.push(
              <div key={`space-${index}`} style={{ marginBottom: '12px' }} />
            );
          }
        }
        // 注意行の処理（最優先で処理）- インラインコード形式にも対応
        else if (line.trim().startsWith('注意：') || line.trim().startsWith('`注意`：') || line.trim().startsWith('`注意`:')) {
          flushList();
          let content = '';
          
          // 様々なパターンに対応
          if (line.trim().startsWith('注意：')) {
            content = line.replace(/^\s*注意：\s*/, '');
          } else if (line.trim().startsWith('`注意`：')) {
            content = line.replace(/^\s*`注意`：\s*/, '');
          } else if (line.trim().startsWith('`注意`:')) {
            content = line.replace(/^\s*`注意`:\s*/, '');
          }
          
          // 注意を###見出しと同じスタイルで表示（灰色背景付き）
          elements.push(
            <div 
              key={`notice-title-${index}`} 
              style={{ 
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '12px',
                marginTop: '20px',
                lineHeight: '1.6',
                display: 'block',
                width: '100%',
                backgroundColor: '#f0f0f0',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              注意
            </div>
          );
          
          // 内容を別の行として表示
          if (content) {
            let processedContent = content;
            
            // 太字処理
            processedContent = processedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            
            // 斜体処理（太字でない場合のみ）
            processedContent = processedContent.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
            
            // 取り消し線
            processedContent = processedContent.replace(/~~([^~]+)~~/g, '<del style="color: #888;">$1</del>');
            
            // インラインコード
            processedContent = processedContent.replace(/`([^`]+)`/g, 
              '<code style="background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: Consolas, Monaco, \'Courier New\', monospace; font-size: 13px; border: 1px solid #e1e1e1;">$1</code>'
            );
            
            // リンク処理（リンクテキストとURLを適切に処理）
            processedContent = processedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">$1</a>');
            
            elements.push(
              <div 
                key={`notice-content-${index}`} 
                style={{ 
                  fontSize: '14px',
                  color: '#333',
                  marginBottom: '8px',
                  lineHeight: '1.6',
                  display: 'block',
                  width: '100%'
                }}
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            );
          }
        }
        // 見出し処理（###を最優先でチェック）
        else if (line.startsWith('### ')) {
          flushList();
          const headingText = line.substring(4);
          
          elements.push(
            <div 
              key={`h3-${index}`} 
              style={{ 
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '12px',
                marginTop: '20px',
                lineHeight: '1.6'
              }}
            >
              {headingText}
            </div>
          );
          
          // 「実装項目」または「進捗」の場合は水平線を追加
          if (headingText === '実装項目' || headingText === '進捗') {
            elements.push(
              <hr 
                key={`hr-after-${index}`} 
                style={{ 
                  margin: '10px 0 15px 0',
                  border: 'none',
                  borderTop: '1px solid #ddd'
                }} 
              />
            );
          }
        }
        // ##の処理
        else if (line.startsWith('## ')) {
          flushList();
          elements.push(
            <div 
              key={`h2-${index}`} 
              style={{ 
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '15px',
                marginTop: '25px',
                lineHeight: '1.6'
              }}
            >
              {line.substring(3)}
            </div>
          );
        }
        // #の処理
        else if (line.startsWith('# ')) {
          flushList();
          elements.push(
            <div 
              key={`h1-${index}`} 
              style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '18px',
                marginTop: '30px',
                lineHeight: '1.6'
              }}
            >
              {line.substring(2)}
            </div>
          );
        }
        // チェックボックスリスト処理
        else if (line.match(/^\s*-\s*\[[x ]\]/)) {
          flushList();
          const isChecked = line.includes('[x]');
          const indent = (line.match(/^\s*/)?.[0].length || 0) * 10;
          const text = line.replace(/^\s*-\s*\[[x ]\]\s*/, '');
          
          elements.push(
            <div key={`checkbox-${index}`} style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
              marginLeft: `${indent}px`,
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <span style={{ 
                marginRight: '8px',
                color: '#333',
                minWidth: '16px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}>
                ・
              </span>
              <input 
                type="checkbox" 
                checked={isChecked} 
                readOnly 
                style={{ 
                  marginRight: '8px',
                  cursor: 'default'
                }}
              />
              <span style={{ 
                color: isChecked ? '#888' : '#333'
              }}>
                {text}
              </span>
            </div>
          );
        }
        // 通常のリスト処理（- または *で始まる）
        else if (line.match(/^\s*[-*]\s+/)) {
          const indent = (line.match(/^\s*/)?.[0].length || 0) * 12;
          let text = line.replace(/^\s*[-*]\s+/, '');
          
          // リスト項目内でも取り消し線処理を適用
          text = text.replace(/~~([^~]+)~~/g, '<del style="color: #888;">$1</del>');
          
          listItems.push({
            bullet: '・',
            text: text,
            indent: `${indent}px`
          });
        }
        // 引用処理
        else if (line.startsWith('> ')) {
          flushList();
          elements.push(
            <div 
              key={`quote-${index}`} 
              style={{ 
                fontSize: '14px', 
                marginBottom: '8px',
                lineHeight: '1.6',
                color: '#333',
                marginLeft: '2em'
              }}
            >
              {line.substring(2)}
            </div>
          );
        }
        // 水平線処理
        else if (line.trim() === '---') {
          flushList();
          elements.push(
            <hr key={`hr-${index}`} style={{ 
              margin: '20px 0',
              border: 'none',
              borderTop: '1px solid #ddd'
            }} />
          );
        }
        // 通常のテキスト行
        else if (line.trim() !== '') {
          flushList();
          
          let processedLine = line;
          
          // 太字処理
          processedLine = processedLine.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
          
          // 斜体処理（太字でない場合のみ）
          processedLine = processedLine.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
          
          // 取り消し線
          processedLine = processedLine.replace(/~~([^~]+)~~/g, '<del style="color: #888;">$1</del>');
          
          // インラインコード
          processedLine = processedLine.replace(/`([^`]+)`/g, 
            '<code style="background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: Consolas, Monaco, \'Courier New\', monospace; font-size: 13px; border: 1px solid #e1e1e1;">$1</code>'
          );
          
          // リンク処理（リンクテキストとURLを適切に処理）
          processedLine = processedLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">$1</a>');
          
          elements.push(
            <div 
              key={`text-${index}`} 
              style={{ 
                fontSize: '14px', 
                marginBottom: '8px',
                lineHeight: '1.6',
                color: '#333'
              }}
              dangerouslySetInnerHTML={{ __html: processedLine }}
            />
          );
        }
      });
      
      // 残りのリストを処理
      flushList();
      
      return elements;
    };

    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '8px', 
          border: '1px solid #ddd',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {renderDescription(description)}
          
          <div style={{ marginTop: '30px', textAlign: 'left' }}>
            <button
              onClick={onBack}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    );
  };

  interface SearchFormProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchResults: Todo[];
  }

  const SearchForm: React.FC<SearchFormProps> = ({ searchQuery, onSearchChange, searchResults }) => {
    const [localQuery, setLocalQuery] = useState(searchQuery);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalQuery(value);
      onSearchChange(value);
    };

    const handleClear = () => {
      setLocalQuery('');
      onSearchChange('');
    };

    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 20px 0 20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '10px',
            backgroundColor: 'white',
            padding: '10px 15px',
            borderRadius: '10px',
            border: '2px solid #ddd',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <input
              type="text"
              placeholder="Todoを検索..."
              value={localQuery}
              onChange={handleInputChange}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                width: '300px',
                backgroundColor: 'transparent'
              }}
            />
            {localQuery && (
              <button
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#666',
                  padding: '0 5px'
                }}
                title="検索をクリア"
              >
                ×
              </button>
            )}
          </div>
          
          {localQuery && (
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              {searchResults.length > 0 
                ? `${searchResults.length}件のタスクが見つかりました（ハイライト表示）`
                : '該当するタスクが見つかりません'
              }
            </div>
          )}
        </div>
      </div>
    );
  };

  interface TodoItemComponentProps {
    todo: Todo;
    onUpdateTodo: (id: number, key: keyof Todo, value: any) => void;
    onToggleExpanded: (id: number) => void;
    isExpanded: boolean;
    onMarkClick: (todo: Todo) => void;
  }

  const TodoItemComponent: React.FC<TodoItemComponentProps> = ({ todo, onUpdateTodo, onToggleExpanded, isExpanded, onMarkClick }) => {
    const [localDescription, setLocalDescription] = useState(todo.description || '');

    useEffect(() => {
      setLocalDescription(todo.description || '');
    }, [todo.description]);

    const handleDescriptionBlur = () => {
      onUpdateTodo(todo.id, 'description', localDescription);
    };

    const handleMarkClick = () => {
      onMarkClick(todo);
    };

    return (
      <li style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f5deb3' }}>
        <div style={{ display: 'flex', gap: '20px', minHeight: '80px', alignItems: 'flex-start', fontSize: '14px', color: '#666' }}>
          <div style={{ flex: '0 0 150px', display: 'flex', gap: '10px', backgroundColor: '#f5deb3', padding: '10px', borderRadius: '5px' }}>
            <div style={{ flex: '0 0 66px', paddingTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>進捗率</label>
              <select
                value={todo.progress}
                onChange={(e) => onUpdateTodo(todo.id, 'progress', Number(e.target.value))}
                disabled={todo.delete_flg}
                style={{ 
                  width: '100%', 
                  padding: '6px', 
                  fontSize: '12px', 
                  border: '1px solid #ccc', 
                  borderRadius: '5px',
                  backgroundColor: todo.delete_flg ? '#f5f5f5' : 'white'
                }}
              >
                <option value={0}>0%</option>
                <option value={10}>10%</option>
                <option value={20}>20%</option>
                <option value={30}>30%</option>
                <option value={40}>40%</option>
                <option value={50}>50%</option>
                <option value={60}>60%</option>
                <option value={70}>70%</option>
                <option value={80}>80%</option>
                <option value={90}>90%</option>
                <option value={100}>100%</option>
              </select>
            </div>
            
            <div style={{ flex: '0 0 105px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <strong>開始日:</strong>
                <input
                  type="date"
                  value={todo.start_date}
                  onChange={(e) => onUpdateTodo(todo.id, 'start_date', e.target.value)}
                  disabled={todo.delete_flg}
                  max={todo.due_date || undefined}
                  style={{ 
                    marginLeft: '5px', 
                    padding: '4px 8px', 
                    fontSize: '11px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    backgroundColor: todo.delete_flg ? '#f5f5f5' : 'white',
                    width: '95px',
                    fontFamily: 'Arial, sans-serif',
                    cursor: todo.delete_flg ? 'not-allowed' : 'pointer'
                  }}
                />
              </div>
              
              <div>
                <strong>完了予定:</strong>
                <input
                  type="date"
                  value={todo.due_date}
                  onChange={(e) => onUpdateTodo(todo.id, 'due_date', e.target.value)}
                  disabled={todo.delete_flg}
                  min={todo.start_date || undefined}
                  style={{ 
                    marginLeft: '5px', 
                    padding: '4px 8px', 
                    fontSize: '11px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    backgroundColor: todo.delete_flg ? '#f5f5f5' : 'white',
                    width: '95px',
                    fontFamily: 'Arial, sans-serif',
                    cursor: todo.delete_flg ? 'not-allowed' : 'pointer'
                  }}
                />
              </div>
            </div>
          </div>
          
          <div style={{ flex: '1', paddingTop: '55px', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <div style={{ flex: '1' }}>
              <input
                type="text"
                value={todo.title}
                onChange={(e) => onUpdateTodo(todo.id, 'title', e.target.value)}
                disabled={todo.delete_flg || todo.progress === 100}
                style={{ 
                  width: 'calc(100% - 10px)', 
                  padding: '6px', 
                  fontSize: '12px', 
                  border: '1px solid #ccc', 
                  borderRadius: '5px',
                  backgroundColor: (todo.delete_flg || todo.progress === 100) ? '#f5f5f5' : 'white'
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => onToggleExpanded(todo.id)}
              className="edit-button"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: 'white',
                minWidth: '50px'
              }}
            >
              編集
            </button>
            <button 
              onClick={() => onUpdateTodo(todo.id, 'delete_flg', !todo.delete_flg)}
              className={todo.delete_flg ? "restore-button" : "delete-button"}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: 'white',
                minWidth: '50px'
              }}
            >
              {todo.delete_flg ? '復元' : '削除'}
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>詳細説明</label>
            <div
              style={{
                border: '1px solid #ccc',
                borderRadius: '5px',
                backgroundColor: ((todo.delete_flg || todo.progress === 100) ? '#f5f5f5' : 'white')
              }}
            >
              <textarea
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                disabled={todo.delete_flg || todo.progress === 100}
                rows={3}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  fontSize: '14px', 
                  border: 'none',
                  borderRadius: '5px',
                  resize: 'vertical',
                  fontFamily: 'Arial, sans-serif',
                  backgroundColor: 'transparent',
                  outline: 'none'
                }}
                placeholder="詳細説明を入力..."
              />
            </div>
            
            <div style={{ marginTop: '10px', textAlign: 'left' }}>
              <button
                type="button"
                onClick={handleMarkClick}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  border: '1px solid #28a745',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: todo.delete_flg ? '#f5f5f5' : '#28a745',
                  color: todo.delete_flg ? '#999' : 'white'
                }}
                disabled={todo.delete_flg}
              >
                マークダウン表示
              </button>
            </div>
          </div>
        )}
      </li>
    );
  };

  const CalendarView: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const searchHighlightDates = useMemo(() => {
      if (!searchQuery.trim()) return new Set();
      
      const highlightDates = new Set<string>();
      getSearchedTodos.forEach(todo => {
        const startDate = new Date(todo.start_date);
        const endDate = new Date(todo.due_date);
        
        const currentDateLoop = new Date(startDate);
        while (currentDateLoop <= endDate) {
          const year = currentDateLoop.getFullYear();
          const month = String(currentDateLoop.getMonth() + 1).padStart(2, '0');
          const day = String(currentDateLoop.getDate()).padStart(2, '0');
          highlightDates.add(`${year}-${month}-${day}`);
          currentDateLoop.setDate(currentDateLoop.getDate() + 1);
        }
      });
      
      return highlightDates;
    }, [getSearchedTodos, searchQuery]);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      return `${year}年${month}月`;
    };

    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days: { date: Date; isCurrentMonth: boolean }[] = [];
      
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const prevDate = new Date(year, month, -i);
        days.push({
          date: prevDate,
          isCurrentMonth: false
        });
      }
      
      for (let day = 1; day <= daysInMonth; day++) {
        days.push({
          date: new Date(year, month, day),
          isCurrentMonth: true
        });
      }
      
      const remainingDays = 42 - days.length;
      for (let day = 1; day <= remainingDays; day++) {
        days.push({
          date: new Date(year, month + 1, day),
          isCurrentMonth: false
        });
      }
      
      return days;
    };

    const navigateMonth = (direction: string) => {
      const newDate = new Date(currentDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      setCurrentDate(newDate);
    };

    const getEventsForDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      let filteredTodos = todos.filter(todo => {
        if (todo.delete_flg) return false;
        const todoStart = todo.start_date;
        const todoEnd = todo.due_date;
        return dateString >= todoStart && dateString <= todoEnd;
      });

      if (searchQuery.trim()) {
        const searchedIds = new Set(getSearchedTodos.map(todo => todo.id));
        filteredTodos = filteredTodos.filter(todo => searchedIds.has(todo.id));
      }

      return filteredTodos;
    };

    const isToday = (date: Date) => {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    };

    const isSearchHighlighted = (date: Date) => {
      if (!searchQuery.trim()) return false;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      return searchHighlightDates.has(dateString);
    };

    const days = getDaysInMonth(currentDate);

    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
              {formatDate(currentDate)}
            </h2>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setCurrentDate(new Date())}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#808080',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                今日
              </button>
              
              <button
                onClick={() => navigateMonth('prev')}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#003366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ←
              </button>
              
              <button
                onClick={() => navigateMonth('next')}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#003366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          backgroundColor: '#ddd',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} style={{
              backgroundColor: '#f8f9fa',
              padding: '15px 5px',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#333'
            }}>
              {day}
            </div>
          ))}
          
          {days.map((day, index) => {
            const events = getEventsForDate(day.date);
            const todayFlag = isToday(day.date);
            const searchHighlighted = isSearchHighlighted(day.date);
            
            return (
              <div
                key={index}
                onClick={() => {
                  setSelectedDate(day.date);
                  setCurrentView('todo');
                }}
                style={{
                  backgroundColor: searchHighlighted 
                    ? '#fff3cd'
                    : day.isCurrentMonth ? 'white' : '#f8f9fa',
                  minHeight: '100px',
                  padding: '8px',
                  cursor: 'pointer',
                  position: 'relative',
                  border: todayFlag ? '2px solid #ff8c00' : searchHighlighted ? '2px solid #ffc107' : 'none',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: todayFlag ? 'bold' : 'normal',
                  color: day.isCurrentMonth ? (todayFlag ? '#ff8c00' : '#333') : '#999',
                  marginBottom: '5px'
                }}>
                  {day.date.getDate()}
                </div>
                
                {events.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '2px',
                      fontSize: '10px',
                      color: '#333',
                      overflow: 'hidden'
                    }}
                    title={`${event.title} (${event.progress}%)`}
                  >
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#003366',
                        borderRadius: '50%',
                        marginRight: '4px',
                        flexShrink: 0
                      }}
                    />
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {event.title}
                    </span>
                  </div>
                ))}
                
                {events.length > 3 && (
                  <div style={{
                    fontSize: '10px',
                    color: '#666',
                    textAlign: 'center'
                  }}>
                    +{events.length - 3} more
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '6px', height: '6px', backgroundColor: '#003366', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '14px' }}>タスク</span>
          </div>
          {searchQuery && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '2px' }}></div>
              <span style={{ fontSize: '14px' }}>検索結果</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const TodoView: React.FC = () => {
    const [text, setText] = useState('');
    const [filter, setFilter] = useState<Filter>('all');
    const [currentDate, setCurrentDate] = useState(selectedDate);

    useEffect(() => {
      setCurrentDate(selectedDate);
    }, [selectedDate]);

    const handleSubmit = () => {
      if (!text || !text.trim()) return;

      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const newTodo: Todo = {
        title: text.trim(),
        id: nextId,
        completed_flg: false,
        delete_flg: false,
        progress: 0,
        start_date: dateString,
        due_date: dateString,
        description: '',
        start_note: '',
        images: [],
      };

      setTodos(prevTodos => [newTodo, ...prevTodos]);
      setNextId(prev => prev + 1);
      setText('');
    };

    const getFilteredTodos = (): Todo[] => {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const currentDateString = `${year}-${month}-${day}`;

      let filteredTodos: Todo[] = [];
      
      switch (filter) {
        case 'completed':
          filteredTodos = todos.filter((todo) => todo.progress === 100 && !todo.delete_flg);
          break;
        case 'unchecked':
          filteredTodos = todos.filter((todo) => todo.progress < 100 && !todo.delete_flg);
          break;
        case 'delete':
          filteredTodos = todos.filter((todo) => todo.delete_flg);
          break;
        default:
          filteredTodos = todos.filter((todo) => !todo.delete_flg);
      }

      if (filter !== 'delete') {
        filteredTodos = filteredTodos.filter((todo) => {
          if (!todo.start_date || !todo.due_date) {
            return true;
          }
          
          const startDate = todo.start_date;
          const dueDate = todo.due_date;
          
          if (startDate <= dueDate) {
            return currentDateString >= startDate && currentDateString <= dueDate;
          } else {
            return currentDateString >= dueDate && currentDateString <= startDate;
          }
        });
      } else {
        filteredTodos = todos.filter((todo) => todo.delete_flg);
      }

      return filteredTodos;
    };

    const handleTodo = useCallback((id: number, key: keyof Todo, value: any) => {
      setTodos((todos) => {
        return todos.map((todo) => {
          if (todo.id === id) {
            const updatedTodo = { ...todo, [key]: value };
            
            if (key === 'start_date' || key === 'due_date') {
              const startDate = key === 'start_date' ? value : todo.start_date;
              const dueDate = key === 'due_date' ? value : todo.due_date;
              
              if (startDate && dueDate && startDate > dueDate) {
                if (key === 'start_date') {
                  updatedTodo.due_date = value;
                }
                if (key === 'due_date') {
                  return todo;  
                }
              }
            }
            
            if (key === 'progress' && value === 100) {
              updatedTodo.completed_flg = true;
            }
            
            return updatedTodo;
          }
          return todo;
        });
      });
    }, []);

    const handleEmpty = () => {
      setTodos((todos) => todos.filter((todo) => !todo.delete_flg));
    };

    const handleBackToCalendar = () => {
      setCurrentView('calendar');
    };

    const handlePreviousDay = () => {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDate(newDate);
    };

    const handleNextDay = () => {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDate(newDate);
    };

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}年${month}月${day}日`;
    };

    const toggleExpanded = useCallback((todoId: number) => {
      setExpandedTodos(prev => 
        prev.includes(todoId) 
          ? prev.filter(id => id !== todoId)
          : [...prev, todoId]
      );
    }, []);

    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>        
        <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          {formatDate(currentDate)}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '20px' }}>
          <button
            onClick={handlePreviousDay}
            style={{ padding: '10px 20px', backgroundColor: '#ff8c00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            ← 前の日
          </button>
          
          <button
            onClick={handleBackToCalendar}
            style={{ padding: '10px 20px', backgroundColor: '#ff8c00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            カレンダーに戻る
          </button>
          
          <button
            onClick={handleNextDay}
            style={{ padding: '10px 20px', backgroundColor: '#ff8c00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            次の日 →
          </button>
        </div>
        
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            style={{ padding: '8px 12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', width: 'calc(100% - 20px)' }}
          >
            <option value="all">すべてのタスク</option>
            <option value="completed">完了したタスク</option>
            <option value="unchecked">現在のタスク</option>
            <option value="delete">ごみ箱</option>
          </select>
        </div>
        
        {filter !== 'completed' && filter !== 'delete' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>タスク名</label>
              <input
                type="text"
                placeholder="新しいタスクを入力..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
                style={{ width: 'calc(100% - 20px)', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
              />
            </div>
            <div>
              <button 
                type="submit"
                onClick={() => {
                  if (text) {
                    handleSubmit();
                  }
                }}
                style={{ padding: '10px 20px', backgroundColor: '#ff8c00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
              >
                追加
              </button>
            </div>
          </div>
        </div> 
        )}

        {filter === 'delete' && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button 
              type="button"
              onClick={handleEmpty}
              style={{ padding: '10px 20px', backgroundColor: '#ff8c00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              ごみ箱を空にする
            </button>
          </div>
        )}
        
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {getFilteredTodos().map((todo) => (
            <TodoItemComponent
              key={todo.id}
              todo={todo}
              isExpanded={expandedTodos.includes(todo.id)}
              onToggleExpanded={toggleExpanded}
              onUpdateTodo={handleTodo}
              onMarkClick={handleMarkClick}
            />
          ))}
        </ul>
        
        {getFilteredTodos().length === 0 && (
          <div style={{ textAlign: 'center', color: '#666', fontSize: '18px', padding: '40px' }}>
            {filter === 'delete' ? 'ごみ箱は空です' : 'タスクがありません'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {currentView === 'calendar' && (
        <SearchForm
          searchQuery={searchQuery}
          onSearchChange={handleSearchQueryChange}
          searchResults={getSearchedTodos}
        />
      )}
      
      {currentView === 'calendar' && <CalendarView />}
      {currentView === 'todo' && <TodoView />}
      
      {showMarkdown && markdownTodo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            width: '90%',
            maxWidth: '1000px',
            maxHeight: '90%',
            overflow: 'auto',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <MarkdownRenderer 
              description={markdownTodo.description || ''}
              onBack={handleCloseMarkdown}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoApp;