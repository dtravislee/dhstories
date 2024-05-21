$ScriptPath = Split-Path -Parent $Script:MyInvocation.MyCommand.Path
cd $ScriptPath/dhstories-website
../Hugo/hugo.exe --cleanDestinationDir --minify
echo $ScriptPath/dtravislee-website
cmd /c pause