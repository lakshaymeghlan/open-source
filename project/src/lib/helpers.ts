// src/lib/helpers.ts
export function getSyncLanguagesFor(selectedTechs: string[]) {
    // map a few UI tech names to GitHub language tokens we use for sync
    const map: Record<string, string> = {
      nodejs: "javascript",
      javascript: "javascript",
      typescript: "typescript",
      react: "javascript",
      "next.js": "javascript",
      "nextjs": "javascript",
      python: "python",
      go: "go",
      java: "java",
      ruby: "ruby",
      php: "php",
    };
  
    const langs = new Set<string>();
    for (const t of selectedTechs) {
      const key = t.toLowerCase();
      if (map[key]) langs.add(map[key]);
      else langs.add(key); // fallback: use the raw key
    }
  
    return Array.from(langs);
  }
  