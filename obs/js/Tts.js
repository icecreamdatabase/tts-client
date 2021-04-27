"use strict"

class Tts {
  constructor (main) {
    this.main = main
  }

  /**
   *
   * @param {TtsRequest} ttsRequest
   */
  playMessage (ttsRequest) {
    let audio = ttsRequest.ttsIndividualSynthesizes[0].voiceDataWavBase64
    this.playAudio(audio)
  }

  /**
   *
   * @param {string} voiceDataWavBase64
   */
  playAudio (voiceDataWavBase64) {

    let audioReqStr = "data:audio/wav;base64," + voiceDataWavBase64
    document.getElementById("source").setAttribute("src", audioReqStr)
    let player = document.getElementById("player")
    player.pause()
    player.load()
    player.play()
  }
}






