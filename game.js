let game;
let debugGraphics;

const gameOptions = {
    SamuraiGravity: 800,
    SamuraiSpeed: 300
}
window.onload = function() {
    let config1 = {
        type: Phaser.AUTO,
        parent: 'gameContainer',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1920,
            height: 1080,
        },
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 0
                },
                debug: false
            }
        },
        scene: [Menu, PlayGame, Boss, End]
    }

    game1 = new Phaser.Game(config1)
    window.focus();
}

class Menu extends Phaser.Scene {

    constructor() {
        super({ key: 'Menu' })
    }

    preload() {

        this.load.image('menu-background', 'menu/back-menu.jpg');
        this.load.image('play-text', 'menu/play-game.png');
    }

    create() {
        localStorage.removeItem('nickname')
        this.gameContainer = document.getElementById('gameContainer')
        this.inputField = document.createElement('input');
        this.inputField.id = 'input1'
        this.inputField.type = 'text';
        this.inputField.placeholder = 'Enter Nickname';
        this.inputField.style.position = 'relative';
        this.inputField.style.left = '800px';
        this.inputField.style.top = '-350px';
        this.gameContainer.appendChild(this.inputField);
        this.add.image(0, 0, 'menu-background').setOrigin(0, 0);
        const play_button = this.add.image(500, 650, 'play-text')
        play_button.setInteractive()
        play_button.on('pointerdown',  () => {
            const Nickname =  document.getElementById('input1').value
            localStorage.setItem('nickname', Nickname)
            this.scene.start("PlayGame")

        })
    }


}
class PlayGame extends Phaser.Scene {

    constructor() {
        super("PlayGame")
        this.score = 0;
    }


    preload() {
        const elIn = document.getElementById('input1')
        elIn.remove()
        this.load.image('background', '1/background.jpg');
        this.load.spritesheet("Samurai", "Samurai/Idle.png", {frameWidth: 128, frameHeight: 128})
        this.load.spritesheet("SRight", "Samurai/Run.png",{frameWidth: 128, frameHeight: 128})
        this.load.spritesheet("SLeft", "Samurai/RunBack.png",{frameWidth: 128, frameHeight: 128})
        this.load.spritesheet("JRight", "Samurai/Jump.png",{frameWidth: 128, frameHeight: 128})
        this.load.spritesheet("JLeft", "Samurai/JumpBack.png",{frameWidth: 128, frameHeight: 128})
        this.load.spritesheet("attackR", "Samurai/Attack_1R.png",{frameWidth: 128, frameHeight: 128})
        this.load.spritesheet("attackL", "Samurai/Attack_1L.png",{frameWidth: 128, frameHeight: 128})
        this.load.image('heart', 'heart.png')
        this.load.image('ground', 'tile.png')
        this.load.image('coin', 'coin.png')

        this.load.spritesheet("Ghost", "ghostGold.png", {frameWidth: 231, frameHeight: 312})
    }

    create() {
        const starttime = this.time.now
        localStorage.setItem('time', starttime)
        this.add.image(0, 0, 'background').setOrigin(0, 0);
        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })
        this.enemies = this.physics.add.group({
            allowGravity: false
        })
        this.coinGroup = this.physics.add.group({
        })
        //Add the number of ghost wich will be spawned at the begining, it would not affect continuosly spawning 
        const quant_ghost = 3


        this.hitpointsGroup = this.physics.add.group({
            allowGravity: false
        })
        this.hitpoints1 = this.physics.add.sprite(150, 100, 'heart')
        this.hitpoints1.setScale(0.05, 0.05)
        this.hitpoints2 = this.physics.add.sprite(250, 100, 'heart')
        this.hitpoints2.setScale(0.05, 0.05)
        this.hitpoints3 = this.physics.add.sprite(350, 100, 'heart')
        this.hitpoints3.setScale(0.05, 0.05)
        this.hitpointsGroup.add(this.hitpoints1)
        this.hitpointsGroup.add(this.hitpoints2)
        this.hitpointsGroup.add(this.hitpoints3)




        this.AddGhost(0,quant_ghost,3000)


        this.cursors = this.input.keyboard.createCursorKeys()

        this.Samurai = this.physics.add.sprite(422, 610, "Samurai")
        this.Samurai.body.gravity.y = gameOptions.SamuraiGravity
        this.physics.add.collider(this.Samurai, this.groundGroup)
        this.Samurai.setScale(2, 2)
        this.Samurai.setSize(32, 80)
        this.Samurai.setOffset(48, 48)

        this.scoreText = this.add.text(50, 75, "0", {fontSize: "50px", fill: "#ffffff"})
        this.text1 = this.add.text(450, 75, "0", {fontSize: "45px", fill: "#ffffff"})
        this.text1.setFontStyle('bold')
        this.text1.setText("Cursors to move, A - attack left, D - attack right")
        setTimeout(() => {
            this.text1.destroy()
        },5000)


        this.ground1 = this.physics.add.sprite(960, 900, 'ground');
        this.ground1.setScale(10,0.01)
        this.groundGroup.add(this.ground1)
        this.ground2 = this.physics.add.sprite(422, 810, 'ground');
        this.ground2.setScale(0.55,1)
        this.groundGroup.add(this.ground2)
        this.ground3 = this.physics.add.sprite(0, 540, 'ground');
        this.ground3.setScale(0.01,10)
        this.groundGroup.add(this.ground3)
        this.ground4 = this.physics.add.sprite(1920, 540, 'ground');
        this.ground4.setScale(0.01,10)
        this.groundGroup.add(this.ground4)
        this.physics.add.collider(this.enemies, this.enemies)

        this.attackHitboxR = this.physics.add.sprite(this.Samurai.x+80, this.Samurai.y+40, 'ground')
        this.attackHitboxR.setSize(200,160)
        
        
        this.attackHitboxL = this.physics.add.sprite(this.Samurai.x-80, this.Samurai.y+40, 'ground')
        this.attackHitboxL.setSize(200,160)

        this.SamuraiHitbox = this.physics.add.sprite(this.Samurai.x,this.Samurai.y, 'ground')
        this.SamuraiHitbox.setSize(40,60)
        this.canbeattacked = true
        this.physics.add.collider(this.SamuraiHitbox, this.enemies, () => {
            if(this.canbeattacked) {
                const hits = this.hitpointsGroup.getChildren()
                const lasthit = hits[0]
                this.hitpointsGroup.remove(lasthit,true,true)
                this.canbeattacked = false
            }
            setTimeout(() => {
                this.canbeattacked = true
            },500)


        })
        this.physics.add.overlap(this.Samurai, this.coinGroup, this.collectCoin, null, this)

        this.physics.add.collider(this.coinGroup, this.groundGroup)


        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("SLeft", {start: 7, end: 0}),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: "stay",
            frames: this.anims.generateFrameNumbers("Samurai", {start: 0, end: 5}),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("SRight", {start: 0, end:7 }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: "attackR",
            frames: this.anims.generateFrameNumbers("attackR", {start: 0, end:5 }),
            frameRate: 10,
            repeat: 0
        })
        this.anims.create({
            key: "attackL",
            frames: this.anims.generateFrameNumbers("attackL", {start: 5, end:0 }),
            frameRate: 10,
            repeat: 0
        })
        this.input.keyboard.on('keydown-A', this.AttackL, this)
        this.input.keyboard.on('keydown-D', this.AttackR, this)
        
        this.lastGhostUpdate = 0
        this.score = 0

    }
    AddGhost(index, max, delay) {
        if (index<max && this.score <10) {
            this.ghost = this.physics.add.sprite(960, 540, 'Ghost');
            this.ghost.setScale(0.5, 0.5)
            this.ghost.setSize(115, 156)
            this.ghost.setOffset(48, 48)
            this.enemies.add(this.ghost)

            index++

            setTimeout(() => {
                this.AddGhost(index, max, delay);
              }, delay);
        }
    }
    AddCoin() {
        this.coin = this.physics.add.sprite(100+Math.random()*1820, 0, 'coin')
        this.coinGroup.add(this.coin)
        this.coin.body.gravity.y = gameOptions.SamuraiGravity/5

    }
    AttackL() {
        this.attack = true
        this.enemies.getChildren().forEach(ghost => {
            const overlapL = this.physics.overlap(this.attackHitboxL, ghost, () => {
                setTimeout(() => {
                    this.enemies.remove(ghost, true, true)
                    this.AddCoin()
                },300)
            },null, this)
        })
        this.Samurai.anims.play("attackL", true)
        setTimeout(() => {
            this.attack = false
        },700)
    }
    AttackR() {
        this.attack = true
        this.enemies.getChildren().forEach(ghost => {
            const overlapR  = this.physics.overlap(this.attackHitboxR, ghost, () => {
                setTimeout(() => {
                    this.enemies.remove(ghost, true, true)
                    this.AddCoin()
                },300)
            })
            setTimeout(() => {
            },300)
        })
        this.Samurai.anims.play("attackR", true)
        setTimeout(() => {
            this.attack = false
        },700)
    }
    collectCoin(Samurai, start) {
        start.destroy()
        this.score+=1
        this.scoreText.setText(this.score)
        if(this.score >9) {
            this.scene.stop()
            this.scene.start('Boss')
        }
    }
    update() {
        if(this.hitpointsGroup.getLength() == 0) {
            this.score = 0
            this.scene.stop()
            this.scene.start("Menu")
            
        }
        if(this.cursors.left.isDown) {
            this.Samurai.body.velocity.x = -gameOptions.SamuraiSpeed
            if(!this.attack){
                this.Samurai.anims.play("left", true)
            }
       }
        else if(this.cursors.right.isDown) {
            this.Samurai.body.velocity.x = gameOptions.SamuraiSpeed
            if(!this.attack){
                this.Samurai.anims.play("right", true)
            }
        }
        else  {
            this.Samurai.body.velocity.x = 0
            if(!this.attack){
                this.Samurai.anims.play("stay", true)
            }
        }
        if(this.cursors.up.isDown && this.Samurai.body.touching.down) {
            this.Samurai.body.velocity.y = -gameOptions.SamuraiGravity / 1.2
        }

        this.SamuraiHitbox.x = this.Samurai.x
        this.SamuraiHitbox.y = this.Samurai.y+20
        this.attackHitboxR.x = this.Samurai.x+64
        this.attackHitboxR.y = this.Samurai.y+40
        this.attackHitboxL.x = this.Samurai.x-64
        this.attackHitboxL.y = this.Samurai.y+40
        if(this.enemies.getLength()>0) {
            if (this.enemies.getLength() > 0) {
                const currentTime1 = this.time.now
                if(currentTime1 - this.lastGhostUpdate > 2000) {
                    this.enemies.getChildren().forEach(ghost => {
                        const playerX = this.Samurai.x;
                        const playerY = this.Samurai.y;
                        const GhostX = ghost.x;
                        const GhostY = ghost.y;
            
                        const angle = Phaser.Math.Angle.Between(GhostX, GhostY, playerX, playerY);
                        const GhostSpeed = 100;
                        ghost.setVelocityX(Math.cos(angle) * GhostSpeed);
                        ghost.setVelocityY(Math.sin(angle) * GhostSpeed);
    
    
                    });
                    this.lastGhostUpdate = currentTime1;

                }
            }


        } else if (this.score <10) {
            this.AddGhost(0, 2, 3000)
        }
    
    
    }

}
class Boss extends Phaser.Scene {
    constructor() {
        super({ key: 'Boss' })
    }

    preload() {
        this.load.image('boss-background', 'Bosss/backgroundboss.png');
        this.load.image('weapon', 'Bosss/pngegg.png')
        this.load.image('boss', 'Bosss/boss-dragon.png')
        this.load.image('fireball', "Bosss/fireball.png")
    }

    create() {
        this.canshoot = true
        this.add.image(0, 0, 'boss-background').setOrigin(0, 0);
        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })
        this.enemies = this.physics.add.group({
            allowGravity: true
        })

        this.hitpointsGroup = this.physics.add.group({
            allowGravity: false
        })
        this.FireGroup = this.physics.add.group({
        })
        this.syrikenGroup = this.physics.add.group({
        })
        this.hitpoints1 = this.physics.add.sprite(150, 100, 'heart')
        this.hitpoints1.setScale(0.05, 0.05)
        this.hitpoints2 = this.physics.add.sprite(250, 100, 'heart')
        this.hitpoints2.setScale(0.05, 0.05)
        this.hitpoints3 = this.physics.add.sprite(350, 100, 'heart')
        this.hitpoints3.setScale(0.05, 0.05)
        this.hitpointsGroup.add(this.hitpoints1)
        this.hitpointsGroup.add(this.hitpoints2)
        this.hitpointsGroup.add(this.hitpoints3)

        this.cursors = this.input.keyboard.createCursorKeys()

        this.Samurai = this.physics.add.sprite(422, 610, "Samurai")
        this.Samurai.body.gravity.y = gameOptions.SamuraiGravity
        this.physics.add.collider(this.Samurai, this.groundGroup)
        this.Samurai.setScale(2, 2)
        this.Samurai.setSize(32, 80)
        this.Samurai.setOffset(48, 48)

        this.Dragon = this.physics.add.sprite(960, 300, "boss")
        this.Dragon.setScale(0.5,0.5)
        this.physics.add.collider(this.Dragon, this.groundGroup, () => {
            this.Dragon.setVelocityX(-this.Dragon.body.velocity.x)
        })

        this.scoreText = this.add.text(50, 75, "0", {fontSize: "50px", fill: "#ffffff"})
        this.text1 = this.add.text(450, 75, "0", {fontSize: "45px", fill: "#ffffff"})
        this.text1.setText("Cursors to move, Click to shoot")
        setTimeout(() => {
            this.text1.destroy()
        },5000)
        this.text1.setFontStyle('bold')




        this.ground1 = this.physics.add.sprite(960, 1080, 'ground');
        this.ground1.setScale(10,0.01)
        this.groundGroup.add(this.ground1)
        this.ground3 = this.physics.add.sprite(0, 540, 'ground');
        this.ground3.setScale(0.01,10)
        this.groundGroup.add(this.ground3)
        this.ground4 = this.physics.add.sprite(1920, 540, 'ground');
        this.ground4.setScale(0.01,10)
        this.groundGroup.add(this.ground4)

        this.physics.add.collider(this.enemies, this.enemies)


        this.SamuraiHitbox = this.physics.add.sprite(this.Samurai.x,this.Samurai.y, 'ground')
        this.SamuraiHitbox.setSize(40,60)
        this.canbeattacked = true
        this.physics.add.overlap(this.SamuraiHitbox, this.enemies, () => {
            if(this.canbeattacked) {
                const hits = this.hitpointsGroup.getChildren()
                const lasthit = hits[0]
                this.hitpointsGroup.remove(lasthit,true,true)
                this.canbeattacked = false
            }
            setTimeout(() => {
                this.canbeattacked = true
            },500)


        })
        this.dragonhp = 20


        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("SLeft", {start: 7, end: 0}),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: "stay",
            frames: this.anims.generateFrameNumbers("Samurai", {start: 0, end: 5}),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("SRight", {start: 0, end:7 }),
            frameRate: 10,
            repeat: -1
        })
        
        this.input.on('pointerdown', this.shootProjectile, this);

        this.dragonismoving = false

        this.lastshot = 0
        this.lastfire = 0
    }
    Boss_attack() {
        this.fireball = this.physics.add.sprite(this.Dragon.x,this.Dragon.y, 'fireball')
        this.fireball.setScale(0.3, 0.3)
        this.enemies.add(this.fireball)
        this.fireball.body.gravity.y = gameOptions.SamuraiGravity/5
        const angle = Phaser.Math.Angle.Between(this.fireball.x, this.fireball.y, this.Samurai.x, this.Samurai.y);
        const FireSpeed = 500;
        this.fireball.setVelocityX(Math.cos(angle) * FireSpeed);
        this.fireball.setVelocityY(Math.sin(angle) * FireSpeed);

    }
    shootProjectile(pointer) {
        if(this.canshoot) {
            const angle = Phaser.Math.Angle.Between(this.Samurai.x, this.Samurai.y, pointer.x, pointer.y);
            this.syriken = this.physics.add.sprite(this.Samurai.x, this.Samurai.y, 'weapon');
            this.syriken.setRotation(angle);
            this.syrikenGroup.add(this.syriken)
            this.physics.add.overlap(this.syrikenGroup, this.Dragon, ()=>{
                this.syrikenGroup.remove(this.syriken, true, true)
                this.dragonhp = this.dragonhp-1
            })
            this.canshoot = false
    
            const speed = 500;
            this.physics.velocityFromRotation(angle, speed, this.syriken.body.velocity);
            
        }

        
    }
    MovingDragon() {
        if(this.dragonhp>0){
            this.dragonismoving = true;
            let MovingTime = 2000 + Math.random() * 7000;
            this.time.addEvent({
                delay: MovingTime,
                callback: () => {
                    if(this.dragonhp>0){
                        this.Dragon.body.velocity.x = -this.Dragon.body.velocity.x;
                        this.dragonismoving = false;
                    }
                },
                loop: false
            });
        }

    }

    
    update() {
        if(this.hitpointsGroup.getLength() == 0) {
            this.score = 0
            this.scene.stop()
            this.scene.start("Menu")
            
        }
        if(this.cursors.left.isDown) {
            this.Samurai.body.velocity.x = -gameOptions.SamuraiSpeed
            this.Samurai.anims.play("left", true)

       }
        else if(this.cursors.right.isDown) {
            this.Samurai.body.velocity.x = gameOptions.SamuraiSpeed
            this.Samurai.anims.play("right", true)

        }
        else  {
            this.Samurai.body.velocity.x = 0
            this.Samurai.anims.play("stay", true)
        }
        if(this.cursors.up.isDown && this.Samurai.body.touching.down) {
            this.Samurai.body.velocity.y = -gameOptions.SamuraiGravity / 1.2
        }

        if(this.dragonhp<1) {
            this.Dragon.destroy()
            this.scene.start("End")
        } else if(this.Dragon.body.velocity.x == 0) {
            this.Dragon.body.velocity.x = 100
        } else if(!this.dragonismoving) {
            this.MovingDragon()
        }
        if(this.dragonhp>0) {
            const currentTime = this.time.now
            if(currentTime - this.lastfire > 1500) {
                this.Boss_attack()
                this.lastfire = currentTime
            }
        }
        
        if(this.syrikenGroup.getLength()<1) {
            this.canshoot = true
        } else {
            const bounds = this.syriken.getBounds()

            if (
                bounds.right < 0 || bounds.left > this.sys.game.config.width ||
                bounds.bottom < 0 || bounds.top > this.sys.game.config.height
            ) {
                this.syriken.destroy();
            }
        }


        this.SamuraiHitbox.x = this.Samurai.x
        this.SamuraiHitbox.y = this.Samurai.y+20
    }
}
class End  extends Phaser.Scene {
    constructor() {
        super({ key: 'End' })
    }

    preload() {

        this.load.image('end-background', 'End/background.png');
        this.load.image('end-text', 'End/GG.png');
        this.load.image('end-start', 'End/over.png');
    }

    create() {
        this.add.image(0, 0, 'end-background').setOrigin(0, 0);
        this.add.image(960, 540, 'end-text')

        const end_button = this.add.image(500, 650, 'end-start')
        this.text1 = this.add.text(1300, 650, 'Your nickname  '+localStorage.getItem('nickname'), {fontSize: "45px", fill: "#ffffff"})
        this.text2 = this.add.text(1300, 750, 'Your time  '+((this.time.now - localStorage.getItem('time'))/1000).toFixed(2)+'s', {fontSize: "45px", fill: "#ffffff"})


        let playersList = JSON.parse(localStorage.getItem('playersList')) || [];

        let playerData = { name: localStorage.getItem('nickname'), score: ((this.time.now - localStorage.getItem('time'))/1000).toFixed(2) };
        playersList.push(playerData);
        playersList.sort((a, b) => a.score - b.score )
        localStorage.setItem('playersList', JSON.stringify(playersList));


        this.text6 = this.add.text(1300, 225, 'Top of players', {fontSize: "45px", fill: "#ffffff"})
        this.text3 = this.add.text(1300, 300, '1. '+playersList[0].name +' '+ playersList[0].score+'s', {fontSize: "45px", fill: "#ffffff"})
        if(playersList.length>1){
            this.text4 = this.add.text(1300, 375, '2. '+playersList[1].name +' '+ playersList[1].score+'s', {fontSize: "45px", fill: "#ffffff"})
        }
        if(playersList.length>2){
            this.text5 = this.add.text(1300, 450, '3. '+playersList[2].name +' '+ playersList[2].score+'s', {fontSize: "45px", fill: "#ffffff"})
        }
        this.text1.setFontStyle('bold')
        this.text2.setFontStyle('bold')
        this.text3.setFontStyle('bold')
        this.text4.setFontStyle('bold')
        this.text5.setFontStyle('bold')
        this.text6.setFontStyle('bold')

        end_button.setInteractive()
        end_button.on('pointerdown',  () => {
            this.scene.start("Menu")

        })
    }
}
