// This file simply provides an ESM "wrapper" for the require syntax to make the two build systems compatible.
// Because of how tape works, it currently MUST be built with Browserify (or if it can be built with Rollup, I can't figure it out).
// So, when building for node, the build system builds everything as a single file except for this require statement, which just uses the normal node require function.
// But, in browser-land, a separate file called "tapeImporter.js" is built which injects the Browserified require functionality and the code for Tape, along with all the browser compatibility layers.
// All other code, from the library to the test code, can use normal ESM.
export default require('tape');
