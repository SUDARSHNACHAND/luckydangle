Set FSO = CreateObject("Scripting.FileSystemObject")
Set WshShell = CreateObject("WScript.Shell")
scriptDir = FSO.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

electronExe = scriptDir & "\node_modules\electron\dist\electron.exe"
mainScript = scriptDir & "\electron\main.cjs"
distOverlay = scriptDir & "\dist\overlay.html"

' If first-time launch setup is needed, run batch setup first
If Not FSO.FileExists(electronExe) Or Not FSO.FileExists(distOverlay) Then
    WshShell.Run "cmd.exe /c """ & scriptDir & "\start-luckydangle.bat""", 1, True
End If

' Launch Electron completely detached in silent background mode (window style 0 = hidden)
If FSO.FileExists(electronExe) Then
    WshShell.Run """" & electronExe & """ """ & mainScript & """", 0, False
Else
    WshShell.Run "cmd.exe /c npx electron """ & mainScript & """", 0, False
End If
