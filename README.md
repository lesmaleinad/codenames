# Codenames: A node.js server for the popular secret word game.
## How to play Codenames

[The Official Rulebook to Codenames from the Publisher](https://czechgames.com/files/rules/codenames-rules-en.pdf)

 Of course, there will be no need to set the table up every time you play. Here's a quick breakdown of the rules:

### Codemaster Gives a Code

 The Codemaster can see all of the 'secret agents' (colors of cards) and must reveal to their Operatives only the cards that match with their team. 
 
 To do this, they may give them a clue: a single word that relates to the meaning of one or more card on the table. They also give a number that indicates how many of the cards that single world relates to. The Codemaster cannot give any other information or speak to the operatives in any other way.

### Operatives Guess 

 Once the operatives for a team have received a clue and a number, they start making guesses. The Operatives click on a card that they think best match with the word given. One of the following will happen:

* The Operatives are correct, the card is revealed to have their team color, and they can keep guessing.

* The Operatives are wrong and the color is either white (a neutral agent) or the other teams color. Guessing is over.

* The revealed card is the black card (assassin agent), and the current Operatives' team loses the game.

Operatives may make as many guesses as given by their Codemaster, plus one more. If the codemaster gives the code: "berry, 3", the Operatives would have up to four guesses, assuming they get all of them correct. This allows Operatives to revist old codes that they believe still have matches on the table.

Operatives must make at least one guess before finishing their turn.

### Special Rules

The Codemaster can give two special guess amounts:
* **0:** This means that the word given is strictly **not** related to any of the correct cards on the table. Operatives are allowed unlimited guesses.

* **Unlimited:** This means that the Operatives should freely guess anything they think could be right. This is useful if there is a backlog of guesses they want to make from other rounds, but the Codemaster still wants to give them a word to guess with as well. In the app, this can be expressed by giving '99' guesses.

### End of Game

Codenames ends either when one team successfully reveals all of their agents (or accidently reveals the other team's agents) or if the assassin agent is revealed.

Right now, at the end of a game, the server will automatically reset when someone reconnects, allowing for people to play again with new words and new roles.


## Running the Server

        npm install
        node app.js
Both are your freinds.

There is no limit to reconnections, role changing, or players in any given role. Don't play with friends who cheat.
You will need at least 4 people (though one person can play both Operatives for a different kind of challange).

Red team always goes first. It may be possible to change the color and team name in the future.
