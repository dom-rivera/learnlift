# 🦋 LearnLift

**Turn your reading into a test you can pass.**

LearnLift is an AI-powered study app. Upload your learning material as a PDF or Word document and it generates an interactive multiple-choice quiz or a flip-style flashcard deck — grounded strictly in your document, with explanations for every right and wrong answer, a source citation for each question, and your score at the end.

> **Live app:** _[add your published Claude artifact link here]_

## Features

- **Upload PDF (.pdf) or Word (.docx)** — drag-and-drop or tap to browse; works on desktop and mobile
- **Quiz mode** — multiple-choice questions with instant feedback: why the correct answer is correct *and* why your wrong answer is wrong
- **Flashcard mode** — 3D flip cards with the answer, a short "why," and self-marking (knew it / missed it)
- **Grounded, cited answers** — every question must include a verbatim quote from your document; questions without verifiable evidence are discarded before you ever see them
- **Configurable difficulty volume** — 5, 10, 15, 20, or 30 questions per session, generated in batches with duplicate protection
- **Score screen** — final score, percentage, and a per-question review of what you picked vs. the correct answer
- **Vintage naturalist theme** — a light, aged-paper palette drawn from an antique butterfly plate
- **Mobile-optimized** — iOS Safari quirks handled (dynamic viewport, safe areas, WebKit flip prefixes), Android file-picker MIME types, 44px+ touch targets, 20 MB file guard

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
