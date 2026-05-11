import { WsStatus } from '../types';
import { WIN_SCORE } from '../constants';

interface Props {
	usernameInput: string;
	setUsernameInput: (v: string) => void;
	status: WsStatus;
	onStart: () => void;
}

export function OverlayIdle({ usernameInput, setUsernameInput, status, onStart }: Props) {
	return (
		<div className="absolute inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-6 text-center gap-6">
			<h2 className="font-head text-3xl md:text-5xl text-white uppercase border-4 border-[#ffc900] px-4 md:px-6 py-2 shadow-[8px_8px_0px_0px_#ffc900]">
				Defense Zone
			</h2>
			<p className="text-neutral-300 font-bold text-sm uppercase tracking-widest">
				Type the falling words before they breach the perimeter
			</p>
			<p className="text-neutral-400 font-mono text-xs uppercase">Reach {WIN_SCORE} points to win the mission</p>
			<div className="flex flex-col gap-2 w-full max-w-xs">
				<label className="font-head text-xs text-[#ffc900] uppercase tracking-widest text-left">
					Enter Codename:
				</label>
				<input
					type="text"
					value={usernameInput}
					onChange={(e) => setUsernameInput(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && onStart()}
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
				onClick={onStart}
				disabled={!usernameInput.trim() || status !== 'connected'}
				className="bg-[#ffc900] border-4 border-black px-10 py-3 font-head uppercase text-black hover:bg-yellow-400 transition-all shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
			>
				{status !== 'connected' ? '⏳ Waiting for Server...' : '▶ Start Mission'}
			</button>
		</div>
	);
}
