#!/usr/bin/env node
// defs.jsonl 자리 자리 → glossary.ts 자리 entries 자리 definition 교체
import fs from 'fs';

const ROOT = '/Users/jenghun.suh/projects/semi-handbook/.claude/worktrees/phase-43-ai-definitions';
const JSONL = '/Users/jenghun.suh/.claude/jobs/bfb20354/defs.jsonl';
const TS = `${ROOT}/src/lib/glossary.ts`;

const defs = new Map();
for (const line of fs.readFileSync(JSONL, 'utf-8').split('\n').filter(Boolean)) {
    const obj = JSON.parse(line);
    if (obj.definition) defs.set(`${obj.book}::${obj.term}`, obj.definition);
}
console.error(`${defs.size} definitions loaded`);

const src = fs.readFileSync(TS, 'utf-8');

let replaced = 0;
let missed = 0;
const out = src.replace(
    /(\{ book: '(stats|claude)', term: '([^']+)'(?:, abbr: '[^']+')?, definition: ')([^']*)(', chapters:)/g,
    (full, prefix, book, term, oldDef, suffix) => {
        const key = `${book}::${term}`;
        const newDef = defs.get(key);
        if (!newDef) {
            missed++;
            return full;
        }
        replaced++;
        const escaped = newDef.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `${prefix}${escaped}${suffix}`;
    },
);

fs.writeFileSync(TS, out);
console.error(`replaced=${replaced} missed=${missed}`);
