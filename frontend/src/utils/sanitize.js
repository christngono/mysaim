import DOMPurify from 'dompurify'

/**
 * Strips all HTML tags and dangerous content from a user input string.
 * Use on every text/textarea onChange to prevent XSS injection.
 */
export function clean(text) {
  if (typeof text !== 'string') return text
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}

/**
 * Sanitize HTML content that will be rendered via dangerouslySetInnerHTML.
 * Allows only safe formatting tags (span, strong, em, br).
 */
export function safeHtml(html) {
  if (typeof html !== 'string') return html
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['span', 'strong', 'em', 'br', 'b', 'i'],
    ALLOWED_ATTR: ['class'],
  })
}
