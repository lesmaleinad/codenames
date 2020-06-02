var board = {
	
		playerInfo: {team: '', role: ''},

		cardHTML: (i, word)=>'<div class="card-wrapper" id="'+i+'"><div class="card"><div class="front"><span>'+word+'</span></div><div class="back"></div></div></div>',

		rowHTML: '<p m-0></p>',

		colors: [],

		init: function(){
			// ASK FOR CARDS
			socket.emit('gameRequest', {'player': board.playerInfo});

			socket.on('gameStart', data=>{

				board.colors = data.colors;

				board.field(data.words);
			})},

		field: function(wordArray){

			// CLEAR BOARD
			$('.cardField').html('');

			for(i=0;i<25;i++){
				// ADD ROWS
			if(i%5===0){$('.cardField').append(board.rowHTML)};
				// APPEND NEW HTML
			$('.cardField p')
				.last().append(board.cardHTML(i, wordArray[i])
					)};
			$('#game').fadeIn(2000)
			$('.front').textfill({explicitWidth: $('.card').width()*.75});
			$('h1').textfill({maxFontPixels: 96});
			

		board.update();
			
		

			},

		update: function(code){
			// UPDATE COLORS
			board.colors.forEach(function(c,i){
				// IF CARD EXISTS
				if (c){
				// COLOR IT CORRECTLY
				c.revealed ?
				$('.card-wrapper').eq(i).addClass('revealed').find('.back').css('background-color', c.color)
				:$('.card-wrapper').eq(i).removeClass('revealed').find('.front').css('background-color', c.color)
				};
			});
			// STILL PLAYING?
			!board.gameOver ?
			// UPDATE HEADER
			board.turn ?
				board.id === 'code' ?
					 $('#giveCode').show() : {}
			 : $('#canDone').add('#giveCode').hide() : {}
			
			// IS THERE A CODE TO SHOW?
			code ? 
			// SHOW THE CODE
			$('#operative').show().find('#getCode').text('Code is: '+code) : 
			// ELSE CLEAR AND HIDE THE CODE
			$('#operative').hide().find('#getCode').text('');
			// REFORMAT THE FONT SIZE			
			board.resizeText();
		},

		resizeText: function(){

			$('.front').textfill({explicitWidth: $('.card').width()*.75});
			$('.cp').textfill({maxFontPixels: 96, explicitHeight: $('.cp').height()*.90});
			$('h1').textfill({maxFontPixels: 96, explicitWidth: $('h1').width()*.90});
			$('#giveCode').textfill({maxFontPixels: 96, explicitHeight: $('#giveCode').height()*.75});
			$('#operative').textfill({maxFontPixels: 96, explicitHeight: $('#operative').height()*.90});
		},

		gameOver: false,
		
		id: '',

		turn: false,
};


const menu = {
	start: function(){
		$('#menu-team')
			.fadeIn(2000)
			.click(function(){
				$(event.target).text() === 'RED TEAM' ?
					(board.playerInfo.team = 'red',
					menu.color('rgb(227, 23, 13)', event.pageX, event.pageY)) :
					(board.playerInfo.team = 'blue',
					menu.color('rgb(56, 176, 222)', event.pageX, event.pageY));
				$('#menu-role')
					.fadeIn(2000)
				$('#menu-color')
					.position($('#menu-role').position())
		})
			.children()
				.textfill();
		
		$('#menu-role')
			.click(function(){
				$(this).children().removeClass('code oper')
				event.target.id === 'codem' ?
					(board.playerInfo.role = 'code', $('#codem').parent().addClass('code')) :
					(board.playerInfo.role = 'oper', $('#opera').parent().addClass('oper'));
				$('#menu-submit').fadeIn(2000)
		})
			.children()
				.textfill()
		
		$('#menu-submit')
			.click(function(){
				$('#menu').fadeOut(2000, function(){
					board.init();
				})
		})
	},
	color: function(color, x, y){
		$('#circles')
			.append('<div class="circle" style="background-color: '+color+'"></div>');
			var circle = $('.circle').last();
		
			circle
				.css({top: y, left: x})
				.animate(
				{
					width: 10000,
					height: 10000,
					top: -5000,
					left: -5000
				}, 3000, 'linear', menu.kill)
	},
	
	kill: function(){
		var circle = $('.circle').first(); 
		$('#backdrop')
			.css('background-color', circle.css('background-color'))
			// .fadeTo(0, .25);
		circle.remove()
	}
}

$('.cardField')
	.on('click', '.front', function(event){
	// IF PLAYER IS ALLOWED TO GUESS
	if (board.id === 'oper' && board.turn){
		// SEND THE CARD THAT WAS GUESSED
		socket.emit('gameAction', {
			'cardID': Number($(event.currentTarget).closest('.card-wrapper').attr('id'))
		});
		// SIT BACK FOR THE REVEAL
		board.turn = false;
	}
})
	.on('mouseenter', '.back', function(event){
		const card = $(event.currentTarget).closest('.card-wrapper');

		card.removeClass('revealed');

		card.mouseleave(function(){
			!board.gameOver ? card.addClass('revealed') : card.off('mouseleave')
		})
	})

// THE SUBMIT CODE BUTTON
$('#submitCode')
	.click(function(){

		var code = $('#code').val();
		var guesses = $('#guesses').val();

		// IF THE CODE AND # GUESSES ARE VALID

		if(guesses !== "" && board.turn){

					// CLEAR THE CODE AND GUESSES BOX

					$('#code').add('#guesses').val('');

					// SEND THE CODE TO THE SERVER

					socket.emit('gameAction', {'code': code, 'guesses': guesses});

					// SIT BACK AND RELAX

					board.turn = false;

		// ADD CSS FOR AN ERROR

		} else $('#guesses').addClass('error');
		
	});

// CLEAR CSS WHEN CHANGING GUESSES

$('#guesses')
	.change(f=>$('#guesses').removeClass('error'));

$('#codeDone')
	.click(f=>{
		socket.emit('gameAction', 'done')
	});

$(window).resize(board.resizeText);

menu.start();

socket.on('gameUpdate', function(data){
	// IF ITS GAME OVER
	if(data.end !== undefined){
		$('#gameHeader').html('<span>'+data.end+'</span>').textfill({maxFontPixels: 96});
		board.gameOver = true;
		board.colors = data.colors;
		board.update()
	} else(
		board.turn = data.turn,
		board.colors = data.colors,
		board.id = data.id,
		$('#currentPlayer').text(board.turn?'YOU':data.whosTurn),
		(data.turn && data.canDone === 'yes') ? $('#codeDone').show() : $('#codeDone').hide(),
		board.update(data.codeText)
)})