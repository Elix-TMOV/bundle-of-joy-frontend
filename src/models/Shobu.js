import ShobuPiece from "./ShobuPiece";
export default class Shobu{
    constructor(playerColor) {
        this.playerColor = playerColor
        this.pieces = this.initializePieces()
        this.isValidMove = this.isValidMove.bind(this)
        this.movePiece = this.movePiece.bind(this);
        this.wasCalled = 0
        this.passiveMoveIn = []
        this.playerTurn = "w"
        this.calculatePassiveMoves()
        this.moveType = 'passive'
    }

    initializePieces(){
        let ranks = [0, 3, 4, 7]
        
        const pieces = []
        ranks.forEach(rank => {
            let color = (rank == 0 || rank == 4) ? 'b' : 'w'
            let board
            for (var j = 0; j<8; j++) {
                if (rank == 0 || rank == 3) {
                    board = j < 4 ? 1 : 2
                }
                else {
                    board = j < 4 ? 3 : 4
                }
                pieces.push(new ShobuPiece(color, 'shobu', rank, j, board))
            }
        })
        return pieces
    }

    setState(gameState){
       
        for (let i = 0; i < this.pieces.length; i++) {
            const pieceOnBoard = this.pieces[i];
            const pieceBefore = gameState.pieces[i]
            pieceOnBoard.file = pieceBefore.file
            pieceOnBoard.rank = pieceBefore.rank
        }
        this.playerTurn = gameState.turn
        this.moveType = gameState.moveType
        this.passiveMoveIn = gameState.passiveMoveIn
        if (this.moveType == "s"){
            this.calculateAggressiveMove()
        }
        else {
            this.calculatePassiveMoves()
        }
    }

    
    getPieces(){
        let domPieces = this.pieces.map(piece => {
            return {
                file: piece.file,
                rank: piece.rank,
                name: piece.name,
                image: piece.image,
                board: piece.board
            }
        })
        return domPieces
    }

    isValidMove(pieceName, frmR, frmF, toR, toF){
        for (var i = 0; i<this.pieces.length; i++){
            const piece = this.pieces[i]
            if (piece.name == pieceName && piece.atThisTile(frmF, frmR)) {
                for (var j = 0; j < piece.possibleMoves.length; j++) {
                    if (piece.possibleMoves[j][0] == toF && piece.possibleMoves[j][1] == toR){
                        return true
                    }
                }
                return false
            }
        }
    }

    isTileOcuupied(file, rank){
        for (var i = 0; i<this.pieces.length; i++){
            if (this.pieces[i].atThisTile(file, rank)) {
                return {occupied: true, color: this.pieces[i].color}
            }
        }
        return {occupied: false, color: null}
    }

    isGameOver() {
        // Initialize dictionaries for pieces on each board
        let piecesOnBoard1 = {'w': 0, 'b': 0};
        let piecesOnBoard2 = {'w': 0, 'b': 0};
        let piecesOnBoard3 = {'w': 0, 'b': 0};
        let piecesOnBoard4 = {'w': 0, 'b': 0};
        
        // Loop through all pieces
        for (let piece of this.pieces.filter(piece => piece.rank != null)) {
            switch (piece.board) {
                case 1:
                    piecesOnBoard1[piece.color]++;
                    break;
                case 2:
                    piecesOnBoard2[piece.color]++;
                    break;
                case 3:
                    piecesOnBoard3[piece.color]++;
                    break;
                case 4:
                    piecesOnBoard4[piece.color]++;
                    break;
            }
        }
        
        // Check all boards for win condition
        const boards = [piecesOnBoard1, piecesOnBoard2, piecesOnBoard3, piecesOnBoard4];
        for (let board of boards) {
            if (board['w'] === 0) {
                return {message: "Black Won", isOver: true};
            }
            else if (board['b'] === 0) {
                return {message: "White Won", isOver: true};
            }
        }
        
        return {message: "", isOver: false}; // Game is not over if all boards have both 'w' and 'b' pieces
    }

    isWithinBoard(newF, newR, frmF, frmR){
        if (newF > 7 || newF < 0 || newR > 7 || newR < 0){
            return false
        }
        
        else if ((frmF <= 3 && newF > 3) || (frmR <= 3 && newR > 3) || (frmF > 3 && newF <= 3) || (frmR > 3 && newR <= 3)) {
            return false
        }
        return true
    }

    calculatePassiveMoves(){
        for(let piece of this.pieces){
            piece.possibleMoves = []
            let boards = this.playerColor == 'w' ? [3, 4] : [1, 2]
            if (piece.color == this.playerColor && piece.getTile()[0] != null && (piece.board == boards[0] | piece.board == boards[1])) {
                let frmR = piece.rank
                let frmF = piece.file
                let direction = [[1,1],[-1,-1],[1,-1],[-1,1],[0,1],[0,-1],[1,0],[-1,0]]
                for(let [directionF, directionR] of direction){
                    for (let i = 1; i<3; i++) {
                        let newR = frmR + (i * directionR)
                        let newF = frmF + (i * directionF)
                        if (this.isWithinBoard(newF, newR, frmF, frmR)){
                            const tileStatus = this.isTileOcuupied(newF, newR) 
                            if (tileStatus.occupied) {
                                break
                            }
                            if (!this.canDoAggressive(piece.file, piece.color, newF-frmF, newR-frmR)){
                                break
                            } 
                            piece.possibleMoves.push([newF, newR])  
                        }
                    }
                }
            }
        }
    }

    canDoAggressive(file, color, directionF, directionR) {
        for (let piece of this.pieces) {
            const isValidMove = (piece.file <= 3 && file > 3) || (piece.file > 3 && file <= 3);
            if (piece.getTile()[0] != null && isValidMove && piece.color == color) {
                let frmF = piece.file;
                let frmR = piece.rank;
                let newF = frmF + (1 * directionF);
                let newR = frmR + (1 * directionR);

                if (!this.isWithinBoard(newF, newR, frmF, frmR)) {
                    continue;
                }
                let tileStatus = this.isTileOcuupied(newF, newR);
                if (tileStatus.color == piece.color) {
                    continue;
                } else if (tileStatus.occupied) {
                    // this code will run when the tile where the piece will land is occupied
                    let aheadF = directionF == 0 ? newF : newF + (1 * directionF / Math.abs(directionF));
                    let aheadR = directionR == 0 ? newR : newR + (1 * directionR / Math.abs(directionR));

                    if (this.isTileOcuupied(aheadF, aheadR).occupied) {
                        continue;
                    }

                    if (Math.abs(directionF) == 2 || Math.abs(directionR) == 2) {
                        let behindF = directionF == 0 ? newF : newF - (1 * directionF / Math.abs(directionF));
                        let behindR = directionR == 0 ? newR : newR - (1 * directionR / Math.abs(directionR));
                        let tileBehindStatus = this.isTileOcuupied(behindF, behindR);
                        // if the tile where the person will land is occupied and the tile behind os also occupied regarless of what color the move can't be made
                        if (tileBehindStatus.occupied) {
                            continue;
                        }
                    }
                } else {
                    // might have a problem here
                    if (Math.abs(directionF) == 2 || Math.abs(directionR) == 2) {
                        let behindF = directionF == 0 ? newF : newF - (1 * directionF / Math.abs(directionF));
                        let behindR = directionR == 0 ? newR : newR - (1 * directionR / Math.abs(directionR));
                        let tileBehindStatus = this.isTileOcuupied(behindF, behindR);

                        if (tileBehindStatus.occupied && tileBehindStatus.color == piece.color) {
                            continue;
                        }
                    }
                }
                return true;
            }
        }
        return false;
    }

    changeTurn(){
        this.playerTurn = this.playerTurn == "w" ? 'b' : "w";
    }
    
    calculateAggressiveMove(){
        for (let piece of this.pieces) {
            let [movedF, movedR, file, passiveColor] = this.passiveMoveIn
            let directionF = movedF == 0 ? 0 : movedF/Math.abs(movedF)
            let directionR = movedR == 0 ? 0 : movedR/Math.abs(movedR)
            let frmR = piece.rank
            let frmF = piece.file
            let newF = frmF + movedF
            let newR = frmR + movedR
            piece.possibleMoves = []
    
            const isValidMove = (file <= 3 && piece.file > 3) || (file > 3 && piece.file <= 3)
            if (isValidMove && passiveColor == piece.color) {
                if (!this.isWithinBoard(newF, newR, frmF, frmR)) {
                    continue
                }
                let tileStatus = this.isTileOcuupied(newF, newR)
                if (tileStatus.occupied) {
                    // Only proceed if the piece to be pushed is of opposite color
                    if (tileStatus.color != piece.color) {
                        let aheadF = newF + (1 * directionF)
                        let aheadR = newR + (1 * directionR)
                        let isWithinBoard = this.isWithinBoard(aheadF, aheadR, newF, newR)

                        if (isWithinBoard) {
                            let tileAheadStatus = this.isTileOcuupied(aheadF, aheadR)
                            
                            if (Math.abs(movedF) == 2 || Math.abs(movedR) == 2) {
                                let behindF = newF - (1 * directionF)
                                let behindR = newR - (1 * directionR)
                                let tileBehindStatus = this.isTileOcuupied(behindF, behindR)
                                
                                // Only allow the move if:
                                // 1. The space ahead is empty AND
                                // 2. The tile behind is empty (for two-unit moves)
                                
                                if (!tileAheadStatus.occupied && !tileBehindStatus.occupied) {
                                    if (piece.file == 0 && piece.rank == 4){
                                        
                                        console.log('okay this move was pusheb', newF, newR)
                                    }
                                    piece.possibleMoves.push([newF, newR])
                                }
                            } else {
                                if (!tileAheadStatus.occupied) {
                                    piece.possibleMoves.push([newF, newR])
                                }
                            }
                        }
                        else {
                            // wheather the color is same or not is already being checked above 
                            piece.possibleMoves.push([newF, newR])
                        }                
                    }
                } else {
                    // If the tile is not occupied, simply add the move in case of one unit move
                    // in case of two unit move, check if the tile behind is either empty or of opposite color
                    if (Math.abs(movedF) == 2 || Math.abs(movedR) == 2) {
                        let behindF = newF - (1 * directionF);
                        let behindR = newR - (1 * directionR);
                        let tileBehindStatus = this.isTileOcuupied(behindF, behindR);
                        if (piece.file == 0 && piece.rank == 4){
                            console.log('okay got the real problem here')
                            console.log(tileBehindStatus)
                        }
    
                        if (!tileBehindStatus.occupied) {
                            piece.possibleMoves.push([newF, newR]);
                        }
                    } else {
                        piece.possibleMoves.push([newF, newR]);
                    }
                }
            }
        }
    }

    // if the moveType was aggressive then change player turn
    movePiece(frmR, frmF, toR, toF){
        // this going to change the move type of the player
        let pieceToMove = this.pieces.find(piece => piece.atThisTile(frmF, frmR) == true)
        let pieceToPush = this.pieces.find(piece => piece.atThisTile(toF, toR) == true)
        pieceToMove.setTile(toF, toR)
        if (this.moveType == 'passive') {
            this.passiveMoveIn = [toF - frmF, toR - frmR, pieceToMove.file, pieceToMove.color]
            this.moveType = "aggressive"
            this.calculateAggressiveMove()
        }
        else {
            this.passiveMoveIn = []
            let movedF = toF - frmF
            let movedR = toR - frmR
            let directionF = movedF == 0 ? 0 : movedF / Math.abs(movedF)
            let directionR = movedR == 0 ? 0 : movedR / Math.abs(movedR)
            if ((Math.abs(movedF) == 2 || Math.abs(movedR) == 2) && !pieceToPush) {
                let behindF = toF - (1*directionF)
                let behindR = toR - (1*directionR)
                pieceToPush = this.pieces.find(piece => piece.atThisTile(behindF, behindR) == true)
            }
            if (pieceToPush){
                let pushToR = toR + (1 * directionR)
                let pushToF = toF + (1 * directionF)
                if (!this.isWithinBoard(pushToF, pushToR, frmF, frmR)) {
                    pushToF = null
                    pushToR = null
                }
                pieceToPush.setTile(pushToF, pushToR)
            }
            this.moveType = "passive"
            this.changeTurn();
            this.calculatePassiveMoves();
        }
    }    
}