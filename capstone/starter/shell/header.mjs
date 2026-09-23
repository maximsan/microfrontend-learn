// YOUR SHARED SHELL, build-time half (M2): the header every zone renders.
//   head({ title, zone, build })  <meta name="acme:build:<zone>">, tokens.css, client.js
//   header({ zone })              .acme-header with plain <a> links between zones,
//                                 [data-acme-session] and [data-acme-cart] slots
//   footer()                      a "What is running" panel with [data-acme-versions]
export const head = () => '';
export const header = () => '';
export const footer = () => '';
