import Pieces from "./Pieces";

export default class ShobuPiece extends Pieces {
    constructor (color, name, rank, file, board) {
        super(color, name, rank, file)
        this.board = board
    }
}