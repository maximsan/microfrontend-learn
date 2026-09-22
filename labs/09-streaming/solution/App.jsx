import { Suspense } from 'react';
import { Post } from './Post.jsx';
import { Sidebar } from './Sidebar.jsx';
import { Published } from './Published.jsx';
import { ErrorBoundary } from './ErrorBoundary.jsx';

// Solution: every fragment gets its own error boundary, so one team's bug
// costs one fragment, not the page.
export function App({ scope }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Lab 09 · Streaming</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <header>
          <strong>Acme blog</strong> · <Published />
        </header>
        <div className="grid">
          <main>
            <ErrorBoundary name="Post">
              <Suspense fallback={<p className="skeleton">Loading post…</p>}>
                <Post scope={scope} />
              </Suspense>
            </ErrorBoundary>
          </main>
          <aside>
            <ErrorBoundary name="Sidebar">
              <Suspense fallback={<p className="skeleton">Loading sidebar…</p>}>
                <Sidebar scope={scope} />
              </Suspense>
            </ErrorBoundary>
          </aside>
        </div>
      </body>
    </html>
  );
}
