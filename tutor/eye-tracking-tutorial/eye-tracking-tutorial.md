# Eye-Tracking Tutorial: Making the Model's Eyes Follow the Mouse

> Goal: understand how the "character's eyes follow the cursor" effect in this 3D
> résumé works, and how to get the same effect on your own model after you swap it in.

---

## 📺 Watch the video first

The whole process is easiest to follow as a video — watch it alongside the text notes
below.

👉 **[Watch the video tutorial on Bilibili](https://www.bilibili.com/video/BV1jF3U6oEEW/)**

---

## The idea in one sentence

The scene code finds the eyes in the model **by name**: **any mesh whose name contains
`eye`** is automatically treated as an eyeball and gets the "eyes follow the cursor"
effect. If no mesh name contains `eye`, this effect simply doesn't activate (everything
else keeps working as normal).

> See the "Making it yours after a fork" section of [`CLAUDE.md`](../../CLAUDE.md) in the
> repo root for the full reference.

---

## When you swap in your own model

1. In your modeling software, name the mesh(es) that act as eyes with something
   containing **`eye`** (e.g. `eye` / `eyes` / `eye_L`).
2. Export `me.glb` as usual, replacing [`web/public/models/me.glb`](../../web/public/models/me.glb).
3. Run `cd web && npm run dev` and move the mouse around to check whether the eyes
   follow it.

---

## Troubleshooting

- **Eyes not moving?** → Check whether that mesh's name actually contains `eye`; it may
  have been renamed or merged into another mesh during export.
- **Want to adjust the tracking range or speed?** → All of this project's scene
  parameters are plain constants at the top of
  [`web/src/scene/Scene.tsx`](../../web/src/scene/Scene.tsx) (see CLAUDE.md's "Scene
  parameters" section) — edit them directly, or just have an AI assistant tune them for
  you.
