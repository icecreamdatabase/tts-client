"use strict"

class SignalR {
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

    //this.Start().then()
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
    console.log("Receive:")
    console.log(ttsRequest)
  }

  OnReceivedConnID (connID) {
    this.connID = connID
    console.log("ConnID: " + this.connID)
    //this.connection.invoke("Register", this.main.roomId)
    //console.log("SendMessage Invoked, on ID: " + this.connID)
  }
}






