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
  allWeeks: [1,2,3].map(id=>({id})),
  state: {week: 3, day: 3, task: 1, positions: {}, codes: {w2d4_2: 'answer'}, passed: {w2d4_1: {at: 'today'}}},
  readLearned: () => JSON.parse(store.get('ioai-learned') || '{}'),
  readNotesPos: () => JSON.parse(store.get('ioai-notes-pos') || '{}'),
});
vm.runInContext(helpers.slice(helpers.indexOf('\n')), context);
const plain = value => JSON.parse(JSON.stringify(value));
store.set('ioai-scratch-w2d4', 'print("my experiment")');
store.set('ioai-scratch-w1d1', '');
store.set('ioai-scratch-w3d7', 'week three draft');
store.set('ioai-learned', JSON.stringify({w2d4: '2026-09-30T00:00:00Z'}));
store.set('ioai-notes-pos', JSON.stringify({'2-4': [3, 0.5], '3-7':[2,0.25]}));
const backup = plain(context.buildBackup());
assert.equal(backup.browser.scratch.w2d4, 'print("my experiment")');
assert.equal(backup.browser.scratch.w1d1, '');
assert.equal(backup.browser.scratch.w3d7, 'week three draft');
assert.equal(backup.schemaVersion,3);
assert.equal(backup.codes.w2d4_2, 'answer');
assert.deepEqual(backup.positions['3'], {day: 3, task: 1});
store.clear();
store.set('unrelated-app-key', 'keep');
context.restoreBrowserBackup(backup.browser);
assert.deepEqual(plain(context.browserBackup()), backup.browser);
assert.equal(store.get('unrelated-app-key'), 'keep');
const cleaned = plain(context.cleanBrowserBackup({scratch: {w4d1: 'bad', w1d1: 'x'.repeat(40001)}, notesPos: {'2-4': [2, 3]}}));
assert.deepEqual(cleaned, {scratch: {}, learned: {}, notesPos: {}});
// Legacy backups still import; absent browser fields clear stale reading state.
context.restoreBrowserBackup(undefined);
assert.deepEqual(plain(context.browserBackup()), {scratch: {}, learned: {}, notesPos: {}});
assert.equal(store.get('unrelated-app-key'), 'keep');
console.log('Backup round trip, empty drafts, current position, legacy import, and validation: PASS');

// Import old and new course progress without dropping answers.
context.allWeeks=[1,2,3].map(id=>({id,days:[{tasks:[{id:id===1?'d1_1':`w${id}d1_1`}]}]}));
vm.runInContext(source.slice(source.indexOf('function validateState('),source.indexOf("$('restore').onclick")),context);
const migrated=plain(context.validateState({schemaVersion:2,week:2,codes:{d1_1:'a',w2d1_1:'b'},positions:{'1':{day:6,task:2}}}));
assert.equal(migrated.schemaVersion,3);assert.equal(migrated.week,2);assert.deepEqual(migrated.codes,{d1_1:'a',w2d1_1:'b'});
const current=plain(context.validateState({schemaVersion:3,week:3,codes:{w3d1_1:'c'},positions:{'3':{day:4,task:1}}}));
assert.equal(current.week,3);assert.equal(current.codes.w3d1_1,'c');assert.deepEqual(current.positions['3'],{day:4,task:1});
console.log('Legacy and three-week progress import PASS');
