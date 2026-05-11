import Link from 'next/link';
import { DefenseZone } from '@/components/game/defense-zone';
import { Button } from '@/components/retroui/Button';

export default function LandingPage() {
	return (
		<div className="relative min-h-screen bg-[#f8f8f8] text-black font-sans">
			<div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#0000001a_1px,transparent_1px),linear-gradient(to_bottom,#0000001a_1px,transparent_1px)] bg-[size:32px_32px]"></div>

			<div className="relative z-10 flex flex-col min-h-screen">
				<nav className="sticky top-0 w-full bg-white border-b-4 border-black px-4 md:px-6 py-4 flex items-center justify-between z-50">
					<div className="flex items-center gap-2">
						<div className="w-6 h-6 bg-[#ffc900] border-2 border-black shadow-[2px_2px_0px_0px_#000]"></div>
						<span className="font-head text-xl md:text-2xl uppercase tracking-tighter">Defense Zone</span>
					</div>
					<Button className="bg-black text-white border-2 border-black shadow-sm font-bold px-3 py-1.5 md:px-4 md:py-2 text-sm">
						<a
							href="https://github.com/novalalgfr"
							target="_blank"
							rel="noopener noreferrer"
						>
							GITHUB
						</a>
					</Button>
				</nav>

				<main className="flex-1 flex flex-col items-center px-4 pt-12 md:pt-24 pb-12 text-center max-w-6xl mx-auto w-full">
					<div className="mb-6 md:mb-8 inline-flex items-center gap-2 bg-[#ff90e8] border-2 border-black px-4 py-1.5 shadow-[4px_4px_0px_0px_#000] rotate-[-2deg]">
						<span className="font-bold text-xs md:text-sm uppercase tracking-wide">
							Multiplayer UDP Game
						</span>
					</div>

					<h1 className="font-head text-5xl md:text-8xl uppercase tracking-tighter leading-[0.9] mb-6 md:mb-8">
						Network <br className="hidden md:block" />
						<span className="bg-[#c4a1ff] px-2 border-4 border-black inline-block mt-2 shadow-[8px_8px_0px_0px_#000]">
							Typing Invaders
						</span>
					</h1>

					<p className="font-medium text-base md:text-xl max-w-2xl text-neutral-800 mb-8 md:mb-10">
						Destroy cyber attacks with your typing speed. A 3-tier architecture with real-time
						UDP-to-WebSocket relay.
					</p>

					<div className="w-full">
						<DefenseZone />
					</div>
				</main>

				<footer className="bg-white border-t-4 border-black px-4 md:px-6 py-8 md:py-12 mt-10 md:mt-20">
					<div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
						<div className="flex items-center gap-2">
							<span className="font-head text-lg md:text-xl uppercase italic">Type Defense</span>
							<span className="font-medium text-neutral-500 border-l-2 border-black pl-2 text-sm">
								Socket Programming Project
							</span>
						</div>
						<div className="font-bold text-xs md:text-sm uppercase text-neutral-400">
							Based on UDP Protocol
						</div>
					</div>
				</footer>
			</div>
		</div>
	);
}
