// The cart team's build: a remote that exposes <CartWidget>.
import rspack from '@rspack/core';

export default ({ dist }) => ({
  mode: 'development',
  devtool: false,
  entry: './src/index.js',
  output: { path: dist, publicPath: 'http://localhost:5111/', uniqueName: 'cart' },
  resolve: { extensions: ['.js', '.jsx'] },
  module: { rules: [{ test: /\.jsx?$/, loader: 'builtin:swc-loader', options: { jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } } } }] },
  plugins: [
    new rspack.container.ModuleFederationPlugin({
      name: 'cart',
      filename: 'remoteEntry.js',
      exposes: { './CartWidget': './src/CartWidget.jsx' },
      // TODO (part 1): the cart team forgot to declare what it shares.
    }),
    new rspack.HtmlRspackPlugin({ templateContent: '<!doctype html><title>cart (standalone)</title><div id="root"></div>' }),
  ],
});
