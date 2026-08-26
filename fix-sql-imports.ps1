$files = @(
  "src\app\(dashboard)\attendance\page.tsx",
  "src\app\(dashboard)\departments\page.tsx",
  "src\app\(dashboard)\departments\choir\page.tsx",
  "src\app\(dashboard)\departments\pastoral\page.tsx",
  "src\app\(dashboard)\members\page.tsx",
  "src\app\(dashboard)\members\new\page.tsx",
  "src\app\(dashboard)\members\[id]\page.tsx"
)

foreach ($f in $files) {
  (Get-Content $f) |
    Where-Object { $_ -notmatch "^import postgres from 'postgres'" -and $_ -notmatch "const sql = postgres\(process\.env\.DATABASE_URL" } |
    ForEach-Object {
      $_
      if ($_ -match "^import Link from 'next/link'") { "import { sql } from '@/lib/db'" }
    } |
    Set-Content $f
}

Write-Host "Done. Now check each file's top imports look right."