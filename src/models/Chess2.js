import Pieces from "./Pieces";
export default class Chess {
    constructor(playerColor) {
        this.file = {0:"1", 1:"2", 2:"3", 3:"4", 4:"5", 5:"6", 6:"7", 7:"8"};
        this.rank = {0:"8", 1:"7", 2:"6", 3:"5", 4:"4", 5:"3", 6:"2", 7:"1"}
        this.whiCheckTiles = new Set()
        this.blaCheckTiles = new Set()
        this.blackKingCheck = false
        this.whiteKingCheck = false
        this.enPassantTiles = {tile: [-1,-1], pieceToRemovePos: [-1, -1]}
        this.promotion = false
        this.staleMate = false
        this.pieces = this.initializePieces()
        this.calculateValidMoves()
        this.movePiece = this.movePiece.bind(this);
        this.isValidMove = this.isValidMove.bind(this)
        this.playerTurn = 'w'
        this.playerColor = playerColor
    }

    getPieces(){
        let domPieces = this.pieces.map(piece => {
            return {
                file: piece.file,
                rank: piece.rank,
                name: piece.name,
                image: piece.image
            }
        })
        return domPieces
    }

    setState(gameState){
        for (var i = 0; i < this.pieces.length; i++) {
            const pieceOnBoard = this.pieces[i]
            const pieceBefore = gameState.pieces[i]
            pieceOnBoard.file = pieceBefore.file
            pieceOnBoard.rank = pieceBefore.rank
        }
        this.playerTurn = gameState.turn
        this.calculateValidMoves()
    }

    initializePieces() {
       
        const pieces =[]
        for (let i = 0; i < 2; i++) {
           
            const startingRank = i == 0 ? 8 : 1
            const pieceColour = i == 0 ? "b" : 'w'
            pieces.push(new Pieces(pieceColour, 'rook',startingRank, 1));
            pieces.push(new Pieces(pieceColour, 'knight',startingRank, 2));
            pieces.push(new Pieces(pieceColour, 'bishop',startingRank, 3));
            pieces.push(new Pieces(pieceColour, 'queen',startingRank, 4));
            pieces.push(new Pieces(pieceColour, 'king',startingRank, 5));
            pieces.push(new Pieces(pieceColour, 'bishop',startingRank, 6));
            pieces.push(new Pieces(pieceColour, 'knight',startingRank, 7));
            pieces.push(new Pieces(pieceColour, 'rook',startingRank, 8));
        }

        // the pawns of both color
        for (let i = 1; i<9; i++){
            // // the black pawn
            pieces.push(new Pieces(`b`, 'pawn', 7, i))
            // // // // // white pawns
            pieces.push(new Pieces(`w`, 'pawn', 2, i))
        }

        return pieces
    }

    isTileOcuupied(file, rank){
        // it will go thru all the pieces and check if a piece is on this tile or not
        for (var i = 0; i<this.pieces.length; i++){
            if (this.pieces[i].atThisTile(file, rank)) {
                return {occupied: true, color: this.pieces[i].color, name: this.pieces[i].name.split('_')[1]}
            }
        }
        return {occupied: false, color: null, name: null}
    }

    isValidMove(pieceName, frmR, frmF, toR, toF){
        for (var i = 0; i<this.pieces.length; i++){
            const piece = this.pieces[i]
            if (piece.name == pieceName && piece.atThisTile(frmF, frmR) == true) {
                for (var j = 0; j < piece.possibleMoves.length; j++) {
                    if (piece.possibleMoves[j][0] == toF && piece.possibleMoves[j][1] == toR){
                        return true
                    }
                }
                return false
            }
        }
    }

    willKingBeInCheck(frmF, frmR, toF, toR, pieceMoved){
        let pieceToRemove = this.pieces.find(piece => piece.atThisTile(toF, toR) == true)
        pieceMoved.setTile(toF, toR)
        if (pieceToRemove){
            pieceToRemove.setTile(null, null)
        }

        let opponentColor = pieceMoved.color == "b" ? 'w' : 'b'
        let opponentPieces = this.pieces.filter(piece => piece.color == opponentColor)
        for (var i = 0; i < opponentPieces.length; i++) {
            let piece = opponentPieces[i]
            let name = piece.name.split('_')[1]
            let pieceColor = piece.color
            let pieceFile = parseInt(piece.file)
            let pieceRank = parseInt(piece.rank)
            let directions;
            if (name == 'knight') {
                directions = [[2, 1], [2, -1], [1, 2], [1, -2], [-2, -1], [-2, 1], [-1, -2], [-1, 2]]
            }
            else if (name == 'bishop') {
                directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
            }
            else if (name == 'rook') {
                directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]
            }
            else if (name == 'queen') {
                directions = [[1, 1], [1, -1], [-1, 1], [-1, -1], [0, 1], [0, -1], [1, 0], [-1, 0]]
            }
            else if (name=='pawn'){
                directions = piece.color == 'w' ? [[1, 1], [-1, 1]] : [[1, -1], [-1, -1]]
            }
            else if (name=='king'){
                directions = [[1,1],[-1,-1],[1,-1],[-1,1],[0,1],[0,-1],[1,0],[-1,0]]
            }
            for (let [directionF, directionR] of directions) {
                let toCheck = name == 'pawn' ? 1 : 7
                for (var j = 1; j <= toCheck; j++) {
                    let progression = (name == 'knight' || name == 'pawn' || name == 'king') ? 1 : j
                    let newF = pieceFile + progression * directionF
                    let newR = pieceRank + progression * directionR
                    if (newF >= 1 && newF <= 8 && newR >= 1 && newR <= 8) {
                        const tileStatus = this.isTileOcuupied(newF, newR)
                        if (tileStatus.occupied && tileStatus.color != pieceColor && tileStatus.name == 'king') {
                            pieceMoved.setTile(frmF, frmR) 
                            if (pieceToRemove) {
                                pieceToRemove.setTile(toF, toR)
                            }
                            return true;
                        } 
                        if (tileStatus.occupied) {
                            break
                        }
                    } else {
                        break;
                    }
                }
            }
        }
        pieceMoved.setTile(frmF, frmR)
        if (pieceToRemove) {
            pieceToRemove.setTile(toF, toR)
        }
        return false;
    }
    
    handleCastling(pieceMoved, pieceToRemove, toF, toR){
        let color = pieceMoved.color
        let kingPlace;
        let rookPlace;
        if ((toF == 8 && toR == 1)|| (toF == 8 && toR == 8)) {
            kingPlace = color == "b" ? {file: 7, rank: 8} : {file: 7, rank: 1} 
            rookPlace = color == 'b' ? {file: 6, rank: 8} : {file: 6, rank: 1} 
        }
        else {
            kingPlace = color == "b" ? {file: 3, rank: 8} : {file: 3, rank: 1} 
            rookPlace = color == 'b' ? {file: 4, rank: 8} : {file: 4, rank: 1} 
        }
        pieceToRemove.setTile(rookPlace.file, rookPlace.rank)
        pieceMoved.setTile(kingPlace.file, kingPlace.rank)
        pieceMoved.hasMoved = true
        pieceToRemove.hasMoved = true
    
        this.changeTurns()
    }

    createEnpassant(pieceMoved, toF, toR){
        let leftTileStatus = this.isTileOcuupied(toF-1, toR)
        let rightTileStatus = this.isTileOcuupied(toF+1, toR)
        if (leftTileStatus.occupied && leftTileStatus.color != pieceMoved.color || rightTileStatus.occupied && rightTileStatus.color != pieceMoved.color){
            let enPassantRank = pieceMoved.color == 'w' ? toR-1 : toR+1
            this.enPassantTiles['tile']=[toF, enPassantRank]
            this.enPassantTiles['pieceToRemovePos']=[toF, toR]                           
        }
    }



    changeTurns(){
        switch (this.playerTurn) {
            case 'w':
              this.playerTurn = 'b';
              break;
            case 'b':
              this.playerTurn = 'w';
              break;
        }
    }

    movePiece(frmR, frmF, toR, toF) {
      
        let enPassantCreationMove = false
        let pieceMoved = this.pieces.find(piece => piece.atThisTile(frmF, frmR) == true)
        let pieceToRemove = this.pieces.find(piece => piece.atThisTile(toF, toR) == true)

        if (pieceMoved) {
            if (this.blackKingCheck || this.whiteKingCheck){
                this.blackKingCheck == true ? this.blackKingCheck = false : this.whiteKingCheck = false;
            }
    
            if (
                pieceMoved.name.split("_")[1] == 'king' && pieceMoved.hasMoved == false && 
                (
                    (toF == 1 && toR == 8) ||
                    (toF == 8 && toR == 8)  || 
                    (toF == 8 && toR == 1)  || 
                    (toF == 1 && toR == 1) 
                )
            ) {
                this.handleCastling(pieceMoved, pieceToRemove, toF, toR)    
            }
            else {
                if (toF == this.enPassantTiles.tile[0] && toR == this.enPassantTiles.tile[1] && pieceMoved.name.split("_")[1] == 'pawn'){
                    
                    pieceToRemove = this.pieces.find(piece => piece.atThisTile(this.enPassantTiles.pieceToRemovePos[0], this.enPassantTiles.pieceToRemovePos[1]) == true)
                } else if (pieceMoved.name.split("_")[1] == 'pawn' && Math.abs(parseInt(frmR) - parseInt(toR))==2) {
                    this.createEnpassant(pieceMoved, toF, toR, toF, toR) 
                    enPassantCreationMove = true
                }
                if (pieceToRemove) {
                    pieceToRemove.setTile(null, null)
                }
                pieceMoved.setTile(toF, toR)
                pieceMoved.hasMoved = true  
                this.changeTurns()
                
            }
            if(!enPassantCreationMove){
                this.enPassantTiles = {tile: [-1, -1], pieceToRemovePos: [-1, -1]}
            }
        }
        this.blaCheckTiles.clear()
        this.whiCheckTiles.clear()
        this.calculateValidMoves()
    }

    isGameOver(){
        // check for the stalemate who evers turn it happens to be
        let team = this.playerTurn == 'w' ? 'w' : 'b'
        let Pieces = this.pieces.filter(piece => piece.color == team && piece.getTile()[0] != null)
        let noMoveAvailable = true
        let kingInCheck = this.playerTurn == "w" ? this.whiteKingCheck : this.blackKingCheck

        for (var i = 0; i<Pieces.length; i++){
            if (Pieces[i].possibleMoves.length != 0){
                noMoveAvailable = false
            }
        }

        if (noMoveAvailable){
            if (kingInCheck){
                return {gameOver: true, reason: 'checkMate'}
            } 
            else {
                return {gameOver: true, reason: 'staleMate'}
            }
        }
        return {gameOver: false, reason: null}
    }

    calculateValidMoves(){
        this.pieces.forEach(piece => {
            // set this piece's possible moves to empty so they could be recalculated
            piece.possibleMoves = []
            const [color, name] = piece.name.split("_")
            const frmR = piece.rank
            const frmF = piece.file
            let directions = []
            const CheckTile = color == "w" ? this.blaCheckTiles : this.whiCheckTiles
            if (name == 'pawn' && piece.rank != null && piece.file != null){
                const specialRank = color == 'w' ? 2 : 7
                const direction = color =='w' ? 1 : -1  
                const enPassantRank = color == 'w' ? 5 : 4
                // the pawn can capture pieces diagonally in it's direction
                // if the diagonal in it's movable rank direction are occupied then it can move there and capture the piece
                let diaRightTileStatus = this.isTileOcuupied(frmF + 1, frmR + 1*direction)
                let diaLeftTileStatus = this.isTileOcuupied(frmF - 1, frmR + 1*direction)
                let leftTileStatus = this.isTileOcuupied(frmF-1, frmR)
                let rightTileStatus = this.isTileOcuupied(frmF+1, frmR)

                // add the attack tiles to the CheckTiles for the king 
                CheckTile.add(String(frmF + 1)+String(frmR + 1*direction))
                CheckTile.add(String(frmF - 1)+String(frmR + 1*direction))
                
                // only let the pawn move to diagonal tiles if they are occupied by a piece of different color
                if (diaRightTileStatus.occupied && diaRightTileStatus.color != color){
                    if (diaRightTileStatus.name == 'king') {
                        color == 'w' ? this.whiteKingCheck = true : this.blackKingCheck = true
                    }
                    else {
                        if (!this.willKingBeInCheck(piece.file, piece.rank, (frmF + 1), (frmR + 1*direction), piece)){
                            piece.possibleMoves.push([frmF + 1, frmR + 1*direction])
                        }
                    }
                }   
                if (diaLeftTileStatus.occupied && diaLeftTileStatus.color != color){
                    if (diaRightTileStatus.name == 'king') {
                        color == 'w' ? this.whiteKingCheck = true : this.blackKingCheck = true;
                    }
                    else {
                        if (!this.willKingBeInCheck(piece.file, piece.rank, (frmF - 1), (frmR + 1*direction), piece)){
                            piece.possibleMoves.push([(frmF - 1), (frmR + 1*direction)])
                        }
                    }
                }         
                // check for the en passant 
                if (frmR == enPassantRank) {
                    if (leftTileStatus.occupied && leftTileStatus.color != color){
                        if ((this.enPassantTiles.tile[0] == (frmF - 1) && this.enPassantTiles.tile[1] == (frmR + 1*direction)) && !this.willKingBeInCheck(piece.file, piece.rank, (frmF - 1), (frmR + 1*direction), piece)){
                            piece.possibleMoves.push([(frmF - 1), (frmR + 1*direction)])
                        }
                    }
                    if (rightTileStatus.occupied && rightTileStatus.color != color){
                        if ((this.enPassantTiles.tile[0] == (frmF + 1) && this.enPassantTiles.tile[1] == (frmR + 1*direction)) && !this.willKingBeInCheck(piece.file, piece.rank, (frmF + 1), (frmR + 1*direction), piece)){
                            piece.possibleMoves.push([(frmF + 1), (frmR + 1*direction)])
                        }
                    }
                }

                // if the tile just in front is not occupied only then then the pawn can move
                if (!this.isTileOcuupied(frmF + 0, frmR + 1*direction).occupied){
                    if (piece.rank == specialRank) {
                        // if it's on the special rank then it can move two steps only if the second tile is also not occupied
                        if (!this.willKingBeInCheck(piece.file, piece.rank, (frmF + 0), (frmR + 1*direction), piece)){
                            piece.possibleMoves.push([(frmF + 0),(frmR + 1*direction)])
                        }
                        if (!this.isTileOcuupied(frmF + 0, frmR + 2*direction).occupied && !this.willKingBeInCheck(piece.file, piece.rank, (frmF + 0), (frmR + 2*direction), piece)) {
                            piece.possibleMoves.push([(frmF + 0),(frmR + 2*direction)])
                        }
                    } 
                    else {
                        if (!this.willKingBeInCheck(piece.file, piece.rank, (frmF + 0), (frmR + 1*direction), piece)){
                            piece.possibleMoves.push([(frmF + 0),(frmR + 1*direction)])
                        }
                    }
                }
            }
            else {
                if (name == 'knight') {
                    directions = [[2, 1], [2, -1], [1, 2], [1, -2], [-2, -1], [-2, 1], [-1, -2], [-1, 2]]
                }
                else if (name == 'bishop') {
                    // there are 4 directions of moves i have to check every one of them
                    directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
                    
                }
                else if (name == 'rook') {
                    // there are 4 directions of moves i have to check every one of them
                    directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]
                }
                else if (name == 'queen') {
                    directions = [[1, 1], [1, -1], [-1, 1], [-1, -1], [0, 1], [0, -1], [1, 0], [-1, 0]]
                }
                else if (name == 'king') {
                    directions = [[1,1],[-1,-1],[1,-1],[-1,1],[0,1],[0,-1],[1,0],[-1,0]]
                }
                directions.forEach(([directionF, directionR]) => {
                    let kingInCheck = false
                    let tileInDirection = []
                    let tilesToAdd = (name == 'knight' || name == 'king') ? 1 : 7
                    for (var i = 1; i <= tilesToAdd; i++) {
                        // let progression = (name == 'knight' || name == 'king') ? 1 : i
                        let newF = frmF + i * directionF
                        let newR = frmR + i * directionR
                        // check if the new position is within the board
                        if (newF >= 1 && newF <= 8 && newR >= 1 && newR <= 8) {
                            const tileStatus = this.isTileOcuupied(newF, newR)
                            if (tileStatus.occupied) {
                                if (tileStatus.color != color){
                                    // if tile is occupied by different color piece
                
                                    // if the piece is king
                                    if (tileStatus.name == "king") {
                                        kingInCheck = true
                                        // add that position to check tile
                                        CheckTile.add(String(newF) + String(newR))
                                        // just check one more tile in the same line of sight
                                        let decisionTile = this.isTileOcuupied((newF + 1 * directionF), (newR + 1 * directionR))
                                        // if it's is not occupied or is but by the same color piece put that tile in checkTile of the king, sp king cannot move there
                                        // cause he will still be in check if he does
                                        if (decisionTile.occupied == false || decisionTile.color == color) {
                                            CheckTile.add(String(newF + 1 * directionF) + String(newR + 1 * directionR))
                                        }
                                        break
                                    }
                                    
                                    else {
                                        if (!this.willKingBeInCheck(piece.file, piece.rank, newF, newR, piece)){
                                            tileInDirection.push([(newF), (newR)])
                                        }
                                        // no need to look any futher in this direction break
                                        break
                                    }
                
                                } 
                                else {
                                    // if the tile is occupied by a team-mate then don't add to the valid moves of the piece but add it to the check tile so opponent king can't move there
                                    CheckTile.add(String(newF) + String(newR))
                                    // break off no need to look futher in this direction
                                    break
                                }
                            }
                            else {
                                // if the tile is not occupied add it to the valid moved list and the check tile of the king
                                CheckTile.add(String(newF) + String(newR))
                                if (!this.willKingBeInCheck(piece.file, piece.rank, newF, newR, piece)){
                                    tileInDirection.push([(newF), (newR)])
                                }
                            }
                        } else {
                            // if the new position is not within the board, break the loop
                            break
                        }
                    }
                    // IF KING IS IN CHECK THEN CHECK WHAT KING and set his stuff to true and all that line of sight thing
                    if (kingInCheck) {
                        color == 'w' ? this.blackKingCheck = true : this.whiteKingCheck = true
                    }
                    piece.possibleMoves.push(...tileInDirection)
                })
            }
        });
       
        this.calculateCastleMoves()
      
    }

    calculateCastleMoves(){
        // once all of the other piece moves are calculated and checkTiles are complete calculate both kings valid moves
        const kings = this.pieces.filter(king => king.name.includes('king') && !king.hasMoved);
        const rooks = this.pieces.filter(rook => rook.name.includes('rook') && !rook.hasMoved);
       
        kings.forEach(king => {
            const kingColor = king.name.split("_")[0];
            const kingCheckStatus = kingColor === 'w' ? this.whiteKingCheck : this.blackKingCheck;

            if (!kingCheckStatus) {
                rooks.forEach(rook => {
                    const color = rook.color
                    let lineOfSightTiles;
                    let checkTiles;
                    if (color == kingColor) {
                        if (color == "b") {
                            lineOfSightTiles = rook.atThisTile(1, 8) == true ? [[2,8], [3,8], [4,8]] : [[7,8], [6,8]]
                            checkTiles = this.blaCheckTiles
                        } 
                        else {
                            lineOfSightTiles = rook.atThisTile(1, 1) == true ? [[2,1], [3,1], [4,1]] : [[7,1], [6,1]]
                            checkTiles = this.whiCheckTiles
                        }
    
                        let clearLineOfSight = true
                        for (var i = 0; i < lineOfSightTiles.length; i++){
                            if (!rook.possibleMoves.includes(lineOfSightTiles[i]) || checkTiles.has(String(lineOfSightTiles[i][0]) + String(lineOfSightTiles[i][1]))){
                                clearLineOfSight = false
                                break
                            }
                        }
    
                        if (true){
                            king.possibleMoves.push(rook.getTile())
                        }  
                    }
                })
            }
        })  
    }

    promotePawn(promotingTo){
        const pawn = this.pieces.find(piece => (piece.name == 'b_pawn' && piece.rank == 1) || (piece.name == 'w_pawn' && piece.rank == 8))
        if(pawn){
            const color = pawn.color
            pawn.name = `${color}_${promotingTo}`
            pawn.image = `/assets/${color}_${promotingTo}.png`
        }
        this.calculateValidMoves()
    }
}
