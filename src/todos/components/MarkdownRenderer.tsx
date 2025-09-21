import React from 'react';
import { Todo } from '../types';

interface MarkdownRendererProps {
  description: string;
  onBack: () => void;
  images?: { name: string; url: string }[];
  markdownTodo?: Todo | null;
  onImageView: (imageUrl: string) => void;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  description, 
  onBack, 
  images = [], 
  markdownTodo,
  onImageView 
}) => {
  const handleImageClick = (imageUrl: string) => {
    onImageView(imageUrl);
  };

  const renderDescription = (description: string): React.ReactNode => {
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return null;
    }
    
    const lines = description.split('\n');
    const elements: React.ReactNode[] = [];
    let codeBlockContent: string[] = [];
    let inCodeBlock = false;
    let listItems: { bullet: string; text: string; indent: string }[] = [];
    
    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <div key={`list-${elements.length}`} style={{ marginBottom: '15px' }}>
            {listItems.map((item, idx) => (
              <div key={idx} style={{ 
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '5px',
                marginLeft: item.indent,
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                <span style={{ 
                  marginRight: '8px',
                  color: '#333',
                  minWidth: '16px',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}>
                  {item.bullet}
                </span>
                <span 
                  style={{ color: '#333' }}
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
              </div>
            ))}
          </div>
        );
        listItems = [];
      }
    };
    
    lines.forEach((line, index) => {
      // コードブロック処理
      if (line.trim().startsWith('```')) {
        flushList();
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`} style={{ 
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '12px',
              fontSize: '13px',
              fontFamily: '"Courier New", Consolas, monospace',
              overflow: 'auto',
              margin: '15px 0',
              lineHeight: '1.4'
            }}>
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }
      
      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }
      
      // セキュリティガイドライン行の処理（最優先）
      if (line.trim().includes('セキュリティガイドライン')) {
        flushList();
        
        // 注意ヘッダー表示
        elements.push(
          <div 
            key={`security-title-${index}`} 
            style={{ 
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '12px',
              marginTop: '20px',
              lineHeight: '1.6',
              display: 'block',
              width: '100%',
              backgroundColor: '#f0f0f0',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            注意
          </div>
        );
        
        // セキュリティガイドライン内容表示
        elements.push(
          <div 
            key={`security-content-${index}`} 
            style={{ 
              fontSize: '14px',
              color: '#333',
              marginBottom: '8px',
              lineHeight: '1.6',
              display: 'block',
              width: '100%'
            }}
          >
            :
            <a 
              href="https://example.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{
                color: '#0066cc', 
                textDecoration: 'underline',
                marginLeft: '0px',
                marginRight: '0px'
              }}
            >
              セキュリティーガイドライン
            </a>
            に準拠すること
          </div>
        );
        return;
      }
      
      // 空行処理
      if (line.trim() === '') {
        flushList();
        if (elements.length > 0) {
          elements.push(
            <div key={`space-${index}`} style={{ marginBottom: '12px' }} />
          );
        }
      }
      // 注意行の処理（最優先で処理）- インラインコード形式にも対応
      else if (line.trim().startsWith('注意：') || line.trim().startsWith('`注意`：') || line.trim().startsWith('`注意`:')) {
        flushList();
        let content = '';
        
        // 様々なパターンに対応
        if (line.trim().startsWith('注意：')) {
          content = line.replace(/^\s*注意：\s*/, '');
        } else if (line.trim().startsWith('`注意`：')) {
          content = line.replace(/^\s*`注意`：\s*/, '');
        } else if (line.trim().startsWith('`注意`:')) {
          content = line.replace(/^\s*`注意`:\s*/, '');
        }
        
        // 注意を###見出しと同じスタイルで表示（灰色背景付き）
        elements.push(
          <div 
            key={`notice-title-${index}`} 
            style={{ 
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '12px',
              marginTop: '20px',
              lineHeight: '1.6',
              display: 'block',
              width: '100%',
              backgroundColor: '#f0f0f0',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            注意
          </div>
        );
        
        // 内容を別の行として表示
        if (content) {
          let processedContent = content;
          
          // 太字処理
          processedContent = processedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
          
          // 斜体処理（太字でない場合のみ）
          processedContent = processedContent.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
          
          // 取り消し線
          processedContent = processedContent.replace(/~~([^~]+)~~/g, '<del style="color: #888;">$1</del>');
          
          // インラインコード
          processedContent = processedContent.replace(/`([^`]+)`/g, 
            '<code style="background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: Consolas, Monaco, \'Courier New\', monospace; font-size: 13px; border: 1px solid #e1e1e1;">$1</code>'
          );
          
          // リンク処理（リンクテキストとURLを適切に処理）
          processedContent = processedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">$1</a>');
          
          elements.push(
            <div 
              key={`notice-content-${index}`} 
              style={{ 
                fontSize: '14px',
                color: '#333',
                marginBottom: '8px',
                lineHeight: '1.6',
                display: 'block',
                width: '100%'
              }}
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          );
        }
      }
      // 見出し処理（###を最優先でチェック）
      else if (line.startsWith('### ')) {
        flushList();
        const headingText = line.substring(4);
        
        elements.push(
          <div 
            key={`h3-${index}`} 
            style={{ 
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '12px',
              marginTop: '20px',
              lineHeight: '1.6'
            }}
          >
            {headingText}
          </div>
        );
        
        // 「実装項目」または「進捗」の場合は水平線を追加
        if (headingText === '実装項目' || headingText === '進捗') {
          elements.push(
            <hr 
              key={`hr-after-${index}`} 
              style={{ 
                margin: '10px 0 15px 0',
                border: 'none',
                borderTop: '1px solid #ddd'
              }} 
            />
          );
        }
      }
      // ##の処理
      else if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <div 
            key={`h2-${index}`} 
            style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '15px',
              marginTop: '25px',
              lineHeight: '1.6'
            }}
          >
            {line.substring(3)}
          </div>
        );
      }
      // #の処理
      else if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <div 
            key={`h1-${index}`} 
            style={{ 
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '18px',
              marginTop: '30px',
              lineHeight: '1.6'
            }}
          >
            {line.substring(2)}
          </div>
        );
      }
      // チェックボックスリスト処理
      else if (line.match(/^\s*-\s*\[[x ]\]/)) {
        flushList();
        const isChecked = line.includes('[x]');
        const indent = (line.match(/^\s*/)?.[0].length || 0) * 10;
        const text = line.replace(/^\s*-\s*\[[x ]\]\s*/, '');
        
        elements.push(
          <div key={`checkbox-${index}`} style={{ 
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px',
            marginLeft: `${indent}px`,
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            <span style={{ 
              marginRight: '8px',
              color: '#333',
              minWidth: '16px',
              fontSize: '14px',
              fontFamily: 'monospace'
            }}>
              ・
            </span>
            <input 
              type="checkbox" 
              checked={isChecked} 
              readOnly 
              style={{ 
                marginRight: '8px',
                cursor: 'default'
              }}
            />
            <span style={{ 
              color: isChecked ? '#888' : '#333'
            }}>
              {text}
            </span>
          </div>
        );
      }
      // 通常のリスト処理（- または *で始まる）
      else if (line.match(/^\s*[-*]\s+/)) {
        const indent = (line.match(/^\s*/)?.[0].length || 0) * 12;
        let text = line.replace(/^\s*[-*]\s+/, '');
        
        // リスト項目内でも取り消し線処理を適用
        text = text.replace(/~~([^~]+)~~/g, '<del style="color: #888;">$1</del>');
        
        listItems.push({
          bullet: '・',
          text: text,
          indent: `${indent}px`
        });
      }
      // 引用処理
      else if (line.startsWith('> ')) {
        flushList();
        elements.push(
          <div 
            key={`quote-${index}`} 
            style={{ 
              fontSize: '14px', 
              marginBottom: '8px',
              lineHeight: '1.6',
              color: '#333',
              marginLeft: '2em'
            }}
          >
            {line.substring(2)}
          </div>
        );
      }
      // 水平線処理
      else if (line.trim() === '---') {
        flushList();
        elements.push(
          <hr key={`hr-${index}`} style={{ 
            margin: '20px 0',
            border: 'none',
            borderTop: '1px solid #ddd'
          }} />
        );
      }
      // 通常のテキスト行
      else if (line.trim() !== '') {
        flushList();
        
        let processedLine = line;
        
        // 太字処理
        processedLine = processedLine.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // 斜体処理（太字でない場合のみ）
        processedLine = processedLine.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
        
        // 取り消し線
        processedLine = processedLine.replace(/~~([^~]+)~~/g, '<del style="color: #888;">$1</del>');
        
        // インラインコード
        processedLine = processedLine.replace(/`([^`]+)`/g, 
          '<code style="background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: Consolas, Monaco, \'Courier New\', monospace; font-size: 13px; border: 1px solid #e1e1e1;">$1</code>'
        );
        
        // リンク処理（リンクテキストとURLを適切に処理）
        processedLine = processedLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">$1</a>');
        
        elements.push(
          <div 
            key={`text-${index}`} 
            style={{ 
              fontSize: '14px', 
              marginBottom: '8px',
              lineHeight: '1.6',
              color: '#333'
            }}
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        );
      }
    });
    
    // 残りのリストを処理
    flushList();
    
    return elements;
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '30px', 
      borderRadius: '8px', 
      border: '1px solid #ddd',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* タスクタイトル表示 */}
      <div style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '20px',
        padding: '10px 15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        border: '1px solid #e9ecef'
      }}>
        {markdownTodo?.title || 'タスク詳細'}
      </div>
      
      {renderDescription(description)}
      
      {/* 画像表示セクション */}
      {images && images.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <div style={{ 
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '15px',
            lineHeight: '1.6'
          }}>
            添付画像
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {images.map((image, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <img
                  src={image.url}
                  alt={image.name}
                  onClick={() => handleImageClick(image.url)}
                  style={{
                    width: '100%',
                    maxWidth: '800px',
                    height: 'auto',
                    minHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'block',
                    margin: '0 auto',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
                <div style={{
                  marginTop: '12px',
                  fontSize: '14px',
                  color: '#666',
                  wordBreak: 'break-all'
                }}>
                  {image.name} - クリックで拡大
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
  );
};

export default MarkdownRenderer;