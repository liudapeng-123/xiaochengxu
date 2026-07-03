'use client';

// 通用：去除行首编号 "1. " 或 "1、"
function stripNumber(line: string): { num: string; text: string } {
  const m = line.match(/^(\d+)[.、\)\]\s]\s*(.*)$/);
  if (m) return { num: m[1], text: m[2] };
  return { num: '', text: line };
}

// MathArithmeticRenderer is now handled inline in A4Preview for multi-page support

interface MathWordRendererProps { content: string; }
export function MathWordRenderer({ content }: MathWordRendererProps) {
  const problems = content.split(/\n\n+/).filter(p => p.trim());
  // 过滤掉没有编号的段落（如标题行）
  const numberedProblems = problems.filter(p => /^\s*\d+[.、]/.test(p));
  return (
    <div>
      {numberedProblems.map((problem, index) => {
        const lines = problem.split('\n').filter(l => l.trim());
        if (lines.length === 0) return null;
        const firstLine = lines[0];
        const { num, text } = stripNumber(firstLine);
        return (
          <div key={index} className="word-problem-item">
            <div className="word-problem-header">
              <span className="word-problem-num">{num || index + 1}.</span>
              <span className="word-problem-text">{text}</span>
            </div>
            <div className="word-problem-answer" />
          </div>
        );
      })}
    </div>
  );
}

interface ChineseCharsRendererProps { content: string; }
export function ChineseCharsRenderer({ content }: ChineseCharsRendererProps) {
  // 解析结构化数据：1. 晨  拼音：chen  笔画：11画  组词：早晨、清晨
  const lines = content.split('\n').filter(l => l.trim());
  const chars: Array<{ num: string; char: string; pinyin: string; strokes: string; words: string }> = [];

  for (const line of lines) {
    // 匹配格式：数字. 汉字  拼音：xxx  笔画：xx画  组词：xxx
    const match = line.match(/^(\d+)[.、]\s*([\u4e00-\u9fa5])\s+拼音[：:]\s*(\S+)\s+笔画[：:]\s*(\d+画?)\s+组词[：:]\s*(.+)$/);
    if (match) {
      chars.push({
        num: match[1],
        char: match[2],
        pinyin: match[3],
        strokes: match[4],
        words: match[5],
      });
    }
  }

  // 如果没有解析到结构化数据，回退到田字格
  if (chars.length === 0) {
    const fallbackChars = content
      .split('\n')
      .filter(l => !l.match(/^\d+[.、]/) && l.trim().length <= 4)
      .join('')
      .match(/[\u4e00-\u9fa5]/g) || [];
    return (
      <div className="tianzige-grid">
        {fallbackChars.map((char, index) => (
          <div key={index} className="tianzige-cell">
            <span className="tianzige-char">{char}</span>
          </div>
        ))}
      </div>
    );
  }

  // 列表形式展示
  return (
    <div className="chinese-chars-list">
      {chars.map((item, index) => (
        <div key={index} className="chinese-char-item">
          <span className="char-num">{item.num}.</span>
          <span className="char-text">{item.char}</span>
          <span className="char-info">拼音：<span className="char-pinyin">{item.pinyin}</span></span>
          <span className="char-info">笔画：<span className="char-strokes">{item.strokes}</span></span>
          <span className="char-info">组词：<span className="char-words">{item.words}</span></span>
        </div>
      ))}
    </div>
  );
}

interface ChinesePracticeRendererProps { content: string; }
export function ChinesePracticeRenderer({ content }: ChinesePracticeRendererProps) {
  const chars = content.match(/[\u4e00-\u9fa5]/g) || [];
  const linesPerGroup = 12;
  const groups: string[][] = [];
  for (let i = 0; i < chars.length; i += linesPerGroup) {
    groups.push(chars.slice(i, i + linesPerGroup));
  }
  return (
    <div className="writing-lines">
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="writing-line">
          <div className="writing-line-text">
            {group.map((char, charIndex) => (
              <span key={charIndex} style={{ marginRight: '8px' }}>{char}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface EnglishWordsRendererProps { content: string; }
export function EnglishWordsRenderer({ content }: EnglishWordsRendererProps) {
  const lines = content.split('\n').filter(line => line.trim());
  const words: Array<{ word: string; meaning: string }> = [];
  for (const line of lines) {
    const { text } = stripNumber(line);
    if (!text) continue;
    // 支持多种分隔符：- — ： : ｜ |
    const sepMatch = text.match(/^([a-zA-Z][a-zA-Z\s'-]*)\s*[-—：:｜|]\s*(.+)$/);
    if (sepMatch) {
      words.push({ word: sepMatch[1].trim(), meaning: sepMatch[2].trim() });
    } else if (/^[a-zA-Z]/.test(text)) {
      // 没有分隔符，整行作为单词
      words.push({ word: text.trim(), meaning: '' });
    }
  }
  return (
    <div className="english-words-list">
      {words.map((item, index) => (
        <div key={index} className="english-word-item">
          <span className="english-word">{item.word}</span>
          <span className="english-meaning">{item.meaning}</span>
        </div>
      ))}
    </div>
  );
}

interface TextDocumentRendererProps { content: string; }
export function TextDocumentRenderer({ content }: TextDocumentRendererProps) {
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  return (
    <div className="text-document">
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

interface ImageRendererProps { src: string; alt?: string; }
export function ImageRenderer({ src, alt }: ImageRendererProps) {
  return (
    <div className="image-container">
      <img src={src} alt={alt || 'Preview'} />
    </div>
  );
}
