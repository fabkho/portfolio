# Blog Post Writing

## Trigger
When writing, editing, or reviewing blog post content in `content/blog/`.

## Voice & Tone

- First person singular ("I built", "I needed", "I use")
- Direct. No hedging, no "In this post we'll explore..."
- Teach through code, not abstract explanation
- Short paragraphs (2-4 sentences max)
- Assume reader is a competent developer — don't over-explain basics
- Practical over theoretical: "here's when you'd actually use this"

## Structure

- Open with the problem (1-2 paragraphs, no preamble)
- Show the solution with real code (not toy examples)
- End with tradeoffs/when-not-to-use, then resources
- Headers break every major thought shift

## Anti-patterns (AI tells to avoid)

- ❌ "Let's dive in", "In this article", "Without further ado"
- ❌ "It's worth noting that", "It's important to understand"
- ❌ "This is where X comes in", "This is what makes X powerful"
- ❌ Rhetorical questions as transitions ("But what about X?")
- ❌ Excessive adverbs ("simply", "easily", "just", "really", "actually")
- ❌ Restating what code already shows ("The above code does X")
- ❌ Emoji in prose
- ❌ "Conclusion" as a heading
- ❌ Summary paragraphs that repeat the intro

## Formatting

- Code blocks: always include language identifier
- Tables for comparisons
- Inline code for APIs, attributes, values (`aria-live`, `polite`, `useAnnouncer`)
- Links inline, not footnote-style
- MDC components for interactive demos (`:component-name`)

## Frontmatter Template

```yaml
---
tag: "CATEGORY"
title: "Title"
description: "One sentence. What the reader walks away knowing."
date: "YYYY-MM-DD"
author: "Fabian Kirchhoff"
specs: ["TECH", "TAGS"]
status: published | draft
featured: true | false
order: 1
---
```

## Cross-linking

- Link to related posts contextually in prose (not generic "Related Posts" sections)
- Exception: a "Related Posts" section at the bottom is fine if the connection is strong and bidirectional
- Prefer linking in "when not to use" or "for more on X" contexts
