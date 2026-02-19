import React from 'react';

declare global {
  namespace JSX {
    type Element = React.ReactElement<any, any>;
    type ElementClass = React.Component<any, any>;
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
