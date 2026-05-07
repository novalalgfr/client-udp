interface Props {
	username: string;
	score: number;
	onReset: () => void;
}

export function OverlayGameOver({ username, score, onReset }: Props) {
	return (
		<div className="absolute inset-0 z-50 bg-red-600/90 flex flex-col items-center justify-center p-6 text-center gap-6 animate-in fade-in duration-300">
			<h2 className="font-head text-6xl text-white uppercase border-4 border-white px-6 py-2 shadow-[8px_8px_0px_0px_#000]">
				Terminal Breached
			</h2>
			<div className="bg-black px-6 py-3 flex flex-col gap-1">
				<p className="text-white font-bold text-xl uppercase tracking-widest">
					{username} — Final Score: {score}
				</p>
				<p className="text-neutral-400 font-mono text-xs uppercase">Session log saved to logs/</p>
			</div>
			<button
				onClick={onReset}
				className="bg-white border-4 border-black px-8 py-3 font-head uppercase hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer"
			>
				Reboot System
			</button>
		</div>
	);
}
