var game = new Phaser.Game(448, 496, Phaser.AUTO);
 var music;
 var time;
 var time_text;
 var atm_time;
 var after_8_time;
 
 var score = 0;
 var score_text;   
 
 var lives = 3;
 var lives_text;
 
 var soldier_text;
 
 var end_text;
 var finish_text;
 
 var counter = 0;
 var knife_eaten = 0;
 var soldier_eaten = 0;
  
  var Pacman = function (game) {
  this.map = null;
  this.layer = null;
  this.pacman = null;
  this.safetile = 14;
  this.gridsize = 16;
  this.speed = 150;
  this.threshold = 3;
  this.marker = new Phaser.Point();
  this.turnPoint = new Phaser.Point();
  this.directions = [ null, null, null, null, null ];
  this.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];
  this.current = Phaser.NONE;
  this.turning = Phaser.NONE;
  };
  
  Pacman.prototype = {
 	init: function () {
 		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
 		this.scale.pageAlignHorizontally = true;
 		this.scale.pageAlignVertically = true;
 		Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
 		this.physics.startSystem(Phaser.Physics.ARCADE);
 	},
 
 	preload: function () {
 		//  We need this because the assets are on github pages
 		//  Remove the next 2 lines if running locally
 		this.load.baseURL = 'https://geocfu.github.io/pacman/';
 		this.load.crossOrigin = 'anonymous';
 
 		this.load.image('dot', 'assets/dot.png');
 		this.load.image('blackberry', 'assets/blackberry.png');
 		this.load.image('cherry', 'assets/cherry.png');
 		this.load.image('kiwi', 'assets/kiwi.png');
 		this.load.image('dynamite', 'assets/dynamite.png');
 		this.load.image('soldier', 'assets/soldier.png');
 		this.load.image('teleport_portal_left', 'assets/teleport_portal_left.png');
 		this.load.image('teleport_portal_right', 'assets/teleport_portal_right.png');
 		this.load.image('knife', 'assets/knife.png');
 
 		this.load.image('blackberry-tiles', 'assets/blackberry.png');
 		this.load.image('cherry-tiles', 'assets/cherry.png');
 		this.load.image('kiwi-tiles', 'assets/kiwi.png');
 		this.load.image('tiles', 'assets/pacman-tiles.png');
 
 		this.load.spritesheet('pacman', 'assets/giannis_rambo_scaled_flipped.png', 32, 32);
 		this.load.tilemap('map', 'assets/pacman-map_fruits.json', null, Phaser.Tilemap.TILED_JSON);
 
 		game.load.audio('chopping', 'assets/giannakis_is_cutting.mp3');
 		//  Needless to say, graphics (C)opyright Namco
 	},
 
 	create: function () {
 		this.map = this.add.tilemap('map');
 		this.map.addTilesetImage('pacman-tiles', 'tiles');
 		this.map.addTilesetImage('blackberry', 'blackberry-tiles');
 		this.map.addTilesetImage('cherry', 'cherry-tiles');
 		this.map.addTilesetImage('kiwi', 'kiwi-tiles');
 
 		this.layer = this.map.createLayer('Pacman');
 
 		this.dots = this.add.physicsGroup();
 		this.blackberries = this.add.physicsGroup();
 		this.cherries = this.add.physicsGroup();
 		this.kiwis = this.add.physicsGroup();
 
 		this.map.createFromTiles(7, this.safetile, 'dot', this.layer, this.dots);
 		this.map.createFromTiles(49, this.safetile, 'blackberry', this.layer, this.blackberries);
 		this.map.createFromTiles(50, this.safetile, 'cherry', this.layer, this.cherries);
 		this.map.createFromTiles(51, this.safetile, 'kiwi', this.layer, this.kiwis);
 
 		//  The dots will need to be offset by 6px to put them back in the middle of the grid
 		this.dots.setAll('x', 6, false, false, 1);
 		this.dots.setAll('y', 6, false, false, 1);
 
 		//  Pacman should collide with everything except the safe tile
 		this.map.setCollisionByExclusion([this.safetile], true, this.layer);
 
 		//  Position Pacman at grid location 13x11 (the +8 accounts for his anchor)
 		this.pacman = this.add.sprite((13 * 16) + 8, (11 * 16) + 8, 'pacman', 0);
 		this.soldier = this.add.sprite((8 * 16) + 8, (10 * 16) + 8, 'soldier', 0);
 		this.dynamite = this.add.sprite((11 * 16), (11 * 16), 'dynamite', 0);
 		this.teleport_portal_left = this.add.sprite((-2 * 16), (12 * 16), 'teleport_portal_left', 0);
 		this.teleport_portal_right = this.add.sprite((29 * 16), (21 * 16), 'teleport_portal_right', 0);
 		this.knife = this.add.sprite((14 * 16), (29 * 16), 'knife', 0);
 
 		this.dynamite.visible = false;
 
 		this.pacman.anchor.set(0.5);
 		this.soldier.anchor.set(0.5);
 		this.pacman.animations.add('munch', [0, 1, 2, 1], 15, true);
 
 		this.physics.arcade.enable(this.pacman);
 		this.pacman.body.setSize(16, 16, 0, 0);
 		this.physics.arcade.enable(this.soldier);
 		this.soldier.body.setSize(16, 16, 0, 0);
 
 		this.cursors = this.input.keyboard.createCursorKeys();
 
 		this.pacman.play('munch');
 		//this.move(Phaser.LEFT);
 
 		music = game.add.audio('chopping');
 
 		time_text = game.add.text(10, -2, 'Time: 0 seconds', { font: '14px Arial', fill: '#FFFFFF' });
 		score_text = game.add.text(180, -2, 'Score: 0 points', { font: '14px Arial', fill: '#FFFFFF' });
 		lives_text = game.add.text(360, -2, 'Lives: 3', { font: '14px Arial', fill: '#FFFFFF' });
 		soldier_text = game.add.text(94, 481, 'Time left to kill the soldier: Not Activated', { font: '14px Arial', fill: '#FFFFFF' });
 		end_text = game.add.text(180, 330, 'Game Over!', { font: '14px Arial', fill: '#FFFFFF' });
 		finish_text = game.add.text(185, 210, 'Completed!', { font: '14px Arial', fill: '#FFFFFF' });
 
 		end_text.visible = false;
 		finish_text.visible = false;	
 	},
 
 	checkKeys: function () {
 		if (this.cursors.left.isDown && this.current !== Phaser.LEFT) {
 			this.checkDirection(Phaser.LEFT);
 		}
 		else if (this.cursors.right.isDown && this.current !== Phaser.RIGHT) {
 			this.checkDirection(Phaser.RIGHT);
 		}
 		else if (this.cursors.up.isDown && this.current !== Phaser.UP) {
 			this.checkDirection(Phaser.UP);
 		}
 		else if (this.cursors.down.isDown && this.current !== Phaser.DOWN) {
 			this.checkDirection(Phaser.DOWN);
 		}
 		else {
 			//  This forces them to hold the key down to turn the corner
 			this.turning = Phaser.NONE;
 		}
 	},
 
 	checkDirection: function (turnTo) {
 		if (this.turning === turnTo || this.directions[turnTo] === null || this.directions[turnTo].index !== this.safetile) {
 			//  Invalid direction if they're already set to turn that way
 			//  Or there is no tile there, or the tile isn't index 1 (a floor tile)
 			return;
 		}
 
 		//  Check if they want to turn around and can
 		if (this.current === this.opposites[turnTo]) {
 			this.move(turnTo);
 		}
 		else {
 			this.turning = turnTo;
 
 			this.turnPoint.x = (this.marker.x * this.gridsize) + (this.gridsize / 2);
 			this.turnPoint.y = (this.marker.y * this.gridsize) + (this.gridsize / 2);
 		}
 	},
 
 	turn: function () {
 		var cx = Math.floor(this.pacman.x);
 		var cy = Math.floor(this.pacman.y);
 
 		//  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
 		if (!this.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) || !this.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold)) {
 			return false;
 		}
 
 		//  Grid align before turning
 		this.pacman.x = this.turnPoint.x;
 		this.pacman.y = this.turnPoint.y;
 
 		this.pacman.body.reset(this.turnPoint.x, this.turnPoint.y);
 
 		this.move(this.turning);
 
 		this.turning = Phaser.NONE;
 
 		return true;
 
 	},
 
 	move: function (direction) {
 		var speed = this.speed;
 
 		if (direction === Phaser.LEFT || direction === Phaser.UP) {
 			speed = -speed;
 		}
 		if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
 			this.pacman.body.velocity.x = speed;
 		}
 		else {
 			this.pacman.body.velocity.y = speed;
 		}
 		//  Reset the scale and angle (Pacman is facing to the right in the sprite sheet)
 		this.pacman.scale.x = 1;
 		this.pacman.angle = 0;
 
 		if (direction === Phaser.LEFT) {
 			this.pacman.scale.x = -1;
 		}
 		else if (direction === Phaser.UP) {
 			this.pacman.angle = 270;
 		}
 		else if (direction === Phaser.DOWN) {
 			this.pacman.angle = 90;
 		}
 		this.current = direction;
 	},
 
 	eatDot: function (pacman, dot) {
 		dot.kill();
 		music.play();
 		score++;
 		score_text.text = 'Score: ' + score + ' points';
 		if (this.dots.total === 0 && this.blackberries.total === 0 && this.cherries.total === 0 && this.kiwis.total === 0) {
 		   this.game.paused = true;
 		   finish_text.visible = true;
 		}
 	},
 
 	eatBlackberry: function (pacman, blackberry) {
 		blackberry.kill();
 		music.play();
 		score += 10;
 		score_text.text = 'Score: ' + score + ' points';
 		if (this.dots.total === 0 && this.blackberries.total === 0 && this.cherries.total === 0 && this.kiwis.total === 0) {
 			this.game.paused = true;
 			finish_text.visible = true;
 		}
 	},
 
 	eatCherry: function (pacman, cherry) {
 		cherry.kill();
 		music.play();
 		score += 10;
 		score_text.text = 'Score: ' + score + ' points';
 		if (this.dots.total === 0 && this.blackberries.total === 0 && this.cherries.total === 0 && this.kiwis.total === 0) {
 			this.game.paused = true;
 			finish_text.visible = true;
 		}
 	},
 
 	eatKiwi: function (pacman, kiwi) {
 		kiwi.kill();
 		music.play();
 		score += 10;
 		score_text.text = 'Score: ' + score + ' points';
 		if (this.dots.total === 0 && this.blackberries.total === 0 && this.cherries.total === 0 && this.kiwis.total === 0) {
 			this.game.paused = true;
 			finish_text.visible = true;
 		}
 	},
 
 	update: function () {
 		if (lives == 0) {
 			this.game.paused = true;
 			end_text.visible = true;
 		}
 		this.physics.arcade.collide(this.pacman, this.layer);
 		this.physics.arcade.overlap(this.pacman, this.dots, this.eatDot, null, this);
 		this.physics.arcade.overlap(this.pacman, this.blackberries, this.eatBlackberry, null, this);
 		this.physics.arcade.overlap(this.pacman, this.cherries, this.eatCherry, null, this);
 		this.physics.arcade.overlap(this.pacman, this.kiwis, this.eatKiwi, null, this);
 
 		this.marker.x = this.math.snapToFloor(Math.floor(this.pacman.x), this.gridsize) / this.gridsize;
 		this.marker.y = this.math.snapToFloor(Math.floor(this.pacman.y), this.gridsize) / this.gridsize;
 
 		//  Update our grid sensors
 		this.directions[1] = this.map.getTileLeft(this.layer.index, this.marker.x, this.marker.y);
 		this.directions[2] = this.map.getTileRight(this.layer.index, this.marker.x, this.marker.y);
 		this.directions[3] = this.map.getTileAbove(this.layer.index, this.marker.x, this.marker.y);
 		this.directions[4] = this.map.getTileBelow(this.layer.index, this.marker.x, this.marker.y);
 
 		this.checkKeys();
 
 		if (this.turning !== Phaser.NONE) {
 			this.turn();
 		}
 
 		time = this.game.time.totalElapsedSeconds()|0;
 		time_text.text = 'Time: ' + time + ' seconds';
 
 		if (knife_eaten == 0) {
 			if (this.pacman.overlap(this.knife)) {
 				music.play();
 				this.knife.visible = false;
 				atm_time = time;
 				knife_eaten = 1;
 				after_8_time = atm_time + 8;
 			}
 		}
 		else {
 			if (time <= after_8_time ) {
 				if (soldier_eaten == 0 && knife_eaten == 1) {
 					if (this.pacman.overlap(this.soldier)) {
 						soldier_eaten = 1;
 						this.soldier.visible = false;
 						score += 250;
 						score_text.text = 'Score: ' + score + ' points';
 					}
 				}
 			}
 		}
 
 		if (knife_eaten == 1) {
 			if (after_8_time - time > 0) {
 				if (soldier_eaten == 1) {
 					soldier_text.text = 'Time left to kill the soldier: ' + 'Soldier Killed';
 				}
 				else {
 					soldier_text.text = 'Time left to eat the soldier: ' + (after_8_time - time) + ' seconds';
 				}
 			}
 			else {
 				if (soldier_eaten == 0) {
 					soldier_text.text = 'Time left to kill the soldier: ' + 'Ended unsuccessfully';
 					if (this.pacman.overlap(this.soldier)) {
 						this.pacman.reset((13 * 16) + 8, (11 * 16) + 8);
 						this.move(Phaser.LEFT);					
 						lives--;
 						lives_text.text = 'Lives: ' + lives;
 					}
 				}
 			}
 		}
 		else {
 			if (this.pacman.overlap(this.soldier)) {
 				this.pacman.reset((13 * 16) + 8, (11 * 16) + 8);
 				this.move(Phaser.LEFT);
 				lives--;
 				lives_text.text = 'Lives: ' + lives;
 			}
 		}
 
 		if (this.pacman.overlap(this.teleport_portal_left)) {
 			this.pacman.reset((27 * 16) + 8, (21 * 16) + 8);
 			this.move(Phaser.LEFT);
 		} 
 		else if (this.pacman.overlap(this.teleport_portal_right)) {
 			this.pacman.reset((0 * 16) + 8, (12 * 16) + 8);
 			this.move(Phaser.RIGHT);
 		}
 
 		if (counter == 0) {
 			if (time >= 10 && time < 16) {
 				this.dynamite.visible = true;
 				if (this.pacman.overlap(this.dynamite)) {
 					music.play();
 					this.dynamite.visible = false;
 					score += 100;
 					score_text.text = 'Score: ' + score + ' points';
 					counter = 1;
 				}
 			}
 			else {
 				this.dynamite.visible = false;
 			}
 		}
 	}
 };
 game.state.add('Game', Pacman, true);
