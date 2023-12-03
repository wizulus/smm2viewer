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
