# Processing the Model with intro3d: Visually Exporting Your `me.glb` (No Blender Needed)

> Goal: without opening Blender, place your model and camera directly in the
> **intro3d** browser editor, and export the `me.glb` this 3D résumé needs with one
> click, ready to drop into your forked project.

---

## 📺 Watch the video first

👉 **[Watch the video tutorial on Bilibili](https://www.bilibili.com/video/BV1oF3U6oELF/)**

---

## What this actually does (the 60-second version)

Under the hood, this résumé's 3D background is a `me.glb` with a **camera animation**
and a handful of **focus anchors** (normally authored in Blender — see "Making it yours
after a fork" in [`CLAUDE.md`](../../CLAUDE.md)). **intro3d** turns that whole workflow
into something you do visually in the browser: you place the model and drag the camera
into position for each timeline node, and it bakes the camera animation and focus
anchors to match this project's conventions, exporting a `me.glb` you can use directly.

---

## Two things to do after exporting

1. **Swap in the model file**: put the exported `me.glb` at
   [`web/public/models/me.glb`](../../web/public/models/me.glb) (overwriting the
   existing one).
2. **Align the focus-point list**: when you export, intro3d gives you a `FOCUS_POINTS`
   array — put it into `model.focusPoints` in
   [`content-plan/content.json`](../../content-plan/content.json), and make sure the number
   of `resume.entries` in the same file matches it — the node count is dynamic, but the
   two lists must stay in sync (see CLAUDE.md for details). If you name the file something
   other than `me.glb`, update `model.glbPath` too.

Then run `cd web && npm run dev` to see it in action.

---

## Troubleshooting

- **Model shows up, but the nodes/camera don't line up?** → Most likely
  `model.focusPoints` and `resume.entries` in `content-plan/content.json` are out of sync —
  the counts need to match (the dev console prints a warning when they don't).
- **Want to manually fine-tune the camera / lighting / depth of field?** → All scene
  parameters live in the constants at the top of
  [`web/src/scene/Scene.tsx`](../../web/src/scene/Scene.tsx).
