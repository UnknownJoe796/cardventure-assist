
export enum Suit { Spades, Hearts, Clubs, Diamonds, Joker }

export const suitSymbols = ['♠', '♥', '♣', '♦', '★']
export const suitColor = [
    '#000',
    '#F66',
    '#000',
    '#F66',
    '#00F',
]

export enum Rank {
    Two = 2,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Jack,
    Queen,
    King,
    Ace,
    Joker
}

export const rankSymbols = [
    "-",
    "-",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
    "Joker",
]

export class Card {
    suit: Suit
    rank: Rank
    constructor(suit: Suit, rank: Rank) {
        this.suit = suit
        this.rank = rank
    }
    toString(): string {
        if(this.rank == Rank.Joker) return "Joker"
        return suitSymbols[this.suit] + rankSymbols[this.rank]
    }
    static compareSuit(left: Card, right: Card): number {
        if(left.suit !== right.suit) return left.suit - right.suit
        else return left.rank - right.rank
    }
    static compareRank(left: Card, right: Card): number {
        if(left.rank !== right.rank) return left.rank - right.rank
        else return left.suit - right.suit
    }
}

export class Deck {
    cards: Array<Card>
    constructor(cards: Array<Card>) {
        this.cards = cards
    }
    shuffle() {
        this.cards = this.cards
            .map(x => [x, Math.random()] as [Card, number])
            .sort((a, b) => a[1] - b[1])
            .map(x => x[0])
    }
    draw(): Card | undefined {
        return this.cards.pop()
    }
    get length(): number { return this.cards.length }
    get value(): number { return this.cards.map(x => x.rank).reduce((prev, current) => prev + current) }

    drawFrom(deck: Deck): boolean {
        const drawn = deck.draw()
        if (drawn) this.cards.push(drawn)
        this.cards.sort(Card.compareSuit)
        return !!drawn
    }
    drawUpTo(count: number, deck: Deck) {
        while(this.length < count) {
            if(!this.drawFrom(deck)) return
        }
    }
    play(card: Card, to: Deck) {
        this.cards = this.cards.filter(x => x !== card)
        to.cards.push(card)
    }
    dump(to: Deck) {
        to.cards = to.cards.concat(this.cards)
        this.cards = []
    }
}
