var MainMenu = function (game) {}

MainMenu.prototype = {
  	create: function(){
		var Title = this.game.add.sprite(160, 160, 'title');
		gameTitle.anchor.setTo(0.5, 0.5);
		var play = this.game.add.button(160, 320, 'play', this.Level1, this);
		playButton.anchor.setTo(0.5, 0.5);
          var level = this.game.add.button(160, 350, 'level', this.Level, this);
		playButton.anchor.setTo(0.5, 0.5);
	},
	Level1: function () {
		this.game.state.start('Level1');
	},
     
     level: function () {
		this.game.state.start('Level_pick');
	}
}
