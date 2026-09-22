// The shell team's build: a host that loads the cart at runtime.
import rspack from '@rspack/core';

export default ({ dist }) => ({
  mode: 'development',
  devtool: false,
  entry: './src/index.js',
  output: { path: dist, publicPath: 'http://localhost:5110/', uniqueName: 'shell' },
  resolve: { extensions: ['.js', '.jsx'] },
  module: { rules: [{ test: /\.jsx?$/, loader: 'builtin:swc-loader', options: { jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } } } }] },
  plugins: [
    new rspack.container.ModuleFederationPlugin({
      name: 'shell',
      remotes: { cart: 'cart@http://localhost:5111/remoteEntry.js' },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        // TODO (part 2): bootstrap.jsx imports 'react-dom/client'. Is that shared?
      },
    }),
    new rspack.HtmlRspackPlugin({ templateContent: '<!doctype html><meta charset="utf-8"><title>Acme shell</title><style>body{font:16px/1.6 system-ui;max-width:40rem;margin:2rem auto;padding:0 1rem}.cart{display:block;border:1px solid #cfd5de;padding:.8rem;border-radius:6px}.fallback{color:#a83f26}</style><div id="root"></div>' }),
  ],
});
