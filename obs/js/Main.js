"use strict"

class Main {
  constructor () {
    this.roomId = findGetParameter("c")

    /* ----- BASE ----- */
    this.SignalR = new SignalR(this)

    /* ----- SETUP ----- */
    this.SignalR.Start().then()
  }
}

const main = new Main()
