"use client";

import dynamic from "next/dynamic";

// Client-only: the app reads the saved language from the browser on first render.
const App = dynamic(() => import("../App"), { ssr: false });

export default function Page() {
  return <App />;
}
