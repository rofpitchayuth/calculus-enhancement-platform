import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        class?: string;
        // Allow any other custom attributes math-field might use
        [key: string]: any;
      };
    }
  }
}

// Support for environments that look at global JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': any;
    }
  }
}
