/**
 * Matches a Markdown-style link `[text](url)` and captures the link text and URL.
 * Used to convert Markdown links to GOV.UK-compliant HTML hyperlinks.
 *
 * Examples:
 * - `[GOV.UK](https://gov.uk)` → `<a href='https://gov.uk' class='govuk-link'>GOV.UK</a>`
 *
 * Does not match:
 * - `GOV.UK (https://gov.uk)` (missing square brackets)
 */
export const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Matches every HTML entity `&amp;` in a string.
 * Used to decode the entity back to a literal ampersand.
 *
 * Examples:
 * - `A&amp;B` → `A&B` (decoding the entity)
 *
 * Does not match:
 * - `A&B` (already a literal ampersand)
 */
export const HTML_AMPERSAND_ENTITY_REGEX = /&amp;/g;

/**
 * Matches any HTML opening or closing tag.
 * Used to strip HTML markup from a string, leaving only the text content.
 *
 * Examples:
 * - `<div>Hello <b>World</b></div>` → `Hello World` (tags removed)
 *
 * Does not match:
 * - `Hello World` (no tags present)
 */
export const HTML_TAG_REGEX = /<[^>]*>/g;
