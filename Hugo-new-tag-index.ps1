$ScriptPath = Split-Path -Parent $Script:MyInvocation.MyCommand.Path
cd $ScriptPath/dhstories-website
$FileName = Read-Host -prompt "Enter tag name"
$FileName = $FileName -replace '\s','-'
hugo new tags/$FileName/_index.md -k "index"
& Start notepad++ content/tags/$FileName/_index.md
cmd /c pause