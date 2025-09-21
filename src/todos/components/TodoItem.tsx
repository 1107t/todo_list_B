import React, { useState, useEffect } from 'react';
import { Todo } from '../types';

interface TodoItemComponentProps {
  todo: Todo;
  onUpdateTodo: (id: number, key: keyof Todo, value: any) => void;
  onToggleExpanded: (id: number) => void;
  isExpanded: boolean;
  onMarkClick: (todo: Todo) => void;
}

const TodoItemComponent: React.FC<TodoItemComponentProps> = ({ 
  todo, 
  onUpdateTodo, 
  onToggleExpanded, 
  isExpanded, 
  onMarkClick 
}) => {
  const [localDescription, setLocalDescription] = useState<string>(todo.description || '');
  const [dragOver, setDragOver] = useState<boolean>(false);

  useEffect(() => {
    setLocalDescription(todo.description || '');
  }, [todo.description]);

  const handleDescriptionBlur = (): void => {
    onUpdateTodo(todo.id, 'description', localDescription);
  };

  const handleMarkClick = (): void => {
    onMarkClick(todo);
  };

  // ドラッグ&ドロップ処理
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          if (event.target?.result) {
            const imageUrl = event.target.result as string;
            const imageName = file.name;
            
            // 画像情報をTodoに追加
            const currentImages = todo.images || [];
            const newImages = [...currentImages, { name: imageName, url: imageUrl }];
            onUpdateTodo(todo.id, 'images', newImages);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    onUpdateTodo(todo.id, 'progress', Number(e.target.value));
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onUpdateTodo(todo.id, 'start_date', e.target.value);
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onUpdateTodo(todo.id, 'due_date', e.target.value);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onUpdateTodo(todo.id, 'title', e.target.value);
  };

  const handleToggleDelete = (): void => {
    onUpdateTodo(todo.id, 'delete_flg', !todo.delete_flg);
  };

  const handleToggleExpanded = (): void => {
    onToggleExpanded(todo.id);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setLocalDescription(e.target.value);
  };

  return (
    <li style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f5deb3' }}>
      <div style={{ display: 'flex', gap: '20px', minHeight: '80px', alignItems: 'flex-start', fontSize: '14px', color: '#666' }}>
        <div style={{ flex: '0 0 150px', display: 'flex', gap: '10px', backgroundColor: '#f5deb3', padding: '10px', borderRadius: '5px' }}>
          <div style={{ flex: '0 0 66px', paddingTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>進捗率</label>
            <select
              value={todo.progress}
              onChange={handleProgressChange}
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
                onChange={handleStartDateChange}
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
                onChange={handleDueDateChange}
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
              onChange={handleTitleChange}
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
            onClick={handleToggleExpanded}
            className="edit-button"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              minWidth: '50px'
            }}
          >
            編集
          </button>
          <button 
            onClick={handleToggleDelete}
            className={todo.delete_flg ? "restore-button" : "delete-button"}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
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
              border: dragOver ? '2px solid #007bff' : '1px solid #ccc',
              borderRadius: '5px',
              backgroundColor: dragOver ? '#f0f8ff' : ((todo.delete_flg || todo.progress === 100) ? '#f5f5f5' : 'white'),
              position: 'relative'
            }}
          >
            <textarea
              value={localDescription}
              onChange={handleDescriptionChange}
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
              placeholder="詳細説明を入力... (画像もここにドラッグ&ドロップ可能)"
            />
            {dragOver && (
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                border: '2px dashed #007bff',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 1
              }}>
                <div style={{
                  backgroundColor: 'rgba(0, 123, 255, 0.9)',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}>
                  画像をドロップしてください
                </div>
              </div>
            )}
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

export default TodoItemComponent;