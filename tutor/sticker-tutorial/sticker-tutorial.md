# AI Sticker Pack Tutorial (Beginner-Friendly)

**Tell an AI a theme, and it generates a whole set of transparent-background stickers
for you** — automatic background removal, sliced into individual images, saved to your
Desktop. The finished transparent images (PNG / WebP) can be used anywhere: 3D scenes,
web pages, chat emoji, printed stickers.

The core of it is an instruction sheet written for the AI:
[`sticker-SKILL/SKILL.md`](sticker-SKILL/SKILL.md). **You just describe what you want, and the
AI follows the instructions.**

---

## How to use it

Open your AI assistant (e.g. Claude Code) and say:

> Follow `tutor/sticker-tutorial/sticker-SKILL/SKILL.md` and make me a set of 16 stickers themed
> around **software engineer careers**.

That's it. Installing dependencies, writing the prompt, generating the image, removing
the background, slicing, and saving — **the AI handles all of it**, and will prompt you
if anything's missing. Along the way it'll confirm with you: **how many** stickers (1 /
4 / 9 / 16), **the theme**, **the style**, and **where to save them** (Desktop by
default).

> **The one thing you need to do yourself, once**: give it an API key for image
> generation (this is your own account's key and consumes a small amount of credit, so
> the AI can't request one on your behalf). The first time you run it, the AI will walk
> you through getting one at [zooop.ai](https://zooop.ai/user#apiKeys) and setting it
> up — a few minutes, and it's done for good after that.

---

## When it's done

- The finished stickers are in a `<theme>-stickers/` folder on your Desktop, one
  transparent image per sticker.
- A `contact.png` proof sheet sits in the same folder — glance over it to check **for
  misspelled or garbled text**.
- If a sticker isn't right, just tell the AI "redo sticker #3" — it will only regenerate
  that one.

---

## FAQ

- **It says it can't generate images?** → Most likely the API key isn't set up yet;
  follow the AI's prompts through the setup once.
- **Text is garbled / background removal is messy?** → Tell the AI which sticker has a
  problem; it'll redo it or re-slice with adjusted parameters.
- **Want the full details?** → See [`sticker-SKILL/SKILL.md`](sticker-SKILL/SKILL.md).
