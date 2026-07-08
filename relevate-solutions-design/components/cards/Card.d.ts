import React from 'react';

export interface CardProps {
  /** Visual variant. Default 'default'. */
  variant?: 'default' | 'featured' | 'person' | 'numbered';
  /** Icon element shown in the 52px chip — 'featured' variant only. */
  icon?: React.ReactNode;
  /** Initials shown in the gradient avatar circle — 'person' variant only. */
  avatar?: string;
  /** Small eyebrow label above the title — 'numbered' variant (e.g. "01", "MISSION"). */
  eyebrow?: string;
  title?: string;
  children?: React.ReactNode;
  /** Optional footer content (e.g. a link or button) below the body. */
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}

export declare function Card(props: CardProps): JSX.Element;
