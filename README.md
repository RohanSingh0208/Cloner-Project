# 🌐 Scaler Website Cloner — CLI Agent

A conversational CLI agent that clones the **Scaler Academy** website by generating fully working HTML, CSS, and JavaScript files through an AI-powered reasoning loop.

> Built with Node.js + OpenAI GPT-4.1-mini | Inspired by Cursor/Windsurf-style agentic workflows

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **Conversational CLI** | Chat with the agent directly in the terminal |
| 🧠 **Multi-step Reasoning** | Agent follows a structured loop: `START → THINK → TOOL → OBSERVE → OUTPUT` |
| 🔧 **Tool Execution** | Agent can create files, read files, list directories, run shell commands, and open the browser |
| 🌐 **Website Cloning** | Generates production-quality HTML/CSS/JS that visually resembles the Scaler website |
| 🔄 **Agent Loop** | The agent reasons through multiple steps — never completes everything in one shot |
| 💬 **Persistent Context** | Conversation history is maintained across prompts within a session |

---

## 🏗️ Architecture

```
User Input (CLI)
     │
     ▼
┌──────────────────────────┐
│     AGENT LOOP           │
│                          │
│  START → THINK → TOOL ──►│──► Tool Execution
│    ▲                     │       │
│    │      OBSERVE ◄──────│───────┘
│    │         │           │
│    └─────────┘           │
│         │                │
│      OUTPUT              │
└──────────────────────────┘
     │
     ▼
  Generated Files
  (HTML, CSS, JS)
     │
     ▼
  Browser Preview
```

### Reasoning Steps

| Step | Purpose |
|------|---------|
| `START` | Acknowledge the user's request |
| `THINK` | Break the problem into smaller pieces, plan next action |
| `TOOL` | Call a tool (createFile, readFile, etc.) |
| `OBSERVE` | Receive and process tool results |
| `OUTPUT` | Deliver the final answer to the user |

### Available Tools

| Tool | Description |
|------|-------------|
| `createFile` | Create or overwrite a file with content |
| `readFile` | Read the contents of a file |
| `listFiles` | List files in a directory |
| `executeCommand` | Run a shell command |
| `openInBrowser` | Open an HTML file in the default browser |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- An **OpenAI API key** ([Get one here](https://platform.openai.com/api-keys))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/Cloner-Project.git
cd Cloner-Project

# 2. Install dependencies
npm install

# 3. Set up your API key
cp .env.example .env
# Edit .env and paste your OpenAI API key
```

### Running the Agent

```bash
npm start
```

You'll see the interactive CLI banner. Type your instruction:

```
❯ You: Clone the Scaler Academy website
```

The agent will:
1. **START** — Acknowledge the task
2. **THINK** — Plan the approach (create HTML, CSS, JS files)
3. **TOOL** — Create each file step by step
4. **OBSERVE** — Verify each file was created
5. **OUTPUT** — Summarize and open the result in the browser

Generated files are saved to the `output/` directory.

---

## 📸 Demo

### CLI in Action

```
🚀  START   The user wants me to clone the Scaler Academy website...
🧠  THINK   I'll break this into steps: 1) Create output dir  2) Create index.html...
🧠  THINK   Starting with the HTML structure including header, hero, and footer...
🔧  TOOL    Calling createFile...
👁️  OBSERVE  File successfully created at: output/index.html (12847 bytes)
🧠  THINK   HTML done. Now creating the CSS stylesheet...
🔧  TOOL    Calling createFile...
👁️  OBSERVE  File successfully created at: output/styles.css (8234 bytes)
🧠  THINK   CSS done. Now adding JavaScript for interactivity...
🔧  TOOL    Calling createFile...
👁️  OBSERVE  File successfully created at: output/script.js (2156 bytes)
🧠  THINK   All files created. Opening in browser...
🔧  TOOL    Calling openInBrowser...
👁️  OBSERVE  Successfully opened output/index.html in the default browser
✅  OUTPUT   Successfully cloned the Scaler Academy website!
```

---

## 📂 Project Structure

```
Cloner-Project/
├── index.js          # Main CLI agent (entry point)
├── package.json      # Dependencies & scripts
├── .env.example      # Environment variable template
├── .env              # Your API key (not committed)
├── .gitignore        # Git ignore rules
├── README.md         # This file
└── output/           # Generated website files (created by agent)
    ├── index.html
    ├── styles.css
    └── script.js
```

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **AI Model**: OpenAI GPT-4.1-mini
- **Libraries**: `openai`, `dotenv`
- **Output**: Vanilla HTML + CSS + JavaScript

---

## 📝 License

MIT License — feel free to use, modify, and distribute.
