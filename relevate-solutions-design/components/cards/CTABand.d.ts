import React from 'react';

export interface CTABandProps {
  title: string;
  subtitle?: string;
  /** Typically one or two <Button> elements. */
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}

export declare function CTABand(props: CTABandProps): JSX.Element;
