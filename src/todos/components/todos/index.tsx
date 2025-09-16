import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TodoItem from './src/components/TodoItem';
import MarkdownRenderer from './src/components/MarkdownRenderer';
import { Todo, ProjectDetail, Filter, SearchFormProps } from './types';

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
    const projectDetail: ProjectDetail = {
      id: todo.id,
      title: todo.title,
      overview: "",
      deadline: "",
      responsible: "",
      description: todo.description,
      implementation_items: [],
      required_environment: [],
      progress_items: [],
      notes: "",
      created_date: new Date().toISOString().split('T')[0]
    };

    setProjectDetails(prev => {
      const exists = prev.find(p => p.id === todo.id);
      if (exists) {
        return prev.map(p => p.id === todo.id ? projectDetail : p);
      }
      return [...prev, projectDetail];
    });

    setSelectedProjectId(todo.id);
    setCurrentView('project_detail');
  }, []);

  const ProjectDetailView: React.FC = () => {
    const projectDetail = projectDetails.find(p => p.id === selectedProjectId);

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

    return <MarkdownRenderer description={projectDetail.description} onBack={handleBackToTodo} />;
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
        images: [],
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