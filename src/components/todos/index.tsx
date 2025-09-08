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

// メインアプリコンポーネント
const TodoApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'calendar' | 'todo'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2024, 11, 4));
  const [todos, setTodos] = useState<Todo[]>([]); // 全体のTodoリスト
  const [nextId, setNextId] = useState(1);

  // カレンダーコンポーネント
  const CalendarView: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(selectedDate);

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
      
      const days = [];
      
      // 前月の日付を追加
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const prevDate = new Date(year, month, -i);
        days.push({
          date: prevDate,
          isCurrentMonth: false
        });
      }
      
      // 当月の日付を追加
      for (let day = 1; day <= daysInMonth; day++) {
        days.push({
          date: new Date(year, month, day),
          isCurrentMonth: true
        });
      }
      
      // 次月の日付を追加（42日になるまで）
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
      const dateString = date.toISOString().split('T')[0];
      return todos.filter(todo => {
        if (todo.delete_flg) return false;
        const todoStart = todo.start_date;
        const todoEnd = todo.due_date;
        return dateString >= todoStart && dateString <= todoEnd;
      });
    };

    const isToday = (date: Date) => {
      const today = new Date();
      return date.toDateString() === today.toDateString();
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

        {/* カレンダーグリッド */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          backgroundColor: '#ddd',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* 曜日ヘッダー */}
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
          
          {/* 日付セル */}
          {days.map((day, index) => {
            const events = getEventsForDate(day.date);
            const todayFlag = isToday(day.date);
            
            return (
              <div
                key={index}
                onClick={() => {
                  setSelectedDate(day.date);
                  setCurrentView('todo');
                }}
                style={{
                  backgroundColor: day.isCurrentMonth ? 'white' : '#f8f9fa',
                  minHeight: '100px',
                  padding: '8px',
                  cursor: 'pointer',
                  position: 'relative',
                  border: todayFlag ? '2px solid #ff8c00' : 'none',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (day.isCurrentMonth) {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (day.isCurrentMonth) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
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
                        backgroundColor: '#003366', // 紺色
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

        {/* 凡例 */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '6px', height: '6px', backgroundColor: '#003366', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '14px' }}>タスク</span>
          </div>
        </div>
      </div>
    );
  };

  // Todo コンポーネント
  const TodoView: React.FC = () => {
    const [text, setText] = useState('');
    const [description, setDescription] = useState('');
    const [startNote, setStartNote] = useState('');
    const [progress, setProgress] = useState(0);
    const [startDate, setStartDate] = useState(() => {
        return new Date(2024, 11, 5).toISOString().split('T')[0];
      });
      const [dueDate, setDueDate] = useState(() => {
        return new Date(2024, 11, 5).toISOString().split('T')[0];
      });
    const [filter, setFilter] = useState<Filter>('all');
    const [currentDate, setCurrentDate] = useState(selectedDate);
    const [showDetailForm, setShowDetailForm] = useState(false);
    const [expandedTodos, setExpandedTodos] = useState<number[]>([]);

    //useEffect(() => {
    //  console.log('TODO!');
    //}, []);
    useEffect(() => {
      setCurrentDate(selectedDate);
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
      };

      setTodos((prevTodos) => [newTodo, ...prevTodos]);
      setNextId(nextId + 1);
      setText('');
      setDescription('');
      setStartNote('');
      setProgress(0);
      const dateString = new Date(2024, 11, 5).toISOString().split('T')[0];
      setStartDate(dateString);
      setDueDate(dateString);
      setShowDetailForm(false);
    };

    const getFilteredTodos = () => {
      switch (filter) {
        case 'completed':
          return todos.filter((todo) => todo.progress === 100 && !todo.delete_flg);
        case 'unchecked':
        return todos.filter((todo) => todo.progress < 100 && !todo.delete_flg);
        case 'delete':
          return todos.filter((todo) => todo.delete_flg);
        default:
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
         
        // 日付関連の処理は、start_dateまたはdue_dateを更新する場合のみ実行
        if (key === 'start_date' || key === 'due_date') {
          const startDate = key === 'start_date' ? value as string : todo.start_date;
          const dueDate = key === 'due_date' ? value as string : todo.due_date;
          
          if (startDate && dueDate && startDate > dueDate) {
            if (key === 'start_date') {
              updatedTodo.due_date = value as string;
            }
            if (key === 'due_date') {
              return todo;  
            }
          }
        }
        
        // 進捗率が100%の場合の処理
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

    const formatDateString = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    };

    const toggleExpanded = (todoId: number) => {
      setExpandedTodos(prev => 
        prev.includes(todoId) 
          ? prev.filter(id => id !== todoId)
          : [...prev, todoId]
      );
    };

    return (
      <div className="todo-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>        
        <div className="date-display" style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          {formatDate(currentDate)}
        </div>
        
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
        
        <div className="filter-container" style={{ marginBottom: '20px', textAlign: 'center' }}>
          <select
            className="filter-select"
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
                className="task-input"
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
              className="empty-button"
              onClick={handleEmpty}
              style={{ padding: '10px 20px', backgroundColor: '#ff8c00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              ごみ箱を空にする
            </button>
          </div>
        )}
        
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {getFilteredTodos().map((todo) => (
            <li key={todo.id} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f5deb3' }}>
              <div style={{ display: 'flex', gap: '20px', minHeight: '80px', alignItems: 'flex-start', fontSize: '14px', color: '#666' }}>
                <div style={{ flex: '0 0 150px', display: 'flex', gap: '10px', backgroundColor: '#f5deb3', padding: '10px', borderRadius: '5px' }}>
                  <div style={{ flex: '0 0 66px', paddingTop: '15px' }}>
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
                  
                  <div style={{ flex: '0 0 105px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <strong>開始日:</strong>
                      <input
                        type="date"
                        value={todo.start_date}
                        onChange={(e) => handleTodo(todo.id, 'start_date', e.target.value)}
                        disabled={todo.delete_flg}
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
                      onChange={(e) => handleTodo(todo.id, 'title', e.target.value)}
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
                  >
                    編集
                  </button>
                  <button 
                    className={todo.delete_flg ? 'restore-button' : 'delete-button'}
                    onClick={() => handleTodo(todo.id, 'delete_flg', !todo.delete_flg)}
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
              
              {/* 詳細説明の表示・編集 - アコーディオン */}
              {expandedTodos.includes(todo.id) && (
                <div style={{ marginTop: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>詳細説明</label>
                  <textarea
                    value={todo.description}
                    onChange={(e) => handleTodo(todo.id, 'description', e.target.value)}
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
        
        {getFilteredTodos().length === 0 && (
          <div className="empty-message" style={{ textAlign: 'center', color: '#666', fontSize: '18px', padding: '40px' }}>
            {filter === 'delete' ? 'ごみ箱は空です' : 'タスクがありません'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {currentView === 'calendar' ? <CalendarView /> : <TodoView />}
    </div>
  );
};

export default TodoApp;