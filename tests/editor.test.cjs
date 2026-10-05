const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../dist/app.js'),'utf8');
const ctx=vm.createContext({document:{execCommand:()=>false},edited(){},syncScroll(){}});
vm.runInContext(source.slice(source.indexOf('const lineStart='),source.indexOf('function remember()')),ctx);
function editor(value,start,end=start,direction='none'){
 return {value,selectionStart:start,selectionEnd:end,selectionDirection:direction,scrollTop:20,scrollLeft:9,
 setSelectionRange(s,e,d='none'){this.selectionStart=s;this.selectionEnd=e;this.selectionDirection=d},
 setRangeText(t,s,e){this.value=this.value.slice(0,s)+t+this.value.slice(e)}};
}
for(const [text,s,e] of [['    print(1)',7,7],['x=1\ny=2\nz=3',0,8],['    x=1\n\n    y=2',2,17],['# old\nx=1',0,9],['\tprint(1)',3,3],['',0,0]]){
 const a=editor(text,s,Math.min(e,text.length),'backward');const original=[a.selectionStart,a.selectionEnd];
 ctx.toggleComment(a);assert.notEqual(a.value,text);assert.equal(a.scrollTop,20);assert.equal(a.scrollLeft,9);
 ctx.toggleComment(a);assert.equal(a.value,text);assert.deepEqual([a.selectionStart,a.selectionEnd],original);
 assert.equal(a.selectionDirection,'backward');
}
let a=editor('x=1\ny=2\nz=3',0,4);ctx.toggleComment(a);assert.equal(a.value,'# x=1\ny=2\nz=3');
a=editor('  #x\n  # y',0,11);ctx.toggleComment(a);assert.equal(a.value,'  x\n  y');
a=editor('   \n  ',0,6);ctx.toggleComment(a);assert.equal(a.value,'   \n  ');
console.log('Comment toggle: caret, multiline, selection boundary, indentation, mixed comments, blank lines, direction, scroll PASS');
