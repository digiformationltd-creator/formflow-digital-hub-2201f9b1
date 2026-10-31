// Strict semantic check for pure decoders only. Not a Deno/endpoint compile.
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './seo-runtime.mjs';
const entries = ['email-template-data.ts', 'order-agent-request.ts'].map(name => path.join(ROOT, 'supabase/functions/_shared', name));
const program = ts.createProgram(entries, { noEmit: true, strict: true, skipLibCheck: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, allowImportingTsExtensions: true, types: [] });
const diagnostics = ts.getPreEmitDiagnostics(program).map(d => ({ file: d.file ? path.relative(ROOT, d.file.fileName).replaceAll('\\','/') : '', line: d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start).line + 1 : null, code: d.code, message: ts.flattenDiagnosticMessageText(d.messageText, '\n') }));
const contractErrors = diagnostics.filter(d => /(?:email-template-data|order-agent-request)\.ts$/.test(d.file));
const environmentGaps = diagnostics.filter(d => d.file.endsWith('request-security.ts') && [2304,2307].includes(d.code));
const unexpected = diagnostics.filter(d => !contractErrors.includes(d) && !environmentGaps.includes(d));
const result = { at: new Date().toISOString(), scope: 'Node TypeScript strict semantic check of two pure data decoders; imported Deno/SDK resolution gaps explicitly retained', contractErrors, unexpected, environmentGaps, nativeDenoStatus: 'NOT TESTED', endpointCompile: 'NOT TESTED', passedPureContractChecks: !contractErrors.length && !unexpected.length };
fs.writeFileSync(path.join(ROOT, 'audit/phase-03/backend-contract-types.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
if (!result.passedPureContractChecks) process.exitCode = 1;
