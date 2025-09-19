export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

type TetrominoShape = (string | number)[][];
type Tetrominos = {
    [key: string]: {
        shape: TetrominoShape;
        color: string;
    };
};

export const TETROMINOS: Tetrominos = {
    '0': { shape: [[0]], color: 'bg-transparent' },
    I: {
        shape: [
            [0, 'I', 0, 0],
            [0, 'I', 0, 0],
            [0, 'I', 0, 0],
            [0, 'I', 0, 0],
        ],
        color: 'bg-cyan-500',
    },
    J: {
        shape: [
            [0, 'J', 0],
            [0, 'J', 0],
            ['J', 'J', 0],
        ],
        color: 'bg-blue-500',
    },
    L: {
        shape: [
            [0, 'L', 0],
            [0, 'L', 0],
            [0, 'L', 'L'],
        ],
        color: 'bg-orange-500',
    },
    O: {
        shape: [
            ['O', 'O'],
            ['O', 'O'],
        ],
        color: 'bg-yellow-500',
    },
    S: {
        shape: [
            [0, 'S', 'S'],
            ['S', 'S', 0],
            [0, 0, 0],
        ],
        color: 'bg-green-500',
    },
    T: {
        shape: [
            [0, 0, 0],
            ['T', 'T', 'T'],
            [0, 'T', 0],
        ],
        color: 'bg-purple-500',
    },
    Z: {
        shape: [
            ['Z', 'Z', 0],
            [0, 'Z', 'Z'],
            [0, 0, 0],
        ],
        color: 'bg-red-500',
    },
};

// Fix: The return type was incorrect, causing type errors throughout the app.
// It should be a 3D array. Also fixed the implementation to create unique cells.
export const createBoard = (): (string | number)[][][] =>
    Array.from(Array(BOARD_HEIGHT), () => Array(BOARD_WIDTH).fill(0).map(() => [0, 'bg-transparent']));


export const checkCollision = (
    player: { pos: { x: number; y: number }; tetromino: (string | number)[][] },
    board: (string | number)[][][],
    { x: moveX, y: moveY }: { x: number; y: number }
) => {
    for (let y = 0; y < player.tetromino.length; y += 1) {
        for (let x = 0; x < player.tetromino[y].length; x += 1) {
            // 1. Check that we're on an actual Tetromino cell
            if (player.tetromino[y][x] !== 0) {
                if (
                    // 2. Check that our move is inside the game areas height (y)
                    // We shouldn't go through the bottom of the play area
                    !board[y + player.pos.y + moveY] ||
                    // 3. Check that our move is inside the game areas width (x)
                    !board[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
                    // 4. Check that the cell we're moving to isn't set to clear
                    board[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'bg-transparent'
                ) {
                    return true;
                }
            }
        }
    }
    return false;
};