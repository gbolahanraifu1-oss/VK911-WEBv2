import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "./global.css";
import type { Route } from "./+types/root";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const links = () => [];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <title>ᴍᴀᴅᴀʀᴀ x-ᴍᴅ</title>
       <meta name="monetag" content="a8c554baae03d4261726e149d47ff2dc" />

<script>(function(s){s.dataset.zone='11849999',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>

<script
  src="https://quge5.com/88/tag.min.js"
  data-zone="278684"
  async
  data-cfasync="false"
/>

<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5934268333067094"
  crossOrigin="anonymous"
/>        <Links />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#080810",
          fontFamily: "'Inter', sans-serif",
          color: "#e2e8f0",
        }}
      >
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position="bottom-right" />
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  return (
    <div style={{ padding: 40, color: "#ef4444", fontFamily: "monospace" }}>
      <h1>Application Error</h1>
      <pre>{error instanceof Error ? error.message : String(error)}</pre>
    </div>
  );
};

export default function App() {
  return <Outlet />;
}
