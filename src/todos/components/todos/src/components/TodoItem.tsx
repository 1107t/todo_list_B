import React from 'react';
import { MarkdownRendererProps } from '../../types';

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ description, onBack }) => {
  const renderDescription = (description: string) => {
    const lines = description.split('\n');
    const elements: React.ReactNode[] = [];
    let codeBlockContent: string[] = [];
    let inCodeBlock = false;
    
    lines.forEach((line, index) => {
      // コードブロックの処理
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // コードブロック終了
          elements.push(
            <pre key={`code-${index}`} style={{ 
              backgroundColor: '#f4f4f4',
              padding: '15px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              fontSize: '14px',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              overflow: 'auto',
              margin: '10px 0'
            }}>
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          // コードブロック開始
          inCodeBlock = true;
        }
        return;
      }
      
      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }
      
      // 見出しの処理
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${index}`} style={{ 
            fontSize: '18px', 
            color: '#333', 
            marginTop: '20px', 
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${index}`} style={{ 
            fontSize: '20px', 
            color: '#333', 
            marginTop: '25px', 
            marginBottom: '15px',
            fontWeight: 'bold'
          }}>
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${index}`} style={{ 
            fontSize: '24px', 
            color: '#333', 
            marginTop: '30px', 
            marginBottom: '20px',
            fontWeight: 'bold'
          }}>
            {line.replace('# ', '')}
          </h1>
        );
      }
      // 画像の処理
      else if (line.startsWith('![')) {
        const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
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
      }
      // 引用の処理
      else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={`quote-${index}`} style={{ 
            borderLeft: '4px solid #ddd',
            paddingLeft: '15px',
            margin: '10px 0',
            color: '#666',
            fontSize: '14px',
            fontStyle: 'italic'
          }}>
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      // リストアイテムの処理
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <ul key={`list-${index}`} style={{ 
            marginLeft: '20px', 
            marginBottom: '5px' 
          }}>
            <li style={{ 
              fontSize: '14px', 
              marginBottom: '5px' 
            }}>
              {line.replace(/^[*-] /, '')}
            </li>
          </ul>
        );
      }
      // インラインコードの処理
      else if (line.includes('`') && !line.startsWith('```')) {
        const processedLine = line.replace(/`([^`]+)`/g, (match, code) => {
          return `<code style="background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 13px;">${code}</code>`;
        });
        
        elements.push(
          <div 
            key={`inline-code-${index}`} 
            style={{ 
              fontSize: '14px', 
              marginBottom: '5px',
              lineHeight: '1.5'
            }}
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        );
      }
      // 太字の処理
      else if (line.includes('**')) {
        const processedLine = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        elements.push(
          <div 
            key={`bold-${index}`} 
            style={{ 
              fontSize: '14px', 
              marginBottom: '5px',
              lineHeight: '1.5'
            }}
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        );
      }
      // 斜体の処理
      else if (line.includes('*') && !line.startsWith('*')) {
        const processedLine = line.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        elements.push(
          <div 
            key={`italic-${index}`} 
            style={{ 
              fontSize: '14px', 
              marginBottom: '5px',
              lineHeight: '1.5'
            }}
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        );
      }
      // リンクの処理
      else if (line.includes('[') && line.includes('](')) {
        const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/g);
        let processedLine = line;
        
        if (linkMatch) {
          linkMatch.forEach(match => {
            const [, linkText, url] = match.match(/\[([^\]]+)\]\(([^)]+)\)/) || [];
            if (linkText && url) {
              const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">${linkText}</a>`;
              processedLine = processedLine.replace(match, linkHtml);
            }
          });
          
          elements.push(
            <div 
              key={`link-${index}`} 
              style={{ 
                fontSize: '14px', 
                marginBottom: '5px',
                lineHeight: '1.5'
              }}
              dangerouslySetInnerHTML={{ __html: processedLine }}
            />
          );
        }
      }
      // 空行の処理
      else if (line.trim() === '') {
        elements.push(
          <div key={`space-${index}`} style={{ marginBottom: '10px' }} />
        );
      }
      // 通常のテキスト
      else if (line.trim() !== '') {
        elements.push(
          <div key={`text-${index}`} style={{ 
            fontSize: '14px', 
            marginBottom: '5px',
            lineHeight: '1.5'
          }}>
            {line}
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

export default MarkdownRenderer;