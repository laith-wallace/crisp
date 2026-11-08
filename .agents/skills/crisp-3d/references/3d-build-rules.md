# 3D build rules

Read this before Phase 5 of `/crisp-3d`. Each rule came from a real build where breaking it cost hours.

## 1. Medium per object

Decide the medium per object in the scene plan. Choosing the right medium does more for the look than adding detail.

| Object | Medium | Why |
|---|---|---|
| Walls, floor, stairs, furniture | Modelled geometry (code or a glTF file) | The camera moves around it and light has to fall on it |
| Line-drawing or blueprint state | `EdgesGeometry` lines built from the same meshes, revealed by a soft edge that sweeps with scroll | Lines and solids stay aligned because they come from one source |
| Printed sheets, posters, screen content, labels | Canvas 2D texture painted in code at 2x the display size | Type stays sharp; a photo of text blurs at angles |
| Plants, hair, fur, food | Cut-out image on a plane (alpha texture), lifted from the target image | Modelled leaves almost always look fake |
| Soft light, contact shadows, sunlight patches | Baked into the surface texture | Real-time light cannot match a painted target at a cost the page can pay |
| Small props far from the camera | Simple boxes with a good texture | Detail the camera never reaches is wasted frame time |

When a modelled object looks wrong after 3 tries, change the medium instead of adding detail.

## 2. Scroll moves the camera

- The document scrolls normally. A smooth-scroll library is optional.
- Scroll progress maps to a path between camera stops. Nothing else is driven by raw scroll except the line-to-solid sweep.
- Every stop is reachable by `?stop=<n>`. `?still` freezes the clock (no idle motion, no particles moving) so two captures of the same stop are identical.
- Set `window.__sceneReady = true` after the first full frame at the requested stop, after textures and the light probe are ready.
- Clicks on scene objects use raycasting, and each clickable object has an HTML button twin for keyboard and screen reader users.

## 3. Light first, geometry second

In target loops, scores move most from light. Work in this order and re-capture after each step:

1. Real textures on every surface (no flat colours on large areas)
2. An environment light probe for the stop
3. Ambient occlusion (soft darkening where surfaces meet)
4. Bloom on bright sources, kept subtle
5. Baked light: paint the difference between the capture and the target into the surface texture
6. Only then: more objects

## 4. Light budget

- 3 real-time lights at most in view. Use them where light must move (lamps turning on at dusk).
- Everything else is baked or comes from the light probe.
- Shadows only from the one main light. Small contact shadows under objects are baked.

## 5. Frame-time budget

- The page measures its own frame time over a rolling 60 frames.
- When the average frame is slower than 16.7ms, lower the render resolution (device pixel ratio) one step, down to a floor of 0.75. Raise it again when there is headroom.
- Expose the numbers for checks: `window.__perf = { fps, dpr, stop }`.
- The line-drawing state is cheap; furnished stops are the expensive ones. Measure the furnished stops.

## 6. Mobile

- Every stop has its own camera position and field of view at 375px wide. Do not just scale the desktop camera.
- Detail panels slide up from the bottom on mobile instead of opening beside the object.
- Touch scroll must not fight the camera: no scroll-jacking, no wheel-only handlers.

## 7. Known traps

| Symptom | Cause | Fix |
|---|---|---|
| A view you did not touch turned grey or dark | The light probe is captured once at load, and new dark objects were in it | Hide objects that do not belong to the stop while its probe is captured |
| Sunlight does not come through blinds | Slats are tilted against the light direction | Tilt slats along the light direction |
| Every probe or object of one kind vanished | A comment in the middle of a line swallowed the code after it | Put comments on their own line; re-capture every stop after edits to shared setup code |
| A sofa looks like a flat sausage | Built from separate stacked boxes | Build the back as one soft rolled tube with thick arms |
| An arc lamp looks like a straight pole | The arc curves away from the camera | Curve it across the view |
| Windows are a green haze | Glass and outside light set by guess | Use a simple outside image and a low-opacity glass, matched to the target |
| The room feels empty | Few objects at the stop | Run the target loop on that stop with a furnished target, then add pieces one at a time |

## 8. Accessibility and content

- All copy is HTML text layered over or beside the canvas. Never only in a texture.
- `prefers-reduced-motion: reduce` jumps between stops instead of flying, and turns off idle motion.
- The canvas has `aria-hidden="true"`; the HTML layer carries the meaning.
- A visible "skip the scene" link goes to a plain list of chapters.
