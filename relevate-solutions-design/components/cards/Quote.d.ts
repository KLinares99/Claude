import React from 'react';

export interface QuoteProps {
  /** Attribution line, e.g. "— Arturo Solis · ★★★★★" */
  by?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export declare function Quote(props: QuoteProps): JSX.Element;
