import Phaser from 'phaser'
import { HeartTarget } from './prefabs/heart'

export class BaseScene extends Phaser.Scene {
	constructor(config: Phaser.Types.Scenes.SettingsConfig) {
		super(config)
		console.log('built')
	}

	preload() {
		HeartTarget.preload(this)
	}

	targetsPool = []
	targetsMax = ((window?.innerWidth * window?.innerHeight) / (64 * 64) / 2) || 50
	targetsInsertedAt = 0
	targetsToInsertRation = 0.7

	score = 0
	scoreEl = document ? document.getElementById('score') : null

	getRandomCoordInside = () => {
		const x = Phaser.Math.RND.integerInRange(64, this.game.canvas.width - 64)
		const y = Phaser.Math.RND.integerInRange(-this.offscreenOffset, this.game.canvas.height / 3)

		return [x, y]
	}

	addTarget() {
		const [x, y] = this.getRandomCoordInside()
		const uuid = Phaser.Math.RND.uuid()
		const target = new HeartTarget(this, { x, y })

		target.on('destroy', () => {
			const index = this.targetsPool.findIndex(({ uuid: tUUID }) => tUUID === uuid)
			this.targetsPool.splice(index, 1)
			if (this.scoreEl) this.scoreEl.innerText = (++this.score).toString()
		})

		this.targetsPool.push({ uuid, target })
	}

	repositionTarget(target: HeartTarget) {
		const [x, y] = this.getRandomCoordInside()

		target.x = x
		target.y = y
		target.refreshDirection()
	}

	create() {
		this.cameras.cameras?.[0].setBackgroundColor('011D27')

		for (let i = 0; i < this.targetsMax; i++) {
			this.addTarget()
		}
	}

	tryRefillTargets(time) {
		if (this.targetsInsertedAt > time - 1e3) return false

		if (this.targetsPool.length >= this.targetsMax) return false

		const targetsToAdd = Math.floor(
			(this.targetsMax - this.targetsPool.length) * this.targetsToInsertRation
		)
		if (targetsToAdd === 0) return false

		for (let i = 0; i < targetsToAdd; i++) {
			this.addTarget()
		}
	}

	offscreenOffset = 128
	moveTargets() {
		const poolCopy = [...this.targetsPool]

		poolCopy.forEach(({ target }) => {
			target.move()
			if (
				target.x > this.game.canvas.width + this.offscreenOffset ||
				target.y > this.game.canvas.height + this.offscreenOffset ||
				target.x < -this.offscreenOffset ||
				target.y < -this.offscreenOffset
			)
				this.repositionTarget(target)
		})
	}

	update(time) {
		this.moveTargets()
		this.tryRefillTargets(time)
	}
}
