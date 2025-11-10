// small text utilities used by ai.service.js
// simple, dependency-free functions to strip HTML and decode a few entities

export function decodeHtmlEntities(str) {
    if (!str) return "";
    return String(str)
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  
  /**
   * Remove HTML tags, script/style blocks and collapse whitespace.
   * Safe and conservative: keeps visible text, removes markup.
   */
  export function stripHtml(input) {
    if (!input) return "";
    let s = String(input);
    // remove script/style contents
    s = s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ");
    s = s.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ");
    // remove tags
    s = s.replace(/<\/?[^>]+(>|$)/g, " ");
    // decode a few entities
    s = decodeHtmlEntities(s);
    // collapse whitespace
    s = s.replace(/\s+/g, " ").trim();
    return s;
  }
  