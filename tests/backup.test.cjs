// Test portable backup data without a browser or the learner's real storage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../dist/app.js'), 'utf8');
const helpers = source.split('// Backup helpers:')[1].split('// End backup helpers.')[0];
const store = new Map();
const context = vm.createContext({
  localStorage: {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: key => store.delete(key),
  },
  state: {week: 2, day: 3, task: 1, positions: {}, codes: {w2d4_2: 'answer'}, passed: {w2d4_1: {at: 'today'}}},
  readLearned: () => JSON.parse(store.get('ioai-learned') || '{}'),
  readNotesPos: () => JSON.parse(store.get('ioai-notes-pos') || '{}'),
});
vm.runInContext(helpers.slice(helpers.indexOf('\n')), context);
const plain = value => JSON.parse(JSON.stringify(value));
store.set('ioai-scratch-w2d4', 'print("my experiment")');
store.set('ioai-scratch-w1d1', '');
store.set('ioai-learned', JSON.stringify({w2d4: '2026-09-30T00:00:00Z'}));
store.set('ioai-notes-pos', JSON.stringify({'2-4': [3, 0.5]}));
const backup = plain(context.buildBackup());
assert.equal(backup.browser.scratch.w2d4, 'print("my experiment")');
assert.equal(backup.browser.scratch.w1d1, '');
assert.equal(backup.codes.w2d4_2, 'answer');
assert.deepEqual(backup.positions['2'], {day: 3, task: 1});
store.clear();
store.set('unrelated-app-key', 'keep');
context.restoreBrowserBackup(backup.browser);
assert.deepEqual(plain(context.browserBackup()), backup.browser);
assert.equal(store.get('unrelated-app-key'), 'keep');
const cleaned = plain(context.cleanBrowserBackup({scratch: {w3d1: 'bad', w1d1: 'x'.repeat(40001)}, notesPos: {'2-4': [2, 3]}}));
assert.deepEqual(cleaned, {scratch: {}, learned: {}, notesPos: {}});
// Legacy backups still import; absent browser fields clear stale reading state.
context.restoreBrowserBackup(undefined);
assert.deepEqual(plain(context.browserBackup()), {scratch: {}, learned: {}, notesPos: {}});
assert.equal(store.get('unrelated-app-key'), 'keep');
console.log('Backup round trip, empty drafts, current position, legacy import, and validation: PASS');
