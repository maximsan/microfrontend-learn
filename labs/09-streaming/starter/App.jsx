import { Suspense } from 'react';
import { Post } from './Post.jsx';
import { Sidebar } from './Sidebar.jsx';
import { Published } from './Published.jsx';

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
            <Suspense fallback={<p className="skeleton">Loading post…</p>}>
              <Post scope={scope} />
            </Suspense>
          </main>
          <aside>
            <Suspense fallback={<p className="skeleton">Loading sidebar…</p>}>
              <Sidebar scope={scope} />
            </Suspense>
          </aside>
        </div>
      </body>
    </html>
  );
}
