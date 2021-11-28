import { BaseScene } from './app'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'game-container',
	width: window.innerWidth,
	height: window.innerHeight - 64,
	scene: BaseScene,
}

Array.from(document.querySelector<HTMLDivElement>('#game-container').children).forEach((el) =>
	el.parentElement.removeChild(el)
)
const game = new Phaser.Game(config)
