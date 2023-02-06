"use strict"

class Tts {
  constructor (main) {
    this.main = main

    /**
     *
     * @type {TtsRequest}
     */
    this.activeRequest = undefined
    /**
     *
     * @type {TtsIndividualSynthesize[]}
     */
    this.individualSynthQueue = []

    /**
     *
     * @type {number}
     */
    this.timeoutId = undefined

    /**
     *
     * @type {number[]}
     */
    this.visemeTimeoutIds = []

    this.source = document.getElementById("source")
    this.player = document.getElementById("player")
    this.player.addEventListener("ended", this.onPlayerEnded.bind(this))
  }

  /**
   *
   * @param {TtsRequest} ttsRequest
   */
  playMessage (ttsRequest) {
    this.activeRequest = ttsRequest
    this.individualSynthQueue = ttsRequest.ttsIndividualSynthesizes

    clearTimeout(this.timeoutId)
    this.resetViseme()
    if (this.activeRequest.maxMessageTimeSeconds > 0) {
      this.timeoutId = setTimeout(this.skip.bind(this), this.activeRequest.maxMessageTimeSeconds * 1000)
    }

    this.runIndividualSynthQueue().then()
  }

  async runIndividualSynthQueue () {
    if (this.individualSynthQueue.length > 0) {
      await sleep(50)
      await this.playAudio(this.individualSynthQueue.shift())
      return
    }
    if (this.activeRequest) {
      this.main.SignalR.ConfirmTtsFullyPlayed(this.activeRequest.redemptionId)
      this.activeRequest = undefined
    }
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
    this.player.volume = Math.max(Math.min((ttsIndividualSynthesize.ttsMessagePart.volume || 100.0) / 100.0, 1.0), 0.0)
    this.player.pause()
    await this.player.load()

    for (let speechMark of ttsIndividualSynthesize.speechMarks) {
      if (speechMark.type === "viseme") {
        this.visemeTimeoutIds.push(setTimeout(this.showViseme.bind(this, speechMark), speechMark.time))
      }
    }

    await this.player.play()
    this.player.playbackRate = ttsIndividualSynthesize.ttsMessagePart.playbackRate || 1.0

    console.log(ttsIndividualSynthesize.speechMarks)
  }

  /**
   *
   * @param {SpeechMark} speechMark
   */
  showViseme (speechMark) {
    console.log(`Showing viseme: ${speechMark.value}`)
  }

  resetViseme () {
    this.visemeTimeoutIds.forEach(clearTimeout)
    console.log("Reset viseme ...")
  }

  skip () {
    console.log("Skipping current message ...")
    this.player.pause()
    this.individualSynthQueue = []
    this.resetViseme()
    console.log("skipped")
    if (this.activeRequest) {
      this.main.SignalR.ConfirmTtsSkipped(this.activeRequest.redemptionId)
      this.activeRequest = undefined
    }
    this.player.dispatchEvent(new Event("ended"))
  }
}






