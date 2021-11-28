import { Math, Geom, Tweens } from 'phaser'
import heartImg from '../assets/heart-svgrepo-com.svg'
import popSfxOggUrl from 'url:../assets/sfx/221091_1282865-lq.ogg'
import popSfxMp3Url from 'url:../assets/sfx/221091_1282865-lq.mp3'

export class HeartTarget extends Phaser.GameObjects.Sprite {
	// Kinda heart shaped polygon, extracted from layer 2 of svg via
	// JSON.parse(PATH.split(' ').join('],[') + ']]').map(a => a.map(b => b / 8)).reduce((acc, ch) => acc.concat(ch.join(' '), [])).join(' '))
	static polygon = new Geom.Polygon(
		`0 21.8 5.7125 9.225 21.975 5.9625 32 15.0875 44.4 5.35 59.625 10.5375 64.025 21.8 59.625 33.25 32.0125 58.9 5.2 33.9875`
	)

	tweens: {
		onDeath?: Tweens.Timeline
	}
	dieTweenline = this.scene.tweens.timeline({
		tweens: [
			{
				targets: [this],
				scale: 1.2,
				duration: 60,
			},
			{
				targets: [this],
				scale: 0.0,
				duration: 120,
			},
			{
				targets: [this],
				opacity: 0.0,
				duration: 30,
			},
		],
	})

	constructor(scene: Phaser.Scene, { x = 0, y = 0, texture = 'heart' }) {
		super(scene, x, y, texture)

		scene.add.existing(this)

		this.setInteractive(HeartTarget.polygon, Geom.Polygon.Contains)
		this.on('pointerdown', () => {
			this.die()
		})
		this.dieTweenline.pause()
		this.tint = Math.RND.realInRange(0.8, 0.9) * 0xffffff
	}

	isDead = false
	die() {
		if (this.isDead) return console.warn('trying to kill already dead entity')
		this.disableInteractive()

		this.dieTweenline.once(Tweens.Events.TWEEN_COMPLETE, () => {
			this.destroy()
		})

		try {
			this.scene.sound.play('pop')
			this.dieTweenline.play()
		} finally {
			this.isDead = true
		}
	}

	minSpeed = 1
	maxSpeed = 1.5
	direction: [number, number] = this.refreshDirection()
	refreshDirection() {
		return (this.direction = [
			Math.RND.realInRange(-this.maxSpeed, this.maxSpeed),
			Math.RND.realInRange(this.minSpeed, this.maxSpeed),
		])
	}
	move() {
		if (this.isDead) return false

		const [deltaX, deltaY] = this.direction
		this.x += deltaX
		this.y += deltaY
	}

	static preload(scene, width = 64, height = 64) {
		scene.load.svg('heart', heartImg, {
			width,
			height,
		})

		scene.load.audio('pop', [popSfxOggUrl, popSfxMp3Url], {
			instances: 1,
		})
	}
}
