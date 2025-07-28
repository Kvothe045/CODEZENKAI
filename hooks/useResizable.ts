import { useState, useCallback, useRef, useEffect } from 'react';

interface UseResizableProps {
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
}

export const useResizable = ({ initialWidth, minWidth, maxWidth }: UseResizableProps) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const resizingRef = useRef(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizingRef.current = true;
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    resizingRef.current = false;
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!resizingRef.current) return;
    
    const containerRect = (e.target as HTMLElement)?.closest('.resizable-container')?.getBoundingClientRect();
    if (!containerRect) return;

    const newWidth = e.clientX - containerRect.left;
    const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
    setWidth(clampedWidth);
  }, [minWidth, maxWidth]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, resize, stopResizing]);

  return {
    width,
    isResizing,
    startResizing,
    setWidth
  };
};
