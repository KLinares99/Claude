import React from 'react';

export interface HeroProps {
  /** 'home' (large, with badges) or 'page' (compact interior hero). Default 'home'. */
  variant?: 'home' | 'page';
  eyebrow?: string;
  title: React.ReactNode;
  lede?: string;
  /** Typically one or two <Button> elements — 'home' variant only in practice. */
  actions?: React.ReactNode;
  /** Trust badges (★ rating, bilingual, availability) — 'home' variant only. */
  badges?: React.ReactNode[];
  style?: React.CSSProperties;
}

export declare function Hero(props: HeroProps): JSX.Element;
