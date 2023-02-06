"use strict"

class Main {
  constructor () {
    this.roomId = findGetParameter("c")

    if (!this.roomId) {
      console.error(`\n\nNo roomId set! Cancelling TTS setup.\n\n`)
      return
    }

    /* ----- BASE ----- */
    this.SignalR = new SignalR(this)
    this.Tts = new Tts(this)

    /* ----- SETUP ----- */
    this.SignalR.Start().then()
  }
}

const main = new Main()
