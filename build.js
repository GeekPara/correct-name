import esbuild from 'esbuild'

esbuild.buildSync({
    entryPoints: ['index.js'],
    bundle: true,
    platform: 'node',
    target: ['node10.4'],
    outfile: 'dist/out.js',
  })
