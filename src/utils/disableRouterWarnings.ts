// Disable specific React Router warnings until we're ready to migrate to v7
export {}; // Make this a module

const originalWarn = console.warn.bind(console);
console.warn = function(...args: any[]) {
  if (
    typeof args[0] === 'string' && (
      args[0].includes('React Router') ||
      args[0].includes('v7_startTransition') ||
      args[0].includes('v7_relativeSplatPath')
    )
  ) {
    return;
  }
  originalWarn.apply(console, args);
};
