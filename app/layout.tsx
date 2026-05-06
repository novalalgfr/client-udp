import { Archivo_Black, Space_Grotesk, Geist } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const archivoBlack = Archivo_Black({
	subsets: ['latin'],
	weight: '400',
	variable: '--font-head',
	display: 'swap'
});

const space = Space_Grotesk({
	subsets: ['latin'],
	weight: '400',
	variable: '--font-sans',
	display: 'swap'
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={`${archivoBlack.variable} ${space.variable}`}>{children}</body>
		</html>
	);
}
