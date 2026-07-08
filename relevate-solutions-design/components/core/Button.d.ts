import React from 'react';

export interface ButtonProps {
  /** Visual style. Default 'primary'. */
  variant?: 'primary' | 'dark' | 'outline' | 'light';
  /** Size. Default 'default'. */
  size?: 'default' | 'sm';
  /** If provided, renders an <a> tag instead of a <button>. */
  href?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export declare function Button(props: ButtonProps): JSX.Element;
