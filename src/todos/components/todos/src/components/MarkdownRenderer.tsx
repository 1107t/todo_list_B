import React from 'react';
import { MarkdownRendererProps } from '../todos/types';

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ description, onBack }) => {
  const renderDescription = (description: string) => {
    // マークダウン記法を解析して適切にレンダリング
    const parts = description.split('\n');
    const elements: React.ReactNode[] = [];
    
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
        
        <div style={{ marginTop: '20px', textAlign: 'left' }}>
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

export default MarkdownRenderer;