# Chrome AI Chat Assistant — Instructions

Quick how-to for using and developing with this project.

## Prerequisites (macOS)
- Node 18+ / npm or Yarn
- Firebase project + API key (if using GenerativeModel/Gemini fallback)

## Install
- npm: `npm ci`
- yarn: `yarn`

## Environment
Create a `.env` in the project root:
- `REACT_APP_FIREBASE_API_KEY=your_firebase_api_key`

(Optional) Add other Firebase project vars if needed.

## Dev server
- Start: `npm start` or `yarn start`
- Build: `npm run build` or `yarn build`

## Main features
- Smart Chat — persistent conversational UI (src/pages/containers/chatApi)
- Smart Chain (Hybrid) — visual multi-step workflows, drag/drop, run sequential steps (src/pages/containers/hybridApi)
  - Intermediate outputs are stored in global state and shown in the "Intermediate Outputs" panel.
  - Save workflows as templates (localStorage key: `hybridTemplates`).
- Smart Prompt — single-step prompts (src/pages/containers/singleApi)

## Hybrid workflow quick use
1. Open the Hybrid workspace from the app home.
2. Select APIs from the left panel to add steps.
3. Click a node to configure options (right-side config panel).
4. Enter input in the top text area and click "Run Workflow" (🚀).
5. Intermediate outputs appear in the "Intermediate Outputs" column; final result shows in "Final Output".
6. Save workflow as a template via the Save button. Templates are persisted in localStorage.

## Tour
- A built-in tour (button in the sidebar) highlights:
  - `.sidebar` — available APIs
  - `.workflow-visual` — pipeline view
  - `.text-area-container` — input area
  - `.btn-tertiary` — save template
- Tour auto-shows on first visit. Use the Tour button to re-open.

## Global state & persistence
- Global store: `src/store/GlobalStore.jsx` — holds chat, hybrid workflow, intermediate outputs, and shared API config.
- localStorage keys:
  - `hybridTemplates` — saved hybrid workflows
  - `hybridTourSeen` — tour seen flag

## Debug & troubleshooting
- Blank AI responses: verify Firebase key and network connectivity.
- Tour tooltip placement: custom SimpleTour component used; ensure selectors exist in DOM.
- Drag/drop issues: ensure @hello-pangea/dnd is installed and component wrappers are unchanged.

## Contributing
- Open issues for bugs/feature requests.
- Make small, focused PRs. Tests and linting welcome.

Files you’ll likely edit:
- UI: `src/pages/containers/hybridApi/hybrid.jsx`, `src/pages/containers/chatApi/chatApi.jsx`, `src/pages/containers/singleApi/singleApi.jsx
- 