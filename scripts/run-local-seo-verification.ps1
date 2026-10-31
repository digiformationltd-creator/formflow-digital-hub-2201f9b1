$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$previousDirectory = Get-Location
function Run-Checked([string]$Log, [string[]]$ToolArgs) {
  & node @ToolArgs *> $Log
  if ($LASTEXITCODE -ne 0) { throw "Verification failed: $Log (exit $LASTEXITCODE)" }
}
try {
  Set-Location -LiteralPath $projectRoot
  node scripts/sync-sitemap.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Sitemap sync failed' }
  node scripts/verification-source-stamp.mjs --begin
  Run-Checked 'audit/phase-03/typecheck-current.log' @('node_modules/typescript/bin/tsc','--project','tsconfig.app.json','--noEmit')
  Run-Checked 'audit/phase-03/typecheck-node.log' @('node_modules/typescript/bin/tsc','--project','tsconfig.node.json','--noEmit')
  Run-Checked 'audit/phase-03/lint-command.log' @('node_modules/eslint/bin/eslint.js','.','--format','json','--output-file','audit/phase-03/eslint-current.json')
  Run-Checked 'audit/phase-03/frontend-lint-command.log' @('node_modules/eslint/bin/eslint.js','src','--format','json','--output-file','audit/phase-03/eslint-src-current.json')
  Run-Checked 'audit/phase-03/unit-command.log' @('node_modules/vitest/vitest.mjs','run','--reporter=json','--outputFile=audit/phase-03/vitest-current.json')
  Run-Checked 'audit/phase-03/security-current.log' @('scripts/security-regression.mjs')
  Run-Checked 'audit/phase-03/backend-types-current.log' @('scripts/backend-contract-types.mjs')
  npm.cmd run build *> audit/phase-03/build-current.log
  if ($LASTEXITCODE -ne 0) { throw 'Build failed' }
  Run-Checked 'audit/phase-03/four-mode-current.log' @('scripts/seo-stage-04-audit.mjs')
  Run-Checked 'audit/phase-03/technical-current.log' @('scripts/phase06-technical.mjs')
  Run-Checked 'audit/phase-03/on-page-current.log' @('scripts/phase07-on-page.mjs')
  Run-Checked 'audit/phase-03/schema-current.log' @('scripts/phase08-schema-inventory.mjs')
  Run-Checked 'audit/phase-03/international-current.log' @('scripts/phase09-international.mjs')
  Run-Checked 'audit/phase-03/heading-current.log' @('scripts/phase07-heading-regression.mjs')
  Run-Checked 'audit/phase-03/services-current.log' @('scripts/phase11-service-audit.mjs')
  Run-Checked 'audit/phase-03/service-cta-current.log' @('scripts/phase11-cta-regression.mjs')
  Run-Checked 'audit/phase-03/blog-current.log' @('scripts/phase12-blog-inventory.mjs')
  Run-Checked 'audit/phase-03/blog-heading-current.log' @('scripts/phase07-heading-regression.mjs','--blogs')
  Run-Checked 'audit/phase-03/trust-current.log' @('scripts/phase13-trust-audit.mjs')
  Run-Checked 'audit/phase-03/topical-current.log' @('scripts/phase14-topical-audit.mjs')
  Run-Checked 'audit/phase-03/topic-journeys-current.log' @('scripts/phase14-topic-journeys.mjs')
  Run-Checked 'audit/phase-03/market-decisions-current.log' @('scripts/phase15-market-decisions.mjs')
  Run-Checked 'audit/phase-03/answer-current.log' @('scripts/phase16-answer-audit.mjs')
  Run-Checked 'audit/phase-03/faq-dom-current.log' @('scripts/phase16-faq-regression.mjs')
  node scripts/verification-source-stamp.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Source changed during verification' }
} finally { Set-Location -LiteralPath $previousDirectory.Path }
