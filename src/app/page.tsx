import type { Metadata } from 'next';
import Game from './game';

export const metadata: Metadata = {
  title: 'Tiger Run - A Funny Money Game',
  description: 'Help Tiger and Monkey learn about saving money in a fun maze!',
  // openGraph is for iMessage, Facebook, etc.
  openGraph: {
    title: 'Tiger Run',
    description: 'Help Tiger get his money safely to the bank!',
    url: 'https://tiger-run.unclepetelaboratories.net',
    images: [
      {
        // This is the full URL to the image in your public folder
        url: 'https://tiger-run.unclepetelaboratories.net/social-preview.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  // twitter is for X (formerly Twitter)
  twitter: {
    card: 'summary_large_image',
    title: 'Tiger Run - A Fun Money Game',
    description: 'Help Tiger and Monkey learn about saving money!',
    // Full URL here as well
    images: ['https://tiger-run.unclepetelaboratories.net/social-preview.png'],
  },
};

export default function Page() {
  return <Game />;
}