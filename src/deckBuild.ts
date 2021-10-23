import {Card, Deck, Rank, Suit} from './deck'

export function focusCost(input: number) {
    if(input <= 3) return 0
    return Math.pow(2, input - 3)
}
export function luckCost(input: number) {
    return Math.pow(2, input)
}

export class Character {
    name: string
    deck: Deck
    discard: Deck = new Deck([])
    hand: Deck = new Deck([])
    handSize: number
    luckPoints: number
    totalLuckPoints: number
    notes: string = ""

    constructor(
        name: string,
        deck: Deck,
        handSize: number,
        luckPoints: number
    ) {
        this.name = name
        this.deck = deck
        this.handSize = handSize
        this.luckPoints = luckPoints
        this.totalLuckPoints = luckPoints
        this.prepare()
    }

    draw() {
        this.hand.drawFrom(this.deck)
    }

    prepare() {
        this.hand.drawUpTo(this.handSize, this.deck)
    }

    play(card: Card) {
        this.hand.play(card, this.discard)
    }

    reshuffle() {
        this.luckPoints = this.totalLuckPoints
        this.discard.dump(this.deck)
        this.deck.shuffle()
    }

    takeHit(): boolean {
        this.luckPoints -= 1
        return this.luckPoints <= 0
    }
}

const baseDeck = [...Array(4).keys()].flatMap(suit =>
    [...Array(6).keys()].map(rankOffset =>
        new Card(suit, Rank.Two + rankOffset)
    )
).concat([new Card(Suit.Joker, Rank.Joker)])


function levelUp(deck: Deck, suit: Suit) {
    const lowest = deck.cards
        .filter(x => x.suit === suit)
        .reduce((prev, current) => prev.rank < current.rank ? prev : current)
    const highest = deck.cards
        .filter(x => x.suit === suit)
        .reduce((prev, current) => prev.rank > current.rank ? prev : current)
    deck.cards.splice(deck.cards.indexOf(lowest), 1)
    deck.cards.push(new Card(suit, highest.rank + 1))
}

function unbalance(deck: Deck, from: Suit, to: Suit) {
    const highestFrom = deck.cards
        .filter(x => x.suit === from)
        .reduce((prev, current) => prev.rank > current.rank ? prev : current)
    const highestTo = deck.cards
        .filter(x => x.suit === to)
        .reduce((prev, current) => prev.rank > current.rank ? prev : current)
    deck.cards.splice(deck.cards.indexOf(highestFrom), 1)
    deck.cards.push(new Card(to, highestTo.rank + 1))
}

export function buildCharacter(
    name: string,
    levels: Array<number>,
    suitCounts: Array<number>,
    focus: number,
    luckPoints: number
): Character {
    const deck = new Deck([...Array(4).keys()].flatMap(suit =>
        [...Array(suitCounts[suit]).keys()].map(rankOffset =>
            new Card(suit, Rank.Two + rankOffset + levels[suit])
        )
    ).concat([new Card(Suit.Joker, Rank.Joker)]))

    return new Character(
        name,
        deck,
        focus,
        luckPoints
    )
}

/*

ABILITY TRANSLATION

Skill -> Spades
Fitness -> Clubs
Awareness, Reasoning -> Diamonds
Creativity, Influence -> Hearts

0 - Sub level 1
1 - Level 1
2 - Level 2
3 - Level 3
4 - Level 5
5 - Level 8

234567890JQKA
xxxxxx
 xxxxxx
  xxxxxx
   xxxxxx
    xxxxxx
     xxxxxx
      xxxxxx
       xxxxxx


8 levels

25 cards, 6 per suit (default) + 1 joker
Unbalancing - maximum is 12/4/4/4
Minimum is 7/7/7/3

Total levels - 8 * 4 = 32



SKILL TRANSLATION

0 - -3 modifier
1 - -2 modifier
2 - -1 modifier
3 - 0 modifier
4 - +1 modifier
5 - +2 modifier
6 - +3 modifier
7 - +4 modifier
8 - +5 modifier


STATUS EFFECTS

Dazed - Hand is returned to deck, draw blind
In Pain - Play clubs with every action
Limb Disabled - Certain things aren't possible or have a large disadvantage

 */