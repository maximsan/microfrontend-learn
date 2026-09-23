import book from '../../../book.config.mjs';

/** The single "sources verified" date, taken from book.config.mjs. */
export const VerifiedDate = () => <span className="verified-date">{book.verified}</span>;
