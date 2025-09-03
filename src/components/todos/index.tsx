import React, { useState, useEffect } from 'react';

// "Todo" 型の定義をコンポーネント外で行います
type Todo = {
  title: string;
  readonly id: number;
  completed_flg: boolean;
  delete_flg: boolean;
  progress: number; // 進捗率 (0-100)
  start_date: string; // 開始日 (YYYY-MM-DD)
  due_date: string; // 完了予定日 (YYYY-MM-DD)
  description: string; // 詳細説明
  start_note: string; // 開始日メモ
};

type Filter = 'all' | 'completed' | 'unchecked' | 'delete';

// Todo コンポーネントの定義
const Todo: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]); // Todoの配列を保持するステート
  const [text, setText] = useState(''); // フォーム入力のためのステート
  const [description, setDescription] = useState(''); // 詳細説明のステート
  const [startNote, setStartNote] = useState(''); // 開始日メモのステート
  const [progress, setProgress] = useState(0); // 進捗率のステート
  const [startDate, setStartDate] = useState('2024-12-04'); // 開始日のステート
  const [dueDate, setDueDate] = useState('2024-12-04'); // 完了予定日のステート
  const [nextId, setNextId] = useState(1); // 次のTodoのIDを保持するステート
  const [filter, setFilter] = useState<Filter>('all'); // フィルタのステート
  const [currentDate, setCurrentDate] = useState(new Date()); // 現在の日付を保持するステート
  const [showDetailForm, setShowDetailForm] = useState(false); // 詳細フォーム表示状態
  const [expandedTodos, setExpandedTodos] = useState<number[]>([]); // 展開されているTodoのIDを管理

  useEffect(() => {
    // ここに副作用の処理を書く
    console.log('TODO!');
  }, []);

  // 日付文字列をDateオブジェクトに変換する関数
  const stringToDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  // DateオブジェクトをYYYY-MM-DD形式の文字列に変換する関数
  const dateToString = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // todos ステートを更新する関数
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
    };

    setTodos((prevTodos) => [newTodo, ...prevTodos]);
    setNextId(nextId + 1);
    setText('');
    setDescription('');
    setStartNote('');
    setProgress(0);
    setStartDate('2024-12-04');
    setDueDate('2024-12-04');
    setShowDetailForm(false); // 追加後は詳細フォームを非表示にする
  };

  // フィルタリングされたタスクリストを取得する関数
  const getFilteredTodos = () => {
    switch (filter) {
      case 'completed':
        // 完了済み **かつ** 削除されていないタスクを返す
        return todos.filter((todo) => todo.completed_flg && !todo.delete_flg);
      case 'unchecked':
        // 未完了 **かつ** 削除されていないタスクを返す
        return todos.filter((todo) => !todo.completed_flg && !todo.delete_flg);
      case 'delete':
        // 削除されたタスクを返す
        return todos.filter((todo) => todo.delete_flg);
      default:
        // 削除されていないすべてのタスクを返す
        return todos.filter((todo) => !todo.delete_flg);
    }
  };

  const handleFilterChange = (filter: Filter) => {
    setFilter(filter);
  };

  const handleTodo = <K extends keyof Todo, V extends Todo[K]>(
    id: number,
    key: K,
    value: V
  ) => {
    setTodos((todos) => {
      const newTodos = todos.map((todo) => {
        if (todo.id === id) {
          const updatedTodo = { ...todo, [key]: value };
          
          // 日付バリデーション
          if (key === 'start_date' || key === 'due_date') {
            const startDate = key === 'start_date' ? value as string : todo.start_date;
            const dueDate = key === 'due_date' ? value as string : todo.due_date;
            
            // 開始日が完了予定日より後の場合、設定を阻止
            if (startDate && dueDate && startDate > dueDate) {
              // 開始日を変更する場合は、完了予定日も同じ日付に自動更新
              if (key === 'start_date') {
                updatedTodo.due_date = value as string;
              }
              // 完了予定日を変更する場合で開始日より前になる場合は変更を阻止
              if (key === 'due_date') {
                return todo; // 変更を反映させない
              }
            }
          }
          
          // 進捗率が100％になったら完了フラグをtrueにする
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
  };

   // 物理的に削除する関数
   const handleEmpty = () => {
    setTodos((todos) => todos.filter((todo) => !todo.delete_flg));
  };

  // カレンダーに戻るボタンの処理
  const handleBackToCalendar = () => {
    alert('カレンダーに戻ります');
  };

  // 前の日ボタンの処理
  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  // 次の日ボタンの処理
  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  // 日付をフォーマットする関数
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };

  // 今日の日付をYYYY-MM-DD形式で取得
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // 日付をフォーマットする関数（YYYY-MM-DD → YYYY年MM月DD日）
  const formatDateString = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // アコーディオンの展開/折りたたみを切り替える関数
  const toggleExpanded = (todoId: number) => {
    setExpandedTodos(prev => 
      prev.includes(todoId) 
        ? prev.filter(id => id !== todoId)
        : [...prev, todoId]
    );
  };

  return (
    <div className="todo-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <style jsx>{`
        .date-display {
          text-align: center;
          font-size: 1.5rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 1rem;
          padding: 0.5rem;
          width: 100%;
        }

        /* フィルター選択の中央配置 */
        .filter-container {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .filter-select {
          width: auto;
          max-width: 300px;
          margin: 0.5em 0;
          padding: 0.75em;
          font-size: 1.2em;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        /* 入力フィールドの中央配置 */
        .input-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1rem;
        }

        .task-input {
          width: auto;
          max-width: 400px;
          margin: 0.5em 0;
          padding: 0.75em;
          font-size: 1.2em;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        /* ナビゲーションボタン用のスタイル */
        .navigation-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .nav-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.3s ease;
        }

        /* すべてのボタンをオレンジ色に統一 */
        .prev-button, .next-button {
          background-color: #ff8c00;
          color: white;
        }

        .prev-button:hover, .next-button:hover {
          background-color: #e67e00;
        }

        .back-button {
          background-color: #ff8c00;
          color: white;
        }

        .back-button:hover {
          background-color: #e67e00;
        }

        /* ごみ箱を空にするボタン */
        .empty-button {
          background-color: #ff8c00 !important;
          width: auto !important;
        }

        .empty-button:hover {
          background-color: #e67e00 !important;
        }

        /* 復元ボタン */
        .restore-button {
          background-color: #dc3545 !important;
        }

        .restore-button:hover {
          background-color: #c82333 !important;
        }

        .delete-button {
          background-color: #dc3545 !important;
        }

        .delete-button:hover {
          background-color: #c82333 !important;
        }

        /* 編集ボタン */
        .edit-button {
          background-color: #28a745 !important;
        }

        .edit-button:hover {
          background-color: #218838 !important;
        }

        /* 追加ボタンもオレンジ色に */
        button[type='submit'] {
          background-color: #ff8c00 !important;
          color: #fff;
          border: none;
          cursor: pointer;
          height: 45px;
          width: 35%;
          font-size: 1.2em;
          padding: 0.5em 1em;
          border-radius: 5px;
        }

        button[type='submit']:hover {
          background-color: #e67e00 !important;
        }

        /* リスト内のボタンもオレンジ色に */
        li button {
          padding: 0.3em 0.6em; 
          background-color: #ff8c00 !important;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          width: 100px;
        }

        li button:hover {
          background-color: #e67e00 !important;
        }

        /* 完了したタスク */
        .completed {
          text-decoration: line-through;
          color: #666;
          background-color: #f8f9fa !important;
        }

        /* 空メッセージ */
        .empty-message {
          text-align: center;
          padding: 2rem;
          color: #666;
          font-size: 1.1rem;
        }
      `}</style>
      {/* 日付表示 */}
      <div className="date-display" style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        {formatDate(currentDate)}
      </div>
      
      {/* ナビゲーションボタン */}
      <div className="navigation-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '20px' }}>
        <button
          className="nav-button prev-button"
          onClick={handlePreviousDay}
          title="前の日"
          style={{ padding: '10px 20px', backgroundColor: '#ff8c00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          ← 前の日
        </button>
        
        <button
          className="nav-button back-button"
          onClick={handleBackToCalendar}
          title="カレンダーに戻る"
          style={{ padding: '10px 20px', backgroundColor: '#ff8c00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          カレンダーに戻る
        </button>
        
        <button
          className="nav-button next-button"
          onClick={handleNextDay}
          title="次の日"
          style={{ padding: '10px 20px', backgroundColor: '#ff8c00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          次の日 →
        </button>
      </div>
      
      {/* フィルター */}
      <div className="filter-container" style={{ marginBottom: '20px', textAlign: 'center' }}>
        <select
          className="filter-select"
          defaultValue="all"
          onChange={(e) => handleFilterChange(e.target.value as Filter)}
          style={{ padding: '8px 12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', width: '200px' }}
        >
          <option value="all">すべてのタスク</option>
          <option value="completed">完了したタスク</option>
          <option value="unchecked">現在のタスク</option>
          <option value="delete">ごみ箱</option>
        </select>
      </div>
      
       {/* タスク名入力フォーム（フィルタの下に配置） */}
      {filter !== 'completed' && filter !== 'delete' && (
       <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>タスク名</label>
            <input
              type="text"
              className="task-input"
              placeholder="新しいタスクを入力..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
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
            className="empty-button"
            onClick={handleEmpty}
            style={{ padding: '10px 20px', backgroundColor: '#ff8c00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            ごみ箱を空にする
          </button>
        </div>
      )}
      
      {/* タスクリスト */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {getFilteredTodos().map((todo) => (
          <li key={todo.id} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              
              
            </div>
            
            <div style={{ display: 'flex', gap: '20px', minHeight: '80px', alignItems: 'flex-start', fontSize: '14px', color: '#666' }}>
              <div style={{ flex: '0 0 140px', paddingTop: '30px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>進捗率</label>
                <select
                  value={todo.progress}
                  onChange={(e) => handleTodo(todo.id, 'progress', Number(e.target.value))}
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
              
              <div style={{ flex: '0 0 140px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <strong>開始日:</strong>
                  <input
                    type="date"
                    value={todo.start_date}
                    onChange={(e) => handleTodo(todo.id, 'start_date', e.target.value)}
                    disabled={todo.delete_flg}
                    min=""
                    max=""
                    style={{ 
                      marginLeft: '5px', 
                      padding: '4px 8px', 
                      fontSize: '11px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px',
                      backgroundColor: todo.delete_flg ? '#f5f5f5' : 'white',
                      width: '130px',
                      fontFamily: 'Arial, sans-serif',
                      cursor: todo.delete_flg ? 'not-allowed' : 'pointer'
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                    {formatDateString(todo.start_date)}
                  </div>
                </div>
                
                <div>
                  <strong>完了予定:</strong>
                  <input
                    type="date"
                    value={todo.due_date}
                    onChange={(e) => handleTodo(todo.id, 'due_date', e.target.value)}
                    disabled={todo.delete_flg}
                    min={todo.start_date || undefined}
                    style={{ 
                      marginLeft: '5px', 
                      padding: '4px 8px', 
                      fontSize: '11px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px',
                      backgroundColor: todo.delete_flg ? '#f5f5f5' : 'white',
                      width: '130px',
                      fontFamily: 'Arial, sans-serif',
                      cursor: todo.delete_flg ? 'not-allowed' : 'pointer'
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                    {formatDateString(todo.due_date)}
                  </div>
                </div>
              </div>
              
              <div style={{ flex: '1', paddingTop: '30px', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ flex: '1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>開始日メモ</label>
                  <input
                    type="text"
                    value={todo.progress === 100 ? '' : todo.start_note}
                    onChange={(e) => handleTodo(todo.id, 'start_note', e.target.value)}
                    placeholder="開始日のメモ..."
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
                  onClick={() => {
                    toggleExpanded(todo.id);
                  }}
                  style={{ 
                    padding: '6px 10px', 
                    color: 'white',
                    border: 'none', 
                    borderRadius: '3px', 
                    cursor: 'pointer',
                    height: '28px',
                    minWidth: '40px'
                  }}
                >
                  編集
                </button>
                <button 
                  className={todo.delete_flg ? 'restore-button' : 'delete-button'}
                  onClick={() => handleTodo(todo.id, 'delete_flg', !todo.delete_flg)}
                  style={{ 
                    padding: '6px 10px', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer',
                    height: '28px',
                    minWidth: '40px'
                  }}
                 >
                  {todo.delete_flg ? '復元' : '削除'}
                </button>
              </div>
            </div>
            
            {/* 詳細説明の表示・編集 - アコーディオン */}
            {expandedTodos.includes(todo.id) && (
              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>詳細説明</label>
                <textarea
                  value={todo.progress === 100 ? '' : todo.description || ''}
                  onChange={(e) => handleTodo(todo.id, 'description', e.target.value)}
                  placeholder="詳細説明を入力..."
                  disabled={todo.delete_flg || todo.progress === 100}
                  rows={3}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    fontSize: '14px', 
                    border: '1px solid #ccc', 
                    borderRadius: '5px',
                    resize: 'vertical',
                    fontFamily: 'Arial, sans-serif',
                    backgroundColor: (todo.delete_flg || todo.progress === 100) ? '#f5f5f5' : 'white'
                  }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
      
      {/* タスクが空の場合のメッセージ */}
      {getFilteredTodos().length === 0 && (
        <div className="empty-message" style={{ textAlign: 'center', color: '#666', fontSize: '18px', padding: '40px' }}>
          {filter === 'delete' ? 'ごみ箱は空です' : 'タスクがありません'}
        </div>
      )}

      {/* フィルターが 'completed' または 'delete' でなければ Todo 入力フォームを表示（タスクリストの下） */}
      
    </div>
  );
};

export default Todo;