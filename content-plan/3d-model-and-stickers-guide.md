# Updating the 3D model + face stickers

This covers the two things in the screenshot you sent: the **character itself** (the
person you see in the Hero screen) and the **face stickers** (ZOOOP, TikTok, the teddy
bear, "I ❤️ SY", thumbs-up, etc.) — those aren't an HTML overlay, they're decals baked
straight into `me.glb`'s face texture (`web/src/scene/Scene.tsx` has no sticker code at
all — it just renders whatever is in the glb). Both need to be replaced together since
they live in the same file.

You said you'll build the new model on [intro3d.com](https://intro3d.com) and hand it
back later — this doc is the reference for that step, plus how to regenerate your own
sticker pack instead of reusing the current one (which is the original author's own
brand/content, not reusable — see `NOTICE`).

---

## 1. How the model plugs into the code (read this first)

The scene code finds everything in `me.glb` **by object name** — nothing is hardcoded
to a specific mesh. Full contract, also in `CLAUDE.md` → "Making it yours after a fork":

| Object in the glb | Name it needs | What breaks if missing |
|---|---|---|
| Camera + its animation clip | Clip named exactly `CameraAction` | No scroll-driven camera movement at all — this is the whole effect |
| Hero starting focus anchor (empty) | `focus-start` or `focus-0` (either works) | Hero screen won't auto-focus on the face |
| One focus anchor (empty) per résumé entry | `focus-1`, `focus-2`, … in order | That résumé entry's camera stop won't align |
| Works-section focus anchor (empty) | `focus-works` | Optional — falls back to the last timeline anchor |
| Any mesh with `eye` in its name | e.g. `eye`, `eyes`, `eye_L` | Eyes won't track the cursor |

**Camera frame convention** (24fps, baked by whatever tool exports the clip): frame `0`
= hero pose, frame `50·k` = the k-th résumé anchor, last frame = works section. So each
résumé node is 50 frames apart — this is just how the clip needs to be authored; intro3d
handles the baking for you if you place the nodes in its editor.

**The one thing that must match by hand:** the number and order of `focus-1…N` anchors
must equal the number and order of `resume.entries` in `content-plan/content.json` — the
anchor list is `model.focusPoints` in the same file. Change your résumé entry count →
update `model.focusPoints` to match (the dev console warns when they differ).

---

## 2. Building the new character in intro3d

1. Go to [intro3d.com](https://intro3d.com) and build/import your character.
2. Place the camera path and the per-entry focus nodes visually in its editor — intro3d
   bakes these into the `CameraAction` clip + `focus-*` empties automatically, matching
   the naming contract above (that's the whole point of using it instead of Blender).
3. Decide your résumé entry count *before* placing nodes, since node count = résumé
   entry count (see `content-plan/content.json` → `resume.entries` / `model.focusPoints`
   — keep those two in sync as you fill in your real content).
4. Make sure whichever mesh is the eyes keeps (or gets renamed to) something containing
   `eye`, if you want the cursor-tracking effect.
5. Export the `.glb`.

Companion video walkthrough already in this repo:
`tutor/intro3d-model-tutorial/intro3d-model-tutorial.md`.

---

## 3. Regenerating the face stickers

The current stickers are the original author's own brand set (ZOOOP logo, their
content-creator bear mascot, etc.) — not reusable per `NOTICE`. This repo already ships
a skill that generates a fresh AI sticker pack for any theme you want (career-themed,
hobby-themed, whatever fits you):

- Tutorial: `tutor/sticker-tutorial/sticker-tutorial.md`
- The actual instructions your AI assistant follows: `tutor/sticker-tutorial/sticker-SKILL/SKILL.md`

**How to use it:** tell an AI coding assistant (Claude Code, etc.):

> Follow `tutor/sticker-tutorial/sticker-SKILL/SKILL.md` — make me a set of 9 stickers themed around
> `<your theme, e.g. "software engineer" / your hobbies / your interests>`.

It'll ask you how many (1/4/9/16), the theme, and the style, then generate a sticker
sheet, cut it into individual transparent PNG/WebP files, and save them to your Desktop.
One prerequisite: a free API key from [zooop.ai](https://zooop.ai/user#apiKeys) (the
image-gen backend the skill calls) — the skill walks you through getting one the first
time you run it.

**Placing the stickers onto the new model's face:**

- Check intro3d's editor first — if it has a sticker/decal placement feature for the
  avatar, use your generated PNGs there directly, then export.
- If intro3d doesn't support that, do it in Blender instead: open `blender/sen.blend`
  (or your new source file), add an Image Texture referencing your sticker PNGs on the
  face material (as a decal / mix layer over the skin texture), then export the glb from
  there. `tutor/eye-tracking-tutorial/eye-tracking-tutorial.md` has the equivalent naming-rule pattern for eyes if
  you need a refresher on how this repo expects meshes/materials to be named on export.

---

## 4. Landing the new model in the repo

Once you have the exported `.glb`:

```bash
cp /path/to/your-export.glb web/public/models/me.glb
```

Then update `model` in `content-plan/content.json`:

```jsonc
"model": {
  "glbPath": "models/me.glb",                        // relative to web/public/
  "focusPoints": ["focus-1", "focus-2", "focus-3"],  // the focus-N anchors in your export, in order
  "framesPerNode": 50                                // intro3d exports use 50
}
```

Run it:

```bash
cd web && npm run dev
```

Check, while scrolling:

- Each résumé entry's scroll position lands the camera on the right anchor (no
  mismatch/jump → if it's off, `model.focusPoints` doesn't match `resume.entries` in content.json)
- Eyes track the mouse (if not: the eye mesh's name doesn't actually contain `eye`, or
  got renamed/merged during export)
- Stickers show up on the face as expected
- Depth-of-field / lighting / character scale & position look right — these are all
  plain constants at the top of `web/src/scene/Scene.tsx` (`Lights`, `Man2`'s
  `posX/posY/posZ/scale`, `GradientBackground`'s `top`/`bottom` colors, `Post2`'s `post`
  object for bloom/DoF) — no config panel, just edit the values directly.

---

## Reference material already in this repo

- `CLAUDE.md` → "Making it yours after a fork" — the canonical naming contract
- `tutor/intro3d-model-tutorial/intro3d-model-tutorial.md` — intro3d export walkthrough (+ video)
- `tutor/sticker-tutorial/sticker-tutorial.md` + `sticker-SKILL/SKILL.md` — AI sticker pack generation
- `tutor/eye-tracking-tutorial/eye-tracking-tutorial.md` — eye-tracking naming rule (+ video)
- `blender/sen.blend` — Blender source, if you ever need the manual-editing fallback
