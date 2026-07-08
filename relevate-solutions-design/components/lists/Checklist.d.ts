import React from 'react';

export interface ChecklistProps {
  items: React.ReactNode[];
  /** Number of grid columns. Default 1. */
  columns?: number;
  style?: React.CSSProperties;
}

export declare function Checklist(props: ChecklistProps): JSX.Element;
