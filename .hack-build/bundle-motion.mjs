import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const {build}=createRequire(new URL('../gdg hackathon sharing/remotion/package.json',import.meta.url))('esbuild');
await build({entryPoints:[fileURLToPath(new URL('../gdg hackathon sharing/remotion/dino-motion.jsx',import.meta.url))],
  outfile:fileURLToPath(new URL('../gdg hackathon sharing/output/assets/dino-motion.js',import.meta.url)),
  bundle:true, minify:true, format:'iife', platform:'browser', target:'es2022',
  define:{'process.env.NODE_ENV':'"production"'}});
console.log('Remotion footer bundled');
