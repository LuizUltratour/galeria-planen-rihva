<#
  generate_thumbs.ps1 — Gerador de thumbnails (Windows, sem dependencias).
  Usa System.Drawing (GDI+). Espelha assets\ em assets\thumbs\ como JPEG.

  - Max 900px no maior lado, JPEG qualidade 82.
  - Achata sobre fundo branco (seguro para PNG de plantas com transparencia).
  - Ignora as pastas thumbs\ e videos\ e o BOOK-PRINT.pdf.

  Uso:
    ./generate_thumbs.ps1          # gera apenas os que faltam / desatualizados
    ./generate_thumbs.ps1 -Force   # regenera todos
#>
param([switch]$Force)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$assets    = Join-Path $PSScriptRoot 'assets'
$thumbRoot = Join-Path $assets 'thumbs'
$MAX = 900.0
$Q   = 82

$jpgEnc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Q)

$imgs = Get-ChildItem -LiteralPath $assets -Recurse -File |
        Where-Object { $_.Extension -match '(?i)\.(jpe?g|png)$' -and
                       $_.FullName -notmatch '\\thumbs\\' -and $_.FullName -notmatch '\\videos\\' }

$made = 0; $skip = 0; $totalOrig = 0.0; $totalThumb = 0.0
foreach ($f in $imgs) {
  $rel = $f.FullName.Substring($assets.Length).TrimStart('\')   # ex: Plantas\corporativo\subsolo.png
  $relLower = $rel.ToLower()
  $relJpg = [System.IO.Path]::ChangeExtension($relLower, '.jpg')
  $dest = Join-Path $thumbRoot $relJpg
  $destDir = Split-Path $dest -Parent
  if (-not (Test-Path -LiteralPath $destDir)) { New-Item -ItemType Directory -Force -Path $destDir | Out-Null }

  if (-not $Force -and (Test-Path -LiteralPath $dest) -and ((Get-Item -LiteralPath $dest).LastWriteTime -ge $f.LastWriteTime)) { $skip++; continue }

  try {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    $scale = [Math]::Min($MAX/$img.Width, $MAX/$img.Height)
    if ($scale -gt 1) { $scale = 1 }
    $w = [int]($img.Width*$scale); $h = [int]($img.Height*$scale)
    $bmp = New-Object System.Drawing.Bitmap($w,$h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::White)               # achata transparencia sobre branco
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($img, 0, 0, $w, $h)
    $bmp.Save($dest, $jpgEnc, $encParams)
    $g.Dispose(); $bmp.Dispose(); $img.Dispose()
    $totalOrig  += $f.Length
    $totalThumb += (Get-Item -LiteralPath $dest).Length
    $made++
    Write-Host ("  {0}  ->  {1} KB" -f $relJpg, [Math]::Round((Get-Item -LiteralPath $dest).Length/1KB))
  } catch {
    Write-Host "ERRO em $rel : $($_.Exception.Message)" -ForegroundColor Red
  }
}
Write-Host ("Gerados: {0} | Pulados: {1}" -f $made, $skip) -ForegroundColor Green
if ($made -gt 0) {
  Write-Host ("Origem somada: {0} MB  ->  Thumbs: {1} MB" -f [Math]::Round($totalOrig/1MB,1), [Math]::Round($totalThumb/1MB,1)) -ForegroundColor Cyan
}