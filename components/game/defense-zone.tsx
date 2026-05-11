'use client';

import React, { useState, useEffect } from 'react';
import { FallingWord, GameState } from './types';
import { WIN_SCORE } from './constants';
import { useWebSocket } from './hooks/use-websocket';
import { useGameLoop } from './hooks/use-game-loop';
import { OverlayIdle } from './overlays/overlay-idle';
import { OverlayPaused } from './overlays/overlay-paused';
import { OverlayGameOver } from './overlays/overlay-gameover';
import { OverlayWin } from './overlays/overlay-win';

export function DefenseZone() {
	const [words, setWords] = useState<FallingWord[]>([]);
	const [userInput, setUserInput] = useState('');
	const [score, setScore] = useState(0);
	const [username, setUsername] = useState('');
	const [usernameInput, setUsernameInput] = useState('');
	const [gameState, setGameState] = useState<GameState>('idle');
	const [invalidFlash, setInvalidFlash] = useState(false);

	const { status, sendWs } = useWebSocket({
		onWordValid: (word) => {
			setWords((prev) => {
				const exists = prev.some((w) => w.text === word);
				if (exists) {
					setScore((s) => s + 100);
					return prev.filter((w) => w.text !== word);
				}
				return prev;
			});
		},
		onWordInvalid: () => {
			setInvalidFlash(true);
			setTimeout(() => setInvalidFlash(false), 400);
		}
	});

	const { inputRef } = useGameLoop({ gameState, setWords, setGameState });

	useEffect(() => {
		if (gameState !== 'playing') return;
		if (score >= WIN_SCORE) {
			setGameState('win');
			sendWs(`${username}:__WIN__`);
		}
	}, [score, gameState]);

	useEffect(() => {
		if (gameState === 'gameover' && username) {
			sendWs(`${username}:__END__`);
		}
	}, [gameState]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (gameState !== 'playing') return;
		const value = e.target.value.toLowerCase();
		setUserInput(value);
		const matchedWord = words.find((w) => w.text === value);
		if (matchedWord) {
			sendWs(`${username}:${value}`);
			setUserInput('');
		}
	};

	const handleStart = () => {
		if (!usernameInput.trim() || status !== 'connected') return;
		setUsername(usernameInput.trim());
		setWords([]);
		setScore(0);
		setUserInput('');
		setGameState('playing');
	};

	const handleStartPause = () => {
		if (gameState === 'paused') setGameState('playing');
		else if (gameState === 'playing') setGameState('paused');
	};

	const resetGame = () => {
		setWords([]);
		setScore(0);
		setUserInput('');
		setUsername('');
		setUsernameInput('');
		setGameState('idle');
	};

	const getStatusStyle = () => {
		if (status === 'connected') return 'bg-[#23a094]';
		if (status === 'connecting') return 'bg-[#ffc900] text-black';
		return 'bg-red-600';
	};

	const getStatusLabel = () => {
		if (status === 'connected') return 'WS: CONNECTED';
		if (status === 'connecting') return 'WS: CONNECTING...';
		return 'WS: OFFLINE';
	};

	return (
		<div className="w-full max-w-4xl mx-auto my-12 relative">
			<div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] flex flex-col overflow-hidden">
				<div className="bg-black text-white px-4 py-3 flex justify-between items-center border-b-4 border-black">
					<div className="flex gap-2">
						<div className="w-3 h-3 rounded-full bg-[#ff4b4b] border-2 border-white"></div>
						<div className="w-3 h-3 rounded-full bg-[#ffc900] border-2 border-white"></div>
						<div className="w-3 h-3 rounded-full bg-[#23a094] border-2 border-white"></div>
					</div>
					<span className="font-head text-xs uppercase tracking-[0.2em]">Visual-Relay-System.v1</span>
					<div className={`px-2 py-0.5 text-[10px] font-bold border-2 border-white ${getStatusStyle()}`}>
						{getStatusLabel()}
					</div>
				</div>

				<div className="flex border-b-4 border-black font-bold uppercase text-xs md:text-sm">
					<div className="flex-1 p-2 md:p-3 bg-[#ffc900] border-r-4 border-black text-center">
						<span className="hidden md:inline">Score: </span>
						{score.toLocaleString()}
						<span className="text-[10px] md:hidden"> / {WIN_SCORE}</span>
						<span className="hidden md:inline"> / {WIN_SCORE}</span>
					</div>
					<div className="flex-1 p-2 md:p-3 bg-white border-r-4 border-black text-center">
						<span className="hidden md:inline">Threats: </span>
						{words.length}
					</div>
					<div className="flex-1 p-2 md:p-3 bg-white text-center truncate">
						{username ? `▶ ${username}` : '— —'}
					</div>
				</div>

				<div
					className={`relative h-[380px] md:h-[500px] bg-[#e5e5e5] bg-[radial-gradient(#00000022_1.5px,transparent_1.5px)] bg-[size:24px_24px] overflow-hidden transition-colors duration-150 ${invalidFlash ? 'bg-red-100' : ''}`}
				>
					{gameState === 'idle' && (
						<OverlayIdle
							usernameInput={usernameInput}
							setUsernameInput={setUsernameInput}
							status={status}
							onStart={handleStart}
						/>
					)}
					{gameState === 'paused' && <OverlayPaused />}
					{gameState === 'gameover' && (
						<OverlayGameOver
							username={username}
							score={score}
							onReset={resetGame}
						/>
					)}
					{gameState === 'win' && (
						<OverlayWin
							username={username}
							score={score}
							onPlayAgain={handleStart}
							onReset={resetGame}
						/>
					)}

					{words.map((word) => (
						<div
							key={word.id}
							style={{ left: `${word.x}%`, top: `${word.y}px`, transition: 'top 0.03s linear' }}
							className="absolute -translate-x-1/2"
						>
							<div className="bg-white border-4 border-black px-4 py-1.5 shadow-[4px_4px_0px_0px_#000] relative">
								<span className="font-head text-xl uppercase tracking-tighter italic">{word.text}</span>
								<div className="absolute -top-1 -left-1 w-2 h-2 bg-black"></div>
							</div>
						</div>
					))}

					<div className="absolute bottom-0 w-full h-12 bg-black border-t-4 border-black flex items-center justify-center overflow-hidden">
						<div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#ff0000,#ff0000_10px,#000_10px,#000_20px)] opacity-30"></div>
						<span className="relative font-head text-white text-xs tracking-widest animate-pulse">
							[ DEFENSE PERIMETER ACTIVE ]
						</span>
					</div>
				</div>

				<div className="p-4 md:p-6 bg-[#f4f4f0] border-t-4 border-black flex flex-col gap-3 md:gap-4">
					<label className="font-head text-sm uppercase">Manual Override Terminal:</label>
					<div className="relative">
						<input
							ref={inputRef}
							type="text"
							disabled={gameState !== 'playing'}
							value={userInput}
							onChange={handleInputChange}
							placeholder={
								gameState === 'gameover'
									? 'SYSTEM FAILED'
									: gameState === 'win'
										? 'MISSION COMPLETE'
										: gameState === 'idle'
											? 'Enter codename to begin...'
											: gameState === 'paused'
												? 'PAUSED — Resume to continue...'
												: 'Type matching words here...'
							}
							className={`w-full bg-white border-4 p-4 font-mono font-bold text-lg focus:outline-none shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all placeholder:text-neutral-300 disabled:bg-neutral-200 disabled:cursor-not-allowed ${invalidFlash ? 'border-red-500' : 'border-black'}`}
						/>
					</div>
					<div className="flex justify-between items-center">
						<div className="flex flex-col gap-1">
							<span className="text-[10px] font-bold text-neutral-500 uppercase">
								Protocol: WS Relay + Server Validation
							</span>
							<span className="text-[10px] font-bold text-neutral-500 uppercase">
								Status:{' '}
								{gameState === 'playing'
									? 'Operational'
									: gameState === 'paused'
										? 'Suspended'
										: gameState === 'gameover'
											? 'Critical Failure'
											: gameState === 'win'
												? 'Mission Complete'
												: 'Standby'}
							</span>
						</div>
						{gameState !== 'gameover' && gameState !== 'idle' && gameState !== 'win' && (
							<button
								onClick={handleStartPause}
								className="bg-black text-white border-4 border-black px-8 py-3 font-head uppercase hover:bg-neutral-800 transition-all shadow-[6px_6px_0px_0px_#555] active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer"
							>
								{gameState === 'playing' ? '⏸ Pause' : '▶ Resume'}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
