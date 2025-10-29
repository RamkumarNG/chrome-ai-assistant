# Chrome AI Chat Assistant (SmartLab)

Lightweight multi-workspace assistant that demonstrates three workflows:
- Smart Chat — conversational assistant with persistent chat messages across workspace switches ([src/pages/containers/chatApi/chatApi.jsx](src/pages/containers/chatApi/chatApi.jsx)).
- Smart Chain — compose and run multi-step hybrid workflows ([src/pages/containers/hybridApi/hybrid.jsx](src/pages/containers/hybridApi/hybrid.jsx)).
- Smart Prompt — single-step prompts (summarize, rewrite, translate, proofread) ([src/pages/containers/singleApi/singleApi.jsx](src/pages/containers/singleApi/singleApi.jsx)).

Overview
- Built with React + SCSS.
- AI integration and multimodal support via Firebase AI / Gemini (see [src/firebaseconifg.js](src/firebaseconifg.js) and the central hook [src/hooks/useAI.js](src/hooks/useAI.js)).
- Global application state uses a React Context provider: [src/store/GlobalStore.jsx](src/store/GlobalStore.jsx). Chat messages and attachments persist when switching workspaces.

Key files
- App entry: [src/App.jsx](src/App.jsx)  
- Home (workspace switcher): [src/pages/Home.jsx](src/pages/Home.jsx)  
- Chat UI: [src/pages/containers/chatApi/chatApi.jsx](src/pages/containers/chatApi/chatApi.jsx)  
- Hybrid (workflow) UI: [src/pages/containers/hybridApi/hybrid.jsx](src/pages/containers/hybridApi/hybrid.jsx)  
- Single prompt UI: [src/pages/containers/singleApi/singleApi.jsx](src/pages/containers/singleApi/singleApi.jsx)  
- Styling: [src/App.scss](src/App.scss), [src/pages/containers/chatApi/style.scss](src/pages/containers/chatApi/style.scss) and other component scss files.  
- AI logic: [src/hooks/useAI.js](src/hooks/useAI.js)

Tech stack
- JavaScript (ESNext) + React (functional components + hooks)
- SCSS (Sass)
- Firebase AI / GenerativeModel (Gemini usage in firebase config)
- Browser APIs: File, Clipboard
- localStorage used for templates

Getting started (macOS)
1. Install dependencies
   - npm
     - npm ci
   - or yarn
     - yarn

2. Create .env with firebase key
   - REACT_APP_FIREBASE_API_KEY=your_firebase_api_key

3. Run dev server
   - npm start
   - or yarn start

4. Build
   - npm run build
   - or yarn build

Notes & developer tips
- Chat messages are intentionally stored in the global store so they persist between workspace switches. See [src/store/GlobalStore.jsx](src/store/GlobalStore.jsx).
- If scroll or overflow issues appear in flex layouts, verify child containers use `min-height: 0` and `overflow: auto` (fixes in [src/pages/containers/chatApi/style.scss](src/pages/containers/chatApi/style.scss) and [src/App.scss](src/App.scss)).
- Hybrid workflows serialize to localStorage under `hybridTemplates` for reuse.

How it works (short)
- UI components call the centralized hook [`useAI`](src/hooks/useAI.js) to invoke selected API classes. For hybrid workflows, `executeHybridWorkflow` runs each step sequentially and collects intermediate outputs.

Troubleshooting
- Blank responses from AI: ensure Firebase API key/env and GoogleAI backend availability.
- Large file attachments: browser memory limits apply; files are converted to base64 in [src/hooks/useAI.js](src/hooks/useAI.js) before sending to the model.

Contributing
- Open an issue for behavior/bug reports.
- For UI or logic changes, prefer small PRs focusing on a single workspace or the shared store.
