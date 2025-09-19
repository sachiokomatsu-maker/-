
import React, { useState, useCallback, useEffect } from 'react';
import Board from './components/Board';
import GameStats from './components/GameStats';
import NextPiece from './components/NextPiece';
import Modal from './components/Modal';
import { usePlayer } from './hooks/usePlayer';
import { useBoard } from './hooks/useBoard';
import { useGameStatus } from './hooks/useGameStatus';
import { useInterval } from './hooks/useInterval';
import { createBoard, checkCollision, TETROMINOS } from './gameHelpers';

const App: React.FC = () => {
    const [dropTime, setDropTime] = useState<number | null>(null);
    const [gameOver, setGameOver] = useState(true);
    const [paused, setPaused] = useState(false);

    const [player, updatePlayerPos, resetPlayer, playerRotate] = usePlayer();
    const [board, setBoard, rowsCleared] = useBoard(player, resetPlayer);
    const { score, setScore, rows, setRows, level, setLevel } = useGameStatus(rowsCleared);
    
    const [nextTetromino, setNextTetromino] = useState(Object.keys(TETROMINOS)[0]);

    const generateNextTetromino = useCallback(() => {
        const tetrominos = 'IJLOSTZ';
        const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
        if(TETROMINOS[randTetromino].shape.length > 0) { // check if valid tetromino
             setNextTetromino(randTetromino);
        } else {
             generateNextTetromino();
        }
    }, []);

    useEffect(() => {
        generateNextTetromino();
    }, [generateNextTetromino]);

    const startGame = useCallback(() => {
        setBoard(createBoard());
        generateNextTetromino();
        resetPlayer(nextTetromino);
        setScore(0);
        setRows(0);
        setLevel(0);
        setGameOver(false);
        setPaused(false);
        setDropTime(1000);
    }, [nextTetromino, resetPlayer, setBoard, setLevel, setRows, setScore, generateNextTetromino]);

    const movePlayer = (dir: -1 | 1) => {
        if (!checkCollision(player, board, { x: dir, y: 0 })) {
            updatePlayerPos({ x: dir, y: 0, collided: false });
        }
    };

    const drop = () => {
        if (paused || gameOver) return;
        // Increase level when player has cleared 10 rows
        if (rows > (level + 1) * 10) {
            setLevel(prev => prev + 1);
            // Also increase speed
            setDropTime(1000 / (level + 1) + 200);
        }

        if (!checkCollision(player, board, { x: 0, y: 1 })) {
            updatePlayerPos({ x: 0, y: 1, collided: false });
        } else {
            // Game Over!
            if (player.pos.y < 1) {
                setGameOver(true);
                setDropTime(null);
            }
            updatePlayerPos({ x: 0, y: 0, collided: true });
        }
    };

    const keyUp = ({ keyCode }: { keyCode: number }) => {
        if (!gameOver && !paused) {
            if (keyCode === 40) { // Down arrow
                setDropTime(1000 / (level + 1) + 200);
            }
        }
    };

    const dropPlayer = () => {
        setDropTime(null);
        drop();
    };
    
    const hardDrop = () => {
      if (paused || gameOver) return;
      let dropDistance = 0;
      while(!checkCollision(player, board, { x: 0, y: dropDistance + 1 })) {
        dropDistance++;
      }
      updatePlayerPos({ x: 0, y: dropDistance, collided: true });
      setScore(prev => prev + dropDistance * 2);
    }
    
    const togglePause = () => {
        if (!gameOver) {
            setPaused(prev => !prev);
            if (paused) {
                setDropTime(1000 / (level + 1) + 200);
            } else {
                setDropTime(null);
            }
        }
    };

    const move = useCallback(({ keyCode }: { keyCode: number }) => {
        if (!gameOver && !paused) {
            if (keyCode === 37) { // Left arrow
                movePlayer(-1);
            } else if (keyCode === 39) { // Right arrow
                movePlayer(1);
            } else if (keyCode === 40) { // Down arrow
                dropPlayer();
            } else if (keyCode === 38 || keyCode === 88) { // Up arrow or X for clockwise rotation
                playerRotate(board, 1);
            } else if (keyCode === 90 || keyCode === 17) { // Z or Ctrl for counter-clockwise rotation
                playerRotate(board, -1);
            } else if (keyCode === 32) { // Space for hard drop
                hardDrop();
            } else if (keyCode === 80) { // P for pause
                togglePause();
            }
        }
    }, [board, gameOver, paused, player, playerRotate, hardDrop]);

    useEffect(() => {
        window.addEventListener('keydown', move);
        window.addEventListener('keyup', keyUp);
        return () => {
            window.removeEventListener('keydown', move);
            window.removeEventListener('keyup', keyUp);
        };
    }, [move]);

    useInterval(() => {
        drop();
    }, dropTime);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-mono">
            <div className="w-full max-w-4xl mx-auto p-6 bg-black bg-opacity-50 rounded-2xl shadow-lg border border-indigo-500/30">
                <h1 className="text-4xl font-bold text-center mb-6 text-indigo-400 tracking-widest uppercase">TETRIS</h1>
                <div className="flex flex-col md:flex-row gap-6 justify-center">
                    <Board board={board} />
                    <aside className="w-full md:w-48 flex flex-col gap-4">
                        {(gameOver || paused) && (
                            <Modal 
                                title={gameOver ? "Game Over" : "Paused"}
                                buttonText={gameOver ? "Play Again" : "Resume"}
                                onButtonClick={gameOver ? startGame : togglePause}
                            />
                        )}
                        {!gameOver && !paused && (
                             <div>
                                <NextPiece tetromino={TETROMINOS[nextTetromino].shape} />
                                <GameStats score={score} rows={rows} level={level} />
                                <button
                                    onClick={togglePause}
                                    className="w-full mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg shadow-md transition-colors"
                                >
                                    Pause (P)
                                </button>
                            </div>
                        )}
                         {gameOver && (
                           <button
                                onClick={startGame}
                                className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg shadow-lg transition-colors text-lg"
                            >
                                Play Again
                            </button>
                         )}
                         <div className="mt-auto p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-sm">
                            <h3 className="font-bold text-indigo-400 mb-2">Controls</h3>
                            <ul className="space-y-1 text-gray-300">
                                <li><span className="font-bold text-white">Left/Right:</span> Move</li>
                                <li><span className="font-bold text-white">Down:</span> Soft Drop</li>
                                <li><span className="font-bold text-white">Up/X:</span> Rotate CW</li>
                                <li><span className="font-bold text-white">Z/Ctrl:</span> Rotate CCW</li>
                                <li><span className="font-bold text-white">Space:</span> Hard Drop</li>
                                <li><span className="font-bold text-white">P:</span> Pause/Resume</li>
                            </ul>
                         </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default App;
