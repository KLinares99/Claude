import React from 'react';

export interface BadgeProps {
  /** Color tone. Default 'cyan'. */
  tone?: 'cyan' | 'gold';
  /** If provided, renders an <a>. */
  href?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export declare function Badge(props: BadgeProps): JSX.Element;
