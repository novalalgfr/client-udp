'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FallingWord {
	id: string;
	text: string;
	x: number;
	y: number;
}

const WORD_LIST = [
	'attack',
	'defense',
	'shield',
	'system',
	'network',
	'packet',
	'server',
	'client',
	'protocol',
	'latency',
	'socket',
	'signal',
	'router',
	'gateway',
	'firewall',
	'encrypt',
	'decrypt',
	'access',
	'control',
	'process',
	'thread',
	'buffer',
	'memory',
	'kernel',
	'runtime',
	'compile',
	'execute',
	'deploy',
	'monitor',
	'status',
	'request',
	'response',
	'connect',
	'disconnect',
	'timeout',
	'secure',
	'threat',
	'breach',
	'alert',
	'warning',
	'critical',
	'failure',
	'backup',
	'restore',
	'sync',
	'async',
	'stream',
	'queue',
	'relay',
	'cluster'
];

const WIN_SCORE = 1000;

export function DefenseZone() {
	const [words, setWords] = useState<FallingWord[]>([]);
	const [userInput, setUserInput] = useState('');
	const [score, setScore] = useState(0);
	const [username, setUsername] = useState('');
	const [usernameInput, setUsernameInput] = useState('');
	const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
	const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover' | 'win'>('idle');
	const [invalidFlash, setInvalidFlash] = useState(false);

	const socketRef = useRef<WebSocket | null>(null);
	const wsReadyRef = useRef(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const connect = () => {
			setStatus('connecting');
			const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000');
			socketRef.current = ws;

			ws.onopen = () => {
				setStatus('connected');
				wsReadyRef.current = true;
			};

			ws.onclose = () => {
				setStatus('disconnected');
				wsReadyRef.current = false;
				setTimeout(connect, 3000);
			};

			ws.onerror = () => {
				setStatus('disconnected');
				wsReadyRef.current = false;
			};

			ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);

					if (data.type === 'WORD_VALID') {
						setWords((prev) => {
							const exists = prev.some((w) => w.text === data.word);
							if (exists) {
								setScore((s) => s + 100);
								return prev.filter((w) => w.text !== data.word);
							}
							return prev;
						});
					}

					if (data.type === 'WORD_INVALID') {
						setInvalidFlash(true);
						setTimeout(() => setInvalidFlash(false), 400);
					}
				} catch (e) {
					console.error('WS parse error', e);
				}
			};
		};

		connect();

		return () => {
			socketRef.current?.close();
		};
	}, []);

	useEffect(() => {
		if (gameState !== 'playing') return;
		if (score >= WIN_SCORE) {
			setGameState('win');
			sendWs(`${username}:__WIN__`);
		}
	}, [score, gameState]);

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

	useEffect(() => {
		if (gameState === 'gameover' && username) {
			sendWs(`${username}:__END__`);
		}
	}, [gameState]);

	const sendWs = (message: string) => {
		if (socketRef.current?.readyState === WebSocket.OPEN) {
			socketRef.current.send(message);
		}
	};

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

	const getButtonLabel = () => {
		if (gameState === 'playing') return '⏸ Pause';
		if (gameState === 'paused') return '▶ Resume';
		return '▶ Start';
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

				<div className="flex border-b-4 border-black font-bold uppercase text-sm">
					<div className="flex-1 p-3 bg-[#ffc900] border-r-4 border-black text-center">
						Score: {score.toLocaleString()} / {WIN_SCORE}
					</div>
					<div className="flex-1 p-3 bg-white border-r-4 border-black text-center">
						Threats: {words.length}
					</div>
					<div className="flex-1 p-3 bg-white text-center truncate">{username ? `▶ ${username}` : '— —'}</div>
				</div>

				<div
					className={`relative h-[500px] bg-[#e5e5e5] bg-[radial-gradient(#00000022_1.5px,transparent_1.5px)] bg-[size:24px_24px] overflow-hidden transition-colors duration-150 ${invalidFlash ? 'bg-red-100' : ''}`}
				>
					{gameState === 'idle' && (
						<div className="absolute inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-6 text-center gap-6">
							<h2 className="font-head text-5xl text-white uppercase border-4 border-[#ffc900] px-6 py-2 shadow-[8px_8px_0px_0px_#ffc900]">
								Defense Zone
							</h2>
							<p className="text-neutral-300 font-bold text-sm uppercase tracking-widest">
								Type the falling words before they breach the perimeter
							</p>
							<p className="text-neutral-400 font-mono text-xs uppercase">
								Reach {WIN_SCORE} points to win the mission
							</p>
							<div className="flex flex-col gap-2 w-full max-w-xs">
								<label className="font-head text-xs text-[#ffc900] uppercase tracking-widest text-left">
									Enter Codename:
								</label>
								<input
									type="text"
									value={usernameInput}
									onChange={(e) => setUsernameInput(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && handleStart()}
									placeholder="e.g. ghost_operator"
									className="bg-white border-4 border-white px-4 py-3 font-mono font-bold text-lg focus:outline-none shadow-[4px_4px_0px_0px_#ffc900] placeholder:text-neutral-300"
									autoFocus
								/>
							</div>

							{status !== 'connected' && (
								<p className="text-[#ffc900] font-mono text-xs uppercase animate-pulse">
									{status === 'connecting'
										? '⏳ Waiting for server connection...'
										: '❌ Server offline — start server first'}
								</p>
							)}

							<button
								onClick={handleStart}
								disabled={!usernameInput.trim() || status !== 'connected'}
								className="bg-[#ffc900] border-4 border-black px-10 py-3 font-head uppercase text-black hover:bg-yellow-400 transition-all shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed"
							>
								{status !== 'connected' ? '⏳ Waiting for Server...' : '▶ Start Mission'}
							</button>
						</div>
					)}

					{gameState === 'paused' && (
						<div className="absolute inset-0 z-50 bg-black/75 flex flex-col items-center justify-center p-6 text-center gap-4">
							<h2 className="font-head text-5xl text-white uppercase border-4 border-[#ffc900] px-6 py-2 shadow-[8px_8px_0px_0px_#ffc900]">
								Paused
							</h2>
							<p className="text-neutral-300 font-bold text-sm uppercase tracking-widest">
								System Suspended — Press Resume to continue
							</p>
						</div>
					)}

					{gameState === 'gameover' && (
						<div className="absolute inset-0 z-50 bg-red-600/90 flex flex-col items-center justify-center p-6 text-center gap-6 animate-in fade-in duration-300">
							<h2 className="font-head text-6xl text-white uppercase border-4 border-white px-6 py-2 shadow-[8px_8px_0px_0px_#000]">
								Terminal Breached
							</h2>
							<div className="bg-black px-6 py-3 flex flex-col gap-1">
								<p className="text-white font-bold text-xl uppercase tracking-widest">
									{username} — Final Score: {score}
								</p>
								<p className="text-neutral-400 font-mono text-xs uppercase">
									Session log saved to defense_log.txt
								</p>
							</div>
							<button
								onClick={resetGame}
								className="bg-white border-4 border-black px-8 py-3 font-head uppercase hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
							>
								Reboot System
							</button>
						</div>
					)}

					{gameState === 'win' && (
						<div className="absolute inset-0 z-50 bg-[#23a094]/95 flex flex-col items-center justify-center p-6 text-center gap-6 animate-in fade-in duration-300">
							<div className="flex flex-col items-center gap-2">
								<span className="font-mono text-white text-xs uppercase tracking-[0.3em] animate-pulse">
									— Mission Complete —
								</span>
								<h2 className="font-head text-6xl text-white uppercase border-4 border-white px-6 py-2 shadow-[8px_8px_0px_0px_#000]">
									Perimeter Secured
								</h2>
							</div>
							<div className="bg-black px-6 py-4 flex flex-col gap-2 border-4 border-white shadow-[6px_6px_0px_0px_#fff]">
								<p className="text-[#23a094] font-head text-2xl uppercase tracking-widest">
									{username}
								</p>
								<p className="text-white font-bold text-3xl uppercase">
									Score: {score.toLocaleString()}
								</p>
								<p className="text-neutral-400 font-mono text-xs uppercase">
									All threats neutralized — system stable
								</p>
							</div>
							<div className="flex gap-4">
								<button
									onClick={handleStart}
									className="bg-[#ffc900] border-4 border-black px-8 py-3 font-head uppercase text-black hover:bg-yellow-400 transition-all shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
								>
									▶ Play Again
								</button>
								<button
									onClick={resetGame}
									className="bg-white border-4 border-black px-8 py-3 font-head uppercase hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
								>
									Main Menu
								</button>
							</div>
						</div>
					)}

					{words.map((word) => (
						<div
							key={word.id}
							style={{
								left: `${word.x}%`,
								top: `${word.y}px`,
								transition: 'top 0.03s linear'
							}}
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

				<div className="p-6 bg-[#f4f4f0] border-t-4 border-black flex flex-col gap-4">
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
								className="bg-black text-white border-4 border-black px-8 py-3 font-head uppercase hover:bg-neutral-800 transition-all shadow-[6px_6px_0px_0px_#555] active:translate-x-1 active:translate-y-1 active:shadow-none"
							>
								{getButtonLabel()}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
