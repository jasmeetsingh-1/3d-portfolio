---
name: sticker-pack
description: |
  Use AI to batch-generate a "grid sticker pack": call GPT Image 2 on the ZOOOP platform
  to produce one N-grid sticker sheet, then automatically remove the background, slice it
  by grid, and save the stickers to a chosen folder / the Desktop. Use this when the user
  wants to make stickers, emoji packs, a sticker pack, die-cut stickers, or a stylized
  sticker set for a theme (career / hobby / zodiac / pets / moods…). Generates an AI
  die-cut sticker pack (1 / 4 / 9 / 16 stickers) via ZOOOP GPT Image 2, then auto matte +
  slice + save to a folder / Desktop.
---

# AI Grid Sticker Pack Production

The flow in one line: **ask the user how many → generate one grid sheet (AI) → auto
background removal + slicing → save → check every cell**.

> This is one of the "do it yourself" tutorials for [sen-3d-resume](../../README.md). It's
> general-purpose — the transparent stickers it produces (WebP/PNG) can be used anywhere:
> decals in a 3D scene, web pages, chat emoji, printed die-cut stickers, and so on. It is
> not tightly coupled to this repo's 3D résumé.

## What this SKILL does / doesn't do

- ✅ Turns "a one-line theme" into a stylistically consistent set of transparent stickers
  for the user: write the prompt → generate → remove background → slice → save.
- ✅ Supports **1 / 4 / 9 / 16 stickers**, corresponding to **single / 2×2 / 3×3 / 4×4**
  grids.
- ✅ After generating, automatically removes the background, slices the sheet into
  individual transparent images by grid, saves them to the user's chosen folder (Desktop
  by default), and produces a contact sheet for review.
- ❌ Does not manage an asset library / database / CDN upload — it only produces local
  transparent image files; what happens to them afterward is up to the user.

## Dependencies (install these two first)

### 1. The official ZOOOP skill + an API key

Image generation goes through the **ZOOOP** platform (an aggregator for AI image / video /
audio generation, including models like GPT Image 2).

**Official skill (give it to your agent)**: <https://github.com/zooopai/skill-zooop>

```bash
# any agent (recommended)
npx skills add zooopai/skill-zooop
# or native Claude Code
claude install github:zooopai/skill-zooop
# installs to ~/.claude/skills/zooop/ and loads automatically when a conversation mentions ZOOOP / image generation
```

Single-file reference (fetch it directly if you don't want to clone):
<https://raw.githubusercontent.com/zooopai/skill-zooop/main/SKILL.md>
· llms.txt: <https://api.zooop.ai/llms.txt>

**If the user doesn't have an API key yet (`$ZOOOP_API_KEY` is empty), guide them to
create one:**

1. Get a token: open <https://zooop.ai/user#apiKeys> → **Create token** → pick a project
   (it can't be changed after creation; all later tasks/uploads are filed under that
   project) → **set a daily spending cap** (to prevent runaway usage) → copy the
   `zpk_live_…` value (**it's only shown once**). For team credits, a team owner/admin
   creates the key on the team dashboard's API Keys page; usage is exactly the same.
2. Set the environment variable in a terminal:
   - macOS / Linux / WSL / Git Bash:
     ```bash
     echo 'export ZOOOP_API_KEY=zpk_live_…' >> ~/.zshrc && source ~/.zshrc
     ```
   - Windows PowerShell:
     ```powershell
     [Environment]::SetEnvironmentVariable('ZOOOP_API_KEY','zpk_live_…','User')
     ```
   - Windows cmd: `setx ZOOOP_API_KEY "zpk_live_…"`
3. **Restart the agent** so it picks up the new environment variable.

Once set, `GET /v1/me` shows the current wallet and balance; before generating,
`POST /v1/quote` gives the exact credit cost / ETA.

### 2. Python + Pillow (slicing script)

Background removal / slicing uses [`scripts/slice_sheet.py`](scripts/slice_sheet.py) in
this directory, which only depends on Pillow:

```bash
python3 -m pip install --upgrade Pillow
```

## Interaction flow (follow this order)

### Step 0 · First ask the user "how many"

**You must ask first** (unless the user already said): **1 / 4 / 9 / 16** stickers? The
count determines the grid and the prompt template:

| Count | Grid   | `slice_sheet.py --grid` | Prompt template           |
| ----- | ------ | ----------------------- | ------------------------- |
| 1     | Single | `1`                     | "Single" template         |
| 4     | 2×2    | `2`                     | "Grid" template (2 rows)  |
| 9     | 3×3    | `3`                     | "Grid" template (3 rows)  |
| 16    | 4×4    | `4`                     | "Grid" template (4 rows)  |

Also confirm: the **theme** (e.g. "programmer careers", "Shiba Inu expressions", "the
twelve zodiac signs"), the **style** (see "Style library" below; default is "retro pop"),
and **where to save** (default `~/Desktop/<theme>-stickers/`).

### Step 1 · Write the prompt

One grid sheet = **a solid magenta background `#FF00FF`** (clean and easy to key out) + N
die-cut stickers + a witty 1–3 word phrase on each. Each sticker = one **anthropomorphic
object** (with a face / emotion / action) + a bold all-caps phrase (arced or stacked).

**Grid template (4/9/16 stickers)** — fill in `{N}` `{R}` `{C}` `{style block}` and each
cell's description:

```
A sticker sheet of {N} die-cut stickers arranged in a perfect {R}x{C} grid with
even gaps, on a solid uniform magenta background (#FF00FF). {style block}
All words must be spelled EXACTLY as given, in chunky bold uppercase letters.

Grid order, strictly row by row, left to right:
Row 1: <cell 1 description>, text "<phrase 1>"; <cell 2 description>, text "<phrase 2>"; …
Row 2: …
(write as many rows as there are, {C} stickers per row)

Stickers must not overlap or touch each other, all fully inside the canvas with
clear margins. No watermark, no grid lines, no extra text beyond the given words.
```

**Single template (1 sticker)** — no grid:

```
A single die-cut sticker on a solid uniform magenta background (#FF00FF). {style block}
The sticker: <description>, with chunky bold uppercase text "<phrase>" spelled EXACTLY as
given. Thick white die-cut border, centered, clear margins, no watermark.
```

Key points:
- **Phrases should be witty** (SHIP IT / CHEF'S KISS / TO THE MOON and the like), not
  descriptive text.
- **Text must be written out verbatim** with `spelled EXACTLY` emphasized — AI text
  rendering fails sometimes, and missing letters (e.g. only half the phrase rendered)
  count as a failure too.
- **Vary** the badge shape between cells (circle / starburst / rounded rectangle /
  pennant / organic blob) — don't make them all rounded rectangles.
- For a complete, editable example see
  [`examples/prompt-career-retro.txt`](examples/prompt-career-retro.txt) (16 careers ·
  retro pop) and its companion [`examples/names.txt`](examples/names.txt).

### Step 2 · Generate the grid sheet (ZOOOP · GPT Image 2)

If the official zooop skill is installed, use its scripts directly; if not, plain `curl`
works too.

**A. Find the GPT Image 2 model id** (interfaceId + versionId):

```bash
curl -fsS "https://api.zooop.ai/v1/models?type=image&subtype=default" \
  -H "Authorization: Bearer $ZOOOP_API_KEY"
# In the response, match name "GPT Image 2" and take its interfaceId and one versions[].versionId (e.g. standard)
# Also check that model's params[] to confirm the exact field names and allowed values for quality/size/aspect_ratio/resolution
```

**B. Build the request body and submit** (stickers contain text → use **Medium** for
`quality`; `low` often garbles the text. If the text is still garbled, try `High`. The
1:1 resolution cap is `2k` — don't use 4k, it exceeds the model's pixel limit and fails
outright):

```jsonc
{
  "interfaceId": "<interfaceId from the previous step>",
  "versionId":   "<versionId from the previous step, e.g. standard>",
  "params": {
    "prompt":       "<the prompt written in Step 1>",
    "aspect_ratio": "1:1",
    "resolution":   "2k",
    "quality":      "Medium"   // match the exact casing in the model's params[].options
  }
}
```

Using the official skill's scripts (in `~/.claude/skills/zooop/`):

```bash
cd ~/.claude/skills/zooop
bash scripts/quote.sh  <interfaceId> <versionId> "$BODY"   # optional: check the exact credits/ETA first
bash scripts/submit.sh <interfaceId> <versionId> "$BODY"   # → taskId
bash scripts/poll.sh   <taskId>                            # → outputs[0].url
```

`$BODY` can be assembled like this (reading the prompt from a file into JSON avoids
escaping hell):

```bash
BODY=$(python3 -c "import json,sys;print(json.dumps({'interfaceId':sys.argv[1],'versionId':sys.argv[2],'params':{'prompt':open(sys.argv[3]).read(),'aspect_ratio':'1:1','resolution':'2k','quality':'Medium'}}))" \
  "<interfaceId>" "<versionId>" "examples/prompt-career-retro.txt")
```

Plain curl equivalent: submit with `POST /v1/tasks`, poll with `GET /v1/tasks/{id}` (see
the official SKILL.md for details).

### Step 3 · Download the sheet

```bash
curl -fsSL "<outputs[0].url returned by poll>" -o sheet.png
```

### Step 4 · Auto background removal + grid slicing + save

One command removes the background, slices the sheet into individual transparent images
by grid, resizes, saves, and produces a contact sheet:

```bash
python3 scripts/slice_sheet.py sheet.png \
  --grid <1|2|3|4> \
  --out  "$HOME/Desktop/<theme>-stickers" \
  --contact "$HOME/Desktop/<theme>-stickers/contact.png" \
  [--names examples/names.txt]     # optional: one name per line (line order = grid row-major), used as output filenames
```

- `--grid` uses the value from the **Step 0 table** (4 stickers = 2, 9 = 3, 16 = 4, 1 =
  1). Non-square grids work too: `--grid 3x4` (3 rows, 4 columns).
- Without `--names`, files are named `cell-<row>-<col>.webp`.
- Default output is transparent **WebP** with a 512px long edge; add `--format png` for
  PNG, or `--size 1024` for larger.
- How the script works: flood-fills the magenta background away from the edges of the
  whole image → uses connected components to find each sticker's body (small bubbles /
  decorations are automatically assigned to the nearest body) → bins and crops by grid;
  **stickers that extend past their cell boundary are kept whole**, never clipped;
  enclosed holes (e.g. inside a stethoscope loop) are keyed out by background color, with
  anti-fringing to avoid pink edges.

**"Save to a given folder / the Desktop"**: if the user gave a path, use it; otherwise
default to `~/Desktop/<theme>-stickers/`.

### Step 5 · Check every cell (don't skip this)

Open `contact.png` with the Read tool and check each cell's **spelling** and content.
For failed cells (missing letters / garbled text / off-theme) → redo only that cell:

1. Rewrite that cell's prompt with the "single" template (same style block + that one
   sticker's description) and generate a small image (1:1 `1k`/Medium is enough and
   cheaper).
2. `python3 scripts/slice_sheet.py fix.png --grid 1 --out /tmp/fix`.
3. Copy `/tmp/fix/…` over the corresponding file in the output directory.

## Style library (default "retro pop"; can switch to "hand-drawn doodle")

Paste the whole matching style block into the prompt template's `{style block}`. Both
are the flavor of trendy sticker packs on Xiaohongshu / Dribbble — **don't** go for clean
stock-icon looks (too old-school, not trendy).

**Style 1 · Retro pop (retro pop mascot)**

```
Style: bold funky retro pop-art sticker pack — anthropomorphic objects with
googly eyes, cheeky expressions and lots of attitude; chunky rounded bold
uppercase typography, arced or stacked, integrated into the sticker design;
badge shapes vary between stickers (circle, starburst, rounded rectangle,
pennant flag, organic blob); limited retro palette of cream, tomato red,
mustard yellow, teal green, cobalt blue and black, thick black outlines,
thick white die-cut border around every sticker; flat colors with subtle
vintage grain, no gradients, no realistic shading.
```

**Style 2 · Hand-drawn doodle (doodle blob)**

```
Style: playful hand-drawn doodle sticker pack — simple organic blobs, abstract
shapes and everyday objects with tiny naive faces, drawn with loose wobbly black
ink lines over flat bright color fills (cobalt blue, tomato red, lemon yellow,
bubblegum pink, teal, purple); quirky doodle hands, sparkles and squiggle
accents; rounded friendly handwritten-style text arced around the character;
minimal detail, generous negative space, cheerful naive energy; thick white
die-cut border around every sticker; no gradients, no shading, no realistic
rendering.
```

To add a new style: write a `Style: …` block like the ones above and drop it into the
template — style and theme are independent of each other.

## Known pitfalls

- **Text failures**: at Medium quality, non-Latin text or long phrases can come out
  garbled or with missing characters, so checking `contact.png` cell by cell is
  mandatory; redo bad cells individually (Step 5).
- **Don't tweak the request body just to dodge idempotency**: zooop's `submit.sh` uses
  `sha256(body)` as the idempotency key, so re-running the same command after a timeout
  is safe (you won't be charged twice); if you genuinely want multiple images with the
  same params, set a different `ZOOOP_IDEMPOTENCY_KEY` each time.
- **Failed tasks are refunded automatically**; run `quote.sh` to see the exact credits
  before `submit`.
- **Pixel cap**: 1:1 only goes up to `2k`; 4k will always fail.
- **Fewer bodies than grid cells** (sticker halos touching get merged into one connected
  component) → re-slice with `--tolerance 44` added to `slice_sheet.py`; if the grid
  layout isn't strictly aligned, the script automatically bins and sorts by row, so you
  usually don't need to worry about it.
- **Brand elements may sneak in** (e.g. a swoosh resembling a certain brand's logo on a
  sneaker) → watch for this when checking; redo that cell if it bothers you.
- **Messy cutout / grey edges**: adjust `--tolerance` (default 28; the purer the
  background, the smaller it can be); increase it a bit if magenta remains on the edges.
