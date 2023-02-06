"use strict"

/**
 * @typedef {object} ValueObject
 * @property {string} value
 */

/**
 * @typedef {object} SpeechMark
 * @property {number} time
 * @property {string} type
 * @property {?int} start
 * @property {?int} end
 * @property {string} value
 */

/**
 * @typedef {object} TtsMessagePart
 * @property {string} message
 * @property {ValueObject} voiceId
 * @property {ValueObject} engine
 */

/**
 * @typedef {object} TtsRequest
 * @property {string} redemptionId
 * @property {number} maxMessageTimeSeconds
 * @property {TtsIndividualSynthesize[]} ttsIndividualSynthesizes
 */

/**
 * @typedef {object} TtsIndividualSynthesize
 * @property {string} voiceDataWavBase64
 * @property {SpeechMark[]|null} speechMarks
 * @property {TtsMessagePart} ttsMessagePart
 * @property {number} requestCharacters
 * @property {number} playbackRate
 * @property {number} volume
 */

class SignalR {

  /**
   *
   * @param {Main} main
   */
  constructor (main) {
    this.main = main
    this.connID = ""

    this.minRetryDelay = 2000
    this.maxRetryDelay = 30000
    this.retryJitterSpread = 10000
    this.currentRetryDelay = this.minRetryDelay

    this.connectionUrl = findGetParameter("local")
      ? 'https://ttsapitest.icdb.dev/TtsHub'
      : 'https://ttsapi.icdb.dev/TtsHub'

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.connectionUrl}?roomId=${this.main.roomId}`)//, {accessTokenFactory: () => this.main.roomId})
      .configureLogging(signalR.LogLevel.Critical)
      .build()

    this.connection.onclose(() => this.Start())

    this.connection.on("TtsPlayRequest", this.OnTtsPlayRequest.bind(this))
    this.connection.on("TtsSkipCurrent", this.OnTtsSkipCurrentRequest.bind(this))
    this.connection.on("ConnId", this.OnConnID.bind(this))
    this.connection.on("Reload", this.OnReload.bind(this))
  }

  async Start () {
    console.log(`SignalR trying to connect to ${this.connectionUrl}`)
    try {
      await this.connection.start()
      console.assert(this.connection.state === signalR.HubConnectionState.Connected)
      console.log(`SignalR connected to ${this.connectionUrl}`)
      this.currentRetryDelay = this.minRetryDelay
    } catch (err) {
      console.assert(this.connection.state === signalR.HubConnectionState.Disconnected)
      let jitter = Math.floor(Math.random() * this.retryJitterSpread - this.retryJitterSpread / 2)
      this.currentRetryDelay = Math.max(this.minRetryDelay, Math.min(this.maxRetryDelay, this.currentRetryDelay * 2) + jitter)
      console.log(`SignalR couldn't connect to ${this.connectionUrl} \nTrying again in ${this.currentRetryDelay / 1000} s.`)
      setTimeout(() => this.Start(), this.currentRetryDelay)
    }
  }

  OnTtsPlayRequest (ttsRequest) {
    console.log("Receive:", ttsRequest)

    this.main.Tts.playMessage(ttsRequest)
  }

  OnTtsSkipCurrentRequest () {
    console.log("Skipping current.")

    this.main.Tts.skip()
  }

  OnReload () {
    console.log("Reloading...")

    location.reload()
  }

  OnConnID (connID) {
    this.connID = connID
    console.log("ConnID:", this.connID)
  }

  ConfirmTtsFullyPlayed (redemptionId) {
    this.connection.invoke("ConfirmTtsFullyPlayed", redemptionId)
    console.log("Confirming tts fully played: " + redemptionId)
  }

  ConfirmTtsSkipped (redemptionId) {
    this.connection.invoke("ConfirmTtsSkipped", redemptionId)
    console.log("Confirming tts fully played: " + redemptionId)
  }
}






