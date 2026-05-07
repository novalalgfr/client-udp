export interface FallingWord {
	id: string;
	text: string;
	x: number;
	y: number;
}

export type GameState = 'idle' | 'playing' | 'paused' | 'gameover' | 'win';
export type WsStatus = 'connected' | 'disconnected' | 'connecting';
