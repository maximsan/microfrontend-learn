import { fileURLToPath } from 'node:url';

/** True when this module is the script Node was started with, not one imported by a test. */
export const isMain = (metaUrl) => Boolean(process.argv[1]) && fileURLToPath(metaUrl) === process.argv[1];
