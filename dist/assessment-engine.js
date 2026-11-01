/* Original IL MASTRO assessment primitives. No official marking equivalence implied. */
(function (root) {
  'use strict';
  const normalize = value => String(value ?? '').normalize('NFKC').trim();
  function amount(value, decimals = 0) {
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 4) throw Error('Invalid decimal precision');
    const s = normalize(value);
    if (s.length > 40) return null;
    // Units belong to a labelled field, never silently rescale a learner's answer.
    if (!/^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s)) return null;
    const plain = s.replaceAll(',', ''), parts = plain.replace(/^[+-]/, '').split('.');
    if ((parts[1] || '').length > decimals) return null;
    const digits = parts[0] + (parts[1] || '').padEnd(decimals, '0');
    const scaled = BigInt(digits) * (plain.startsWith('-') ? -1n : 1n);
    return scaled <= BigInt(Number.MAX_SAFE_INTEGER) && scaled >= BigInt(Number.MIN_SAFE_INTEGER) ? Number(scaled) : null;
  }
  function points(n) { if (!Number.isSafeInteger(n) || n <= 0) throw Error('Points must be positive integers'); return n; }
  function account(value, aliases = {}) {
    const s = normalize(value).replace(/\s/g, '');
    return Object.hasOwn(aliases, s) ? aliases[s] : s;
  }
  function journalTotals(lines, decimals, aliases) {
    if (!Array.isArray(lines) || !lines.length || lines.length > 100) return { valid: false, totals: {}, debit: 0, credit: 0 };
    const totals = Object.create(null), duplicates = new Set(); let debit = 0, credit = 0;
    for (const line of lines) {
      if (!line || typeof line !== 'object') return { valid: false, totals: {}, debit: 0, credit: 0 };
      const a = account(line.account, aliases), n = amount(line.amount, decimals);
      if (!['debit', 'credit'].includes(line.side) || !a || n === null || n <= 0) return { valid: false, totals: {}, debit: 0, credit: 0 };
      const key = JSON.stringify([line.side, a]); if (Object.hasOwn(totals,key)) duplicates.add(key); totals[key] = (totals[key] || 0) + n;
      if (!Number.isSafeInteger(totals[key])) return { valid: false, totals: {}, debit: 0, credit: 0 };
      if (line.side === 'debit') debit += n; else credit += n;
    }
    return { valid: Number.isSafeInteger(debit) && Number.isSafeInteger(credit), totals, debit, credit, duplicates: [...duplicates] };
  }
  function gradeJournal(spec, response) {
    if (!['learning','cbt'].includes(spec.inputMode ?? 'learning')) throw Error('Unknown assessment input mode');
    const decimals = spec.decimals ?? 0, aliases = spec.aliases || {};
    if (!Array.isArray(spec.lines) || !spec.lines.length) throw Error('Missing journal rubric');
    const expected = journalTotals(spec.lines, decimals, aliases);
    if (!expected.valid || expected.debit !== expected.credit || expected.debit === 0) throw Error('Unbalanced journal rubric');
    const keys = new Set(), rubric = spec.lines.map(line => {
      const key = JSON.stringify([line.side, account(line.account, aliases)]);
      if (keys.has(key)) throw Error('Duplicate rubric account; combine amounts'); keys.add(key);
      return { key, max: points(line.points), expected: expected.totals[key] };
    });
    const submitted = journalTotals(response, decimals, aliases);
    const components = rubric.map(r => ({ key: r.key, max: r.max, earned: submitted.valid && submitted.totals[r.key] === r.expected ? r.max : 0 }));
    const extras = Object.keys(submitted.totals).filter(k => !keys.has(k));
    const duplicateAccounts = submitted.duplicates || [], duplicateFailure = spec.inputMode === 'cbt' && duplicateAccounts.length > 0;
    const max = components.reduce((n,c) => n+c.max,0);
    if (!Number.isSafeInteger(max)) throw Error('Rubric point total overflow');
    // Extra entries cannot receive a full score by preserving every expected line.
    for (const component of components) { component.matchedPoints = component.earned; if (extras.length || duplicateFailure) component.earned = 0; }
    const earned = components.reduce((n,c) => n+c.earned,0);
    return { valid: submitted.valid, earned, max, correct: earned === max && submitted.debit === submitted.credit,
      balanced: submitted.valid && submitted.debit === submitted.credit, extraEntries: extras.length, duplicateAccounts, warnings: duplicateAccounts.length && !duplicateFailure ? ['同じ側の同一勘定を合算して学習用に採点しました。日商のネット試験では同一側の重複科目は不正解になるため、1行にまとめてください。'] : [], reason: !submitted.valid ? 'incomplete-or-invalid' : extras.length ? 'unexpected-journal-entries' : duplicateFailure ? 'duplicate-journal-accounts' : null, components };
  }
  function gradeFields(spec, response) {
    if (!['learning','cbt'].includes(spec.inputMode ?? 'learning')) throw Error('Unknown assessment input mode');
    if (!Array.isArray(spec.fields) || !spec.fields.length) throw Error('Missing field rubric');
    const seen = new Set();
    const components = spec.fields.map(f => {
      if (!f.id || seen.has(f.id)) throw Error('Duplicate or missing field ID'); seen.add(f.id);
      const max = points(f.points), raw = response?.[f.id]; let valid = false, correct = false;
      if (f.type === 'amount') {
        const expected = amount(f.answer, f.decimals ?? 0); if (expected === null) throw Error('Invalid amount rubric');
        const n = amount(raw, f.decimals ?? 0); valid = n !== null; correct = valid && n === expected;
      } else if (f.type === 'choice') {
        if (!Array.isArray(f.options) || !f.options.length || f.options.some(o => typeof o !== 'string' || !o.trim()) || new Set(f.options).size !== f.options.length || !f.options.includes(f.answer)) throw Error('Invalid choice rubric');
        valid = f.options.includes(raw); correct = valid && raw === f.answer;
      } else throw Error('Unsupported field type');
      return { id: f.id, valid, max, earned: correct ? max : 0 };
    });
    const max = components.reduce((n,c)=>n+c.max,0), earned = components.reduce((n,c)=>n+c.earned,0);
    if (!Number.isSafeInteger(max)) throw Error('Rubric point total overflow');
    return { valid: components.every(c=>c.valid), earned, max, correct: earned === max, components };
  }
  const api = Object.freeze({ amount, gradeJournal, gradeFields });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ILMastroAssessment = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
