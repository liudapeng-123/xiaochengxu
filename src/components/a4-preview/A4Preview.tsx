'use client';

import { GeneratedContent } from '@/lib/types';
import { A4Page } from './A4Page';
import {
  TextDocumentRenderer,
  MathArithmeticRenderer,
  MathWordRenderer,
  ChineseCharsRenderer,
  ChinesePracticeRenderer,
  EnglishWordsRenderer,
  ImageRenderer,
} from './renderers';

interface A4PreviewProps {
  content: GeneratedContent;
}

export function A4Preview({ content }: A4PreviewProps) {
  const MAX_DOC_PARAGRAPHS_PER_PAGE = 30;

  const getPageInfo = (): { totalPages: number; type: string } => {
    if (content.type === 'math_arithmetic') {
      const problemLines = content.content.split('\n').filter(l => /^\s*\d+[.、]/.test(l));
      return { totalPages: Math.ceil(problemLines.length / 100) || 1, type: 'math_arithmetic' };
    }
    if (content.type === 'math_word') {
      const problems = content.content.split(/\n\n+/).filter(p => /^\s*\d+[.、]/.test(p));
      return { totalPages: Math.ceil(problems.length / 20) || 1, type: 'math_word' };
    }
    if (content.type === 'document' || content.type === 'custom_text') {
      const paragraphs = content.content.split('\n\n').filter(p => p.trim());
      return { totalPages: Math.ceil(paragraphs.length / MAX_DOC_PARAGRAPHS_PER_PAGE) || 1, type: 'document' };
    }
    return { totalPages: 1, type: 'other' };
  };

  const { totalPages } = getPageInfo();

  const renderSinglePage = (pageNum: number) => {
    switch (content.type) {
      case 'math_arithmetic': {
        const problemLines = content.content.split('\n').filter(l => /^\s*\d+[.、]/.test(l));
        const pageStart = (pageNum - 1) * 100;
        const pageItems = problemLines.slice(pageStart, pageStart + 100);
        const half = Math.ceil(pageItems.length / 2);
        const leftCol = pageItems.slice(0, half);
        const rightCol = pageItems.slice(half);

        const renderCol = (items: string[], startIdx: number) =>
          items.map((line, i) => {
            let text = line.trim();
            const firstMatch = text.match(/^(\d+)[.、\)\]\s]\s*(.*)$/);
            if (firstMatch) {
              text = firstMatch[2];
            }
            if (!text) return null;
            return (
              <div key={i} className="math-col-item">
                <span className="math-col-num">{startIdx + i + 1}.</span>
                <span className="math-col-text">{text}</span>
                <span className="math-col-blank" />
              </div>
            );
          });

        return (
          <div className="math-two-col">
            <div className="math-col">{renderCol(leftCol, pageStart)}</div>
            <div className="math-col">{renderCol(rightCol, pageStart + leftCol.length)}</div>
          </div>
        );
      }
      case 'math_word': {
        const problems = content.content.split(/\n\n+/).filter(p => /^\s*\d+[.、]/.test(p));
        const pageStart = (pageNum - 1) * 20;
        const pageItems = problems.slice(pageStart, pageStart + 20);

        return (
          <div>
            {pageItems.map((problem, index) => {
              const lines = problem.split('\n').filter(l => l.trim());
              if (lines.length === 0) return null;
              const firstLine = lines[0];
              const m = firstLine.match(/^\s*(\d+)[.、\)\]\s]\s*(.*)$/);
              const num = m ? m[1] : '';
              const text = m ? m[2] : firstLine;
              return (
                <div key={index} className="word-problem-item">
                  <div className="word-problem-header">
                    <span className="word-problem-num">{num || pageStart + index + 1}.</span>
                    <span className="word-problem-text">{text}</span>
                  </div>
                  <div className="word-problem-answer" />
                </div>
              );
            })}
          </div>
        );
      }
      case 'chinese_chars':
        return <ChineseCharsRenderer content={content.content} />;
      case 'chinese_practice':
        return <ChinesePracticeRenderer content={content.content} />;
      case 'english_words':
        return <EnglishWordsRenderer content={content.content} />;
      case 'image':
        return content.metadata.previewUrl ? (
          <ImageRenderer src={content.metadata.previewUrl} alt={content.title} />
        ) : null;
      case 'document':
      case 'custom_text': {
        const paragraphs = content.content.split('\n\n').filter(p => p.trim());
        const pageStart = (pageNum - 1) * MAX_DOC_PARAGRAPHS_PER_PAGE;
        const pageItems = paragraphs.slice(pageStart, pageStart + MAX_DOC_PARAGRAPHS_PER_PAGE);
        return (
          <div className="text-document">
            {pageItems.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        );
      }
      default:
        return <TextDocumentRenderer content={content.content} />;
    }
  };

  return (
    <div className="a4-preview-container">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
        <A4Page key={pageNum} title={content.title} pageNumber={pageNum} totalPages={totalPages}>
          {renderSinglePage(pageNum)}
        </A4Page>
      ))}
    </div>
  );
}
