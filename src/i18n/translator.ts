import { EN, EN_PATTERNS } from "@/i18n/en";
import type { Lang } from "@/i18n/lang";

/**
 * Translation layer: the app is written in Italian; in English mode every text on screen
 * (and the placeholder, aria-label, title and alt attributes) is looked up in the EN
 * dictionary and replaced. React keeps rendering Italian; a MutationObserver translates
 * each change before the browser paints it. Text without an English entry stays Italian.
 *
 * To translate a new text: add `"Italian text": "English text"` to src/i18n/en.ts.
 * Texts with a changing part (a number, a name) go in EN_PATTERNS.
 */

const ATTRS = ["placeholder", "aria-label", "title", "alt"] as const;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "NOSCRIPT"]);

/** Dictionary lookup that also accepts lowercase use of a capitalised entry ("vegetariana" -> "vegetarian") */
function lookup(core: string): string | undefined {
  if (EN[core] !== undefined) return EN[core];
  const cap = core.charAt(0).toUpperCase() + core.slice(1);
  if (cap !== core && EN[cap] !== undefined) return EN[cap].charAt(0).toLowerCase() + EN[cap].slice(1);
  return undefined;
}

/** English for the trimmed text, or undefined. Patterns use {1} for a captured part and {t1} for it translated. */
function translateCore(core: string): string | undefined {
  const direct = lookup(core);
  if (direct !== undefined) return direct;
  for (const [re, en] of EN_PATTERNS) {
    const m = core.match(re);
    if (m) return en.replace(/\{(t?)(\d)\}/g, (_, t: string, i: string) => (t ? translateCore(m[+i]) ?? m[+i] : m[+i]));
  }
  // lists such as "4 × 150 g · Latticini e formaggi" or "−10% extra su carne · −5% extra su pesce"
  if (core.includes(" · ")) {
    const parts = core.split(" · ");
    const out = parts.map((p) => translateCore(p) ?? p);
    if (out.some((p, i) => p !== parts[i])) return out.join(" · ");
  }
  return undefined;
}

/** English for one Italian text (keeps surrounding spaces); the text itself if there is none */
export function translate(text: string): string {
  const core = text.trim();
  if (!core) return text;
  const out = translateCore(core);
  if (out === undefined) return text;
  const start = text.indexOf(core);
  return text.slice(0, start) + out + text.slice(start + core.length);
}

/** Italian original and the English we wrote, per text node / attribute */
type Memo = { orig: string; written: string };
const textMemo = new WeakMap<Text, Memo>();
const attrMemo = new WeakMap<Element, Partial<Record<(typeof ATTRS)[number], Memo>>>();

let lang: Lang = "it";
let observer: MutationObserver | null = null;

function skip(node: Node) {
  for (let el = node.parentElement; el; el = el.parentElement) {
    if (SKIP_TAGS.has(el.tagName) || el.hasAttribute("data-no-translate")) return true;
  }
  return false;
}

function doText(node: Text) {
  const value = node.nodeValue ?? "";
  const memo = textMemo.get(node);
  // our own write coming back through the observer
  const orig = memo && value === memo.written ? memo.orig : value;
  if (skip(node)) return;
  const next = lang === "en" ? translate(orig) : orig;
  textMemo.set(node, { orig, written: next });
  if (next !== value) node.nodeValue = next;
}

function doAttrs(el: Element) {
  const memos = attrMemo.get(el) ?? {};
  for (const a of ATTRS) {
    const value = el.getAttribute(a);
    if (value === null) continue;
    const memo = memos[a];
    const orig = memo && value === memo.written ? memo.orig : value;
    const next = lang === "en" ? translate(orig) : orig;
    memos[a] = { orig, written: next };
    if (next !== value) el.setAttribute(a, next);
  }
  attrMemo.set(el, memos);
}

function walk(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) return doText(root as Text);
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const el = root as Element;
  if (SKIP_TAGS.has(el.tagName)) return;
  doAttrs(el);
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    if (n.nodeType === Node.TEXT_NODE) doText(n as Text);
    else doAttrs(n as Element);
  }
}

/** Starts translating the page (call once, after React has rendered) and sets the language */
export function applyLanguage(next: Lang) {
  lang = next;
  document.documentElement.lang = next;
  if (!observer) {
    observer = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "characterData") doText(r.target as Text);
        else if (r.type === "attributes") doAttrs(r.target as Element);
        else r.addedNodes.forEach(walk);
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRS],
    });
  }
  walk(document.body);
}
