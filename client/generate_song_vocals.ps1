Add-Type -AssemblyName System.Speech

function MakeVocalTrack {
    param(
        [string]$text,
        [string]$outputFile,
        [int]$rate = 0,
        [string]$voice = "Microsoft David Desktop"
    )
    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
    $synth.SelectVoice($voice)
    $synth.Rate = $rate
    $synth.SetOutputToWaveFile($outputFile)
    $synth.Speak($text)
    $synth.Dispose()
    Write-Host "Created: $outputFile"
}

$audioDir = "d:\void-hunter\client\public\audio\temp_vocals"
if (-not (Test-Path $audioDir)) {
    New-Item -ItemType Directory -Path $audioDir | Out-Null
}

MakeVocalTrack "System online. Void Hunters, prepare for combat." "$audioDir\v_intro.wav" 1 "Microsoft David Desktop"
MakeVocalTrack "Into the endless dark we fly! Stars ignite across the sky!" "$audioDir\v_verse1.wav" 1 "Microsoft David Desktop"
MakeVocalTrack "Void Hunters rise, our spirits bold! A galactic legend now unfolds!" "$audioDir\v_verse2.wav" 1 "Microsoft David Desktop"
MakeVocalTrack "Feel the power in your veins! Break the gravity, break the chains!" "$audioDir\v_prechorus.wav" 2 "Microsoft David Desktop"
MakeVocalTrack "Feel the thunder! Feel the flame! Write our victory in their name!" "$audioDir\v_chorus1.wav" 2 "Microsoft David Desktop"
MakeVocalTrack "Space warriors, never surrender! We are the Void Hunter!" "$audioDir\v_chorus2.wav" 2 "Microsoft David Desktop"
MakeVocalTrack "Target locked. Full laser overdrive! All wings engage!" "$audioDir\v_bridge.wav" 2 "Microsoft David Desktop"
MakeVocalTrack "Victory is ours. The galaxy belongs to Void Hunters!" "$audioDir\v_outro.wav" 1 "Microsoft David Desktop"

Write-Host "Full song vocal phrases generated!"
