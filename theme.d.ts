import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    cardBackground: string;
    border: string; 
    font: {
      regular: string;
      bold: string;
      size: {
        small: number;
        medium: number;
        large: number;
        title: number;
        header: number;
      };
    };
  }
}