param([switch]$Uninstall)
$ErrorActionPreference = 'Stop'
if (!(Test-Path (Join-Path $PSScriptRoot 'dist/patcher.js'))) {
    throw 'Extract the entire ZIP before installing.'
}
$installerDir = Join-Path $PSScriptRoot 'installer'
New-Item -ItemType Directory -Force -Path $installerDir | Out-Null
$installerPath = Join-Path $installerDir 'VencordInstallerCli.exe'
Invoke-WebRequest -UseBasicParsing -Uri 'https://github.com/Vencord/Installer/releases/latest/download/VencordInstallerCli.exe' -OutFile $installerPath
$previousDataDir = $env:VENCORD_USER_DATA_DIR
$previousDevInstall = $env:VENCORD_DEV_INSTALL
try {
    $env:VENCORD_USER_DATA_DIR = $PSScriptRoot
    $env:VENCORD_DEV_INSTALL = '1'
    $action = if ($Uninstall) { '--uninstall' } else { '--install' }
    & $installerPath $action
    if ($LASTEXITCODE -ne 0) { throw "Installer exited with code $LASTEXITCODE" }
    Write-Host 'Done. Restart Discord and enable ConfirmBeforeCall in Vencord settings.'
} finally {
    $env:VENCORD_USER_DATA_DIR = $previousDataDir
    $env:VENCORD_DEV_INSTALL = $previousDevInstall
}
