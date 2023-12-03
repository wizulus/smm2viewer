export const images = {}
const promises = {}
export async function importImages (paths) {
  return (await Promise.all(paths.map(path => import(`assets/${path.split('/').slice(2).join('/')}`)))).map(x => x.default)
}
export async function importImage (path) {
  return (await importImages([path]))[0]
}

export async function loadImages (paths) {
  paths = Array.from(new Set(paths))
  for (const path of paths) {
    if (!promises[path]) {
      promises[path] = new Promise((resolve, reject) => {
        import(`assets/${path.split('/').slice(2).join('/')}`).then(({ default: src }) => {
          const image = new Image()
          images[path] = image
          image.src = src
          image.addEventListener('load', resolve)
          image.addEventListener('error', err => {
            console.error('Could not load image', path, err)
            reject(err)
          })
        }).catch(reject)
      })
    }
  }
  return await Promise.all(paths.map(x => promises[x]))
}

export async function loadImage (path) {
  return (await loadImages([path]))[0]
}

const imageSrcs = {}

export async function loadImageFromSrc (src) {
  if (!imageSrcs[src]) {
    imageSrcs[src] = new Promise((resolve, reject) => {
      const image = new Image()
      image.src = src
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', err => {
        console.error('Could not load image', src, err)
        reject(err)
      })
    })
  }
  return imageSrcs[src]
}

export async function loadImagesFromSrc (srcs) {
  return Promise.all(srcs.map(src => loadImageFromSrc(src)))
}
