import React from 'react';

export interface ResourceItemProps {
  title: string;
  description: string;
  /** Typically a <Badge>. */
  tag?: React.ReactNode;
  href?: string;
  style?: React.CSSProperties;
}

export declare function ResourceItem(props: ResourceItemProps): JSX.Element;
