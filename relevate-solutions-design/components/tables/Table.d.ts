import React from 'react';

export interface TableProps {
  headers: React.ReactNode[];
  rows: React.ReactNode[][];
  style?: React.CSSProperties;
}

export declare function Table(props: TableProps): JSX.Element;
