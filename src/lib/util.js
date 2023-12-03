import pLimit from 'p-limit'

export const limit = pLimit(1)

export function loadImage (src, cb) {
  let abort = false
  limit(async () => {
    if (abort) return null
    if (!src) return null
    cb(null, null, true)
    // Load image using fetch and convert it to a blob url
    try {
      const response = await fetch(src)
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        cb(null, url, false)
      } else {
        // Create an error image
        const canvas = document.createElement('canvas')
        canvas.width = 180
        canvas.height = 101
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#400'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 20px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Error', canvas.width / 2, canvas.height / 2)
        const url = canvas.toDataURL()
        cb(new Error(`Failed to load image: ${response.status} ${response.statusText}`), url, false)
      }
    } catch (err) {
      cb(err, null, false)
    }
  })
  return () => { abort = true }
}

export async function waitFor (fn) {
  let ret = null
  while (!(ret = fn())) {
    await sleep()
  }
  return ret
}

export async function sleep (ms = 0) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

export function uniq (array, by = x => x) {
  const seen = new Set()
  const ret = []
  for (const value of array) {
    const key = by(value)
    if (!seen.has(key)) {
      ret.push(value)
      seen.add(key)
    }
  }
  return ret
}

export function formatDate (date) {
  if (typeof date === 'number') {
    return formatDate(new Date(date * 1000))
  } else if (typeof date === 'string') {
    return formatDate(new Date(date))
  } else if (date instanceof Date) {
    // Format as DD/MM/YYYY HH:MM
    const pad = n => n.toString().padStart(2, '0')
    return `${date.toLocaleDateString(navigator.language, {
      year: 'numeric', month: '2-digit', day: '2-digit'
    })} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  } else {
    return `(${typeof date})`
  }
}
