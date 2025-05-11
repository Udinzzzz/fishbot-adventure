class AudioControl {
    constructor() {
        this.charge = document.getElementById('charge')
        this.win = document.getElementById('win')
        this.lose = document.getElementById('lose')
        this.randomFlap = 1
        this.flap
    }
    
    playFlap(){
        this.randomFlap = Math.ceil(Math.random() * 5)
        this.flap = document.getElementById(`flap${this.randomFlap}`)
        this.flap.play()
    }
    playCharge() {
        this.charge.play()
    }
    playWin() {
        this.win.play()
    }
    playLose() {
        this.lose.play()
    }
}