// global.d.ts
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.css' {
  const css: string;
  export default css;
}

// Specifically for react-pdf CSS imports
declare module 'react-pdf/dist/Page/AnnotationLayer.css';
declare module 'react-pdf/dist/Page/TextLayer.css';