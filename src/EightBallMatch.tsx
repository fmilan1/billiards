import { useEffect, useState } from "react";
import { Ball } from "./components/Ball";
import { useSearchParams } from "react-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export interface EightBallMatchInterface {
    id: string,
    type: string,
    player1: string,
    player2: string,
    balls: number[],
    score1: number,
    score2: number,
    player: number,
    raceTo: number,
    colors: string[],
    overlayHidden: boolean,
    foulsToLose: number,
    fouls1: number,
    fouls2: number,
    player1balls: 'stripes' | 'solids',
}

const EightBallMatch = () => {

    const [searchParams, _setSearchParams] = useSearchParams();
    const [_id, setId] = useState('');

    const [balls, setBalls] = useState<number[]>([]);
    const [colors, setColors] = useState([]);
    const [foulsToLose, setFoulsToLose] = useState(0);
    const [fouls1, setFouls1] = useState(0);
    const [fouls2, setFouls2] = useState(0);

    const [player1balls, setPlayer1balls] = useState<'stripes' | 'solids'>();

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setId(id);
            const unsubscribeMatch = onSnapshot(doc(db, 'matches', id), snapshot => {
                setScore1(snapshot.get('score1'));
                setScore2(snapshot.get('score2'));
                setPlayer1(snapshot.get('player1'));
                setPlayer2(snapshot.get('player2'));
                setBalls(snapshot.get('balls'));
                setPlayer(snapshot.get('player'));
                setRaceTo(snapshot.get('raceTo'));
                setColors(snapshot.get('colors'));
                setHidden(snapshot.get('overlayHidden'));
                setFoulsToLose(snapshot.get('foulsToLose'));
                setFouls1(snapshot.get('fouls1'));
                setFouls2(snapshot.get('fouls2'));
                setPlayer1balls(snapshot.get('player1balls'))
            });

            return () => {
                unsubscribeMatch();
            }
        }
    }, []);

    const [player, setPlayer] = useState(0); //0: no player indicated, 1: left player, 2: right player
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [raceTo, setRaceTo] = useState(0);

    const [hidden, setHidden] = useState(false);

    const EightBall = () => {
        return <Ball type={'pool'} color="black" value={8} potted={!balls.includes(8)} />
    }

    return (
        <div className={`container ${hidden ? 'hidden' : ''}`}>
            <div className="player player1">
                <div className="name">{player1}</div>
                {foulsToLose > 0 &&
                    <div className="fouls">
                        {Array.from({ length: foulsToLose }).map((_, idx) => (
                            <div key={idx} className={`foul-bar ${fouls1 > idx ? 'foul' : 'no-foul'}`} />
                        ))}
                    </div>
                }
                <div className="balls">
                    {(player1balls === 'solids' || player1balls === 'stripes') &&
                        <>
                            {balls.filter(b => player1balls === 'solids' ? (b < 8) : player1balls === 'stripes' ? (b > 8) : false).length > 0 ?
                                Array.from({ length: 7 }).map((_, idx) => idx + 1 + (player1balls === 'solids' ? 0 : player1balls === 'stripes' ? 8 : 0)).map((v, idx) => (
                                    <Ball
                                        type="pool"
                                        key={idx}
                                        value={v}
                                        color={colors[idx]}
                                        potted={!balls.includes(v)}
                                    />
                                ))
                                :
                                <EightBall />
                            }
                        </>
                    }
                </div>
            </div>
            <div className="scores">
                <div className="score score1">{score1}</div>
                <div className="race-to score">
                    <div className="text">Race to</div>
                    <span>{raceTo}</span>
                </div>
                <div className="score score2">{score2}</div>
                <div className={`indicator ${player === 1 ? 'left' : player === 2 ? 'right' : 'hide'}`}>
                    <Ball
                        type="pool"
                        color="white"
                    />
                </div>
            </div>
            <div className="player player2">
                <div className="name">{player2}</div>
                {foulsToLose > 0 &&
                    <div className="fouls">
                        {Array.from({ length: foulsToLose }).map((_, idx) => (
                            <div key={idx} className={`foul-bar ${fouls2 > idx ? 'foul' : 'no-foul'}`} />
                        ))}
                    </div>
                }
                <div className="balls">
                    {(player1balls === 'solids' || player1balls === 'stripes') &&
                        <>
                            {balls.filter(b => player1balls === 'solids' ? (b > 8) : player1balls === 'stripes' ? (b < 8) : false).length > 0 ?
                                Array.from({ length: 7 }).map((_, idx) => idx + 1 + (player1balls === 'stripes' ? 0 : player1balls === 'solids' ? 8 : 0)).map((v, idx) => (
                                    <Ball
                                        type="pool"
                                        key={idx}
                                        value={v}
                                        color={colors[idx]}
                                        potted={!balls.includes(v)}
                                    />
                                ))
                                :
                                <EightBall />
                            }
                        </>
                    }
                </div>
            </div>
        </div>
    );
}

export default EightBallMatch;
