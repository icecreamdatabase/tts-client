"use strict"

class Tts {
  constructor (main) {
    this.main = main

    /**
     *
     * @type {TtsRequest|null}
     */
    this.activeRequest = null
    /**
     *
     * @type {TtsIndividualSynthesize[]}
     */
    this.individualSynthQueue = []

    this.source = document.getElementById("source")
    this.player = document.getElementById("player")
    this.player.addEventListener("ended", this.onPlayerEnded.bind(this))
  }

  /**
   *
   * @param {TtsRequest} ttsRequest
   */
  playMessage (ttsRequest) {
    if (this.activeRequest != null) {
      console.log("skipped")
      this.main.SignalR.ConfirmTtsSkipped(this.activeRequest.id)
    }
    this.activeRequest = ttsRequest
    this.individualSynthQueue = ttsRequest.ttsIndividualSynthesizes
    //TODO: max message time skipping
    this.runIndividualSynthQueue().then()
  }

  async runIndividualSynthQueue () {
    if (this.individualSynthQueue.length > 0) {
      await sleep(50)
      await this.playAudio(this.individualSynthQueue.shift())
      return
    }
    this.main.SignalR.ConfirmTtsFullyPlayed(this.activeRequest.id)
    this.activeRequest = null
  }

  onPlayerEnded () {
    console.log("Playback ended")
    this.runIndividualSynthQueue().then()
  }

  /**
   *
   * @param {TtsIndividualSynthesize} ttsIndividualSynthesize
   */
  async playAudio (ttsIndividualSynthesize) {
    // if blob failed something must be wrong. Simply skip that element.
    if (!ttsIndividualSynthesize || !ttsIndividualSynthesize.voiceDataWavBase64) {
      this.skip()
      return
    }

    console.log("Playback started")
    let audioWavBase64 = `data:audio/wav;base64,${ttsIndividualSynthesize.voiceDataWavBase64}`
    this.source.setAttribute("src", audioWavBase64)
    this.player.volume = ttsIndividualSynthesize.volume || 1.0
    this.player.pause()
    await this.player.load()
    await this.player.play()
    this.player.playbackRate = ttsIndividualSynthesize.playbackRate || 1.0
  }

  skip () {
    console.log("Skipping current message ...")
    this.player.pause()
    this.player.dispatchEvent(new Event("ended"))
  }
}






