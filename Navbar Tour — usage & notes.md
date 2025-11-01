# Navbar Tour — usage & notes

Filename recommendation: NAVBAR_TOUR.md (adds a short doc focused on the Tour option available in the app navbar/sidebar).

Summary
- The app includes an interactive tour accessible from the Hybrid workspace sidebar (Tour button / navbar area).
- Purpose: quickly onboard users to key UI areas (API selector, visual workflow, input area, save template).

How to use the Tour (end user)
1. Open the Hybrid workspace.
2. Click the Tour button (🛈) in the top-right of the sidebar / navbar area.
3. Follow the steps using "Next" / "Prev" / "Skip" controls. The tour highlights:
   - .sidebar — available APIs
   - .workflow-visual — pipeline view
   - .text-area-container — input area
   - .btn-tertiary — save template
4. The tour auto-opens on first visit (controlled by localStorage key `hybridTourSeen`).

Developer notes
- Tour selector classes must exist in the DOM for accurate placement:
  - Ensure .sidebar wraps the API list / tour button.
  - Ensure .workflow-visual is the container for the draggable workflow nodes.
  - Ensure .text-area-container wraps the workflow input TextArea.
  - Ensure .btn-tertiary is used for the "Save as Template" button.
- The lightweight SimpleTour component is used (no extra dependency). You can replace with a third-party tour library if desired, but verify React compatibility.
- Tour state:
  - Auto-show on first visit: localStorage key `hybridTourSeen` is set to "true".
  - Manual re-open: click the Tour button to set tour state open.
  - Controlled via `startTour` boolean in the Hybrid component.

Customization
- Modify steps in `src/pages/containers/hybridApi/hybrid.jsx` — the `tourSteps` array defines selector + content.
- To change auto-show behavior, edit the useEffect that sets `hybridTourSeen` or remove the auto-open logic.
- To add or adjust placement/paddings, tweak CSS in `src/pages/containers/hybridApi/style.scss` (.simple-tour-tooltip and related classes).

Accessibility & small-screen behavior
- The tooltip centers when a target selector is not found.
- Tooltip responsive rules exist in style.scss; adjust @media rules if needed for very small viewports.
- Keep target elements focusable where appropriate for screen-reader users.

Troubleshooting
- If a step appears off-screen or positioned outside the viewport, confirm the target selector exists and is not inside a hidden element.
- If the tooltip is clipped by overflow on a parent, ensure parent containers use `min-height: 0` and `overflow: auto` where needed (same fix as chat scroll issues).

Where to edit
- Tour steps & state: src/pages/containers/hybridApi/hybrid.jsx
- Tour styling: src/pages/containers/hybridApi/style.scss
- Tour persistence: localStorage keys `hybridTourSeen` (auto show) and any UI states in GlobalStore if you lift tour
- 