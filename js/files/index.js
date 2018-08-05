window.PIXI = require('phaser-ce/build/custom/pixi');
window.p2 = require('phaser-ce/build/custom/p2');
window.Phaser = require('phaser-ce/build/custom/phaser-split');

import io from 'socket.io-client'

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

let Game = {}

Game.client = io.connect('http://192.168.15.12:4000')
console.log(Game.client.io, '---')
//Game.client.emit('newUser', { x: 10, y: 70 })
//game.state.add('Game', game);
//game.state.start('Game');
//let Game = {};

Game.init = () => {
  Game.game.stage.disableVisibilityChange = true;
  Game.game.player
  Game.enemy
}

Game.preload = function () {
  Game.game.load.image('background', './assets/mapas/56A.jpg');
  Game.game.load.spritesheet('player', './assets/naves/33.png');
  Game.game.load.image('rank', './assets/rangos/103_rank20.png');
  Game.game.load.image('selectable', './assets/miselaneas/circle-png-7.png');
};

Game.create = async () => {
  Game.playerMap = {};
  Game.game.add.tileSprite(0, 0, 3840, 2160, 'background');
  Game.game.world.setBounds(0, 0, 3840, 2160);
  
  Game.game.physics.startSystem(Phaser.Physics.ARCADE);
  Game.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;

  const x = randomInt(10, 70)
  const y = randomInt(10, 70)
  const id = randomInt(10, 70)
  Game.id = id
  await Game.createUser(id, x, y, true)
  Game.client.emit('newUser', {id, x, y})
}

Game.update = () => {
  //console.log(Object.keys(Game.playerMap).length, '-----', JSON.stringify({x: 'dd', d: {s: 'sd'}}), JSON.stringify({}))
  if (Object.keys(Game.playerMap).length > 0) {
    if (Game.game.input.activePointer.isDown) {
      Game.x = Game.game.input.activePointer.worldX
      Game.y = Game.game.input.activePointer.worldY
      Game.move(Game.id, Game.x, Game.y)
      Game.client.emit('move', { id: Game.id, x: Game.x, y: Game.y });
    } else {
      if (Game.playerMap[Game.id].health >= 1) {
        const active = Game.game.physics.arcade.distanceToXY(Game.playerMap[Game.id], Math.floor(Game.x), Math.floor(Game.y))
        if (Math.round(active) >= 1 && Math.round(active) <= 6) {
          Game.playerMap[Game.id].body.velocity.setTo(0, 0)
        }

        Game.playerMap[Game.id].text.x = Math.floor(Game.playerMap[Game.id].x + Game.playerMap[Game.id].width / 7 - 50);
        Game.playerMap[Game.id].text.y = Math.floor(Game.playerMap[Game.id].y + Game.playerMap[Game.id].height / 1.5);

        Game.playerMap[Game.id].rank.x = Math.floor(Game.playerMap[Game.id].x + Game.playerMap[Game.id].width / 7 - 63);
        Game.playerMap[Game.id].rank.y = Math.floor(Game.playerMap[Game.id].y + Game.playerMap[Game.id].height / 1.3);

      }

      if (Game.enemy) {
        console.log('----')
        Game.selectable.x = Game.enemy.world.x - 70
        Game.selectable.y = Game.enemy.world.y - 70
      }

      Object.keys(Game.playerMap).map((player) => {
        if (Game.playerMap[player] != Game.id) {
          const active = Game.game.physics.arcade.distanceToXY(Game.playerMap[player], Math.floor(Game.playerMap[player].posX), Math.floor(Game.playerMap[player].posY))
          if (Math.round(active) >= 1 && Math.round(active) <= 50) {
            Game.playerMap[player].body.velocity.setTo(0, 0)
          }

          Game.playerMap[player].text.x = Math.floor(Game.playerMap[player].x + Game.playerMap[player].width / 7 - 50);
          Game.playerMap[player].text.y = Math.floor(Game.playerMap[player].y + Game.playerMap[player].height / 1.5);

          Game.playerMap[player].rank.x = Math.floor(Game.playerMap[player].x + Game.playerMap[player].width / 7 - 63);
          Game.playerMap[player].rank.y = Math.floor(Game.playerMap[player].y + Game.playerMap[player].height / 1.3);

          if (Game.enemy) {
            console.log('----', Game.selectable)
            Game.selectable.x = Game.enemy.world.x - 70
            Game.selectable.y = Game.enemy.world.y - 70
          }
        }
      })
    }
  }
}

Game.render = () => {
  Game.game.debug.text("Arrows to move.", 32, 32);
  //console.log(game)
}

Game.move = (id, x, y) => {

  Game.playerMap[id].text.x = Math.floor(Game.playerMap[id].x + Game.playerMap[id].width / 7 - 50);
  Game.playerMap[id].text.y = Math.floor(Game.playerMap[id].y + Game.playerMap[id].height / 1.5);

  Game.playerMap[id].rank.x = Math.floor(Game.playerMap[id].x + Game.playerMap[id].width / 7 - 63);
  Game.playerMap[id].rank.y = Math.floor(Game.playerMap[id].y + Game.playerMap[id].height / 1.3);
  Game.playerMap[id].posX = x;
  Game.playerMap[id].posY = y;
  Game.playerMap[id].isId = id;

  if (Game.enemy) {
    Game.selectable.x = Game.enemy.world.x - 70
    Game.selectable.y = Game.enemy.world.y - 70
    //Game.selectable.x = Math.floor(Game.enemy.x + Game.enemy.width / 7 - 100)
    //Game.selectable.y = Math.floor((Game.enemy.y + Game.enemy.height) / 6 + 100);
  }
  
  Game.game.physics.arcade.moveToXY(Game.playerMap[id],
    Math.floor(x),
    Math.floor(y),
    580,
    null);
}

Game.client.on('newplayer', function (data) {
  console.log('si?')
  Game.createUser(data.id, data.x, data.y);
});

Game.client.on('allplayers', function (data) {
  console.log('----?')
  for (let i = 0; i < data.length; i++) {
    if (data[i].id !== Game.id) {
      Game.createUser(data[i].id, data[i].x, data[i].y);
    }
  }
});

Game.client.on('delete', function (id) {
  Game.removePlayer(id);
});

Game.client.on('move', function (data) {
  Game.move(data.id, data.x, data.y);
  Game.stop(data.id, data.x, data.y)
});

Game.stop = (id, x, y) => {
  if (Game.playerMap[id].health >= 1) {
    const active = Game.game.physics.arcade.distanceToXY(Game.playerMap[id], Math.floor(x), Math.floor(y))
    if (Math.round(active) >= 1 && Math.round(active) <= 6) {
      Game.playerMap[id].body.velocity.setTo(0, 0)
    }

    Game.playerMap[id].text.x = Math.floor(Game.playerMap[id].x + Game.playerMap[id].width / 7 - 50);
    Game.playerMap[id].text.y = Math.floor(Game.playerMap[id].y + Game.playerMap[id].height / 1.5);

    Game.playerMap[id].rank.x = Math.floor(Game.playerMap[id].x + Game.playerMap[id].width / 7 - 63);
    Game.playerMap[id].rank.y = Math.floor(Game.playerMap[id].y + Game.playerMap[id].height / 1.3);
    if (Game.enemy) {
      Game.selectable.x = Game.enemy.world.x - 70
      Game.selectable.y = Game.enemy.world.y - 70
      console.log(Game.enemy, 'enemy')
    }
  }
}

Game.removePlayer = function (id) {
  if (Game.playerMap[id]) {
    Game.playerMap[id].text.destroy();
    Game.playerMap[id].rank.destroy();
    Game.playerMap[id].destroy();
    if (Game.enemy) {
      if (Game.enemy.isId) {
        Game.enemy.destroy()
        Game.selectable.destroy()
      }
    }
    delete Game.playerMap[id];
  }
};

Game.followSelection = (enemy, selectable) => {

  //Game.game.physics.arcade.moveToXY(selectable, enemy.x - 70, enemy.y - 70, 580);
}

Game.selectEnemy = (enemy) => {
  Game.enemy = enemy
  Game.selectable = Game.game.add.sprite(enemy.world.x - 70, enemy.world.y - 70, 'selectable');
  Game.game.physics.enable(Game.selectable, Phaser.Physics.ARCADE);
  Game.selectable.scale.setTo(.2, .2);

  //Game.followSelection(enemy, Game.selectable)

  //this.eventsOnClick.followSelection.call(this, this.enemy, this.selectable)
}

Game.createUser = (id, x, y, iam) => {
  return new Promise((resolve, reject) => {
    // 700, 900
    const player = Game.game.add.sprite(x, y, 'player');
    player.anchor.setTo(0.5, 0.5);
    player.smoothed = false;
    player.damage = 8700
    player.health = 256000
    Game.game.physics.enable(player, Phaser.Physics.ARCADE);
    
    // Drones
    //let drones = new Drones()
    //this.player.drones = drones
    //this.player.dronesArr = drones.createDrone(config, this.player, Phaser)
    
    // Rango
    player.rank = game.add.sprite(Math.floor(player.x + player.width / 7 - 63), Math.floor(player.y + player.height / 1.3), 'rank');
    player.rank.anchor.setTo(0.5, 0.5);
    
    Game.game.physics.enable(player.rank, Phaser.Physics.ARCADE)
    
    // Nanme of user
    const style = {
      font: "16px Arial", fill: "#FFFFFF", wordWrap: true, wordWrapWidth: player.width, align: "center", marginLeft: 'auto',
      marginRight: 'auto',
      display: 'block',
      textShadow: "2px 2px #ff0000"
    };
    
    player.text = Game.game.add.text(Math.floor(player.x + player.width / 7 - 50), Math.floor(player.y + player.height / 1.5), "- Buraky -", style);
    player.text.fontWeight = 'bold';
    player.text.setShadow(2, 2, 'rgba(5, 5, 5, 0.9)', 10);
    
    player.body.fixedRotation = true;
    player.inputEnabled = true;
    Game.playerMap[id] = player
    if (iam) {
      Game.game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 1, 1);
    } else {
      player.events.onInputDown.add(Game.selectEnemy.bind(this, player), this)
    }

    resolve(player)
  })
}

const game = new Phaser.Game(document.body.clientWidth, 800, Phaser.CANVAS, 'canvas', Game);
Game.game = game