"use strict"

class Viseme {

  static lips = {
    'p': 'viseme-media/lips_m.png',
    't': 'viseme-media/lips_c.png',
    'S': 'viseme-media/lips_ch.png',
    'T': 'viseme-media/lips_th.png',
    'f': 'viseme-media/lips_f.png',
    'k': 'viseme-media/lips_c.png',
    'i': 'viseme-media/lips_e.png',
    'r': 'viseme-media/lips_r.png',
    's': 'viseme-media/lips_c.png',
    'u': 'viseme-media/lips_w.png',
    '@': 'viseme-media/lips_u.png',
    'a': 'viseme-media/lips_a.png',
    'e': 'viseme-media/lips_a.png',
    'E': 'viseme-media/lips_u.png',
    'o': 'viseme-media/lips_o.png',
    'O': 'viseme-media/lips_u.png',
    'sil': 'viseme-media/lips_sil.png'
  }

  /**
   *
   * @param {Main} main
   */
  constructor (main) {
    this.main = main

    this.display = document.getElementById("viseme-display")
    this.display.src = ""
    this.hideTimeoutId = undefined
  }

  /**
   *
   * @param {SpeechMark} speechMark
   */
  showViseme (speechMark) {
    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId)
    }
    this.display.src = Viseme.lips[speechMark.value]
  }

  resetViseme () {
    this.display.src = ""
  }

  hideViseme () {
    if (this.display.getAttribute("src") !== "") {
      this.hideTimeoutId = setTimeout(this.resetViseme.bind(this), 500)
    }
  }
}
