// YOUR SHARED SHELL, runtime half (M2, M6, M7), served at /shell/client.js.
// Expose window.acme = { on, api, refreshCart, getUser, getCsrfToken }:
//   session from /bff/me; api() adds x-csrf-token to unsafe methods;
//   one EventSource per *browser* via navigator.locks + BroadcastChannel;
//   broadcast logout to other tabs; fill [data-acme-versions].
