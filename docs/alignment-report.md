# Motion alignment status

Target: a functional macOS desktop recreation with paper share tickets, a clothesline entrance, crisp perforation tearing, and clipboard transfer. Renderer: HTML/CSS/SVG + Canvas. Visual language follows the user’s static ticket poster.

## Available source

The referenced download chat was read in full. Its six local videos were surveyed at fixed intervals. Latest download `davidhaz_2110738519597437387_2110738288721969152.mp4` is a Fluid Glass demo, not ticket tearing. No tear sequence exists in this set.

Tendedero `alejandr0bujan_2107726966304690416.mp4` provides the hanging reference: thin gently sagging full-width line, narrow silver clip, fixed suspension point, restrained recoil. The implementation adapts that behavior to three original share tickets. Arrival is deliberately staggered across tickets; the red desktop and ticket graphics are requested differences.

## Implemented motion contract

- Ticket enters from above, settles around a fixed clip, and can be hidden by menu-bar or Dock icon.
- 25 paper bridges. Progress advances in discrete 4.8px input steps following a 12px initial resistance zone.
- A moving 9px fold zone, with rigid rotation outside it. No continuous sinusoidal deformation, long filaments, or scaling of paper in Y.
- The initially chosen tear side remains fixed after the first break; broken bridges do not heal on backtracking or release.
- The final bridge releases into the same paper pose; the detached stub rotates and falls over 620ms while the main ticket recoils about 1.6 degrees.
- Clipboard copy begins at final separation; success appears only after the browser confirms the write. A failed write leaves an explicit retry action.
- Reset invalidates outstanding animation callbacks. A fresh ticket cannot be consumed or erased by an old animation.

## Evidence and limit

Source hanging analysis: `hanging-analysis.md`. Source inventory: `reference-analysis.md`. Functional and browser checks: `validation.md`.

The original ticket tearing reference is missing. Therefore ticket motion is an original, tested implementation of the requested crisp perforation behavior. Frame-by-frame ticket-source alignment is PENDING and has not been claimed. A pixel/SSIM comparison of these different assets and scenes would not be meaningful.
