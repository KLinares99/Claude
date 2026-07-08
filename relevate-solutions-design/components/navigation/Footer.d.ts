import React from 'react';

export interface FooterLink { href: string; label: string; }
export interface FooterColumn { title: string; links: FooterLink[]; }
export interface FooterProps {
  logoSrc?: string;
  columns: FooterColumn[];
  bottomLeft?: React.ReactNode;
  bottomRight?: React.ReactNode;
  style?: React.CSSProperties;
}

export declare function Footer(props: FooterProps): JSX.Element;
