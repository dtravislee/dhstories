$ScriptPath = Split-Path -Parent $Script:MyInvocation.MyCommand.Path
cd $ScriptPath/dhstories-website
$StyleName = Read-Host -prompt "Enter name of highlighting style to export (see: https://xyproto.github.io/splash/docs/all.html)"
hugo gen chromastyles --style=$StyleName > syntax.css
cmd /c pause