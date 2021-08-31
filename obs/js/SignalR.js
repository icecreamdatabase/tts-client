"use strict"

/**
 * @typedef {object} TtsRequest
 * @property {string} messageId
 * @property {number} maxMessageTimeSeconds
 * @property {TtsIndividualSynthesize[]} ttsIndividualSynthesizes
 */

/**
 * @typedef {object} TtsIndividualSynthesize
 * @property {string} voiceDataWavBase64
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
      ? 'https://localhost:5001/TtsHub'
      : 'https://api.icdb.dev/TtsHub'

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.connectionUrl}?roomId=${this.main.roomId}`)//, {accessTokenFactory: () => this.main.roomId})
      .configureLogging(signalR.LogLevel.Critical)
      .build()

    this.connection.onclose(() => this.Start())

    this.connection.on("TtsPlayRequest", this.OnTtsPlayRequest.bind(this))
    this.connection.on("TtsSkipCurrent", this.OnTtsSkipCurrentRequest.bind(this))
    this.connection.on("ConnId", this.OnConnID.bind(this))
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

  OnConnID (connID) {
    this.connID = connID
    console.log("ConnID:", this.connID)
  }

  ConfirmTtsFullyPlayed (messageId) {
    this.connection.invoke("ConfirmTtsFullyPlayed", messageId)
    console.log("Confirming tts fully played: " + messageId)
  }

  ConfirmTtsSkipped (messageId) {
    this.connection.invoke("ConfirmTtsSkipped", messageId)
    console.log("Confirming tts fully played: " + messageId)
  }
}






