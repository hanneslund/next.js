import { preloadFont } from "next/font";
export default function Page() {
    preloadFont("/_next/static/fonts/Roboto.woff2");
    preloadFont("/_next/static/fonts/Inter.woff2");
    return <p >Hello!</p>;
};
