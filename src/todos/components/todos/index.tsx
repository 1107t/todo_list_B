import React, { useState, useEffect, useCallback } from 'react';
import { Todo, Filter } from '../../types';
import TodoItemComponent from '../TodoItem';
import MarkdownRenderer from '../MarkdownRenderer';

const TodoApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  const [expandedTodos, setExpandedTodos] = useState<number[]>([]);
  const [markdownTodo, setMarkdownTodo] = useState<Todo | null>(null);
  const [showMarkdown, setShowMarkdown] = useState<boolean>(false);
  const [imageViewMode, setImageViewMode] = useState<boolean>(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');

  const handleMarkClick = useCallback((todo: Todo) => {
    setMarkdownTodo(todo);
    setShowMarkdown(true);
  }, []);

  const handleCloseMarkdown = useCallback(() => {
    setShowMarkdown(false);
    setMarkdownTodo(null);
  }, []);

  const handleImageView = useCallback((imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
    setImageViewMode(true);
    setShowMarkdown(false);
  }, []);

  const handleBackToMarkdown = useCallback(() => {
    setImageViewMode(false);
    setShowMarkdown(true);
  }, []);

  const ImageViewPage: React.FC = () => {
    return (
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        minHeight: '100vh',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ 
          marginBottom: '20px',
          width: '100%',
          maxWidth: '1200px'
        }}>
          <button
            onClick={handleBackToMarkdown}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ← マークダウンに戻る
          </button>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '1200px',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            marginBottom: '30px',
            color: '#333',
            fontSize: '24px'
          }}>
            画像表示
          </h2>
          
          <div style={{ 
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <img
              src={currentImageUrl}
              alt="表示画像"
              style={{
                maxWidth: '100%',
                width: 'auto',
                height: 'auto',
                maxHeight: '80vh',
                borderRadius: '8px',
                border: '1px solid #ddd',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>
          
          <div style={{ 
            marginTop: '30px',
            textAlign: 'center'
          }}>
            <button
              onClick={handleBackToMarkdown}
              style={{
                padding: '12px 24px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              マークダウンに戻る
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SearchableCalendarView: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState<string>('');

    const getSearchedTodos = () => {
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
    };

    const searchHighlightDates = () => {
      if (!searchQuery.trim()) return new Set();
      
      const highlightDates = new Set<string>();
      getSearchedTodos().forEach(todo => {
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
    };

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
        const searchedIds = new Set(getSearchedTodos().map(todo => todo.id));
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
      
      return searchHighlightDates().has(dateString);
    };

    const days = getDaysInMonth(currentDate);
    const searchResults = getSearchedTodos();

    return (
      <div>
        {/* 検索フォーム */}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '16px',
                  width: '300px',
                  backgroundColor: 'transparent'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
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
            
            {searchQuery && (
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                {searchResults.length > 0 
                  ? `${searchResults.length}件のタスクが見つかりました（ハイライト表示）`
                  : '該当するタスクが見つかりません'
                }
              </div>
            )}
          </div>
        </div>

        {/* カレンダー */}
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
      {imageViewMode ? (
        <ImageViewPage />
      ) : (
        <>
          {currentView === 'calendar' && <SearchableCalendarView />}
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
                width: '95%',
                maxWidth: '1400px',
                maxHeight: '95%',
                overflow: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}>
                <MarkdownRenderer 
                  description={markdownTodo.description || ''}
                  images={markdownTodo.images || []}
                  markdownTodo={markdownTodo}
                  onBack={handleCloseMarkdown}
                  onImageView={handleImageView}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TodoApp;