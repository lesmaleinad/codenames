let https = require('https');

const game = {

	currentPlayer : {
		code: '',
		guesses: 0,
		maxGuesses: 0
	},
	
	reset: function(){
		game.isCode = true;
		game.isTeamOne = true;
		wordList = [];
		teamOne = {name: 'red', color: 'rgb(227, 23, 13)'};
		teamTwo = {name: 'blue', color: 'rgb(56, 176, 222)'};
		game.playerList = [{team: game.teamOne, role:'code', sockets:[]},
				   {team: game.teamOne, role:'oper', sockets: []},
				   {team: game.teamTwo, role:'code', sockets: []},
				   {team: game.teamTwo, role:'oper', sockets: []}];
		game.over = false;
		cardField.init()
		
	},
	
	isCode: true,
	
	isTeamOne: true,

	teamOne: {name: 'red', color: 'rgb(227, 23, 13)'},
	teamTwo: {name: 'blue', color: 'rgb(56, 176, 222)'},

	colorList: function(){
		var list = ['grey'];
		for(i=0;i<9;i++){list.push(game.teamOne.color)};
		for(i=0;i<8;i++){list.push(game.teamTwo.color)};
		for(i=0;i<7;i++){list.push(	'#fffffa')};
		return list
		},

	init: function(){
		https.get('https://raw.githubusercontent.com/sillelien/codenames/master/nouns.txt', res=>
			{
			var body = '';
			res.on('data', data=>body+=data);
			res.on('end', f=>{
				game.wordList = body.split("\n");
				cardField.init();
				});
			});
	},

	turn: function(info){
		
		game.isCode = !game.isCode;
		
		game.isCode ? game.isTeamOne = !game.isTeamOne : {};
		
		game.isCode ? (game.currentPlayer.maxGuesses = 0, game.currentPlayer.guesses = 0, game.currentPlayer.code = '') : {}
		
		game.gameUpdate(info)
		
		},
	
	gameUpdate: function(info){
		console.log('UPDATE: '+info)
		// SEND EVERY CONNECTED PLAYER AN UPDATE
		game.playerList.forEach(function(p){
			// BUILD CURRENT CODE TEXT
			const codeText = !game.isCode ? game.currentPlayer.code : '';
			// IS IT YOUR TURN?
			var turn = ((game.isCode === (p.role === 'code')) && (game.isTeamOne === (p.team ===  game.teamOne)))
			// WHOS TURN IS IT?
			var whosTurn = (game.isTeamOne ? 
							game.teamOne.name.toUpperCase()+"'s ":
							game.teamTwo.name.toUpperCase()+"'s ") + 
							(game.isCode ? 'CodeMaster' : "Operative")
			// CAN YOU PRESS DONE?
			var canDone = game.currentPlayer.guesses > 0 ? 'yes' : ''
			// ARE YOU REAL?
			if (p.sockets[0]){
			// SEND THE UPDATE
			for (var socket of p.sockets){
				socket.emit('gameUpdate', 
					{'turn': turn,
					 'whosTurn': whosTurn,
					 'colors' : updateColors(p),
					 'codeText': codeText,
					 'id': p.role,
					 'canDone': canDone
						}) 
			}};
		});
		
		console.log('TURN: '+
				   (game.isTeamOne ? 'Team One ':'Team Two ')+
					(game.isCode ? 'CodeMaster' : "Operative")
				   )
	},
	
	isTurn: function(sock){
		var isTurn = false;
		for(var p of game.playerList){
			if(p.sockets[0])
			{
				for (var socket of p.sockets){
					if (socket.id === sock.id){
						isTurn = ((game.isCode === (p.role === 'code')) && (game.isTeamOne === (p.team === game.teamOne)))}
				}
			}
		};
		return isTurn
	},

	winCheck: function(theCard){
		// SET THIS CARD TO REVEALED
		if (theCard.revealed === true)
			{return game.gameUpdate('Card already picked')}
		else{theCard.revealed = true}
		// INCREASE THE GUESSES
		game.currentPlayer.guesses++;
		
		var team1 = 0;
		var team2 = 0;
		var lose = false;
		game.colorArray.forEach(function(thisCard){
			if(thisCard.revealed === true){
				var c = thisCard.color;
				c == game.teamOne.color ? team1++ :
				c == game.teamTwo.color ? team2++ :
				c == 'grey' ? lose = true : {}
			}});
		
		lose?game.end():
		team1===9?game.end(game.teamOne.name):
		team2===8?game.end(game.teamTwo.name):
			// IF NO ONE WON
			function(c){
				// RIGHT CHOICE and MORE GUESSES?
				var rightChoice = '';
				game.isTeamOne ? rightChoice = game.teamOne.color : rightChoice = game.teamTwo.color;
				(c.color === rightChoice && game.currentPlayer.guesses <= game.currentPlayer.maxGuesses) ?
				// KEEP GOING
				game.gameUpdate('RIGHT CHOICE'):
				// ELSE, NEXT PLAYER
				game.turn('GUESSING OVER');
			}(theCard);
		},

	end: function(winner){
		console.log('GAME OVER')
		if(!winner){game.turn('gameOver'); game.end(game.isTeamOne?game.teamOne.name:game.teamTwo.name)}
		else(
			game.colorArray.forEach(c=>c.revealed = false),
			game.playerList.forEach(p=>{
			if (p.sockets[0]){
				for(var socket of p.sockets){
					socket.emit('gameUpdate', {'end': 'TEAM ' + winner.toUpperCase()+ ' WINS!', 'colors': game.colorArray})
				}
			}}),
			 game.over = true
			)
		},

	over: false,
	
	wordArray: [],
	
	colorArray: [],
};

game.playerList = [{team: game.teamOne, role:'code', sockets: []},
				   {team: game.teamOne, role:'oper', sockets: []},
				   {team: game.teamTwo, role:'code', sockets: []},
				   {team: game.teamTwo, role:'oper', sockets: []}];

const card = {
	
	Color: function(color){
		this.color = color;
		this.revealed = false;
	}
}

const cardField = {

	init: ()=>{

		var words = game.wordList.slice();
		var colors = game.colorList()
		
		game.wordArray = [];
		game.colorArray = [];

		for(i=0;i<25;i++){

			// ADD NEW COLORS TO ARRAY
		game.colorArray.push(new card.Color(
			// COLOR
			colors.splice(Math.floor(Math.random()* colors.length), 1)[0]
			));
		game.wordArray.push(
			// WORD
			words.splice(Math.floor(Math.random()* words.length), 1)[0],
			)
		};
	},
};

var updateColors = playerListPlayer=>{
	
			var arr = [];
	
			if(playerListPlayer.role === 'code')
			// IF CODE, THE WHOLE THING
				{return game.colorArray}
			// ELSE JUST REVEALED ONES
				else (function(){
					game.colorArray.forEach(c=>{
						arr.push(c.revealed ? c : {color:'white', revealed: false})
						});
				}());
	
			return arr;
			}

game.init()

exports.playerAdd = function(pl, sock){
	var player = pl.player;
	
	if (game.over){game.reset()};
	
	game.playerList.forEach(function(p){
		// CLEAR THIS SOCKET FROM PLAYERLIST
		for(var socket of p.sockets){
			socket === sock 
			? socket = undefined : {};
		}
		// FIND REQUESTED ROLE/TEAM
		if (p.team.name == player.team && p.role == player.role){
			// SAVE SOCKET
			p.sockets.push(sock);
			// DECIDE WHAT COLORS TO SEND
			var colors = updateColors(p);
			// SEND IT BACK
			sock.emit('gameStart', {
				'words': game.wordArray,
				'colors': colors
			});
			console.log('Now connecting:')
			console.log(sock.id)
			console.log(player.team+' '+player.role)
			//GET THEM IN TURN ORDER
			game.gameUpdate('playerAdd');
		}
	});
	
};

exports.gameAction = function(data, sock){
	if(game.isTurn(sock)){
		console.log(data)
		if(data.code){
			game.currentPlayer.code = `${data.code} ${data.guesses}`;
			game.currentPlayer.guesses = 0;
			game.currentPlayer.maxGuesses = data.guesses === '0' ? 25 : data.guesses;
			console.log('Code: '+game.currentPlayer.code)
			console.log('Max guesses: '+ game.currentPlayer.maxGuesses)
			game.turn('Gave code');
		}
		else if (data === 'done'){
			game.currentPlayer.guesses > 0 ?
			game.turn('Player done') :
			game.gameUpdate('NOT DONE');
		}
		else if(typeof(data.cardID) === 'number'){
			console.log('GUESSED: '+game.wordArray[data.cardID]+', color was: '+game.colorArray[data.cardID].color)
			game.winCheck(game.colorArray[data.cardID]);
		}
		else game.gameUpdate()
	} else console.log(
			sock.id + ' sent an action NOT ON THEIR TURN.'
		)	
}