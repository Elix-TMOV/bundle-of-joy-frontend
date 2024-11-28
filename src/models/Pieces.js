export default class Pieces {
    constructor (color, name, rank, file) {
        this.color = color
        this.name = `${color}_${name}`
        this.rank = rank
        this.file = file
        this.image = `/assets/${color}_${name}.png`
        this.possibleMoves = []
        this.hasMoved = false
    }

    getTile(){
        return [this.file, this.rank]
    }

    atThisTile(file, rank){
        return this.file == file && this.rank == rank
    }

    setTile(toF, toR){
        this.file = toF
        this.rank = toR
    }
}
