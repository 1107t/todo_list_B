import React, { useState, useEffect } from 'react';

// Todo型の定義
type Todo = {
  title: string;
  readonly id: number;
  completed_flg: boolean;
  delete_flg: boolean;
};

type Filter = 'all' | 'completed' | 'unchecked' | 'delete';

const Todo: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  const [nextId, setNextId] = useState(1);
  const [filter, setFilter] = useState<Filter>('all');

  // todos ステートを更新する関数
  const handleSubmit = () => {
    if (!text) return;

    const newTodo: Todo = {
      title: text,
      id: nextId,
      completed_flg: false,
      delete_flg: false,
    };

    setTodos((prevTodos) => [newTodo, ...prevTodos]);
    setNextId(nextId + 1);
    setText('');
  };

  // フィルタリングされたタスクリストを取得する関数
  const getFilteredTodos = () => {
    switch (filter) {
      case 'completed':
        return todos.filter((todo) => todo.completed_flg && !todo.delete_flg);
      case 'unchecked':
        return todos.filter((todo) => !todo.completed_flg && !todo.delete_flg);
      case 'delete':
        return todos.filter((todo) => todo.delete_flg);
      default:
        return todos.filter((todo) => !todo.delete_flg);
    }
  };

  const handleTodo = <K extends keyof Todo, V extends Todo[K]>(
    id: number,
    key: K,
    value: V
  ) => {
    setTodos((todos) => {
      const newTodos = todos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, [key]: value };
        } else {
          return todo;
        }
      });
      return newTodos;
    });
  };

  const handleFilterChange = (filter: Filter) => {
    setFilter(filter);
  };

  // 物理的に削除する関数
  const handleEmpty = () => {
    setTodos((todos) => todos.filter((todo) => !todo.delete_flg));
  };

  // localStorageを使用してデータを保存・読み込み
  useEffect(() => {
    try {
      const savedTodos = localStorage.getItem('todo-20240622');
      if (savedTodos) {
        const parsedTodos = JSON.parse(savedTodos) as Todo[];
        setTodos(parsedTodos);
        // 最大IDを計算して次のIDを設定
        if (parsedTodos.length > 0) {
          const maxId = Math.max(...parsedTodos.map(todo => todo.id));
          setNextId(maxId + 1);
        }
      }
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    }
  }, []);

  // todos が更新されるたびにlocalStorageに保存
  useEffect(() => {
    try {
      localStorage.setItem('todo-20240622', JSON.stringify(todos));
    } catch (error) {
      console.error('データの保存に失敗しました:', error);
    }
  }, [todos]);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <div className="flex items-center space-x-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => window.location.href = '/'}
          title="Topページに戻る"
        >
          ← 戻る
        </button>
        
        <select
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value as Filter)}
        >
          <option value="all">すべてのタスク</option>
          <option value="completed">完了したタスク</option>
          <option value="unchecked">現在のタスク</option>
          <option value="delete">ごみ箱</option>
        </select>
      </div>

      {filter === 'delete' ? (
        <button 
          onClick={handleEmpty}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          ごみ箱を空にする
        </button>
      ) : (
        filter !== 'completed' && (
          <form
            className="flex space-x-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="新しいタスクを入力..."
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              追加
            </button>
          </form>
        )
      )}

      <ul className="space-y-2">
        {getFilteredTodos().map((todo) => (
          <li key={todo.id} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              disabled={todo.delete_flg}
              checked={todo.completed_flg}
              onChange={() => handleTodo(todo.id, 'completed_flg', !todo.completed_flg)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <input
              type="text"
              disabled={todo.completed_flg || todo.delete_flg}
              value={todo.title}
              onChange={(e) => handleTodo(todo.id, 'title', e.target.value)}
              className={`flex-1 px-2 py-1 border border-gray-300 rounded ${
                todo.completed_flg ? 'line-through text-gray-500 bg-gray-100' : ''
              } ${todo.delete_flg ? 'bg-red-50' : ''}`}
            />
            <button 
              onClick={() => handleTodo(todo.id, 'delete_flg', !todo.delete_flg)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                todo.delete_flg 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {todo.delete_flg ? '復元' : '削除'}
            </button>
          </li>
        ))}
      </ul>
      
      {getFilteredTodos().length === 0 && (
        <p className="text-center text-gray-500 py-8">
          {filter === 'delete' ? 'ごみ箱は空です' : 'タスクがありません'}
        </p>
      )}
    </div>
  );
};

export default Todo;