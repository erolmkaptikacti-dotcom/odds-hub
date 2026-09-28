// expo-status-bar ships only raw TypeScript source for its main entry (no
// compiled JS fallback). Expo's config-plugin resolver tries to require()
// a package's main entry as a fallback when the package has no
// app.plugin.js, and that require() crashes under Node versions with
// native TypeScript stripping enabled (22.18+, 24.x) — stripping is
// unconditionally refused for anything under node_modules.
//
// expo-status-bar has no native project files to modify, so the fix is a
// trivial no-op app.plugin.js that gives the resolver a normal, plain-JS
// file to find first, skipping the broken require() path entirely. Its
// package.json also needs an "exports" entry for that file, or Node's
// strict exports-map resolution hides it even though it exists on disk.
//
// Runs on every `npm install` (see postinstall in the root package.json)
// since npm doesn't preserve hand-edits inside node_modules.
const fs = require("fs");
const path = require("path");

const pkgDir = path.join(__dirname, "..", "node_modules", "expo-status-bar");
if (!fs.existsSync(pkgDir)) {
  // expo-status-bar isn't installed (e.g. running outside apps/mobile) — nothing to fix.
  process.exit(0);
}

const pluginPath = path.join(pkgDir, "app.plugin.js");
fs.writeFileSync(pluginPath, "module.exports = (config) => config;\n");

const pkgJsonPath = path.join(pkgDir, "package.json");
const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
if (!pkgJson.exports || !pkgJson.exports["./app.plugin.js"]) {
  pkgJson.exports = { "./app.plugin.js": "./app.plugin.js", ...pkgJson.exports };
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");
}

console.log("Patched expo-status-bar with a no-op app.plugin.js");
