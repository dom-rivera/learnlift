# 🦋 LearnLift

**Turn your reading into a test you can pass.**

LearnLift is an AI-powered study app. Upload your learning material as a PDF or Word document and it generates an interactive multiple-choice quiz or a flip-style flashcard deck — grounded strictly in your document, with explanations for every right and wrong answer, a source citation for each question, and your score at the end.

> **Live app:** https://claude.ai/public/artifacts/70e0091f-a32a-4797-af6d-25a0e6967c8f

## Features

- **Upload PDF (.pdf) or Word (.docx)** — drag-and-drop or tap to browse; works on desktop and mobile
- **Quiz mode** — multiple-choice questions with instant feedback: why the correct answer is correct *and* why your wrong answer is wrong
- **Flashcard mode** — 3D flip cards with the answer, a short "why," and self-marking (knew it / missed it)
- **Grounded, cited answers** — every question must include a verbatim quote from your document; questions without verifiable evidence are discarded before you ever see them
- **Configurable difficulty volume** — 5, 10, 15, 20, or 30 questions per session, generated in batches with duplicate protection
- **Score screen** — final score, percentage, and a per-question review of what you picked vs. the correct answer
- **Vintage naturalist theme** — a light, aged-paper palette drawn from an antique butterfly plate
- **Mobile-optimized** — iOS Safari quirks handled (dynamic viewport, safe areas, WebKit flip prefixes), Android file-picker MIME types, 44px+ touch targets, 20 MB file guard

## 🚀 How to use LearnLift (for users)

**What you need:** any web browser (phone, tablet, or computer) and a free [Claude](https://claude.ai) account for the AI generation step. No installation.

### Step 1 — Open the app
Click the link below (or scan it from wherever it was shared with you):

**👉 https://claude.ai/public/artifacts/70e0091f-a32a-4797-af6d-25a0e6967c8f**

The app opens instantly in your browser — you can look around without signing in.

### Step 2 — Upload your learning material
Tap the upload box and choose a file, or drag one in on desktop.

- Supported formats: **PDF (.pdf)** and **Word (.docx)**
- Maximum size: **20 MB** (split very large readings into parts)
- Older `.doc` files must be re-saved as `.docx` first

### Step 3 — Choose your study mode
- **Quiz** — multiple-choice questions with instant right/wrong feedback
- **Flashcards** — flip cards you self-mark as "knew it" or "missed it"

Then pick how many items you want: **5, 10, 15, 20, or 30**. (Larger sets take a few minutes to generate — a progress bar keeps you posted.)

### Step 4 — Hit "Generate" and sign in
Press the **Generate** button. The first time, Claude will ask you to **sign in or create a free account** — this takes under a minute and is only needed because the AI generation runs on your own Claude account. After that, you're in.

> 💡 Generation counts against your Claude plan's usage limits. On a free account, a few large 30-question sets in one sitting may hit your daily cap — 5–10 question sets are perfect for regular review; save 30 for exam prep.

### Step 5 — Study!
- **In Quiz mode:** tap an answer. You'll immediately see whether you were right, *why* the correct answer is correct, *why* your wrong choice was wrong, and a 📖 quote showing exactly where in **your document** the answer comes from.
- **In Flashcard mode:** tap the card to flip it, read the answer and explanation, then mark whether you knew it.

### Step 6 — See your score
At the end you get your score, a percentage, and a question-by-question review of what you picked versus the correct answers. From there you can **retake the same set** or **upload a new document**.

### Troubleshooting
| Problem | Fix |
|---|---|
| "Generate" asks me to sign in | Normal — create a free Claude account and continue |
| Generation fails or stalls | Check your connection and try again; very long documents work better with smaller question counts first |
| My file is rejected | Ensure it's `.pdf` or `.docx` and under 20 MB |
| Fewer questions than I asked for | Your document didn't have enough distinct material — the app refuses to pad with repeats or made-up questions |

## How it works

```
┌────────────┐   PDF (base64) or       ┌─────────────────┐
│  Browser   │   DOCX text (mammoth)   │  Anthropic API   │
│  React UI  ├────────────────────────►│  claude-sonnet   │
│            │◄────────────────────────┤  (JSON output)   │
└────────────┘   batched questions     └─────────────────┘
      │
      ▼
 Evidence verification (client-side):
 each question's quote is checked against
 the document text; ungrounded items dropped
```

1. The document is read entirely in the browser — PDFs are base64-encoded and sent as native document attachments; Word files have their text extracted locally with [mammoth.js](https://github.com/mwilliamson/mammoth.js).
2. Questions are generated in small batches (5–8 per call). Each batch is told which questions already exist and instructed to cover different parts of the material.
3. Strict grounding rules require a verbatim evidence quote per question. For Word uploads, each quote is verified against the actual document text; anything unverifiable is discarded.
4. The UI shows the citation under every answer so users can check the source themselves.

## Repository structure

```
learnlift/
├── src/
│   └── LearnLift.jsx    # The entire app (single-file React component)
├── docs/
│   └── SELF_HOSTING.md  # Future path: deploying outside Claude with your own API key
├── README.md
├── LICENSE
└── .gitignore
```

## ⚠️ Why this repo doesn't deploy to GitHub Pages directly

`LearnLift.jsx` calls the Anthropic API **without an API key**. That works only when the app runs as a **Claude artifact** inside [claude.ai](https://claude.ai), where authentication is handled by the platform and each user's generation counts against **their own** Claude plan — meaning the app costs the creator nothing to share.

Deployed anywhere else (GitHub Pages, Vercel, etc.), the API calls will fail. To self-host, you need a small backend proxy holding your own API key — see [`docs/SELF_HOSTING.md`](docs/SELF_HOSTING.md). **Never commit an API key to this repository.**

## Running / editing the app

The intended workflow:

1. Open [claude.ai](https://claude.ai) and paste `src/LearnLift.jsx` into a conversation, asking Claude to render it as an artifact (or continue iterating in the original conversation that built it).
2. Test in the artifact preview.
3. Click **Publish** on the artifact to get a public shareable link.
4. Commit any code changes back to this repo so it stays the source of truth.

## Tech

- React (hooks only, no external state library)
- [mammoth.js](https://github.com/mwilliamson/mammoth.js) for DOCX text extraction
- Anthropic Messages API (`claude-sonnet-4-6`) with low temperature and JSON-only prompting
- Pure CSS (no framework) — Archivo + IBM Plex Mono, index-card visual motif

## License

MIT — see [LICENSE](LICENSE).
