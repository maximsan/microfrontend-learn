// Skip link, reading-progress bar, and the bar with Contents and Theme buttons
// that replaces the sidebar on narrow screens. src/client/book.js wires them up.
import book from '../../book.config.mjs';

export const TopBar = () => (
  <>
    <a className="skip" href="#main">Skip to main content</a>
    <div id="prog"><i></i></div>

    <div id="bar">
      <button className="iconbtn" id="menu" aria-label="Open contents" aria-expanded="false">Contents</button>
      <strong>{book.title}</strong>
      <button className="iconbtn" data-theme-toggle aria-label="Switch colour theme">Theme</button>
    </div>
    <div id="scrim"></div>
  </>
);
