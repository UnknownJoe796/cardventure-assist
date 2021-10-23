/** @jsx jsx */
import {
    mapMutable,
    StandardProperty,
    jsx,
    Property,
    MutableProperty,
    map,
    bindArray,
    flatMapMutable
} from 'rxjs-property'
import {buildCharacter, Character} from "./deckBuild";
import {Card, rankSymbols, Suit, suitColor, suitSymbols} from "./deck";
import {Subject} from "rxjs";

const characters = new StandardProperty<Array<StandardProperty<Character>>>([])

function SuitLevelEntry(
    {
        suitLevels,
        suitCounts,
        suit
    }: {
        suitLevels: Array<StandardProperty<number>>,
        suitCounts: Array<StandardProperty<number>>,
        suit: Suit
    }
): HTMLElement {
    return <div>
        <span>{suitSymbols[suit]}</span>
        <label for={`suit-${suit}`}>Count</label>
        <input id={`suit-${suit}`} type="number"
               min={3}
               max={12}
               value--onInput={suitCounts[suit].pipe(mapMutable(a => a.toString(), a => parseInt(a)))}/>
        <label for={`suit-${suit}`}>Level</label>
        <input id={`suit-${suit}`} type="number"
               min={0}
               max={7}
               value--onInput={suitLevels[suit].pipe(mapMutable(a => a.toString(), a => parseInt(a)))}/>
    </div>
}

function CharacterForm(): HTMLElement {
    const name = new StandardProperty("")
    const suitCounts = [
        new StandardProperty(6),
        new StandardProperty(6),
        new StandardProperty(6),
        new StandardProperty(6),
    ]
    const suitLevels = [
        new StandardProperty(1),
        new StandardProperty(1),
        new StandardProperty(1),
        new StandardProperty(1),
    ]
    const focus = new StandardProperty(5)
    const luckPoints = new StandardProperty(1)
    return <div>
        <form onSubmit={ev => {
            ev.preventDefault()
            characters.value.push(new StandardProperty(buildCharacter(
                name.value,
                suitLevels.map(x => x.value),
                suitCounts.map(x => x.value),
                focus.value,
                luckPoints.value
            )))
            name.value = ""
            suitCounts[0].value = 6
            suitCounts[1].value = 6
            suitCounts[2].value = 6
            suitCounts[3].value = 6
            suitLevels[0].value = 1
            suitLevels[1].value = 1
            suitLevels[2].value = 1
            suitLevels[3].value = 1
            focus.value = 5
            luckPoints.value = 1
            characters.update()
        }}>
            <h4>Add Character</h4>

            <div>
                <label for="name">Name</label>
                <input id="name" type="text" value--onInput={name}/>
            </div>

            <SuitLevelEntry suitLevels={suitLevels} suitCounts={suitCounts} suit={0}/>
            <SuitLevelEntry suitLevels={suitLevels} suitCounts={suitCounts} suit={1}/>
            <SuitLevelEntry suitLevels={suitLevels} suitCounts={suitCounts} suit={2}/>
            <SuitLevelEntry suitLevels={suitLevels} suitCounts={suitCounts} suit={3}/>

            <div>
                <label for="focus">Focus</label>
                <input
                    id="focus"
                    type="number"
                    min={0}
                    max={7}
                    value--onInput={focus.pipe(mapMutable(a => a.toString(), a => parseInt(a)))}
                />
            </div>

            <div>
                <label for="luck">Luck</label>
                <input
                    id="luck"
                    type="number"
                    min={0}
                    max={7}
                    value--onInput={luckPoints.pipe(mapMutable(a => a.toString(), a => parseInt(a)))}
                />
            </div>

            <button>Generate</button>

        </form>

    </div>
}

function CardButton({card, onClick}: { card: Property<Card>, onClick: () => void }) {
    return <button onClick={onClick}>
        <CardDisplay card={card}/>
    </button>
}

function CardDisplay({card}: { card: Property<Card | null> }) {
    return <span style-color={card.pipe(map(x => x ? suitColor[x.suit] : "black"))}>
        <span>{card.pipe(map(x => x ? suitSymbols[x.suit] : ""))}</span>
        <span>{card.pipe(map(x => x ? rankSymbols[x.rank] : ""))}</span>
    </span>
}

function CharacterDisplay({character}: { character: MutableProperty<Character> }) {
    const lastPlayed = new StandardProperty<Card | null>(null)
    character.subscribe(x => console.log(x))
    return <div>
        <div>
            <h4>{character.pipe(map(x => x.name))}</h4>
            <button onClick={ev => {
                characters.value = characters.value.filter(x => x.value !== character.value)
            }}>Remove
            </button>
        </div>
        <label for="luck">Luck</label>
        <input
            id="luck"
            type="number"
            min={0}
            max={character.pipe(map(x => x.totalLuckPoints))}
            value--onInput={character.pipe(mapMutable(x => x.luckPoints, x => {
                character.value.luckPoints = x
                return character.value
            })).pipe(mapMutable(a => a.toString(), a => parseInt(a)))}
        />
        <button onClick={ev => {
            console.log("Drawing...")
            character.value.draw()
            character.update()
            console.log("Update sent")
        }}>Deck: {character.pipe(map(x => x.deck.length))}</button>
        <span>Discard: {character.pipe(map(x => x.discard.length))}</span>
        <button onClick={ev => {
            character.value.hand.dump(character.value.discard)
            character.value.reshuffle()
            character.value.prepare()
            character.update()
        }}>Focus
        </button>
        <div>{bindArray<Card>(
            character.pipe(map(x => x.hand.cards)),
            x => <CardButton card={x} onClick={() => {
                character.value.play(x.value)
                lastPlayed.value = x.value
                character.update()
            }}/>
        )}</div>
        <div>Last played: <CardDisplay card={lastPlayed}/></div>
        <textarea value--onInput={character.pipe(mapMutable(x => x.notes, x => {
            character.value.notes = x
            return character.value
        }))}/>
    </div>
}

document.body.appendChild(<div>
    <CharacterForm/>
    <div>
        <h2>Characters</h2>
        <div>{bindArray(
            characters,
            x => <CharacterDisplay character={x.pipe(flatMapMutable(x => x))}/>
        )}</div>
    </div>
</div>)
