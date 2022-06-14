import { preloadFont } from 'next/font';
export default function Page() {
    preloadFont("/_next/font/main");
    return <p >hello</p>;
};
