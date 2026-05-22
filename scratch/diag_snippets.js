const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'app/components/subscription/SubscriptionCheckoutView.tsx');
const source = fs.readFileSync(file, 'utf8');
const program = ts.createProgram([file], { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ES2020, allowJs: false, esModuleInterop: true, module: ts.ModuleKind.ESNext });
const diagnostics = ts.getPreEmitDiagnostics(program);
const lines = source.split(/\r?\n/);
for (const d of diagnostics) {
  if (!d.file) continue;
  const pos = d.file.getLineAndCharacterOfPosition(d.start);
  const startLine = Math.max(0, pos.line - 3);
  const endLine = Math.min(lines.length - 1, pos.line + 3);
  console.log('DIAG', d.code, 'line', pos.line + 1, 'char', pos.character + 1, ts.flattenDiagnosticMessageText(d.messageText, ' '));
  for (let i = startLine; i <= endLine; i++) {
    console.log(`${i+1}: ${lines[i]}`);
  }
  console.log('----');
}
