$ScriptPath = Split-Path -Parent $Script:MyInvocation.MyCommand.Path
cd $ScriptPath/dtravislee-website
../Hugo/hugo.exe --cleanDestinationDir --minify
echo $ScriptPath/dtravislee-website
cmd /c pause