/**
 * Utility functions for text formatting and decoding
 */

/**
 * Decodes HTML entities commonly found in YouTube titles and API responses
 * (e.g. &#39; -> ', &amp; -> &, &quot; -> ", &lt; -> <, &gt; -> >)
 */
export function decodeHtml(html?: string): string {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&hellip;/g, '...')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '--')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"');
}
