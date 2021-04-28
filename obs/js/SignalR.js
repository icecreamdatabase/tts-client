"use strict"

/**
 * @typedef {object} TtsRequest
 * @property {string} id
 * @property {number} maxMessageTime
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
      .withUrl(this.connectionUrl, {accessTokenFactory: () => this.main.roomId})
      .configureLogging(signalR.LogLevel.Critical)
      .build()

    this.connection.onclose(() => this.Start())

    this.connection.on("ReceiveTtsRequest", this.OnReceiveTtsRequest.bind(this))
    this.connection.on("ReceiveConnID", this.OnReceivedConnID.bind(this))
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

  OnReceiveTtsRequest (ttsRequest) {
    console.log("Receive:", ttsRequest)

    this.main.Tts.playMessage(ttsRequest)
  }

  OnReceivedConnID (connID) {
    this.connID = connID
    console.log("ConnID:", this.connID)
  }

  ConfirmTtsFullyPlayed (id) {
    this.connection.invoke("ConfirmTtsFullyPlayed", id)
    console.log("Confirming tts fully played : " + id)
  }

  ConfirmTtsSkipped (id) {
    this.connection.invoke("ConfirmTtsSkipped", id)
    console.log("Confirming tts fully played : " + id)
  }
}






