$ScriptPath = Split-Path -Parent $Script:MyInvocation.MyCommand.Path
cd $ScriptPath/dtravislee-website
$FileName = Read-Host -prompt "Enter filename"
$FileName = $FileName -replace '\s','-'
hugo new other/$FileName.md
& Start notepad++ content/posts/$FileName.md
cmd /c pause
