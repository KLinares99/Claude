import React from 'react';

export interface Stat { value: string; label: string; }
export interface StatBandProps {
  stats: Stat[];
  style?: React.CSSProperties;
}

export declare function StatBand(props: StatBandProps): JSX.Element;
