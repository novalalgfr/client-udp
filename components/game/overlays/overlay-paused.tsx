export function OverlayPaused() {
	return (
		<div className="absolute inset-0 z-50 bg-black/75 flex flex-col items-center justify-center p-6 text-center gap-4">
			<h2 className="font-head text-5xl text-white uppercase border-4 border-[#ffc900] px-6 py-2 shadow-[8px_8px_0px_0px_#ffc900]">
				Paused
			</h2>
			<p className="text-neutral-300 font-bold text-sm uppercase tracking-widest">
				System Suspended — Press Resume to continue
			</p>
		</div>
	);
}
