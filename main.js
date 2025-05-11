class Game {
    constructor(canvas, context) {
        this.canvas = canvas,
        this.ctx = context,
        this.width = this.canvas.width
        this.height = this.canvas.height
        this.baseHeight = 720
        this.backround = new Backround(this)
        this.player = new Player(this)
        this.audio = new AudioControl()
        this.obstacles = []
        this.numberOfObstacle = 5
        this.resize(window.innerWidth, window.innerHeight)
        this.ratio = this.height / this.baseHeight
        this.gravity
        this.speed
        this.minSpeed
        this.maxSpeed
        this.score
        this.gameOver
        this.timer
        this.message1
        this.message2
        this.eventTimer = 0
        this.eventInterval = 150
        this.eventUpdate = false
        this.debug = false
        this.touchStartX,
        this.swipeDistance = 50

        window.addEventListener('resize', e => {
            this.resize(e.currentTarget.innerWidth, e.target.innerHeight)
        })

        // mouse control
        canvas.addEventListener('mousedown', e => {
            this.player.flap()
        })
        // keyboard control
        document.addEventListener('keydown', e => {
            if (e.key === ' ' || e.key === 'Enter') {
                this.player.flap()
            }
            if (e.key === 'Shift' || e.key === 'c') {
                this.player.startCharge()
            }
            if (e.key === 'r') {
                console.log('reload')
                location.reload()
            }
            if (e.key === 'd') {
                this.debug = !this.debug
            }
        })
        // touch control
        this.canvas.addEventListener('touchstart', e => {
            this.player.flap()
            this.touchStartX = e.changedTouches[0].pageX
            if(this.gameOver){
                location.reload()
            }
        })

        this.canvas.addEventListener('touchmove', e => {
            if (e.changedTouches[0].pageX - this.touchStartX > this.swipeDistance) {
                this.player.startCharge()
            }
        })
    }

    resize(width, height) {
        this.canvas.width = width
        this.canvas.height = height
        this.ctx.font = '20px Bungee'
        this.ctx.textAlign = 'right'
        this.ctx.lineWidth = 3
        this.ctx.strokeStyle = 'white'
        this.width = this.canvas.width
        this.height = this.canvas.height
        this.ratio = this.height / this.baseHeight
        this.gravity = 0.15 * this.ratio
        this.speed = 3 * this.ratio
        this.minSpeed = this.speed
        this.maxSpeed = this.speed * 5
        console.log(this.ratio)
        this.player.resize()
        this.backround.resize()
        this.createObstacle()
        this.obstacles.forEach(obstacle => {
            obstacle.resize()
        })
        this.score = 0
        this.gameOver = false
        this.timer = 0
        this.highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0
    }


    createObstacle() {
        this.obstacles = []
        const firstX = this.baseHeight * this.ratio
        const obstacleSpacing = 600 * this.ratio
        for (let i = 0; i < this.numberOfObstacle; i++) {
            this.obstacles.push(new Obstacle(this, firstX + i * obstacleSpacing))
        }
    }

    addObstacle() {
        const lastObstacle = this.obstacles[this.obstacles.length - 1]
        const obstacleSpacing = 600 * this.ratio
        const newX = lastObstacle ? lastObstacle.x + obstacleSpacing : this.baseHeight * this.ratio
        this.obstacles.push(new Obstacle(this, newX))
    }

    render(deltaTime) {
        if (!this.gameOver) this.timer += deltaTime || 0
        this.handlePeriodicEvents(deltaTime)
        this.backround.update()
        this.backround.draw()
        this.player.update()
        this.player.draw()
        this.obstacles.forEach(obstacle => {
            obstacle.update()
            obstacle.draw()
        })
        this.drawStatusText()

        // Add new obstacle if last obstacle is approaching certain position
        if (!this.gameOver) {
            const lastObstacle = this.obstacles[this.obstacles.length - 1]
            // if (lastObstacle && lastObstacle.x < this.width - 600 * this.ratio) {
            //     this.addObstacle()
            // }
        }
    }

    checkCollision(a, b) {
        const dx = a.collisionX - b.collisionX
        const dy = a.collisionY - b.collisionY
        const distance = Math.hypot(dx, dy)
        const sumOfRadii = a.collisionRadius + b.collisionRadius
        return distance <= sumOfRadii
    }

    formatTimer() {
        return (this.timer * 0.001).toFixed(1)
    }

    handlePeriodicEvents(deltaTime) {
        if (this.eventTimer < this.eventInterval) {
            this.eventTimer += deltaTime
            this.eventUpdate = false
        } else {
            this.eventTimer = this.eventTimer % this.eventInterval
            this.eventUpdate = true
        }

    }

    drawStatusText() {
        this.ctx.save()
        this.ctx.fillText('Score : ' + this.score, this.width - 10, 30)
        this.ctx.fillText('High Score : ' + this.highScore, this.width - 10, 60)
        this.ctx.textAlign = 'left'
        this.ctx.fillText('Timer : ' + this.formatTimer(), 10, 30)
        if (this.gameOver) {
            if (this.score < this.highScore) {
                this.message1 = 'Game Over'
                this.message2 = 'cuma bisa dapet score ' + this.score + '?'
                this.audio.playLose()
            } else if (this.score > this.highScore) {
                this.message1 = 'New Score'
                this.message2 = 'selamat kamu berhasil mendapatkan score ' + this.score + ' 👏👏'
                this.highScore = this.score
                this.audio.playWin()
                localStorage.setItem('highScore', this.highScore)
            }
            this.ctx.textAlign = 'center'
            this.ctx.font = '50px Bungee'
            this.ctx.fillText(this.message1, this.width * 0.5, this.height * 0.5 - 40)
            this.ctx.font = '20px Bungee'
            this.ctx.fillText(this.message2, this.width * 0.5, this.height * 0.5 - 20)
            this.ctx.font = '15px Bungee'
            this.ctx.fillText('ketuk dimana saja atau tekan "r" untuk mulai ulang', this.width * 0.5, this.height * 0.5)
        }

        if (this.player.energy <= 20) this.ctx.fillStyle = 'red'
        if (this.player.energy >= this.player.maxEnergy) this.ctx.fillStyle = 'orange'
        for (let i = 0; i < this.player.energy; i++) {
            this.ctx.fillRect(10, this.height - 10 - this.player.barSize * i, this.player.barSize * 5, this.player.barSize)

        }
        this.ctx.restore()
    }
}


window.addEventListener('load', function () {

    const canvas = document.getElementById('myCanvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 720
    canvas.height = 720

    const game = new Game(canvas, ctx)

    let lastTime = 0
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime
        lastTime = timeStamp
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        game.render(deltaTime)
        requestAnimationFrame(animate)
    }
    animate()
})
