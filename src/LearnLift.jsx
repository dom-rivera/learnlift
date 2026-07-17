import React, { useState, useRef, useCallback } from "react";
import mammoth from "mammoth";

/* ------------------------------------------------------------------ */
/*  LearnLift — turn reading materials into quizzes & flashcards       */
/* ------------------------------------------------------------------ */

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

const styles = `
${FONTS}
:root{
  --ink:#3d3323; --ink-soft:#7d6e53; --paper:#fffdf6; --paper-line:#efe7d2;
  --bg:#f8f4e9; --bg-deep:#efe8d4; --margin-red:#d98070;
  --verm:#c25538; --verm-deep:#9a4128; --teal:#5a8474; --teal-soft:rgba(90,132,116,.1);
  --mustard:#ddb056;
  --good:#5a8258; --good-bg:#eef2e2; --bad:#b55238; --bad-bg:#f8e8de;
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html{-webkit-text-size-adjust:100%}
button{touch-action:manipulation}
.qd-root{min-height:100vh;min-height:100dvh;overscroll-behavior-y:none;background:var(--bg);font-family:'Archivo',sans-serif;color:var(--ink);
  background-image:radial-gradient(ellipse at 50% 25%, rgba(255,255,250,.7) 0%, transparent 55%),
    radial-gradient(ellipse at 50% 110%, var(--bg-deep) 0%, transparent 60%);}
.qd-shell{max-width:820px;margin:0 auto;
  padding:calc(24px + env(safe-area-inset-top)) calc(20px + env(safe-area-inset-right))
  calc(80px + env(safe-area-inset-bottom)) calc(20px + env(safe-area-inset-left))}
.brand{font-weight:900;font-size:17px;letter-spacing:-.01em;color:var(--ink);margin-bottom:26px;display:flex;align-items:center;gap:8px}
.brand .bfly{display:block;flex:none}
.brand small{font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#a4967a;margin-left:4px;margin-top:3px}
.qd-eyebrow{font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--verm)}
.qd-title{font-weight:900;font-size:clamp(34px,6vw,54px);line-height:1.02;letter-spacing:-.02em;margin:10px 0 8px;color:var(--ink)}
.qd-sub{color:var(--ink-soft);font-size:16px;max-width:52ch;line-height:1.5}

/* index card look */
.card{background:var(--paper);color:var(--ink);border-radius:10px;position:relative;
  border:1px solid #ece3cc;
  box-shadow:0 1px 0 #ffffff inset, 0 10px 24px rgba(120,100,60,.14);}
.card.ruled{background-image:
  linear-gradient(to right, transparent 46px, var(--margin-red) 46px, var(--margin-red) 48px, transparent 48px),
  repeating-linear-gradient(to bottom, transparent 0 31px, var(--paper-line) 31px 32px);
  background-position:0 22px;}
.card-pad{padding:26px 26px 26px 60px}

/* dropzone */
.drop{border:2px dashed #d3c6a3;border-radius:14px;padding:44px 24px;text-align:center;cursor:pointer;
  transition:border-color .15s, background .15s;margin-top:28px;color:var(--ink)}
.drop.on{border-color:var(--teal);background:var(--teal-soft)}
@media (hover:hover){
  .drop:hover{border-color:var(--teal);background:var(--teal-soft)}
}
.drop b{color:var(--verm)}
.drop small{display:block;margin-top:8px;color:#a4967a;font-family:'IBM Plex Mono',monospace;font-size:12px}
.filechip{display:inline-flex;align-items:center;gap:10px;background:var(--paper);border:1px solid #e5dbbf;
  border-radius:999px;padding:8px 16px;margin-top:16px;font-size:14px;color:var(--ink)}
.filechip button{background:none;border:none;color:#a4967a;cursor:pointer;font-size:16px;line-height:1}

/* controls */
.controls{display:flex;flex-wrap:wrap;gap:26px;margin-top:26px}
.ctl-label{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#a4967a;display:block;margin-bottom:8px}
.seg{display:inline-flex;border:1px solid #ddd1ad;border-radius:10px;overflow:hidden;background:rgba(255,255,250,.6)}
.seg button{background:transparent;border:none;color:var(--ink-soft);padding:10px 18px;font-family:'Archivo';font-weight:600;font-size:14px;cursor:pointer}
.seg button.sel{background:var(--teal);color:#f6f1de}
.go{margin-top:30px;background:var(--verm);color:#f9f0e2;border:none;border-radius:12px;padding:15px 30px;
  font-family:'Archivo';font-weight:800;font-size:16px;cursor:pointer;letter-spacing:.01em;
  box-shadow:0 6px 0 var(--verm-deep);transition:transform .1s, box-shadow .1s}
@media (hover:hover){ .go:hover{transform:translateY(2px);box-shadow:0 4px 0 var(--verm-deep)} }
.go:active{transform:translateY(3px);box-shadow:0 2px 0 var(--verm-deep)}
.go:disabled{opacity:.4;cursor:not-allowed;box-shadow:none;transform:none}
.err{margin-top:18px;background:var(--bad-bg);color:#7c2c17;border-left:4px solid var(--bad);padding:12px 16px;border-radius:8px;font-size:14px}

.notice{background:rgba(211,161,60,.14);border:1px solid rgba(163,122,38,.4);color:#79601f;
  border-radius:8px;padding:10px 14px;font-size:13px;margin:-12px 0 22px;line-height:1.5}

/* progress */
.meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.1em;color:#9c8d6c}
.meta-left{display:flex;align-items:center;gap:12px}
.backbtn{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;
  background:transparent;border:1.5px solid #ddd1ad;color:#9c8d6c;border-radius:8px;padding:8px 12px;cursor:pointer;
  transition:border-color .12s, color .12s, background .12s;min-height:34px}
@media (hover:hover){ .backbtn:hover{border-color:var(--teal);color:var(--teal)} }
.backbtn.armed{border-color:var(--bad);color:var(--bad);background:var(--bad-bg)}
.bar{height:6px;background:#e9dfc4;border-radius:99px;overflow:hidden;margin-bottom:26px}
.bar i{display:block;height:100%;background:var(--teal);transition:width .3s}

/* quiz */
.q-text{font-weight:800;font-size:clamp(19px,3vw,24px);line-height:1.35;color:var(--ink)}
.opts{display:flex;flex-direction:column;gap:10px;margin-top:20px}
.opt{display:flex;gap:12px;align-items:flex-start;text-align:left;background:#fffefa;border:2px solid #ede4cb;
  border-radius:10px;padding:13px 15px;font-family:'Archivo';font-size:15.5px;color:var(--ink);cursor:pointer;transition:border-color .12s}
@media (hover:hover){ .opt:hover:not(:disabled){border-color:var(--teal)} }
.opt:active:not(:disabled){border-color:var(--teal)}
.opt:disabled{cursor:default}
.opt .key{font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:13px;background:#f4eeda;border-radius:6px;padding:3px 7px;flex:none;margin-top:1px;color:var(--ink-soft)}
.opt.correct{border-color:var(--good);background:var(--good-bg)}
.opt.wrong{border-color:var(--bad);background:var(--bad-bg)}
.opt.dim{opacity:.55}
.verdict{margin-top:18px;border-radius:10px;padding:14px 16px;font-size:14.5px;line-height:1.55}
.verdict.good{background:var(--good-bg);border-left:4px solid var(--good);color:#2f4b26}
.verdict.bad{background:var(--bad-bg);border-left:4px solid var(--bad);color:#6e2814}
.verdict .vt{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.15em;text-transform:uppercase;display:block;margin-bottom:6px;font-weight:600}
.evidence{margin-top:12px;padding-top:10px;border-top:1px dashed rgba(63,45,15,.25);font-style:italic;font-size:13.5px;opacity:.9}
.evidence-inline{font-style:italic;font-size:13px;margin-top:8px;opacity:.9}
.nextrow{display:flex;justify-content:flex-end;margin-top:22px}
.nextrow .go,.again-row .go{margin-top:0}

/* flashcards */
.flip-stage{perspective:1400px;margin-top:6px}
.flip{position:relative;width:100%;min-height:300px;transform-style:preserve-3d;-webkit-transform-style:preserve-3d;
  user-select:none;-webkit-user-select:none;transition:transform .55s cubic-bezier(.4,.1,.2,1);cursor:pointer}
.flip.flipped{transform:rotateX(180deg)}
.face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:flex;flex-direction:column;justify-content:center;justify-content:safe center;overflow-y:auto}
.face.back{transform:rotateX(180deg)}
.face .hint{position:absolute;bottom:14px;right:20px;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.12em;color:#b3a582;text-transform:uppercase}
.face .fc-label{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--margin-red);margin-bottom:12px}
.fc-front-text{font-weight:800;font-size:clamp(20px,3.4vw,27px);line-height:1.3;color:var(--ink)}
.fc-back-text{font-weight:600;font-size:clamp(17px,2.6vw,21px);line-height:1.4;color:var(--ink)}
.fc-expl{margin-top:14px;font-size:14.5px;line-height:1.55;color:var(--ink-soft)}
.selfmark{display:flex;gap:12px;justify-content:center;margin-top:22px}
.selfmark button{border:none;border-radius:10px;padding:13px 24px;font-family:'Archivo';font-weight:800;font-size:15px;cursor:pointer}
.sm-miss{background:var(--bad-bg);color:#6e2814;box-shadow:0 4px 0 #d3ac95}
.sm-got{background:var(--good-bg);color:#2f4b26;box-shadow:0 4px 0 #b9c398}
@media (hover:hover){ .selfmark button:hover{transform:translateY(2px);box-shadow:none} }
.selfmark button:active{transform:translateY(2px);box-shadow:none}
@media (prefers-reduced-motion: reduce){ .flip{transition:none} }

/* results */
.score-hero{text-align:center;padding:38px 20px 30px}
.score-num{font-weight:900;font-size:clamp(56px,11vw,92px);line-height:1;color:var(--ink);letter-spacing:-.03em}
.score-num small{font-size:.4em;color:var(--ink-soft);font-weight:600}
.score-line{font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.15em;text-transform:uppercase;color:var(--ink-soft);margin-top:10px}
.review{margin-top:22px;display:flex;flex-direction:column;gap:12px}
.rev-item{background:#fffefa;border:1px solid #ede4cb;border-radius:10px;padding:16px 18px;color:var(--ink)}
.rev-item .rq{font-weight:700;font-size:15px;line-height:1.4}
.rev-item .ra{font-size:14px;margin-top:6px;line-height:1.5}
.tag{font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;border-radius:5px;padding:2px 7px;margin-right:8px;font-weight:600}
.tag.g{background:var(--good-bg);color:#2f4b26}.tag.b{background:var(--bad-bg);color:#6e2814}
.again-row{display:flex;gap:12px;justify-content:center;margin-top:28px;flex-wrap:wrap}
.ghost{background:transparent;border:1.5px solid #d3c6a3;color:var(--ink-soft);border-radius:12px;padding:14px 24px;font-family:'Archivo';font-weight:700;font-size:15px;cursor:pointer}
@media (hover:hover){ .ghost:hover{border-color:var(--teal);color:var(--teal)} }

/* loading */
.loading{ text-align:center;padding:70px 20px}
.pulse-card{width:120px;height:80px;margin:0 auto 26px;border-radius:8px;background:var(--paper);
  border:1px solid #ece3cc;
  animation:shuffle 1.2s ease-in-out infinite;box-shadow:0 8px 20px rgba(120,100,60,.18)}
@keyframes shuffle{0%,100%{transform:rotate(-4deg) translateY(0)}50%{transform:rotate(4deg) translateY(-10px)}}
@media (prefers-reduced-motion: reduce){ .pulse-card{animation:none} }
.loading p{color:var(--ink-soft);font-family:'IBM Plex Mono',monospace;font-size:13px;letter-spacing:.08em}

/* small screens (phones) */
@media (max-width:540px){
  .qd-title{font-size:clamp(30px,8.5vw,40px)}
  .backbtn{min-height:42px;padding:8px 14px}
  .meta{flex-wrap:wrap;gap:8px}
  .card-pad{padding:20px 16px 20px 44px}
  .card.ruled{background-image:
    linear-gradient(to right, transparent 32px, var(--margin-red) 32px, var(--margin-red) 34px, transparent 34px),
    repeating-linear-gradient(to bottom, transparent 0 31px, var(--paper-line) 31px 32px);
    background-position:0 22px;}
  .drop{padding:34px 16px}
  .controls{gap:18px}
  .seg button{padding:12px 14px;min-height:44px}
  .go{width:100%;min-height:52px}
  .nextrow{justify-content:stretch}
  .nextrow .go{margin-top:0}
  .selfmark{flex-direction:row}
  .selfmark button{flex:1;min-height:50px}
  .opt{padding:14px 13px;min-height:48px}
  .flip{min-height:340px}
  .face .hint{bottom:10px;right:14px}
  .again-row .go,.again-row .ghost{width:100%}
}
`;

const LETTERS = ["A", "B", "C", "D"];
const MAX_TEXT = 14000;

async function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Could not read the file."));
    r.readAsDataURL(file);
  });
}

function buildPrompt(mode, count, avoid) {
  const avoidBlock = avoid.length
    ? `\n\nAlready used in this quiz — do NOT repeat or closely paraphrase any of these:\n${avoid.map(a => `- ${a}`).join("\n")}\nCover DIFFERENT concepts, sections, or details of the material instead.`
    : "";
  const grounding = `STRICT GROUNDING RULES — these override everything else:
- Use ONLY facts explicitly stated in the attached material. Do not use outside knowledge, even if you are certain it is true.
- Every item must include an "evidence" field: a short verbatim quote (max 15 words) copied exactly from the material that proves the correct answer.
- If you cannot find a verbatim supporting quote for an item, do not write that item.
- If the material does not contain enough distinct content for ${count} items, return fewer items instead of inventing anything.
- Wrong options must be plausible but clearly contradicted by or absent from the material.`;
  if (mode === "quiz") {
    return `You are a study-quiz generator. Based ONLY on the attached learning material, create up to ${count} challenging multiple-choice questions that test understanding of its key ideas.

${grounding}

Respond with ONLY valid JSON — no markdown fences, no preamble. Use this exact shape:
{"questions":[{"q":"question text","options":["opt1","opt2","opt3","opt4"],"correct":0,"evidence":"verbatim quote from the material","explanations":["why option 1 is right or wrong","why option 2 is right or wrong","why option 3 is right or wrong","why option 4 is right or wrong"]}]}

Rules: "correct" is the 0-based index of the right option. Each explanation is one short sentence (max 15 words) that refers only to what the material says — for the correct option say why it is correct per the material, for wrong options say why they are wrong per the material. Vary the position of the correct answer. Keep everything concise so the JSON stays small.${avoidBlock}`;
  }
  return `You are a flashcard generator. Based ONLY on the attached learning material, create up to ${count} flashcards covering its most important concepts.

${grounding}

Respond with ONLY valid JSON — no markdown fences, no preamble. Use this exact shape:
{"cards":[{"front":"a question or term","back":"the correct answer","evidence":"verbatim quote from the material","explanation":"one short sentence on why this is the answer, per the material"}]}

Rules: fronts are questions or terms, backs are concise correct answers drawn only from the material, explanations max 15 words. Keep everything concise so the JSON stays small.${avoidBlock}`;
}

// Questions per API call — kept small so each JSON response (with evidence quotes) fits safely
const BATCH_SIZE = { quiz: 5, cards: 7 };

// Normalize text for evidence verification: lowercase, strip punctuation, collapse spaces
function normalize(s) {
  return (s || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

// Check that an evidence quote is really present in the document text.
// Accepts exact normalized containment, or ≥70% of its meaningful words appearing
// in the document (tolerates minor quote drift while catching invented facts).
function evidenceInText(evidence, normalizedDoc) {
  const ev = normalize(evidence);
  if (!ev) return false;
  if (normalizedDoc.includes(ev)) return true;
  const words = ev.split(" ").filter(w => w.length > 3);
  if (!words.length) return false;
  const hits = words.filter(w => normalizedDoc.includes(w)).length;
  return hits / words.length >= 0.7;
}

async function prepareSource(file) {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const b64 = await fileToBase64(file);
    return { kind: "pdf", b64 };
  }
  const buf = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
  const text = (value || "").trim();
  if (!text) throw new Error("No readable text was found in this Word document.");
  return { kind: "text", text: text.slice(0, MAX_TEXT) };
}

async function generateBatch(source, mode, batchCount, avoid) {
  const promptText = buildPrompt(mode, batchCount, avoid);
  const userContent = source.kind === "pdf"
    ? [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: source.b64 } },
        { type: "text", text: promptText },
      ]
    : [{ type: "text", text: `LEARNING MATERIAL:\n"""\n${source.text}\n"""\n\n${promptText}` }];

  // Call the API with one automatic retry on transient failures (rate limit / overload).
  // NOTE: only the documented params (model, max_tokens, messages) are sent — the
  // artifact platform's auth bridge can reject requests carrying extra parameters.
  let response;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: userContent }],
        }),
      });
    } catch (networkErr) {
      if (attempt === 0) { await new Promise(r => setTimeout(r, 2500)); continue; }
      throw new Error("Network error — check your internet connection and try again.");
    }
    if (response.ok) break;
    const retryable = response.status === 429 || response.status >= 500;
    if (retryable && attempt === 0) {
      await new Promise(r => setTimeout(r, 2500));
      continue;
    }
    if (!retryable) break; // 4xx errors won't succeed on retry — fail fast
  }
  if (!response.ok) {
    let detail = "";
    try {
      const errBody = await response.json();
      detail = errBody?.error?.message || "";
    } catch { /* non-JSON error body */ }
    if (response.status === 429) {
      throw new Error("You've hit your Claude usage limit for now. Wait a little while, then try again — or generate a smaller set.");
    }
    if (response.status === 413) {
      throw new Error("This document is too large to process. Try a smaller file or split it into parts.");
    }
    throw new Error(`Generation failed (HTTP ${response.status}${detail ? `: ${detail}` : ""}). Please try again.`);
  }
  const data = await response.json();
  const raw = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
  const clean = raw.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) return [];
  let parsed;
  try { parsed = JSON.parse(clean.slice(start, end + 1)); } catch { return []; }

  if (mode === "quiz") {
    return (parsed.questions || []).filter(
      q => q && q.q && Array.isArray(q.options) && q.options.length === 4 &&
        Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4 &&
        Array.isArray(q.explanations) && q.explanations.length === 4 &&
        typeof q.evidence === "string" && q.evidence.trim().length > 0
    );
  }
  return (parsed.cards || []).filter(
    c => c && c.front && c.back &&
      typeof c.evidence === "string" && c.evidence.trim().length > 0
  );
}

async function generateFromDocument(file, mode, count, onProgress) {
  const source = await prepareSource(file);
  const batchSize = BATCH_SIZE[mode];
  const items = [];
  const seen = new Set();
  const totalBatches = Math.ceil(count / batchSize);
  let emptyStreak = 0;
  // Normalize the document text once (used to verify evidence quotes per batch)
  const normalizedDoc = source.kind === "text" ? normalize(source.text) : null;

  for (let b = 0; b < totalBatches && items.length < count; b++) {
    const need = Math.min(batchSize, count - items.length);
    if (onProgress) onProgress(items.length, count);
    const avoid = items.slice(-24).map(it => (mode === "quiz" ? it.q : it.front));
    let batch = [];
    try { batch = await generateBatch(source, mode, need, avoid); } catch (e) {
      if (items.length === 0) throw e; // fail loudly only if nothing generated yet
    }

    // Grounding check: for text sources, drop any item whose evidence quote
    // can't actually be found in the uploaded document.
    if (normalizedDoc) {
      batch = batch.filter(it => evidenceInText(it.evidence, normalizedDoc));
    }

    let added = 0;
    for (const it of batch) {
      const key = (mode === "quiz" ? it.q : it.front).toLowerCase().replace(/\s+/g, " ").trim();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(it);
      added++;
      if (items.length >= count) break;
    }
    emptyStreak = added === 0 ? emptyStreak + 1 : 0;
    if (emptyStreak >= 2) break; // material exhausted or repeated failures — stop gracefully
  }

  if (!items.length) throw new Error("No valid questions could be generated from this document. Please try again.");
  if (onProgress) onProgress(items.length, count);
  return items;
}

/* ------------------------------- UI ------------------------------- */

export default function LearnLift() {
  const [stage, setStage] = useState("setup"); // setup | loading | quiz | cards | results
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("quiz");
  const [count, setCount] = useState(5);
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);       // quiz: chosen option index
  const [flipped, setFlipped] = useState(false);    // flashcards
  const [record, setRecord] = useState([]);         // per-item outcome
  const [error, setError] = useState("");
  const [dragOn, setDragOn] = useState(false);
  const [genProgress, setGenProgress] = useState({ done: 0, total: 0 });
  const [shortfall, setShortfall] = useState(false);
  const [backArmed, setBackArmed] = useState(false);   // two-tap confirm for the back button
  const backTimer = useRef(null);
  const inputRef = useRef(null);

  // Back to the landing page mid-session. First tap arms the button (so an
  // accidental tap can't wipe progress); second tap within 3s confirms.
  const handleBack = () => {
    if (!backArmed) {
      setBackArmed(true);
      clearTimeout(backTimer.current);
      backTimer.current = setTimeout(() => setBackArmed(false), 3000);
      return;
    }
    clearTimeout(backTimer.current);
    setBackArmed(false);
    setItems([]); setIdx(0); setPicked(null); setFlipped(false);
    setRecord([]); setShortfall(false);
    setStage("setup"); // file stays selected so settings can be tweaked and regenerated
  };

  const reset = () => {
    setStage("setup"); setItems([]); setIdx(0); setPicked(null);
    setFlipped(false); setRecord([]); setError("");
  };

  const acceptFile = (f) => {
    if (!f) return;
    const name = f.name.toLowerCase();
    const okPdf = f.type === "application/pdf" || name.endsWith(".pdf");
    const okDocx = name.endsWith(".docx");
    if (!okPdf && !okDocx) { setError("Please upload a PDF (.pdf) or Word document (.docx)."); return; }
    if (name.endsWith(".doc")) { setError("Legacy .doc files aren't supported — please save as .docx."); return; }
    if (f.size > 20 * 1024 * 1024) {
      setError("This file is larger than 20 MB, which can be slow or unstable on phones. Try a smaller file, or split the document into parts.");
      return;
    }
    setError(""); setFile(f);
  };

  const start = useCallback(async () => {
    if (!file) return;
    setStage("loading"); setError(""); setShortfall(false);
    setGenProgress({ done: 0, total: count });
    try {
      const generated = await generateFromDocument(file, mode, count,
        (done, total) => setGenProgress({ done, total }));
      setItems(generated); setIdx(0); setPicked(null); setFlipped(false); setRecord([]);
      setShortfall(generated.length < count);
      setStage(mode === "quiz" ? "quiz" : "cards");
    } catch (e) {
      setError(e.message || "Something went wrong while generating. Please try again.");
      setStage("setup");
    }
  }, [file, mode, count]);

  const advance = (outcome) => {
    const nextRecord = [...record, outcome];
    setRecord(nextRecord);
    if (idx + 1 >= items.length) { setStage("results"); return; }
    setIdx(idx + 1); setPicked(null); setFlipped(false);
  };

  const score = record.filter(r => r.correct).length;
  const pct = items.length ? Math.round((score / items.length) * 100) : 0;

  return (
    <div className="qd-root">
      <style>{styles}</style>
      <div className="qd-shell">
        <div className="brand">
          <svg className="bfly" aria-hidden="true" width="26" height="22" viewBox="-42 -36 84 63" xmlns="http://www.w3.org/2000/svg">
            <path d="M-2,-16 C-3,-24 -7,-29 -12,-32" stroke="#4a2c52" strokeWidth="2.6" fill="none" strokeLinecap="round"/>
            <path d="M2,-16 C3,-24 7,-29 12,-32" stroke="#4a2c52" strokeWidth="2.6" fill="none" strokeLinecap="round"/>
            <circle cx="-12" cy="-32" r="2.4" fill="#4a2c52"/><circle cx="12" cy="-32" r="2.4" fill="#4a2c52"/>
            <path d="M-3,-3 C-5,-16 -12,-28 -22,-30 C-32,-32 -38,-24 -36,-15 C-34,-5 -24,2 -12,3 C-6,3.5 -3,1 -3,-3 Z" fill="#e8552e" stroke="#4a2c52" strokeWidth="4.5" strokeLinejoin="round"/>
            <path d="M3,-3 C5,-16 12,-28 22,-30 C32,-32 38,-24 36,-15 C34,-5 24,2 12,3 C6,3.5 3,1 3,-3 Z" fill="#e8552e" stroke="#4a2c52" strokeWidth="4.5" strokeLinejoin="round"/>
            <path d="M-8,-6 C-10,-15 -15,-23 -22,-25 C-28,-26 -31,-21 -29,-15 C-27,-9 -20,-4 -13,-3 C-9,-2.6 -8,-4 -8,-6 Z" fill="#f5833f"/>
            <path d="M8,-6 C10,-15 15,-23 22,-25 C28,-26 31,-21 29,-15 C27,-9 20,-4 13,-3 C9,-2.6 8,-4 8,-6 Z" fill="#f5833f"/>
            <path d="M-3,5 C-6,15 -13,23 -21,23 C-28,23 -31,16 -28,10 C-25,4 -14,2 -6,5 C-4,5.8 -3,5 -3,5 Z" fill="#5b3766" stroke="#4a2c52" strokeWidth="4" strokeLinejoin="round"/>
            <path d="M3,5 C6,15 13,23 21,23 C28,23 31,16 28,10 C25,4 14,2 6,5 C4,5.8 3,5 3,5 Z" fill="#5b3766" stroke="#4a2c52" strokeWidth="4" strokeLinejoin="round"/>
            <circle cx="-18" cy="13" r="5.6" fill="#f3e8d8"/><circle cx="-18" cy="13" r="2.6" fill="#4a2c52"/>
            <circle cx="18" cy="13" r="5.6" fill="#f3e8d8"/><circle cx="18" cy="13" r="2.6" fill="#4a2c52"/>
            <circle cx="-27" cy="-20" r="2.8" fill="#f3e8d8" opacity="0.9"/><circle cx="27" cy="-20" r="2.8" fill="#f3e8d8" opacity="0.9"/>
            <ellipse cx="0" cy="-1" rx="4" ry="15" fill="#4a2c52"/><circle cx="0" cy="-15" r="4.2" fill="#4a2c52"/>
          </svg>
          LearnLift
          <small>Study smarter</small>
        </div>

        {stage === "setup" && (
          <>
            <span className="qd-eyebrow">Your PDF or Word file → quiz · flashcards</span>
            <h1 className="qd-title">Turn your reading<br />into a test you can pass.</h1>
            <p className="qd-sub">Upload your learning material and get an auto-generated quiz or flashcard deck. Every question is drawn strictly from your document and cites the passage it came from — with explanations for right and wrong answers, and your score at the end.</p>

            <div
              className={`drop ${dragOn ? "on" : ""}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOn(true); }}
              onDragLeave={() => setDragOn(false)}
              onDrop={(e) => { e.preventDefault(); setDragOn(false); acceptFile(e.dataTransfer.files?.[0]); }}
              role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
            >
              <b>Drop your file here</b> or click to browse
              <small>Accepts .pdf and .docx</small>
              <input ref={inputRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style={{ display: "none" }}
                onChange={(e) => acceptFile(e.target.files?.[0])} />
            </div>

            {file && (
              <div className="filechip">
                📄 {file.name}
                <button aria-label="Remove file" onClick={() => setFile(null)}>✕</button>
              </div>
            )}

            <div className="controls">
              <div>
                <span className="ctl-label">Study mode</span>
                <div className="seg">
                  <button className={mode === "quiz" ? "sel" : ""} onClick={() => setMode("quiz")}>Quiz</button>
                  <button className={mode === "cards" ? "sel" : ""} onClick={() => setMode("cards")}>Flashcards</button>
                </div>
              </div>
              <div>
                <span className="ctl-label">{mode === "quiz" ? "Questions" : "Cards"}</span>
                <div className="seg">
                  {[5, 10, 15, 20, 30].map(n => (
                    <button key={n} className={count === n ? "sel" : ""} onClick={() => setCount(n)}>{n}</button>
                  ))}
                </div>
              </div>
            </div>

            {error && <div className="err">{error}</div>}

            <button className="go" disabled={!file} onClick={start}>
              Generate {mode === "quiz" ? "quiz" : "flashcards"}
            </button>
          </>
        )}

        {stage === "loading" && (
          <div className="loading">
            <div className="pulse-card" />
            <p>
              Reading your material and writing {mode === "quiz" ? "questions" : "cards"}…<br />
              {genProgress.done > 0
                ? `${genProgress.done} of ${genProgress.total} ready`
                : "Warming up"} — larger sets are built in batches, so 30 can take a few minutes.
            </p>
            <div className="bar" style={{ maxWidth: 320, margin: "18px auto 0" }}>
              <i style={{ width: `${genProgress.total ? (genProgress.done / genProgress.total) * 100 : 0}%` }} />
            </div>
          </div>
        )}

        {stage === "quiz" && items[idx] && (() => {
          const q = items[idx];
          const answered = picked !== null;
          const isRight = answered && picked === q.correct;
          return (
            <>
              <div className="meta">
                <span className="meta-left">
                  <button className={`backbtn ${backArmed ? "armed" : ""}`} onClick={handleBack}>
                    {backArmed ? "Tap again to exit" : "← Back"}
                  </button>
                  QUESTION {idx + 1} / {items.length}
                </span>
                <span>SCORE {score}</span>
              </div>
              <div className="bar"><i style={{ width: `${(idx / items.length) * 100}%` }} /></div>
              {shortfall && idx === 0 && (
                <div className="notice">This document had enough distinct material for {items.length} unique questions, so your set was trimmed to avoid repeats.</div>
              )}

              <div className="card ruled card-pad">
                <p className="q-text">{q.q}</p>
                <div className="opts">
                  {q.options.map((opt, i) => {
                    let cls = "opt";
                    if (answered) {
                      if (i === q.correct) cls += " correct";
                      else if (i === picked) cls += " wrong";
                      else cls += " dim";
                    }
                    return (
                      <button key={i} className={cls} disabled={answered} onClick={() => setPicked(i)}>
                        <span className="key">{LETTERS[i]}</span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {answered && (
                  <div className={`verdict ${isRight ? "good" : "bad"}`}>
                    <span className="vt">{isRight ? "✓ Correct" : "✗ Incorrect"}</span>
                    {!isRight && (
                      <>Your answer ({LETTERS[picked]}) is wrong: {q.explanations[picked]}<br /><br /></>
                    )}
                    The correct answer is <b>{LETTERS[q.correct]}</b>: {q.explanations[q.correct]}
                    {q.evidence && (
                      <div className="evidence">📖 From your material: “{q.evidence}”</div>
                    )}
                  </div>
                )}

                {answered && (
                  <div className="nextrow">
                    <button className="go" onClick={() => advance({
                      correct: isRight, q: q.q,
                      pickedText: q.options[picked], correctText: q.options[q.correct],
                    })}>
                      {idx + 1 === items.length ? "See my score" : "Next question"}
                    </button>
                  </div>
                )}
              </div>
            </>
          );
        })()}

        {stage === "cards" && items[idx] && (() => {
          const c = items[idx];
          return (
            <>
              <div className="meta">
                <span className="meta-left">
                  <button className={`backbtn ${backArmed ? "armed" : ""}`} onClick={handleBack}>
                    {backArmed ? "Tap again to exit" : "← Back"}
                  </button>
                  CARD {idx + 1} / {items.length}
                </span>
                <span>KNOWN {score}</span>
              </div>
              <div className="bar"><i style={{ width: `${(idx / items.length) * 100}%` }} /></div>
              {shortfall && idx === 0 && (
                <div className="notice">This document had enough distinct material for {items.length} unique cards, so your set was trimmed to avoid repeats.</div>
              )}

              <div className="flip-stage">
                <div
                  className={`flip ${flipped ? "flipped" : ""}`}
                  onClick={() => setFlipped(f => !f)}
                  role="button" tabIndex={0} aria-label="Flip flashcard"
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFlipped(f => !f); }}
                >
                  <div className="face card ruled card-pad">
                    <span className="fc-label">Prompt</span>
                    <p className="fc-front-text">{c.front}</p>
                    <span className="hint">Tap to reveal answer</span>
                  </div>
                  <div className="face back card ruled card-pad">
                    <span className="fc-label">Answer</span>
                    <p className="fc-back-text">{c.back}</p>
                    {c.explanation && <p className="fc-expl"><b>Why:</b> {c.explanation}</p>}
                    {c.evidence && <p className="fc-expl evidence-inline">📖 From your material: “{c.evidence}”</p>}
                    <span className="hint">Tap to flip back</span>
                  </div>
                </div>
              </div>

              {flipped && (
                <div className="selfmark">
                  <button className="sm-miss" onClick={() => advance({ correct: false, q: c.front, correctText: c.back })}>
                    ✗ I missed it
                  </button>
                  <button className="sm-got" onClick={() => advance({ correct: true, q: c.front, correctText: c.back })}>
                    ✓ I knew it
                  </button>
                </div>
              )}
            </>
          );
        })()}

        {stage === "results" && (
          <>
            <span className="qd-eyebrow">Session complete</span>
            <div className="card" style={{ marginTop: 14 }}>
              <div className="score-hero">
                <div className="score-num">{score}<small> / {items.length}</small></div>
                <div className="score-line">
                  {pct}% · {pct === 100 ? "Perfect — you own this material." :
                    pct >= 70 ? "Strong grasp — review the misses below." :
                    pct >= 40 ? "Getting there — worth another pass." :
                    "Tough round — reread and try again."}
                </div>
              </div>
            </div>

            <div className="review">
              {record.map((r, i) => (
                <div key={i} className="rev-item">
                  <div className="rq">
                    <span className={`tag ${r.correct ? "g" : "b"}`}>{r.correct ? "Correct" : "Missed"}</span>
                    {i + 1}. {r.q}
                  </div>
                  <div className="ra">
                    {!r.correct && r.pickedText && <>You picked: {r.pickedText}<br /></>}
                    Answer: <b>{r.correctText}</b>
                  </div>
                </div>
              ))}
            </div>

            <div className="again-row">
              <button className="go" onClick={() => {
                setIdx(0); setPicked(null); setFlipped(false); setRecord([]);
                setStage(mode === "quiz" ? "quiz" : "cards");
              }}>Retake this set</button>
              <button className="ghost" onClick={reset}>Upload a new document</button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
