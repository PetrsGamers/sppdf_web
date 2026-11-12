import React from 'react'

/**
 * Renders editor text where words wrapped in {{double braces}} are highlighted
 * in the primary colour, e.g. "Inspirujeme {{budoucí}} učitele."
 */
export function renderHighlighted(text: string): React.ReactNode {
  const parts = text.split(/(\{\{.*?\}\})/)
  return parts.map((part, i) => {
    const match = part.match(/^\{\{(.*)\}\}$/)
    if (match) {
      return (
        <span key={i} className="text-primary">
          {match[1]}
        </span>
      )
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

/** Replaces the {rok} placeholder with the current year. */
export function withCurrentYear(text: string): string {
  return text.replace(/\{rok\}/g, String(new Date().getFullYear()))
}
