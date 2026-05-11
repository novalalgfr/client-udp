interface Props {
	username: string;
	score: number;
	onPlayAgain: () => void;
	onReset: () => void;
}

export function OverlayWin({ username, score, onPlayAgain, onReset }: Props) {
	return (
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
				<p className="text-[#23a094] font-head text-2xl uppercase tracking-widest">{username}</p>
				<p className="text-white font-bold text-3xl uppercase">Score: {score.toLocaleString()}</p>
				<p className="text-neutral-400 font-mono text-xs uppercase">All threats neutralized — system stable</p>
			</div>
			<div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto px-4 md:px-0">
				<button
					onClick={onPlayAgain}
					className="bg-[#ffc900] border-4 border-black px-8 py-3 font-head uppercase text-black hover:bg-yellow-400 transition-all shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer"
				>
					▶ Play Again
				</button>
				<button
					onClick={onReset}
					className="bg-white border-4 border-black px-8 py-3 font-head uppercase hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer"
				>
					Main Menu
				</button>
			</div>
		</div>
	);
}
