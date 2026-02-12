let audioCtx: AudioContext | null = null
let turnMusic: HTMLAudioElement | null = null

export const useGameEvents = () => {
  const initAudio = () => {
    if (import.meta.server) return
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    if (!turnMusic) {
      turnMusic = new Audio("/sounds/game.mp3")
      turnMusic.preload = "auto"
    }
  }

  const playTurnMusic = () => {
    initAudio()
    if (turnMusic) {
      turnMusic.currentTime = 0
      turnMusic.play().catch(e => console.warn("Music play blocked", e))
    }
  }

  const stopTurnMusic = () => {
    if (turnMusic) {
      turnMusic.pause()
      turnMusic.currentTime = 0
    }
  }

  const vibrate = (pattern: number | number[]) => {
    if (import.meta.client && window.navigator?.vibrate) {
      window.navigator.vibrate(pattern)
    }
  }

  return {
    playTurnMusic,
    stopTurnMusic,
    vibrate
  }
}
