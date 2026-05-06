'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FallingWord {
	id: string;
	text: string;
	x: number;
	y: number;
}

export function DefenseZone() {
	const [words, setWords] = useState<FallingWord[]>([]);
	const [userInput, setUserInput] = useState('');
	const [score, setScore] = useState(0);
	const [status, setStatus] = useState<'connected' | 'disconnected'>('disconnected');
	// State baru untuk status permainan
	const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');

	const socketRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		// Jangan jalankan koneksi/loop jika game over
		if (gameState === 'gameover') return;

		// 1. Inisialisasi Koneksi WebSocket ke Server Python
		socketRef.current = new WebSocket('ws://localhost:8000');

		socketRef.current.onopen = () => setStatus('connected');
		socketRef.current.onclose = () => setStatus('disconnected');

		socketRef.current.onmessage = (event) => {
			const data = JSON.parse(event.data);
			// Validasi tipe pesan dari server
			if (data.type === 'WORD_DESTROYED') {
				destroyWord(data.word);
			}
		};

		// 2. Game Loop: Pergerakan kata jatuh
		const gameLoop = setInterval(() => {
			setWords((prev) => {
				const updatedWords = prev.map((w) => ({ ...w, y: w.y + 1.5 })); // Sedikit lebih cepat

				// LOGIKA GAME OVER: Cek jika ada kata yang menyentuh batas bawah
				if (updatedWords.some((w) => w.y >= 460)) {
					setGameState('gameover');
					return updatedWords;
				}

				return updatedWords;
			});
		}, 30);

		// 3. Spawner: Munculkan kata baru secara berkala
		const spawner = setInterval(() => {
			const wordList = [
				'pnpm',
				'socket',
				'udp',
				'nextjs',
				'python',
				'uv',
				'brutalist',
				'fastapi',
				'relay',
				'async'
			];
			const newWord: FallingWord = {
				id: Math.random().toString(),
				text: wordList[Math.floor(Math.random() * wordList.length)],
				x: Math.random() * 80 + 10,
				y: 0
			};
			setWords((prev) => [...prev, newWord]);
		}, 2000);

		return () => {
			socketRef.current?.close();
			clearInterval(gameLoop);
			clearInterval(spawner);
		};
	}, [gameState]); // Restart effect saat gameState berubah

	const destroyWord = (wordText: string) => {
		setWords((prev) => {
			const exists = prev.some((w) => w.text === wordText);
			if (exists) {
				setScore((s) => s + 100);
				return prev.filter((w) => w.text !== wordText);
			}
			return prev;
		});
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (gameState === 'gameover') return;
		const value = e.target.value.toLowerCase();
		setUserInput(value);

		const matchedWord = words.find((w) => w.text === value);
		if (matchedWord) {
			destroyWord(value);
			setUserInput('');
		}
	};

	const resetGame = () => {
		setWords([]);
		setScore(0);
		setUserInput('');
		setGameState('playing');
	};

	return (
		<div className="w-full max-w-4xl mx-auto my-12 relative">
			<div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] flex flex-col overflow-hidden">
				{/* WINDOW HEADER */}
				<div className="bg-black text-white px-4 py-3 flex justify-between items-center border-b-4 border-black">
					<div className="flex gap-2">
						<div className="w-3 h-3 rounded-full bg-[#ff4b4b] border-2 border-white"></div>
						<div className="w-3 h-3 rounded-full bg-[#ffc900] border-2 border-white"></div>
						<div className="w-3 h-3 rounded-full bg-[#23a094] border-2 border-white"></div>
					</div>
					<span className="font-head text-xs uppercase tracking-[0.2em]">Visual-Relay-System.v1</span>
					<div
						className={`px-2 py-0.5 text-[10px] font-bold border-2 border-white ${status === 'connected' ? 'bg-[#23a094]' : 'bg-red-600'}`}
					>
						{status === 'connected' ? 'WS: CONNECTED' : 'WS: OFFLINE'}
					</div>
				</div>

				{/* STATS BAR */}
				<div className="flex border-b-4 border-black font-bold uppercase text-sm">
					<div className="flex-1 p-3 bg-[#ffc900] border-r-4 border-black text-center">
						Score: {score.toLocaleString()}
					</div>
					<div className="flex-1 p-3 bg-white text-center">Threats: {words.length}</div>
				</div>

				{/* BATTLEFIELD AREA */}
				<div className="relative h-[500px] bg-[#e5e5e5] bg-[radial-gradient(#00000022_1.5px,transparent_1.5px)] bg-[size:24px_24px] overflow-hidden">
					{/* OVERLAY GAME OVER */}
					{gameState === 'gameover' && (
						<div className="absolute inset-0 z-50 bg-red-600/90 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
							<h2 className="font-head text-6xl text-white uppercase mb-4 border-4 border-white px-6 py-2 shadow-[8px_8px_0px_0px_#000]">
								Terminal Breached
							</h2>
							<p className="text-white font-bold text-xl mb-8 uppercase tracking-widest bg-black px-4 py-1">
								Final Score: {score}
							</p>
							<button
								onClick={resetGame}
								className="bg-white border-4 border-black px-8 py-3 font-head uppercase hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
							>
								Reboot System
							</button>
						</div>
					)}

					{/* FALLING WORDS */}
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

					{/* DANGER PERIMETER */}
					<div className="absolute bottom-0 w-full h-12 bg-black border-t-4 border-black flex items-center justify-center overflow-hidden">
						<div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#ff0000,#ff0000_10px,#000_10px,#000_20px)] opacity-30"></div>
						<span className="relative font-head text-white text-xs tracking-widest animate-pulse">
							[ DEFENSE PERIMETER ACTIVE ]
						</span>
					</div>
				</div>

				{/* KEYBOARD INPUT SECTION */}
				<div className="p-6 bg-[#f4f4f0] border-t-4 border-black flex flex-col gap-4">
					<label className="font-head text-sm uppercase">Manual Override Terminal:</label>
					<div className="relative">
						<input
							type="text"
							disabled={gameState === 'gameover'}
							value={userInput}
							onChange={handleInputChange}
							placeholder={gameState === 'gameover' ? 'SYSTEM FAILED' : 'Type matching words here...'}
							className="w-full bg-white border-4 border-black p-4 font-mono font-bold text-lg focus:outline-none shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all placeholder:text-neutral-300 disabled:bg-neutral-200 disabled:cursor-not-allowed"
							autoFocus
						/>
					</div>
					<div className="flex justify-between items-center text-[10px] font-bold text-neutral-500 uppercase">
						<span>Protocol: UDP/WS Relay[cite: 1]</span>
						<span>Status: {gameState === 'playing' ? 'Operational' : 'Critical Failure'}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
