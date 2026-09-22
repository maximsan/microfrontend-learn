import { use } from 'react';
import { load } from '../shared/data.js';

export function Post({ scope }) {
  const post = use(load('post', scope));
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
