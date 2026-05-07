import { useEffect, useRef, useState } from 'react';
import { WsStatus } from '../types';

interface UseWebSocketProps {
	onWordValid: (word: string) => void;
	onWordInvalid: () => void;
}

export function useWebSocket({ onWordValid, onWordInvalid }: UseWebSocketProps) {
	const [status, setStatus] = useState<WsStatus>('connecting');
	const socketRef = useRef<WebSocket | null>(null);
	const wsReadyRef = useRef(false);

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
					if (data.type === 'WORD_VALID') onWordValid(data.word);
					if (data.type === 'WORD_INVALID') onWordInvalid();
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

	const sendWs = (message: string) => {
		if (socketRef.current?.readyState === WebSocket.OPEN) {
			socketRef.current.send(message);
		}
	};

	return { status, sendWs };
}
