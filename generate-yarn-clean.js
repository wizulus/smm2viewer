const { exec, execSync } = require('child_process')
const { readFileSync, unlinkSync, writeFileSync } = require('fs')
const pkg = require('./package.json')

async function main () {
  const deps = new Set(Object.keys(pkg.dependencies))
  const output = await new Promise((resolve, reject) => exec('du -bd 10 node_modules', (err, stdout, stderr) => err ? reject(err) : resolve(stdout)))
  const folders = output
    .split('\n')
    .filter(x => x)
    // .filter(x => {
    //   if (x.startsWith('node_modules/@')) {
    //     return deps.has(x.split('/').slice(1, 3).join('/'))
    //   } else {
    //     return deps.has(x.split('/')[1])
    //   }
    // })
    .map(x => {
      const [_, sizeStr, folder] = /^(\d+)\s+(.*)$/.exec(x)
      return {
        size: parseInt(sizeStr),
        folder
      }
    })

  execSync(`TRACING=true strace -y -f -e trace=open -o trace.tmp ${process.argv.slice(2).join(' ')}`)

  const trace = readFileSync('./trace.tmp', 'utf-8')
  unlinkSync('./trace.tmp')

  const findFiles = /\d+<([^>]+)>/g
  let files = []
  let result = null
  // eslint-disable-next-line no-cond-assign
  while (result = findFiles.exec(trace)) {
    files.push(result[1])
  }

  writeFileSync('.files', files.sort().map(file => `${file}\n`).join(''))
  process.exit(0)
  for (const file of files) {
    console.log(`COPY --from=0 /build/${file} /app/`)
  }
  const cwd = process.cwd()
  files = Array.from(new Set(files.filter(x => x.startsWith(cwd)).map(x => x.substr(cwd.length + 1)))).sort()

  const foldersToClear = new Set(folders)
  for (const file of files) {
    for (const folder of foldersToClear) {
      if (file.startsWith(folder.folder)) {
        foldersToClear.delete(folder)
      }
    }
  }

  const seen = []
  const clearing = Array.from(foldersToClear).sort((a, b) => a.folder.length - b.folder.length)
  const parents = []
  // eslint-disable-next-line no-labels
  next:
  for (const folder of clearing) {
    const f = folder.folder + '/'
    for (const prev of seen) {
      // eslint-disable-next-line no-labels
      if (f.startsWith(prev)) continue next
    }
    parents.push(folder)
    seen.push(f)
  }

  const bytesToSave = parents.map(x => x.size).reduce((a, b) => a + b, 0)
  for (const folder of parents) {
    console.log(folder.folder)
  }
  console.log(`# This should save ${(bytesToSave / 1024 / 1024).toPrecision(3)} MB.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
