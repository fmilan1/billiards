import { useEffect, useState } from "react"
import { type EightBallMatchInterface } from "../EightBallMatch"
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useSearchParams } from "react-router";
import { Ball } from "../components/Ball";

export const Admin = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [matches, setMatches] = useState<EightBallMatchInterface[]>([]);

    const [matchID, setMatchID] = useState('');
    const [match, setMatch] = useState<EightBallMatchInterface>();

    const [selectedBalls, setSelectedBalls] = useState<number[]>([]);

    const [_player1name, setPlayer1name] = useState(match?.player1);
    const [_player2name, setPlayer2name] = useState(match?.player2);

    useEffect(() => {
        const id = searchParams.get('matchID');
        if (id) {
            setMatchID(id);
        }
        else {
            setMatchID('');
        }

        onSnapshot(collection(db, 'matches'), snapshot => {
            setMatches(snapshot.docs.map(d => ({
                id: d.id,
                type: d.get('type'),
                player1: d.get('player1'),
                player2: d.get('player2'),
                player: d.get('player'),
                balls: d.get('balls'),
                raceTo: d.get('raceTo'),
                score1: d.get('score1'),
                score2: d.get('score2'),
                colors: d.get('colors'),
                overlayHidden: d.get('overlayHidden'),
                foulsToLose: d.get('foulsToLose'),
                fouls1: d.get('fouls1'),
                fouls2: d.get('fouls2'),
                player1balls: d.get('player1balls'),
            })));
        });
    }, []);

    useEffect(() => {
        const m = matches.find(m => m.id === matchID);
        setMatch(m);
        setPlayer1name(m?.player1);
        setPlayer2name(m?.player2);
    }, [matchID, matches]);


    if (matchID && match) {


        const increaseScore1 = () => {
            updateDoc(doc(db, 'matches', matchID), {
                score1: match?.score1 + 1,
            });
        }

        const decreaseScore1 = () => {
            updateDoc(doc(db, 'matches', matchID), {
                score1: match?.score1 - 1,
            });
        }

        const increaseFouls1 = () => {
            const newFoul = match.fouls1 + 1;
            if (newFoul >= match.foulsToLose) {
                increaseScore2();
                newFrame();
            }
            else {
                updateDoc(doc(db, 'matches', matchID), {
                    fouls1: match?.fouls1 + 1,
                });
            }
        }

        const decreaseFouls1 = () => {
            const newFoul = match.fouls1 - 1;
            if (newFoul < 0) return;
            updateDoc(doc(db, 'matches', matchID), {
                fouls1: newFoul,
            });
        }

        const increaseScore2 = () => {
            updateDoc(doc(db, 'matches', matchID), {
                score2: match?.score2 + 1,
            });
        }

        const decreaseScore2 = () => {
            updateDoc(doc(db, 'matches', matchID), {
                score2: match?.score2 - 1,
            });
        }

        const increaseFouls2 = () => {
            const newFoul = match.fouls2 + 1;
            if (newFoul >= match.foulsToLose) {
                increaseScore1();
                newFrame();
            }
            else {
                updateDoc(doc(db, 'matches', matchID), {
                    fouls2: newFoul,
                });
            }
        }

        const decreaseFouls2 = () => {
            const newFoul = match.fouls2 - 1;
            if (newFoul < 0) return;
            updateDoc(doc(db, 'matches', matchID), {
                fouls2: newFoul,
            });
        }

        const increaseRaceTo = () => {
            updateDoc(doc(db, 'matches', matchID), {
                raceTo: match.raceTo + 1,
            });
        }

        const decreaseRaceTo = () => {
            updateDoc(doc(db, 'matches', matchID), {
                raceTo: match.raceTo - 1,
            });
        }

        const increaseFoulsToLose = () => {
            updateDoc(doc(db, 'matches', matchID), {
                foulsToLose: match.foulsToLose + 1,
            });
        }

        const decreaseFoulsToLose = () => {
            updateDoc(doc(db, 'matches', matchID), {
                foulsToLose: match.foulsToLose - 1,
            });
        }

        const handlePot = () => {
            let newObj: { balls: any, player1balls?: any } = {
                balls: match.balls.filter(function(v) {
                    return !selectedBalls.includes(v);
                }),
            };
            if (!match.player1balls && selectedBalls.length > 0) {
                if (match.player === 1) {
                    if (selectedBalls[0] < 8) newObj['player1balls'] = 'solids';
                    else newObj['player1balls'] = 'stripes';
                }
                else if (match.player === 2) {
                    if (selectedBalls[0] > 8) newObj['player1balls'] = 'solids';
                    else newObj['player1balls'] = 'stripes';
                }
            }
            updateDoc(doc(db, 'matches', matchID), newObj);
            if (selectedBalls.includes(8)) {
                const solids = match.balls.filter(b => b < 8);
                const stripes = match.balls.filter(b => b > 8);
                if (match.player === 1) {
                    if (match.player1balls === 'solids') {
                        if (solids.length === 0) increaseScore1();
                        else increaseScore2();
                    }
                    else if (match.player1balls === 'stripes') {
                        if (stripes.length === 0) increaseScore1();
                        else increaseScore2();
                    }
                }
                else if (match.player === 2) {
                    if (match.player1balls === 'solids') { // is player 2 stripes?
                        if (stripes.length === 0) increaseScore2();
                        else increaseScore1();
                    }
                    else if (match.player1balls === 'stripes') { // is player 2 solids?
                        if (solids.length === 0) increaseScore2();
                        else increaseScore1();
                    }
                }
            }
            setSelectedBalls([]);
        }

        const newFrame = () => {
            setSelectedBalls([]);
            updateDoc(doc(db, 'matches', matchID), {
                balls: Array.from({ length: 15 }).map((_, idx) => idx + 1),
                fouls1: 0,
                fouls2: 0,
                player1balls: '',
            });
            changePlayer(0);
        }

        const endBreak = () => {
            changePlayer(3 - match.player);
        }

        const changePlayer = (v: number) => {
            const newPlayer = match.player === v ? 0 : v;
            updateDoc(doc(db, 'matches', matchID), {
                player: newPlayer,
            });
        }

        const toggleOverlay = () => {
            updateDoc(doc(db, 'matches', matchID), {
                overlayHidden: !match.overlayHidden,
            });
        }

        const WrapperBalls = (props: { solid: boolean }) => {

            const select = (v: number) => {
                setSelectedBalls(prev => {
                    if (match.player === 0 || !match.balls.includes(v)) return prev;
                    if (prev.includes(v)) return prev.filter(b => b !== v);
                    let tmp = [...prev];
                    tmp.push(v);
                    return tmp;
                })
            }

            return (
                <>
                    {
                        match.player1balls ?
                            <div className="balls">
                                {Array.from({ length: 7 }).map((_, idx) => idx + (props.solid ? 1 : 9)).map((v, idx) => (
                                    <Ball type="pool" value={v} color={match.colors[idx]} potted={!match.balls.includes(v)} selected={selectedBalls.includes(v)}
                                        onClick={() => select(v)}
                                    />
                                ))}
                            </div>
                            :
                            <>
                                <div className="balls">
                                    {Array.from({ length: 7 }).map((_, idx) => idx + 1).map((v, idx) => (
                                        <Ball type="pool" value={v} color={match.colors[idx]} potted={!match.balls.includes(v)} selected={selectedBalls.includes(v)}
                                            onClick={() => select(v)}
                                        />
                                    ))}
                                </div>
                                <div className="balls">
                                    {Array.from({ length: 7 }).map((_, idx) => idx + 9).map((v, idx) => (
                                        <Ball type="pool" value={v} color={match.colors[idx]} potted={!match.balls.includes(v)} selected={selectedBalls.includes(v)}
                                            onClick={() => select(v)}
                                        />
                                    ))}
                                </div>
                            </>
                    }
                </>
            )
        }

        return (
            <div className="maincontainer">
                <div className="match-properties">
                    <div className="row">
                        <button onClick={decreaseScore1}>-</button>
                        <div className="wrapper">
                            <div
                                onClick={() => changePlayer(1)}
                                className="property"
                            >
                                {match.player1}
                                {match.player === 1 &&
                                    <Ball type="pool" color="white" />
                                }
                                <div className="score">{match.score1}</div>
                                <div className="fouls">
                                    {Array.from({ length: match.foulsToLose }).map((_, idx) => <div className={`foul-bar ${idx < match.fouls1 ? 'foul' : 'no-foul'}`} />)}
                                </div>
                            </div>
                            {match.player === 1 &&
                                <WrapperBalls solid={match.player1balls === 'solids'} />
                            }
                        </div>
                        <button onClick={increaseScore1}>+</button>
                    </div>

                    <div className="row">
                        <button onClick={decreaseScore2}>-</button>
                        <div className="wrapper">
                            <div
                                onClick={() => changePlayer(2)}
                                className="property"
                            >
                                {match.player2}
                                {match.player === 2 &&
                                    <Ball type="pool" color="white" />
                                }
                                <div className="score">{match.score2}</div>
                                <div className="fouls">
                                    {Array.from({ length: match.foulsToLose }).map((_, idx) => <div className={`foul-bar ${idx < match.fouls2 ? 'foul' : 'no-foul'}`} />)}
                                </div>
                            </div>
                            {match.player === 2 &&
                                <WrapperBalls solid={match.player1balls !== 'solids'} />
                            }
                        </div>
                        <button onClick={increaseScore2}>+</button>
                    </div>

                    <div className="row">
                        <button onClick={decreaseRaceTo}>-</button>
                        <div className="property">
                            Race to
                            <div className="score">
                                {match?.raceTo}
                            </div>
                        </div>
                        <button onClick={increaseRaceTo}>+</button>
                    </div>
                    <div className="row">
                        <button onClick={decreaseFoulsToLose}>-</button>
                        <div className="property">
                            Fouls to lose
                            <div className="score">
                                {match?.foulsToLose}
                            </div>
                        </div>
                        <button onClick={increaseFoulsToLose}>+</button>
                    </div>
                </div>
                {/* <div className="row"> */}
                {/*     <div className="adminballs"> */}
                {/*         {Array.from({ length: 15 }).map((_, idx) => idx + 1).map((v, idx) => ( */}
                {/*             <Ball */}
                {/*                 key={idx} */}
                {/*                 type="pool" */}
                {/*                 value={v} */}
                {/*                 color={match?.colors[idx % 8]} */}
                {/*                 onClick={() => { */}
                {/*                     if (match.player !== 0 && match.balls.includes(v) && !selectedBalls.includes(v)) { */}
                {/*                         setSelectedBalls(prev => { */}
                {/*                             let tmp = [...prev]; */}
                {/*                             tmp.push(v); */}
                {/*                             return tmp; */}
                {/*                         }); */}
                {/*                     } else { */}
                {/*                         setSelectedBalls(prev => { */}
                {/*                             return prev.filter(t => t !== v); */}
                {/*                         }) */}
                {/*                     } */}
                {/*                 }} */}
                {/*                 selected={selectedBalls.includes(v)} */}
                {/*                 potted={!match.balls.includes(v)} */}
                {/*             /> */}
                {/*         ))} */}
                {/*     </div> */}
                {/* </div> */}
                <div className="row">
                    {match.player !== 0 &&
                        <>
                            <button onClick={selectedBalls.length > 0 ? handlePot : endBreak}>{selectedBalls.length > 0 ? 'belokes' : 'break vege'}</button>
                            <button onClick={match.player === 1 ? increaseFouls1 : increaseFouls2}>hiba</button>
                        </>
                    }
                    <button onClick={newFrame}>uj frame</button>
                </div>
                <div className="row">
                    <button onClick={toggleOverlay}>overlay {match.overlayHidden ? 'mutatasa' : 'eltuntetese'}</button>
                </div>
            </div>
        );
    }

    if (!matchID) {
        return (
            <div>
                <h1>8 ball meccsek</h1>
                {matches.map((m, idx) => (
                    <div key={idx} className="match-container"
                        onClick={() => {
                            setMatchID(m.id);
                            setSearchParams(sp => {
                                sp.set('matchID', m.id);
                                return sp;
                            });
                        }}
                    >
                        <div>{m.player1}</div>
                        <div>{m.score1}</div>
                        <div>race to {m.raceTo}</div>
                        <div>{m.score2}</div>
                        <div>{m.player2}</div>
                    </div>
                ))}
            </div>
        );
    }
}
