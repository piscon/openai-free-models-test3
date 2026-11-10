// Parser test: runs the real deprecations parser against a saved copy of
// OpenAI's official Deprecations page and compares the merged result with
// the seed's verified shutdown data (34 models, 23 with shutdown dates).
//
// Usage:  node test/parse.test.mjs [path-to-deprecations.html]
// Without a file argument, a small built-in fixture is used instead.
import { readFileSync } from 'node:fs';
import { parseDeprecations, mergeShutdowns } from '../src/parse.js';

const seed = JSON.parse(readFileSync(new URL('../data/models.json', import.meta.url), 'utf8'));

let failures = 0;
const check = (cond, msg) => {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + msg);
  if (!cond) failures += 1;
};

// --- dataset integrity ---
const counts = seed.taskGroups.map((g) => g.models.length);
check(JSON.stringify(counts) === '[11,5,4,5,9]', `group counts 11/5/4/5/9 (got ${counts})`);
const all = seed.taskGroups.flatMap((g) => g.models);
check(all.length === 34, `34 models (got ${all.length})`);
check(all.filter((m) => m.isLatest).length === 7, '7 latest flags');
check(all.filter((m) => m.shutdownDate).length === 23, '23 seed shutdown entries');
check(new Set(all.map((m) => m.name)).size === 34, 'model names unique');

// --- parser ---
const fixture = process.argv[2]
  ? readFileSync(process.argv[2], 'utf8')
  : `<table><tbody>
     <tr><td>Dec 11, 2026</td><td><code>gpt-5</code> | <code>gpt-5-2025-08-07</code></td><td><code>gpt-5.6-sol</code></td></tr>
     <tr><td>January 14, 2027</td><td>GPT-4o (<code>gpt-4o-2024-08-06</code>)</td><td><code>gpt-6-luna</code></td></tr>
     </tbody></table>`;
const depMap = parseDeprecations(fixture);
console.log(`parsed ${depMap.size} model ids from deprecations source`);
check(depMap.size >= 2, 'parser extracted entries');

const { data, matched } = mergeShutdowns(seed, depMap);
const merged = Object.fromEntries(
  data.taskGroups.flatMap((g) => g.models).map((m) => [m.name, m]),
);

if (process.argv[2]) {
  // Full-page run: every seed shutdown entry must be reproduced exactly.
  let exact = 0;
  for (const m of all) {
    const got = merged[m.name];
    if ((got.shutdownDate || null) === (m.shutdownDate || null) &&
        (got.replacement || null) === (m.replacement || null)) {
      exact += 1;
    } else {
      console.log(`  diff ${m.name}: seed=${m.shutdownDate}/${m.replacement} parsed=${got.shutdownDate}/${got.replacement}`);
    }
  }
  check(matched === 23, `parser matched all 23 shutdown models (got ${matched})`);
  check(exact === 34, `all 34 models reproduce seed exactly (got ${exact})`);
} else {
  check(merged['gpt-5-2025-08-07'].shutdownDate === '2026-12-11', 'fixture: gpt-5 date');
  check(merged['gpt-4o-2024-08-06'].replacement === 'gpt-6-luna', 'fixture: 4o replacement');
}

console.log(failures === 0 ? '\nALL TESTS PASSED' : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
