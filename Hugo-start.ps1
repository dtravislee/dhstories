$ScriptPath = Split-Path -Parent $Script:MyInvocation.MyCommand.Path
cd $ScriptPath/dhstories-website
../Hugo/hugo.exe server -w --disableFastRender --gc
cmd /c pause