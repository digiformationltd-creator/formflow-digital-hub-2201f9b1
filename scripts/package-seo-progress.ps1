$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$desktopPath = [Environment]::GetFolderPath('Desktop')
$reportRoot = Join-Path $desktopPath 'Digi SCO रिपोर्ट'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$destination = Join-Path $reportRoot "Progress-$stamp"
$zipPath = "$destination.zip"
New-Item -ItemType Directory -Path $destination -Force | Out-Null
# Explicit report folders only. No .env, source checkpoints, dependencies or customer exports.
$folders = @('audit/phase-02', 'audit/phase-03', 'audit/phase-06', 'audits/phase-05', 'reports/seo-stage-04', 'reports/seo07', 'reports/schema', 'reports/seo/stage-09', 'reports/seo/stage-10', 'reports/seo/prompt-11', 'reports/seo/stage-12', 'reports/seo/stage-13', 'reports/seo/phase-14')
$allowed = @('.md', '.csv', '.json', '.png', '.log')
foreach ($folder in $folders) {
  $source = Join-Path $projectRoot $folder
  if (!(Test-Path -LiteralPath $source)) { continue }
  foreach ($file in Get-ChildItem -LiteralPath $source -File -Recurse) {
    if ($file.Extension -notin $allowed) { continue }
    $relative = [IO.Path]::GetRelativePath($projectRoot, $file.FullName)
    $target = Join-Path $destination $relative
    New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force | Out-Null
    Copy-Item -LiteralPath $file.FullName -Destination $target
  }
}
foreach ($name in @('STATUS.json', 'STAGE_STATUS.csv', 'CODE_CHANGE_MANIFEST.csv', 'CURRENT_RESULTS.md', 'PROGRESS.md', 'LIVE_STATUS_25_OCTOBER.md', 'LIVE_RENDERING_FINDING.md', 'EDITORIAL_REVIEW_STANDARD.md')) {
  Copy-Item -LiteralPath (Join-Path $projectRoot "SEO_TRANSFORMATION/$name") -Destination (Join-Path $destination $name)
}
$sourceChanges = Import-Csv -LiteralPath (Join-Path $projectRoot 'SEO_TRANSFORMATION/CODE_CHANGE_MANIFEST.csv')
foreach ($change in $sourceChanges) {
  $sourceFile = [IO.Path]::GetFullPath((Join-Path $projectRoot $change.file))
  if (!$sourceFile.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid source manifest path' }
  if ([IO.Path]::GetFileName($sourceFile) -like '.env*') { throw 'Environment file excluded' }
  $sourceText = [IO.File]::ReadAllText($sourceFile)
  if ($sourceText -match '(?s)-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bAKIA[A-Z0-9]{16}\b|\bsk_live_[A-Za-z0-9]{16,}') { throw "Potential credential in source file; not packaged: $($change.file)" }
  $target = Join-Path $destination ('changed-source/' + $change.file)
  New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force | Out-Null
  Copy-Item -LiteralPath $sourceFile -Destination $target
  if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant() -ne $change.sha256) { throw "Source changed during packaging: $($change.file)" }
}
@'
# DigiFormation — local progress evidence

This is an IN-PROGRESS report package, not a completed 24-stage delivery or a production release.
Read CURRENT_RESULTS.md and STATUS.json first. Evidence dates are inside individual files; older baseline logs are deliberately retained.
Changed-source contains current files differing from the checkpoint, including preserved external user commits and earlier dirty work; these are not all attributed to this agent. This is a partial source snapshot, not a complete runnable project. Review/merge per file; never overwrite an existing checkout wholesale. CODE_CHANGE_MANIFEST records hashes and checkpoint comparisons.
Source checkpoints, .env, dependencies, customer exports and build output are excluded. The basic credential-pattern gate is not a complete secret-hygiene certification.
Native Deno/PostgreSQL integration, real analytics, live deployment, field CWV and qualified claims review remain open. Offline mocks are not database integration proof.
The original 23 October audit folder and ZIP are preserved.
'@ | Set-Content -LiteralPath (Join-Path $destination 'READ_ME_FIRST.md') -Encoding utf8
$manifest = @(Get-ChildItem -LiteralPath $destination -File -Recurse | ForEach-Object {
  [PSCustomObject]@{ path = [IO.Path]::GetRelativePath($destination, $_.FullName).Replace('\','/'); bytes = $_.Length; sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant() }
})
$manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $destination 'PACKAGE_MANIFEST.json') -Encoding utf8
Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::CreateFromDirectory($destination, $zipPath, [IO.Compression.CompressionLevel]::Optimal, $false)
$archive = [IO.Compression.ZipFile]::OpenRead($zipPath)
try {
  foreach ($item in $manifest) {
    $entry = $archive.GetEntry($item.path)
    if (!$entry) { throw "Missing ZIP entry: $($item.path)" }
    $stream = $entry.Open()
    $hasher = [Security.Cryptography.SHA256]::Create()
    try { $actual = [Convert]::ToHexString($hasher.ComputeHash($stream)).ToLowerInvariant() }
    finally { $stream.Dispose(); $hasher.Dispose() }
    if ($actual -ne $item.sha256) { throw "ZIP hash mismatch: $($item.path)" }
  }
} finally { $archive.Dispose() }
$result = [PSCustomObject]@{ folder = $destination; zip = $zipPath; verifiedFiles = $manifest.Count; bytes = (Get-Item -LiteralPath $zipPath).Length; sha256 = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant(); status = 'IN PROGRESS — NOT DEPLOYED' }
$result | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $projectRoot 'SEO_TRANSFORMATION/LATEST_DESKTOP_PACKAGE.json') -Encoding utf8
$result | ConvertTo-Json
