/**
 * Encodes every character as an HTML numeric entity. Browsers and screen readers
 * decode it transparently; the plainest address harvesters do not.
 */
export const toEntities = (text: string): string =>
  Array.from(text, (ch) => `&#${ch.codePointAt(0)};`).join('');

/** Escapes a value for use inside a double-quoted HTML attribute. */
export const escapeAttribute = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
