$ScriptPath = Split-Path -Parent $Script:MyInvocation.MyCommand.Path
cd $ScriptPath/dtravislee-website
../Hugo/hugo.exe server -w --disableFastRender --gc --minify
cmd /c pause