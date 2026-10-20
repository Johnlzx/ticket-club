# Reference inspection — 2026-10-20

## Evidence and scope

The referenced download chat was read before using its contents. It contains six successfully downloaded MP4s. The newest completed download is `davidhaz_2110738519597437387_2110738288721969152.mp4`. Its decoded content is **Fluid Glass**, not a ticket tear. No ticket/perforated-paper tearing sequence was found among the six local files. Therefore exact ticket-tear phase timings cannot truthfully be measured from the supplied videos.

Source inventory sheet: `inventory.jpg`.

Requested delivery should be described as a visual recreation of the supplied ticket artwork and clothesline reference, with an original, crisp perforation interaction. It cannot be claimed to reproduce an unavailable ticket video frame for frame.

## Latest download: Fluid Glass

- File: `davidhaz_2110738519597437387_2110738288721969152.mp4`
- Frame: 1154 × 722; 20.625 s; approximately 57.8 fps; no audio.
- Evidence: `contact-halfsec.jpg` and individual decoded frames in `halfsec/` (0.5 s sampling).
- Layout: white browser demo with small `Fluid Glass` heading, toolbar, then fixed large black `Look closer.` headline. Glass object is approximately 180–215 px high over the headline in the source frame. It casts a soft gray shadow below/right, magnifies/distorts text, and changes its silhouette continuously while following pointer motion.

| Approx. window | Visible state / motion |
| --- | --- |
| 0.0–2.0 s | Clear irregular rounded lens/sphere sweeps left → center → right → center; highlights and refracted black type rotate through lens. |
| 2.0–2.5 s | Rounded lens morphs into a triangular prism/pyramid silhouette. |
| 2.5–4.5 s | Triangular prism crosses center/right then left, yawing around vertical axis; refraction splits type into bright and dark facets. |
| 4.5–5.0 s | Triangular shape turns/morphs into a diamond-like faceted crystal. |
| 5.0–6.5 s | Diamond/crystal moves through center, rolls/yaws. |
| 6.5–7.0 s | Facets round away into an almost circular lens. |
| 7.0–10.5 s | Circular/oval glass lens crosses right → far left → center; broad black refracted bands turn with rotation. |
| 10.5–11.0 s | Lens becomes a rounded cube. |
| 11.0–15.0 s | Cube moves left/right over headline, with compound pitch/yaw and discrete face changes visible in refraction. |
| 15.0–16.0 s | Cube flattens into rounded capsule. |
| 16.0–18.0 s | Capsule swings left/right and rotates in plane; long horizontal transparent center. |
| 18.0–20.625 s | Shape morphs back to circular/oval lens while moving from right to left. |

These are useful only as proof of source identity, not as ticket animation measurements.

## Other downloaded references

| Local file stem | Actual content | Applicable part |
| --- | --- | --- |
| `alejandr0bujan_2107726966304690416` | Tendedero screenshot utility; screenshots hang from a clothesline | Top rope, clothes pegs, hanging paper behavior. Separate analysis by hanging_reference agent. |
| `withAnimationUI_2110643020890849625_2110642935847063553` | 7.29 s radial menu: central plus expands into six white circular action buttons; icon becomes × | Optional tray reveal motion language only. No ticket. |
| `slashui_2109805146926698804_2109803569713233920` | 40.04 s Airsup Lab engine assembly / simulation walkthrough | No relevant tear or clothesline. Full 1 s evidence contact sheet saved. |
| `GeekCatX_2109522383883362732_2109248836128423936` | 19.995 s vertical live-action gathering | Not applicable. |
| `foxshuo_2108764205419798650` | 24.43 s vertical live-action workshop | Not applicable. |

## Proposed crisp perforation motion contract

The following is a recommended implementation specification, **not measured source motion**. It implements the user's explicit request to remove the gummy feeling.

1. **Reveal**: tray click; ticket group drops from above its pegs over 500–650 ms. Slight angular overshoot around the rope anchor, maximum ±3°, settling with damping. Keep each ticket rigid during reveal. Rope reacts with a subtle 2–4 px tension dip.
2. **Contact**: grab the lower stub. Use pointer capture. For the first 6–10 px of downward strain, paper follows only 2–4 px and rotates at most 1.5°. Avoid elastic stretching or scaling the ticket.
3. **Tear starts**: start at the grabbed edge. Perforation holes are real negative space, approximately 2.2–3.2 px diameter at 8–11 px pitch for a 300 px-wide ticket. The narrow paper bridges between holes break in discrete steps; 26–36 breaks span the seam.
4. **Tear advances**: monotonic progression snaps to the next bridge, with 16–35 ms mechanical impulses rather than a continuous melting boundary. Crack-front bending is localized to 5–9 px around the frontier. The freed part can rotate and translate; unbroken bridges remain exactly attached. A short 1–2 px paper-edge vibration on each break is sufficient.
5. **Final snap**: last bridge breaks in 1–2 animation frames. Detached stub immediately becomes a fully rigid body; no lingering filaments or connection. A compact ±1.5° recoil of the main ticket settles in 180–260 ms.
6. **Copy**: write the chosen sharing payload on the final snap while still inside the user gesture. Confirm success only after clipboard API success. Toast/clipboard shelf confirmation begins within 30–80 ms; if API fails, expose a direct retry/copy action and never claim copied.
7. **Exit**: detached stub follows release velocity for 160–240 ms, then falls/tilts away over 260–400 ms, or lands in a clearly labeled clipboard shelf. Scale stays close to 1 until the intentional dismissal; avoid squash/stretch.

### Mechanical details

- State graph: `attached → tension → tearing → detached → copied`, plus an explicit reprint/reset action.
- Tear progress must be monotonically nondecreasing after the first bridge breaks. A partly torn paper should not heal simply because the pointer moves back; this is one cause of gummy feedback.
- Use rigid source artwork, then SVG clip paths / segmented strips to reveal a stepped crack. Do not stretch a single rectangular element along Y.
- Visible seam edges should expose short alternating fibers/triangular teeth around the circular holes, not smooth scalloped liquid lobes.
- Separate continuous pointer tracking from discrete crack advancement: continuous motion positions the detached part; quantized bridge count changes topology.
- Prevent bottom-stub transform from dragging the entire card down. Main body motion is a small angular response around top peg attachment.
- Optional synthesized paper sounds should be short dry noise bursts (8–18 ms) per bridge, with a slightly stronger final snap; no long wet tearing sound.

## Fidelity statement

No candidate has been compared in this analysis-only task. Source identity was verified visually at 0.5 s for the latest clip and 1 s for the engine clip. A frame-identical tear recreation is blocked by the absence of a tear reference in the supplied download set. Do not label a hand-authored interactive rebuild pixel-level or frame-identical.
