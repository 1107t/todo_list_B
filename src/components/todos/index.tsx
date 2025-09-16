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
  images?: { name: string; url: string }[]; // ファイル名とURLの配列に変更
};

type ProjectDetail = {
  id: number;
  title: string;
  overview: string;
  deadline: string;
  responsible: string;
  description: string;
  implementation_items: string[];
  required_environment: string[];
  progress_items: { item: string; completed: boolean }[];
  notes: string;
  created_date: string;
};

type Filter = 'all' | 'completed' | 'unchecked' | 'delete';

interface SearchFormProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: Todo[];
}

const SearchForm: React.FC<SearchFormProps> = (props) => {
  const { searchQuery, onSearchChange, searchResults } = props;
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

interface TodoItemProps {
  todo: Todo;
  isExpanded: boolean;
  onToggleExpanded: (id: number) => void;
  onUpdateTodo: (id: number, key: keyof Todo, value: any) => void;
  onMarkClick: (todo: Todo) => void;
}

const TodoItem: React.FC<TodoItemProps> = (props) => {
  const { todo, isExpanded, onToggleExpanded, onUpdateTodo, onMarkClick } = props;
  const [localDescription, setLocalDescription] = useState(todo.description);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    setLocalDescription(todo.description);
  }, [todo.description]);

  const handleDescriptionChange = useCallback((newDescription: string) => {
    setLocalDescription(newDescription);
    
    // 詳細説明からファイル名が削除された場合、対応する画像も削除
    if (todo.images && todo.images.length > 0) {
      const currentImages = todo.images;
      const descriptionLines = newDescription.split('\n').map(line => line.trim()).filter(line => line !== '');
      
      // 詳細説明に含まれているファイル名のみを残す
      const remainingImages = currentImages.filter(image => 
        descriptionLines.includes(image.name.trim())
      );
      
      // 画像が削除された場合のみ更新
      if (remainingImages.length !== currentImages.length) {
        onUpdateTodo(todo.id, 'images', remainingImages);
      }
    }
  }, [todo.images, todo.id, onUpdateTodo]);

  const handleDescriptionBlur = useCallback(() => {
    onUpdateTodo(todo.id, 'description', localDescription);
    // ブラー時にも画像の同期をチェック
    handleDescriptionChange(localDescription);
  }, [todo.id, localDescription, onUpdateTodo, handleDescriptionChange]);

  const handleMarkClick = () => {
    onMarkClick(todo);
  };

  // 画像ファイルを読み込んでBase64に変換
  const handleImageUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          const currentImages = todo.images || [];
          onUpdateTodo(todo.id, 'images', [...currentImages, { name: file.name, url: imageUrl }]);
          
          // 詳細説明欄にファイル名を追加
          const currentDescription = localDescription;
          const newDescription = currentDescription ? `${currentDescription}\n${file.name}` : file.name;
          setLocalDescription(newDescription);
          onUpdateTodo(todo.id, 'description', newDescription);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // ドラッグオーバー処理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // ドロップ処理
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  // ファイル選択処理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
  };

  // 画像削除処理
  const handleImageDelete = (imageIndex: number) => {
    const currentImages = todo.images || [];
    const newImages = currentImages.filter((_, index) => index !== imageIndex);
    onUpdateTodo(todo.id, 'images', newImages);
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
            className="edit-button"
            onClick={() => onToggleExpanded(todo.id)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: '#28a745',
              color: 'white',
              minWidth: '50px'
            }}
          >
            編集
          </button>
          <button 
            className={todo.delete_flg ? 'restore-button' : 'delete-button'}
            onClick={() => onUpdateTodo(todo.id, 'delete_flg', !todo.delete_flg)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: todo.delete_flg ? '#28a745' : '#dc3545',
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: isDragOver ? '2px dashed #007bff' : '1px solid #ccc',
              borderRadius: '5px',
              backgroundColor: isDragOver ? '#f8f9fa' : ((todo.delete_flg || todo.progress === 100) ? '#f5f5f5' : 'white'),
              transition: 'all 0.2s ease'
            }}
          >
            <textarea
              value={localDescription}
              onChange={(e) => handleDescriptionChange(e.target.value)}
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
              placeholder={isDragOver ? "画像をドロップしてください..." : "詳細説明を入力..."}
            />
          </div>
          
          {/* 画像ファイル名は詳細説明欄に表示されるため、ここでは表示しない */}
          
          <div style={{ marginTop: '10px', textAlign: 'left' }}>
            <button
              type="button"
              onClick={handleMarkClick}
              style={{
                padding: '1px',
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

const TodoApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'calendar' | 'todo' | 'project_detail'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [nextId, setNextId] = useState(1);
  const [expandedTodos, setExpandedTodos] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectDetails, setProjectDetails] = useState<ProjectDetail[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  
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
        todo.description.toLowerCase().replace(/\s+/g, '').includes(query) ||
        query.split('').every(char => 
          todo.title.toLowerCase().includes(char) || 
          todo.description.toLowerCase().includes(char)
        )
      )
    );
  }, [searchQuery, todos]);

  const handleMarkClick = useCallback((todo: Todo) => {
    // 画像も含めてマークダウン形式でプロジェクト詳細データを作成
    let markdownDescription = "";
    
    // タスクに画像がある場合は、マークダウンに画像を追加（引用文なし）
    if (todo.images && todo.images.length > 0) {
      markdownDescription += `### ${todo.title}\n`;
      todo.images.forEach((image, index) => {
        markdownDescription += `\n![${image.name}](${image.url})\n`;
      });
    } else {
      // 画像がない場合は従来通りの引用文を表示
      markdownDescription = "> 本プロジェクトは経営層からの重要施策";
    }

    const projectDetail: ProjectDetail = {
      id: todo.id,
      title: todo.title,
      overview: "本プロジェクトは経営層からの重要施策",
      deadline: "2024年12月20日",
      responsible: "佐藤健一",
      description: markdownDescription,
      implementation_items: [
        "ユーザー認証機能",
        "レガシーシステムとの連携",
        "タスク管理機能"
      ],
      required_environment: [
        "Node.js 18以上",
        "PostgreSQL 14"
      ],
      progress_items: [
        { item: "要件定義完了", completed: true },
        { item: "開発環境構築", completed: false },
        { item: "テスト実施", completed: false }
      ],
      notes: "注意：「セキュリティガイドライン」(http://example.com)に準拠すること",
      created_date: new Date().toISOString().split('T')[0]
    };

    // プロジェクト詳細を追加（重複チェック）
    setProjectDetails(prev => {
      const exists = prev.find(p => p.id === todo.id);
      if (exists) {
        // 既存のプロジェクト詳細を更新（画像が変更されている可能性があるため）
        return prev.map(p => p.id === todo.id ? projectDetail : p);
      }
      return [...prev, projectDetail];
    });

    // 詳細ページに遷移
    setSelectedProjectId(todo.id);
    setCurrentView('project_detail');
  }, []);

  const ProjectDetailView: React.FC = () => {
    const projectDetail = projectDetails.find(p => p.id === selectedProjectId);
    const relatedTodo = todos.find(t => t.id === selectedProjectId);
    const hasImages = relatedTodo?.images && relatedTodo.images.length > 0;

    if (!projectDetail) {
      return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            プロジェクト詳細が見つかりません
          </div>
        </div>
      );
    }

    const handleBackToTodo = () => {
      setCurrentView('todo');
    };

    const renderDescription = (description: string) => {
      // マークダウン記法を解析して適切にレンダリング
      const parts = description.split('\n');
      const elements: React.ReactNode[] = [];
      
      let currentIndex = 0;
      parts.forEach((part, index) => {
        if (part.startsWith('### ')) {
          // H3見出し
          elements.push(
            <h3 key={`h3-${index}`} style={{ fontSize: '16px', color: '#333', marginTop: '20px', marginBottom: '10px' }}>
              {part.replace('### ', '')}
            </h3>
          );
        } else if (part.startsWith('![')) {
          // 画像のマークダウン記法を解析
          const imageMatch = part.match(/!\[([^\]]*)\]\(([^)]+)\)/);
          if (imageMatch) {
            const [, altText, imageUrl] = imageMatch;
            elements.push(
              <div key={`img-${index}`} style={{ marginBottom: '15px' }}>
                <img
                  src={imageUrl}
                  alt={altText}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            );
          }
        } else if (part.startsWith('> ')) {
          // 引用
          elements.push(
            <div key={`quote-${index}`} style={{ 
              fontSize: '14px',
              paddingLeft: '10px',
              color: '#666'
            }}>
              {'>'}  {part.replace('> ', '')}
            </div>
          );
        } else if (part.trim() !== '') {
          // 通常のテキスト
          elements.push(
            <div key={`text-${index}`} style={{ marginLeft: '10px', fontSize: '14px', marginBottom: '5px' }}>
              {part}
            </div>
          );
        }
      });
      
      return elements;
    };

    // 画像がある場合は画像と閉じるボタンのみ表示
    if (hasImages) {
      return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '8px', 
            border: '1px solid #ddd',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {renderDescription(projectDetail.description)}
            
            <div style={{ marginTop: '20px', textAlign: 'left' }}>
              <button
                onClick={handleBackToTodo}
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
    }

    // 画像がない場合は従来通りの表示
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '8px', 
          border: '1px solid #ddd',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            marginBottom: '20px', 
            color: '#333',
            borderBottom: '2px solid #333',
            paddingBottom: '5px'
          }}>
            ▼ プロジェクト管理システム導入
          </h1>

          {/* 概要 */}
          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '18px', color: '#333', marginBottom: '10px' }}>## 概要</h2>
            <div style={{ marginLeft: '10px', fontSize: '14px' }}>
              <div style={{ marginBottom: '5px' }}>
                <strong>**期限**:</strong> {projectDetail.deadline}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>*責任者*:</strong> {projectDetail.responsible}
              </div>
              <div>
                {renderDescription(projectDetail.description)}
              </div>
            </div>
          </section>

          {/* 実装項目 */}
          <section style={{ marginBottom: '25px' }}>
            <div style={{ fontSize: '14px', color: '#333', margin: '20px 0', marginLeft: '10px' }}>---</div>
            <h2 style={{ fontSize: '18px', color: '#333', marginBottom: '10px' }}>### 実装項目</h2>
            <div style={{ marginLeft: '10px', fontSize: '14px' }}>
              {projectDetail.implementation_items.map((item, index) => (
                <div key={index} style={{ marginBottom: '5px' }}>
                  - {item === 'レガシーシステムとの連携' ? `~~${item}~~` : item}
                </div>
              ))}
            </div>
          </section>

          {/* 必要環境 */}
          <section style={{ marginBottom: '25px' }}>
            <div style={{ fontSize: '14px', color: '#333', margin: '20px 0', marginLeft: '10px' }}>```</div>
            <h2 style={{ fontSize: '18px', color: '#333', marginBottom: '10px' }}>## 必要環境:</h2>
            <div style={{ marginLeft: '10px', fontSize: '14px' }}>
              {projectDetail.required_environment.map((env, index) => (
                <div key={index} style={{ marginBottom: '5px' }}>
                  {env}
                </div>
              ))}
              <div style={{ fontSize: '14px', color: '#333', marginTop: '10px' }}>```</div>
            </div>
          </section>

          {/* 進捗 */}
          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '18px', color: '#333', marginBottom: '10px' }}>### 進捗</h2>
            <div style={{ marginLeft: '10px', fontSize: '14px' }}>
              {projectDetail.progress_items.map((item, index) => (
                <div key={index} style={{ marginBottom: '5px' }}>
                  - {item.completed ? '[x]' : '[ ]'} {item.item}
                </div>
              ))}
            </div>
          </section>

          {/* 注意 */}
          <section style={{ marginBottom: '25px' }}>
            <div style={{ marginLeft: '10px', fontSize: '14px' }}>
              <a 
                href="http://example.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: '#0066cc', textDecoration: 'underline' }}
              >
              `注意`：「セキュリティガイドライン」[セキュリティーガイドライン](https://example.com)に準拠すること
              </a>
              
            </div>
            <div style={{ marginTop: '10px', textAlign: 'left' }}>
              <button
                onClick={handleBackToTodo}
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
          </section>

          
        </div>
      </div>
    );
  };

  const CalendarView: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const searchHighlightDates = useMemo(() => {
      if (!searchQuery.trim()) return new Set<string>();
      
      const highlightDates = new Set<string>();
      getSearchedTodos.forEach(todo => {
        const startDate = new Date(todo.start_date);
        const endDate = new Date(todo.due_date);
        
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const day = String(currentDate.getDate()).padStart(2, '0');
          highlightDates.add(`${year}-${month}-${day}`);
          currentDate.setDate(currentDate.getDate() + 1);
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

    const navigateMonth = (direction: 'prev' | 'next') => {
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
    const [description, setDescription] = useState('');
    const [startNote, setStartNote] = useState('');
    const [progress, setProgress] = useState(0);
    
    const [startDate, setStartDate] = useState(() => {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
    
    const [dueDate, setDueDate] = useState(() => {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
    
    const [filter, setFilter] = useState<Filter>('all');
    const [currentDate, setCurrentDate] = useState(selectedDate);

    useEffect(() => {
      setCurrentDate(selectedDate);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      setStartDate(dateString);
      setDueDate(dateString);
    }, [selectedDate]);

    const handleSubmit = () => {
      if (!text) return;

      const newTodo: Todo = {
        title: text,
        id: nextId,
        completed_flg: false,
        delete_flg: false,
        progress: progress,
        start_date: startDate,
        due_date: dueDate,
        description: description,
        start_note: startNote,
        images: [], // 新しいタスクには空の画像配列を設定
      };

      setTodos((prevTodos) => [newTodo, ...prevTodos]);
      setNextId(nextId + 1);
      setText('');
      setDescription('');
      setStartNote('');
      setProgress(0);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      setStartDate(dateString);
      setDueDate(dateString);
    };

    const getFilteredTodos = () => {
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

    const handleFilterChange = (filter: Filter) => {
      setFilter(filter);
    };

    const handleTodo = useCallback((id: number, key: keyof Todo, value: any) => {
      setTodos((todos) => {
        const newTodos = todos.map((todo) => {
          if (todo.id === id) {
            const updatedTodo = { ...todo, [key]: value };
            
            if (key === 'delete_flg' && value === false) {
              const restoredTodo = updatedTodo;
              if (restoredTodo.start_date) {
                const taskStartDate = new Date(restoredTodo.start_date);
                setSelectedDate(taskStartDate);
              }
            }
            
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
          } else {
            return todo;
          }
        });
        
        return newTodos;
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
            onChange={(e) => handleFilterChange(e.target.value as Filter)}
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
            <TodoItem
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
      {currentView === 'project_detail' && <ProjectDetailView />}
    </div>
  );
};

export default TodoApp;