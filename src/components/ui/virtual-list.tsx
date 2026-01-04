/**
 * Virtual List Component for high-performance list rendering
 * Ideal for rendering large lists (100+ items) without DOM bloat
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerHeight?: number;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  containerHeight = 500,
  overscan = 5,
  className,
  onEndReached,
  endReachedThreshold = 100,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [hasCalledEndReached, setHasCalledEndReached] = useState(false);

  const totalHeight = items.length * itemHeight;

  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);

    return {
      startIndex: start,
      endIndex: end,
      visibleItems: items.slice(start, end + 1),
    };
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);

    // Check if near end
    if (onEndReached && !hasCalledEndReached) {
      const distanceFromEnd = totalHeight - (target.scrollTop + containerHeight);
      if (distanceFromEnd < endReachedThreshold) {
        setHasCalledEndReached(true);
        onEndReached();
      }
    }
  }, [totalHeight, containerHeight, endReachedThreshold, onEndReached, hasCalledEndReached]);

  // Reset end reached flag when items change
  useEffect(() => {
    setHasCalledEndReached(false);
  }, [items.length]);

  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Simple infinite scroll hook for pagination
 */
export function useInfiniteScroll(
  callback: () => void,
  options: { threshold?: number; enabled?: boolean } = {}
) {
  const { threshold = 100, enabled = true } = options;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    if (triggerRef.current) {
      observerRef.current.observe(triggerRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [callback, threshold, enabled]);

  return triggerRef;
}

/**
 * Optimized grid component for product grids
 */
interface VirtualGridProps<T> {
  items: T[];
  columns: number;
  rowHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerHeight?: number;
  gap?: number;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  columns,
  rowHeight,
  renderItem,
  containerHeight = 600,
  gap = 16,
  className,
}: VirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const rowCount = Math.ceil(items.length / columns);
  const totalHeight = rowCount * (rowHeight + gap);

  const { startRow, endRow } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / (rowHeight + gap)) - 2);
    const visibleRows = Math.ceil(containerHeight / (rowHeight + gap));
    const end = Math.min(rowCount - 1, start + visibleRows + 4);
    return { startRow: start, endRow: end };
  }, [scrollTop, rowHeight, gap, containerHeight, rowCount]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  }, []);

  const visibleItems = useMemo(() => {
    const result: { item: T; index: number; row: number; col: number }[] = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        if (index < items.length) {
          result.push({ item: items[index], index, row, col });
        }
      }
    }
    return result;
  }, [items, startRow, endRow, columns]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, row, col }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: row * (rowHeight + gap),
              left: `calc(${(col / columns) * 100}% + ${(col * gap) / columns}px)`,
              width: `calc(${100 / columns}% - ${((columns - 1) * gap) / columns}px)`,
              height: rowHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
