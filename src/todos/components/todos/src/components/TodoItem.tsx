import React, { useState, useEffect, useCallback } from 'react';
import { TodoItemProps, Todo } from '../../types';

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
      const remainingImages = currentImages.filter((image: { name: string; url: string }) => 
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

  // 画像削除処理（未使用だが将来のために保持）
  const handleImageDelete = (imageIndex: number) => {
    const currentImages = todo.images || [];
    const newImages = currentImages.filter((_: any, index: number) => index !== imageIndex);
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

export default TodoItem;