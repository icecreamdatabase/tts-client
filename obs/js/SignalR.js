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

    this.connectionUrl = "http://localhost:5000/TtsHub"
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.connectionUrl, {accessTokenFactory: () => this.main.roomId})
      .build()

    this.connection.onclose(() => this.Start())

    this.connection.on("ReceiveTtsRequest", this.OnReceiveTtsRequest.bind(this))
    this.connection.on("ReceiveConnID", this.OnReceivedConnID.bind(this))
  }

  async Start () {
    console.log("Trying to connect")
    try {
      await this.connection.start()
      console.assert(this.connection.state === signalR.HubConnectionState.Connected)
      console.log("SignalR Connected.")
    } catch (err) {
      console.assert(this.connection.state === signalR.HubConnectionState.Disconnected)
      console.log(err)
      setTimeout(() => this.Start(), 2000)
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






