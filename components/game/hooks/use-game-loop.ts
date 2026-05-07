import { useEffect, useRef } from 'react';
import { FallingWord, GameState } from '../types';
import { WORD_LIST } from '../constants';

interface UseGameLoopProps {
	gameState: GameState;
	setWords: React.Dispatch<React.SetStateAction<FallingWord[]>>;
	setGameState: (state: GameState) => void;
}

export function useGameLoop({ gameState, setWords, setGameState }: UseGameLoopProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (gameState !== 'playing') return;

		setTimeout(() => inputRef.current?.focus(), 100);

		const gameLoop = setInterval(() => {
			setWords((prev) => {
				const updated = prev.map((w) => ({ ...w, y: w.y + 1.5 }));
				if (updated.some((w) => w.y >= 460)) {
					setGameState('gameover');
					return updated;
				}
				return updated;
			});
		}, 30);

		const spawner = setInterval(() => {
			setWords((prev) => [
				...prev,
				{
					id: Math.random().toString(),
					text: WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)],
					x: Math.random() * 70 + 15,
					y: 0
				}
			]);
		}, 2000);

		return () => {
			clearInterval(gameLoop);
			clearInterval(spawner);
		};
	}, [gameState]);

	return { inputRef };
}
