---
title: Example Work
banner: /works/example/banner.jpg
year: 2026
role: Design / Development
tags: [Interactive, Example Tag]
link: https://example.com
---

> **This is an optional markdown fallback for a work detail.** The normal place for work
> details is `workDetails` in `content-plan/content.json`. A file at `src/content/works/<slug>.md`
> is used only when content.json has no entry for that `slug` (the `slug` of a work item under
> `works.sections` in content.json). Otherwise the detail shows the shared placeholder.
> This file's slug is `example`, which matches no work, so it never shows up on the live
> site — it's for reference only.

## Subheading

The body supports standard Markdown: **bold**, *italic*, [external links](https://example.com), and lists:

- Point one
- Point two
- Point three

## Images and video

Put media in `public/works/<slug>/` and reference it with `/works/...` absolute paths
(`public/works/` is not tracked by git by default, see `.gitignore`):

![Example image](/works/example/1.jpg)

<video src="/works/example/demo.mp4" autoplay muted loop playsinline></video>

---

Available frontmatter fields (all optional):

| Field | Description |
| --- | --- |
| `title` | Detail title (falls back to the work's name in content.json) |
| `banner` | Top banner image path (defaults to a gradient placeholder) |
| `year` | Year |
| `role` | Role / responsibility |
| `tags` | Tag array, e.g. `[Interactive, Tiger Roar Award]` |
| `link` | External link, rendered as the "Visit site" button |
