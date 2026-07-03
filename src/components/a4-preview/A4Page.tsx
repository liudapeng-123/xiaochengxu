'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

interface A4PageProps {
  children: ReactNode;
  pageNumber?: number;
  totalPages?: number;
  title?: string;
}

export function A4Page({ children, pageNumber, totalPages, title }: A4PageProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!measureRef.current) return;
      const availableWidth = measureRef.current.clientWidth;
      const newScale = availableWidth / A4_WIDTH;
      setScale(newScale);
    };

    updateScale();

    const ro = new ResizeObserver(updateScale);
    if (measureRef.current) ro.observe(measureRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={measureRef}
      style={{ width: '100%', marginBottom: '8px' }}
    >
      <div
        className="a4-page"
        style={{
          width: `${A4_WIDTH}px`,
          height: `${A4_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {title && <div className="a4-header">{title}</div>}
        <div className="a4-page-content">{children}</div>
        {totalPages && totalPages > 1 && (
          <div className="a4-footer">第 {pageNumber} / {totalPages} 页</div>
        )}
      </div>
    </div>
  );
}
