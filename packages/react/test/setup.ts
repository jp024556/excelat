import "@testing-library/jest-dom/vitest";

// Mock navigator.clipboard
let clipboardStore = "";

Object.assign(navigator, {
  clipboard: {
    writeText: async (text: string) => {
      clipboardStore = text;
    },
    readText: async () => {
      return clipboardStore;
    },
  },
});
