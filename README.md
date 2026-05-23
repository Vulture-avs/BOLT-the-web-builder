# Bolt — AI Web Builder

A full-stack AI-powered web builder that takes a plain-text prompt and generates a fully functional React or Node.js project in real time, right in the browser. Inspired by [Bolt.new](https://bolt.new).

---

## How It Works

1. You describe the website or app you want to build.
2. The backend uses **Google Gemini** to determine the project type (React or Node) and generate structured build steps.
3. The frontend parses those steps, builds a live file tree, and mounts everything into a **WebContainer** — an in-browser Node.js runtime.
4. You get a live code editor and preview, and can keep chatting to iterate on the result.

```
  User Prompt
    │
    ▼
┌─────────────────────────────┐
│        Express Backend       │
│  ┌───────────────────────┐  │
│  │   /template endpoint  │  │  ◄── Detects project type (React / Node)
│  │   /chat endpoint      │  │  ◄── Sends conversation to Gemini AI
│  └───────────────────────┘  │
└────────────┬────────────────┘
             │  Structured XML (boltArtifact)
             ▼
┌─────────────────────────────┐
│        React Frontend        │
│  ┌──────────┐ ┌──────────┐  │
│  │  Parser  │ │File Tree │  │  ◄── Parses XML into files & steps
│  └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐  │
│  │  Monaco  │ │WebContai-│  │  ◄── Live editor + in-browser runtime
│  │  Editor  │ │  ner     │  │
│  └──────────┘ └──────────┘  │
└─────────────────────────────┘
             │
             ▼
     Live App Preview
```
---

## Project Structure

```
bolt-ai-web-builder/
│
├── be/                         # Express backend
│   ├── src/
│   │   ├── index.ts            # Entry point — sets up Express server
│   │   ├── routes/
│   │   │   ├── template.ts     # POST /template — detects project type
│   │   │   └── chat.ts         # POST /chat — sends messages to Gemini
│   │   ├── prompts/
│   │   │   ├── react.ts        # System prompt for React projects
│   │   │   └── node.ts         # System prompt for Node.js projects
│   │   └── gemini.ts           # Gemini API client setup
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                   # React frontend
    ├── src/
    │   ├── App.tsx              # Root component — chat + editor layout
    │   ├── components/
    │   │   ├── Editor.tsx       # Monaco code editor
    │   │   ├── FileExplorer.tsx # Sidebar file tree
    │   │   ├── Preview.tsx      # WebContainer iframe preview
    │   │   ├── StepsList.tsx    # Build progress steps
    │   │   └── ChatInput.tsx    # Prompt input bar
    │   ├── hooks/
    │   │   └── useWebContainer.ts  # WebContainer lifecycle hook
    │   ├── utils/
    │   │   └── parseXml.ts      # Parses boltArtifact XML responses
    │   └── types.ts             # Shared TypeScript interfaces
    ├── index.html
    ├── package.json
    ├── tailwind.config.ts
    └── vite.config.ts
```

---

## Tech Stack

| Layer     | Tech                                      |
|-----------|-------------------------------------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS  |
| Editor    | Monaco Editor (`@monaco-editor/react`)    |
| Preview   | WebContainers API (`@webcontainer/api`)   |
| Backend   | Node.js, Express, TypeScript              |
| AI Model  | Google Gemini 2.5 Flash                   |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### 1. Backend

```bash
cd be
npm install
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
# Optional: override the default model
# GEMINI_MODEL=gemini-2.5-flash
```

Start the server:

```bash
npm run dev
```

The backend runs on `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

---

## API Endpoints

### `POST /template`
Determines the project type from the user's prompt and returns the appropriate base template and prompts.

**Request:**
```json
{ "prompt": "Build a todo app" }
```

**Response:**
```json
{
  "prompts": ["...system prompts..."],
  "uiPrompts": ["...initial file structure XML..."]
}
```

### `POST /chat`
Sends the full conversation history to Gemini and returns the next set of build steps as structured XML.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:**
```json
{ "response": "<boltArtifact>...</boltArtifact>" }
```

---

## Features

- Natural language to working web app
- Supports React and Node.js project types
- Live in-browser preview via WebContainers (no server needed for the generated app)
- Monaco-based code editor with file explorer
- Iterative chat — keep refining your app after the initial generation
- Step-by-step build progress view

---

## Environment Variables

| Variable          | Required | Description                              |
|-------------------|----------|------------------------------------------|
| `GEMINI_API_KEY`  | Yes      | Your Google Gemini API key               |
| `GEMINI_MODEL`    | No       | Override the model (default: `gemini-2.5-flash`) |

---

