const fs = require('fs')
const path = require('path')
const esbuild = require('esbuild')
const rmrf = require('rimraf')
const pug = require('pug')
const pretty = require('pretty')
const { execSync } = require('child_process')

rmrf.sync('gen')

execSync('node node_modules/zotero-plugin/dist/cjs/bin/make-dirs.cjs', { stdio: 'inherit' })
execSync('node node_modules/zotero-plugin/dist/cjs/bin/version.cjs', { stdio: 'inherit' })

async function bundle(entry) {
  const outdir = path.join('build', path.basename(path.dirname(entry)))
  const config = {
    entryPoints: [ entry ],
    outdir,
    bundle: true,
    format: 'iife',
    target: ['firefox115'],
    treeShaking: true,
    minify: false,
    drop: ['console'],
    external: [ 'zotero/itemTree' ]
  }

  const target = path.join(outdir, path.basename(entry).replace(/[.]ts$/, '.js'))
  const esm = await esbuild.build({ ...config, logLevel: 'silent', format: 'esm', metafile: true, write: false })
  const postfix = `$$${Date.now()}`
  for (const output of Object.values(esm.metafile.outputs)) {
    if (output.entryPoint) {
      config.globalName = `${escape(`{ ${output.exports.join(', ')} }`).replace(/%/g, '$')}${postfix}`
      console.log(config.globalName)
    }
  }

  await esbuild.build(config)

  await fs.promises.writeFile(
    target,
    (await fs.promises.readFile(target, 'utf-8')).replace(config.globalName, unescape(config.globalName.replace(postfix, '').replace(/[$]/g, '%')))
  )
}

async function build() {
  await bundle('bootstrap.ts')
  await bundle('content/folder-import.ts')
  await bundle('content/bulkimport.ts')
  fs.writeFileSync('build/content/wizard.xhtml', pretty(pug.compileFile('content/wizard.pug')()))

  execSync('node node_modules/zotero-plugin/dist/cjs/bin/copy-assets.cjs', { stdio: 'inherit' })
  execSync('node node_modules/zotero-plugin/dist/cjs/bin/make-manifest.cjs', { stdio: 'inherit' })
}

build().catch(err => {
  console.log(err)
  process.exit(1)
})
