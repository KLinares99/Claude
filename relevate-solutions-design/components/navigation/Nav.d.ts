import React from 'react';

export interface NavLink { href: string; label: string; }
export interface NavProps {
  logoSrc?: string;
  links: NavLink[];
  activeHref?: string;
  /** Typically one or two <Button size="sm">. */
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}

export declare function Nav(props: NavProps): JSX.Element;
