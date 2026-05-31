const { loadPartialConfig } = require('@babel/core');
const path = require('path');

async function main() {
  const file = path.resolve('node_modules/expo-router/entry.js');
  const cfg = loadPartialConfig({ filename: file });
  if (!cfg) {
    console.log('No babel config found');
    return;
  }
  const out = {
    options: cfg.options,
    presets: cfg.options.presets && cfg.options.presets.map(p => ({ name: p && p.file && p.file.request ? p.file.request : p })),
    plugins: cfg.options.plugins && cfg.options.plugins.map(p => {
      if (Array.isArray(p)) return p[0] && p[0].file ? p[0].file.request : p[0];
      return p && p.file ? p.file.request : p;
    })
  };
  console.log(JSON.stringify(out, null, 2));
}

main().catch(err => {
  console.error(err && err.stack || err);
  process.exit(1);
});
