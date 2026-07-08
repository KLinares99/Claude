import React from 'react';

export interface FormFieldProps {
  label?: string;
  /** Element type. Default 'input'. */
  as?: 'input' | 'select' | 'textarea';
  /** HTML input type when as='input'. Default 'text'. */
  type?: string;
  /** Options when as='select'. */
  options?: string[];
  placeholder?: string;
  style?: React.CSSProperties;
}

export declare function FormField(props: FormFieldProps): JSX.Element;
