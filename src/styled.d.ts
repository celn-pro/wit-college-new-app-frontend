import 'styled-components/native';

declare module 'styled-components/native' {
  export interface DefaultTheme {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    cardBackground: string;
  }
}