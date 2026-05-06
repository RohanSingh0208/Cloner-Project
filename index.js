import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import readline from "readline";

// ─────────────────────────────────────────────────────────────
// ✦  SCALER WEBSITE CLONER — CLI Agent (Gemini Edition)
// ─────────────────────────────────────────────────────────────
// A conversational CLI agent that accepts natural language
// instructions and generates a working Scaler Academy clone
// using an AI-driven reasoning loop (START → THINK → TOOL → OBSERVE → OUTPUT).
// ─────────────────────────────────────────────────────────────

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model to use — can be overridden via .env
// Options: gemini-2.5-flash-lite, gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

// ── Colour helpers for terminal output ──────────────────────
const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
};

function log(icon, color, label, message) {
  console.log(
    `\n${color}${COLORS.bright}  ${icon}  ${label}${COLORS.reset}  ${message}`
  );
}

function logStep(step, content) {
  const map = {
    START: ["🚀", COLORS.blue, "START  "],
    THINK: ["🧠", COLORS.yellow, "THINK  "],
    TOOL: ["🔧", COLORS.cyan, "TOOL   "],
    OBSERVE: ["👁️ ", COLORS.magenta, "OBSERVE"],
    OUTPUT: ["✅", COLORS.green, "OUTPUT "],
  };
  const [icon, color, label] = map[step] || ["❓", COLORS.white, step];
  log(icon, color, label, content);
}

function banner() {
  console.log(`
${COLORS.blue}${COLORS.bright}
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║     ███████╗ ██████╗ █████╗ ██╗     ███████╗██████╗       ║
  ║     ██╔════╝██╔════╝██╔══██╗██║     ██╔════╝██╔══██╗      ║
  ║     ███████╗██║     ███████║██║     █████╗  ██████╔╝      ║
  ║     ╚════██║██║     ██╔══██║██║     ██╔══╝  ██╔══██╗      ║
  ║     ███████║╚██████╗██║  ██║███████╗███████╗██║  ██║      ║
  ║     ╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝      ║
  ║                                                           ║
  ║        🌐  Website Cloner Agent  —  CLI Edition           ║
  ║        Clone the Scaler Academy website with AI           ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
${COLORS.reset}
  ${COLORS.dim}Type your instruction and press Enter. Type "exit" to quit.${COLORS.reset}
  ${COLORS.dim}Example: "Clone the Scaler Academy website"${COLORS.reset}
`);
}

// ─────────────────────────────────────────────────────────────
// ✦  TOOLS — Functions the agent can call
// ─────────────────────────────────────────────────────────────

/**
 * Creates a file at the given file path with the provided content.
 * Automatically creates intermediate directories if they don't exist.
 */
async function createFile(args) {
  try {
    const filePath = args.filePath;
    const content = args.content;

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, "utf-8");
    return `File successfully created at: ${filePath} (${content.length} bytes written)`;
  } catch (err) {
    return `Error creating file: ${err.message}`;
  }
}

/**
 * Reads the content of a file at the given path.
 */
async function readFile(args) {
  try {
    const filePath = args.filePath;
    if (!fs.existsSync(filePath)) {
      return `File not found: ${filePath}`;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return `File content of ${filePath}:\n${content}`;
  } catch (err) {
    return `Error reading file: ${err.message}`;
  }
}

/**
 * Lists files and directories at the given path.
 */
async function listFiles(args) {
  try {
    const dirPath = args.dirPath || ".";
    if (!fs.existsSync(dirPath)) {
      return `Directory not found: ${dirPath}`;
    }
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const result = items.map((item) => {
      const type = item.isDirectory() ? "📁" : "📄";
      return `${type} ${item.name}`;
    });
    return `Contents of ${dirPath}:\n${result.join("\n")}`;
  } catch (err) {
    return `Error listing files: ${err.message}`;
  }
}

/**
 * Executes a shell command and returns its output.
 */
async function executeCommand(args) {
  try {
    const cmd = args.cmd;
    return new Promise((resolve) => {
      exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          resolve(`Command error: ${error.message}\nStderr: ${stderr}`);
        } else {
          resolve(
            `Command executed successfully.\nOutput: ${stdout || "(no output)"}\n${stderr ? "Stderr: " + stderr : ""}`
          );
        }
      });
    });
  } catch (err) {
    return `Error executing command: ${err.message}`;
  }
}

/**
 * Opens a file in the default browser.
 */
async function openInBrowser(args) {
  try {
    const filePath = path.resolve(args.filePath);
    if (!fs.existsSync(filePath)) {
      return `File not found: ${filePath}`;
    }

    const command =
      process.platform === "win32"
        ? `start "" "${filePath}"`
        : process.platform === "darwin"
          ? `open "${filePath}"`
          : `xdg-open "${filePath}"`;

    return new Promise((resolve) => {
      exec(command, (error) => {
        if (error) {
          resolve(`Error opening browser: ${error.message}`);
        } else {
          resolve(`Successfully opened ${filePath} in the default browser.`);
        }
      });
    });
  } catch (err) {
    return `Error opening in browser: ${err.message}`;
  }
}

// ── Tool registry ───────────────────────────────────────────
const TOOLS = {
  createFile,
  readFile,
  listFiles,
  executeCommand,
  openInBrowser,
};

// ─────────────────────────────────────────────────────────────
// ✦  SYSTEM PROMPT — Agent persona & reasoning format
// ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are an expert Web Developer AI Agent that works inside a CLI terminal.
You specialise in cloning / recreating websites using HTML, CSS, and JavaScript.

You operate in a structured reasoning loop:  START → THINK → TOOL → OBSERVE → … → OUTPUT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVAILABLE TOOLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. createFile({"filePath": "string", "content": "string"})
   Creates or overwrites a file with the given content. Parent directories are created automatically.

2. readFile({"filePath": "string"})
   Reads and returns the full content of a file.

3. listFiles({"dirPath": "string"})
   Lists files and folders inside a directory.

4. executeCommand({"cmd": "string"})
   Runs a shell command and returns its output. Use for any CLI operations.

5. openInBrowser({"filePath": "string"})
   Opens an HTML file in the user's default web browser.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Always respond with EXACTLY ONE valid JSON object per message.
2. Follow the step progression: START → THINK (one or more) → TOOL → wait for OBSERVE → THINK → TOOL → … → OUTPUT
3. Break large tasks into small steps. Create files one at a time.
4. After every TOOL step, STOP and wait for the OBSERVE response before continuing.
5. Only produce an OUTPUT step when ALL work is complete and verified.
6. When cloning a website, you MUST create production-quality HTML/CSS/JS with:
   - Pixel-perfect layout matching the original
   - Responsive design
   - Proper colors, typography, spacing
   - Smooth animations and hover effects
   - All sections requested (Header, Hero, Footer at minimum)
7. tool_args must be a valid JSON object.
8. The output directory should be "output/" relative to the current working directory.
9. Do NOT generate an OBSERVE step yourself. The system will inject it after each TOOL step.
10. You MUST do multiple THINK steps showing your reasoning before each TOOL call.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT  (strict JSON — one per message)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For START step:
{ "step": "START", "content": "description of what user wants" }

For THINK step:
{ "step": "THINK", "content": "reasoning / planning" }

For TOOL step:
{ "step": "TOOL", "tool_name": "createFile", "tool_args": { "filePath": "output/index.html", "content": "<!DOCTYPE html>..." } }

For OUTPUT step (final):
{ "step": "OUTPUT", "content": "final summary for user" }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCALER ACADEMY WEBSITE REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When asked to clone the Scaler Academy website (https://www.scaler.com), use this reference:

HEADER:
- Sticky white header bar with subtle box-shadow: 0 2px 10px rgba(0,0,0,0.08)
- Left: SCALER logo text in bold black "SCALER" with a small blue square icon with arrow
- Center: Nav links — PROGRAM, STORIES, PEOPLE BEHIND SCALER, PODCAST, PLACEMENT REPORT (uppercase, font-size 12px, font-weight 500, letter-spacing 1.5px, color #4B5563)
- Right side: "Login" text button with border + "PLACEMENT REPORT" solid blue (#0052CC) button with white text
- Height: 70px, padding 0 40px, display flex, align-items center, justify-content space-between
- On scroll: header gets background white and increased shadow

HERO SECTION:
- Full width section with clean white background (#FFFFFF)
- Top center: Small blue (#0052CC) pill/badge with text "THE MARKET HAS ALREADY CHANGED" — background: rgba(0,82,204,0.08), padding 8px 20px, border-radius 50px, font-size 13px, color #0052CC
- Main heading: "Become the Professional Built for the Next Decade in AI." — font-size 52px, font-weight 800, line-height 1.15, color #111827, max-width 800px, text-align center
- Subtitle: "The investment that compounds. Strong technical foundations, AI integrated at every stage, and a curriculum that evolves as the market does" — font-size 18px, color #6B7280, max-width 650px, text-align center
- Two CTA buttons centered:
  "Request A Callback" — background #0052CC, color white, padding 14px 32px, border-radius 8px, font-weight 600
  "Book Free Live Class" — background white, border 2px solid #0052CC, color #0052CC, padding 14px 32px, border-radius 8px
- Below CTAs: 4 program cards in horizontal row (flex, gap 20px):
  Each card: White bg, border 1px solid #E5E7EB, border-radius 12px, padding 24px, colored top accent line
  Programs: "Modern Software and AI Engineering", "Modern Data Science and ML", "Advanced AIML with Agentic AI", "DevOps, Cloud & AI Platform Engineering"
  Hover: translateY(-4px), box-shadow 0 8px 25px rgba(0,0,0,0.1)

WHY SCALER SECTION:
- Light grey background #F8F9FA, padding 80px 40px
- Section title: "Why Scaler" small blue text + "Four things no other program gives you" large heading
- 4 feature cards in 2x2 grid with icons, titles, descriptions, hover lift effect

FOOTER:
- Background #FFFFFF with top border 1px solid #E5E7EB
- 5-column grid layout, padding 60px 40px
- Columns: Explore Scaler, Resources, Others, Socials, Trending Courses
- Bottom: copyright "© 2026 InterviewBit Software Services Pvt. Ltd."
- Sticky dark blue (#0052CC) bar at very bottom: "Need help? Talk to us at 08047939623 or Request a Call" — white text

COLOR PALETTE:
- Primary Blue: #0052CC
- Dark Blue Hover: #003D99
- White: #FFFFFF
- Light Grey BG: #F8F9FA  
- Dark Heading: #111827
- Body Text: #4B5563
- Muted Text: #6B7280
- Border: #E5E7EB

TYPOGRAPHY:
- Google Font: 'Inter', sans-serif
- H1: 52px, weight 800
- H2: 36px, weight 700
- Nav: 12px, weight 500, uppercase, letter-spacing 1.5px
- Body: 16px, weight 400

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXAMPLE INTERACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User: Clone the Scaler Academy website

assistant: { "step": "START", "content": "The user wants me to clone the Scaler Academy website. I need to create a working HTML page with Header, Hero Section, and Footer that visually resembles scaler.com" }

assistant: { "step": "THINK", "content": "I will break this into steps: 1) Create the output directory 2) Create index.html with all the HTML structure 3) Create styles.css with Scaler design system 4) Create script.js for interactivity 5) Open in browser" }

assistant: { "step": "THINK", "content": "Starting with index.html. I need a proper HTML5 document with the header nav, hero section with heading and program cards, and a full footer." }

assistant: { "step": "TOOL", "tool_name": "createFile", "tool_args": { "filePath": "output/index.html", "content": "<!DOCTYPE html>..." } }

// system injects OBSERVE

assistant: { "step": "THINK", "content": "index.html created. Now creating the CSS file with all the Scaler design tokens." }

assistant: { "step": "TOOL", "tool_name": "createFile", "tool_args": { "filePath": "output/styles.css", "content": "/* Scaler CSS */..." } }

// ... continues step by step ...

assistant: { "step": "OUTPUT", "content": "Successfully cloned the Scaler Academy website! Files: output/index.html, output/styles.css, output/script.js. Opened in browser." }
`;

// ─────────────────────────────────────────────────────────────
// ✦  Helper: Parse JSON from model response (handles markdown fences)
// ─────────────────────────────────────────────────────────────

function parseJSON(text) {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Strip markdown code fences if present
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      // Try to find the first { ... } block
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error("Could not parse JSON from model response");
    }
  }
}

// ─────────────────────────────────────────────────────────────
// ✦  AGENT LOOP — The core reasoning engine
// ─────────────────────────────────────────────────────────────

async function agentLoop(userMessage, chatHistory) {
  // Build messages array for Gemini
  chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

  let iterationCount = 0;
  const MAX_ITERATIONS = 50;

  while (iterationCount < MAX_ITERATIONS) {
    iterationCount++;

    try {
      // Create a chat with the model
      const chat = genAI
        .getGenerativeModel({
          model: MODEL_NAME,
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
          systemInstruction: SYSTEM_PROMPT,
        })
        .startChat({
          history: chatHistory.slice(0, -1), // All except the last
        });

      // Send the last message
      const lastMsg = chatHistory[chatHistory.length - 1];
      const result = await chat.sendMessage(lastMsg.parts[0].text);
      const rawText = result.response.text();

      let parsed;
      try {
        parsed = parseJSON(rawText);
      } catch {
        console.log(
          `${COLORS.red}  ⚠  Failed to parse JSON. Retrying...${COLORS.reset}`
        );
        console.log(`${COLORS.dim}  Raw: ${rawText.substring(0, 200)}${COLORS.reset}`);

        chatHistory.push({ role: "model", parts: [{ text: rawText }] });
        chatHistory.push({
          role: "user",
          parts: [
            {
              text: JSON.stringify({
                step: "OBSERVE",
                content:
                  "Your response was not valid JSON. Please respond with exactly one valid JSON object matching the specified format.",
              }),
            },
          ],
        });
        continue;
      }

      // Store model response
      chatHistory.push({
        role: "model",
        parts: [{ text: JSON.stringify(parsed) }],
      });

      // ── Handle each step type ──
      const step = parsed.step;

      if (step === "START") {
        logStep("START", parsed.content);
      } else if (step === "THINK") {
        logStep("THINK", parsed.content);
      } else if (step === "TOOL") {
        logStep("TOOL", `Calling ${parsed.tool_name}...`);

        const toolFn = TOOLS[parsed.tool_name];

        if (!toolFn) {
          const errMsg = `Tool "${parsed.tool_name}" is not available. Available tools: ${Object.keys(TOOLS).join(", ")}`;
          log("⚠", COLORS.red, "ERROR", errMsg);
          chatHistory.push({
            role: "user",
            parts: [
              {
                text: JSON.stringify({ step: "OBSERVE", content: errMsg }),
              },
            ],
          });
        } else {
          try {
            // Parse tool_args — could be string or object
            let toolArgs = parsed.tool_args;
            if (typeof toolArgs === "string") {
              toolArgs = JSON.parse(toolArgs);
            }

            const toolResult = await toolFn(toolArgs);

            // Show truncated result in terminal
            const displayResult =
              typeof toolResult === "string" && toolResult.length > 300
                ? toolResult.substring(0, 300) + "... (truncated)"
                : toolResult;

            logStep(
              "OBSERVE",
              typeof displayResult === "string"
                ? displayResult
                : JSON.stringify(displayResult)
            );

            chatHistory.push({
              role: "user",
              parts: [
                {
                  text: JSON.stringify({
                    step: "OBSERVE",
                    content:
                      typeof toolResult === "string"
                        ? toolResult
                        : JSON.stringify(toolResult),
                  }),
                },
              ],
            });
          } catch (toolErr) {
            const errMsg = `Tool execution error: ${toolErr.message}`;
            log("⚠", COLORS.red, "ERROR", errMsg);
            chatHistory.push({
              role: "user",
              parts: [
                {
                  text: JSON.stringify({ step: "OBSERVE", content: errMsg }),
                },
              ],
            });
          }
        }
      } else if (step === "OUTPUT") {
        logStep("OUTPUT", parsed.content);
        return; // Agent loop done
      } else {
        log("❓", COLORS.yellow, "UNKNOWN", `Unknown step: ${step}`);
      }
    } catch (apiErr) {
      log("💥", COLORS.red, "API ERROR", apiErr.message);

      if (apiErr.status === 429 || apiErr.message?.includes("429")) {
        // Extract retry delay from error message if available
        const retryMatch = apiErr.message?.match(/retry in ([\d.]+)s/);
        const waitSeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) + 2 : 15;
        log("⏳", COLORS.yellow, "WAIT", `Rate limited. Waiting ${waitSeconds} seconds...`);
        await new Promise((r) => setTimeout(r, waitSeconds * 1000));
      } else {
        // For other errors, push error context and continue
        log("🔄", COLORS.yellow, "RETRY", "Attempting to recover...");
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  log(
    "⚠",
    COLORS.red,
    "LIMIT",
    `Agent reached maximum iteration limit (${MAX_ITERATIONS}).`
  );
}

// ─────────────────────────────────────────────────────────────
// ✦  MAIN — Interactive CLI loop
// ─────────────────────────────────────────────────────────────

async function main() {
  banner();

  // Validate API key
  if (!process.env.GEMINI_API_KEY) {
    console.log(
      `${COLORS.red}${COLORS.bright}  ❌  GEMINI_API_KEY not found in .env file!${COLORS.reset}`
    );
    console.log(
      `${COLORS.dim}  Create a .env file with: GEMINI_API_KEY=your_key_here${COLORS.reset}\n`
    );
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Persistent chat history across prompts in a session
  const chatHistory = [];

  const prompt = () => {
    rl.question(
      `\n${COLORS.blue}${COLORS.bright}  ❯ You: ${COLORS.reset}`,
      async (input) => {
        const trimmed = input.trim();

        if (!trimmed) {
          prompt();
          return;
        }

        if (
          trimmed.toLowerCase() === "exit" ||
          trimmed.toLowerCase() === "quit"
        ) {
          console.log(
            `\n${COLORS.dim}  👋 Goodbye! Thanks for using Scaler Website Cloner Agent.${COLORS.reset}\n`
          );
          rl.close();
          process.exit(0);
        }

        console.log(
          `\n${COLORS.dim}  ─────────────────────────────────────────${COLORS.reset}`
        );

        try {
          await agentLoop(trimmed, chatHistory);
        } catch (err) {
          log("💥", COLORS.red, "ERROR", `Fatal error: ${err.message}`);
        }

        console.log(
          `\n${COLORS.dim}  ─────────────────────────────────────────${COLORS.reset}`
        );
        prompt();
      }
    );
  };

  prompt();
}

main();
