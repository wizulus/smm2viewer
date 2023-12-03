import app from './app.js'
import './websocket.js'
import rest from './rest.js'
import { sequelize } from './lib/sequelize.js'
import { User } from './lib/user-schema.js'
import './lib/key-value-schema.js'
import { s3 } from './s3.js'
import { GetObjectCommand, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import axios from 'axios'
import { Agent } from 'https'
import { stripCode, formatCode } from '../lib/id.mjs'
import { isNSOMakerCode, isNSOCourseCode, isOCWCourseCode, isOCWMakerCode, getCodeType } from '@wizulus/code'
import ejs from 'ejs'
import fs from 'fs'
import multer from 'multer'

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const httpsAgent = new Agent({
  rejectUnauthorized: false
})

const debugHeaders = (process.env.DEBUG_HEADERS || 'user-agent: smm2-viewer')
  .split(';')
  .map(x => x.trim().split(':').map(y => y.trim()))
  .filter(x => x.length === 2)
  .map(([key, value]) => [key, value.startsWith('.') ? (r) => r[value.substring(1)] : () => value])
  .reduce((a, [k, v]) => r => ({ ...a(r), [k]: v(r) }), (r) => ({}))

async function main () {
  await sequelize.sync({
    alter: {
      drop: false
    }
  })

  // Initialize main user
  if (!(await User.findOne({ where: { username: 'wizulus' } }))) {
    await User.upsert({
      username: 'wizulus',
      role: 'wiz'
    })
  }

  const cacheAge = {}

  const paramValidators = {
    courseCode: /^[0123456789BCDFGHJKLMNPQRSTVWXY]{9}$/,
    playerCode: /^[0123456789BCDFGHJKLMNPQRSTVWXY]{9}(?:,[0123456789BCDFGHJKLMNPQRSTVWXY]{9})*$/,
    dataId: /^\d+$/,
    superWorldId: /^[a-f0-9]+_\d+$/,
    count: /^\d+$/,
    difficulty: /^(e|n|ex|sex)$/,
    rejectRegions: /^(j|u|e)$/,
    force: /^1$/
  }
  const tgrUrls = {
    '/mm2/level_info/:courseCode?force': { strategy: 'cache', ttl: '100y', forceable: true },
    '/mm2/user_info/:playerCode?force': { strategy: 'cache', ttl: '5m', forceable: true },
    '/mm2/level_info_multiple/:courseCodes': { strategy: 'redirect' },
    '/mm2/level_comments/:courseCode': { strategy: 'cache', ttl: '1d' },
    '/mm2/level_played/:courseCode': { strategy: 'cache', ttl: '1d' },
    '/mm2/level_deaths/:courseCode': { strategy: 'cache', ttl: '1d' },
    '/mm2/level_thumbnail/:courseCode': { strategy: 'cache', ttl: '100y' },
    '/mm2/level_entire_thumbnail/:courseCode': { strategy: 'redirect' },
    '/mm2/level_data/:courseCode': { strategy: 'cache', ttl: '1h', ipAppend: '-2' },
    '/mm2/level_data_dataid/:dataId': { strategy: 'redirect' },
    '/mm2/ninji_info': { strategy: 'redirect' },
    '/mm2/ninji_ghosts/:index': { strategy: 'redirect' },
    '/mm2/get_posted/:playerCode': { strategy: 'cache', ttl: '1d' },
    '/mm2/get_liked/:playerCode': { strategy: 'cache', ttl: '1d' },
    '/mm2/get_played/:playerCode': { strategy: 'cache', ttl: '1d' },
    '/mm2/get_first_cleared/:playerCode': { strategy: 'cache', ttl: '1d' },
    '/mm2/get_world_record/:playerCode': { strategy: 'cache', ttl: '1d' },
    '/mm2/get_super_worlds': { strategy: 'redirect' },
    '/mm2/super_world/:superWorldId': { strategy: 'cache', ttl: '1d' },
    '/mm2/search_endless_mode?count&difficulty': { strategy: 'redirect' },
    '/mm2/search_new?count': { strategy: 'cache', ttl: '1h' },
    '/mm2/search_popular?count&difficulty&rejectRegions': { strategy: 'redirect' }
  }

  const urlChecker = (template, config) => {
    const [path, query] = template.split('?')
    const pathParts = path.split('/').map(part => {
      if (part.startsWith(':')) {
        const regexp = paramValidators[part.substring(1)]
        return {
          part,
          test: str => regexp.test(str)
        }
      } else {
        return {
          part,
          test: str => str === part
        }
      }
    })
    const paramSet = new Set(query?.split('&') ?? [])
    return (url) => {
      const [path, query] = url.split('?')
      const myPathParts = path.split('/')
      const myParams = new URLSearchParams(query)
      if (myPathParts.length !== pathParts.length) return false
      const params = {}
      for (let i = 0; i < myPathParts.length; i++) {
        const part = pathParts[i]
        const myPart = myPathParts[i]
        if (!part.test(myPart)) return false
        if (part.part.startsWith(':')) {
          params[part.part.substring(1)] = myPart
        }
      }
      for (const [key, value] of myParams.entries()) {
        if (!paramSet.has(key)) return false
        if (!paramValidators[key].test(value)) return false
      }
      return {
        ...config,
        params,
        query: Object.fromEntries(new URLSearchParams(query))
      }
    }
  }
  const validateUrl = Object.entries(tgrUrls).map(([url, config]) => urlChecker(url, config))
    .reduce((a, b) => url => a(url) || b(url))

  const tgrPromises = {}
  const callTgrApi = async (tgrLog, ip, known, force, url, key) => {
    const r = { ip, known, force, url, key }
    console.log('callTgrApi', ip, known, force, url, key)
    const start = Date.now()
    while (true) {
      /** @type {import('axios').AxiosResponse} */
      let apiRes
      /** @type {import('axios').AxiosError} */
      let apiError
      tgrLog.push([Date.now(), `ip ${ip}`])
      if ((!known && !cacheAge[key]) || force) {
        tgrLog.push([Date.now(), 'unknown'])
        if (force) {
          tgrLog.push([Date.now(), 'force'])
        } else {
          // Check if this exists in S3 already
          const obj = await s3.send(new GetObjectCommand({
            Key: key,
            Bucket: 'smm2viewer'
          })).catch(err => {
            if (err.name === 'NoSuchKey') return null
            return Promise.reject(err)
          })

          if (obj) {
            tgrLog.push([Date.now(), 'cache hit'])
            // We retrieved a cached response from S3.
            cacheAge[key] = true
            setTimeout(() => {
              delete cacheAge[key]
            }, 60 * 60 * 1000)

            return res => {
              res.header('X-Strategy', 'Cached').contentType(obj.ContentType)
              obj.Body.pipe(res)
            }
          } else {
            tgrLog.push([Date.now(), 'cache miss'])
          }
        }

        tgrLog.push([Date.now(), 'call api'])
        // If we don't have the data, or the cached data is old, retrieve from server.
        const tgrUrl = `https://tgrcode.com${url}`
        console.log(`TGR API Call: ${tgrUrl}`)
        apiRes = await axios.get(tgrUrl, {
          responseType: 'arraybuffer',
          validateStatus: () => true,
          headers: debugHeaders(r),
          httpsAgent
        }).catch(err => {
          tgrLog.push([Date.now(), `TGRCode API Error: ${err.res?.status} ${err.res?.statusText} / ${err.message}`])
          console.error(`TGRCode API Error: ${err.res?.status} ${err.res?.statusText} / ${err.message}`)
          apiError = err
          return null
        })
        if (apiRes?.status === 200) {
          tgrLog.push([Date.now(), 'success, cache set'])
          // If we retrieved from the server, save to s3.
          const contentType = apiRes.headers['content-type']
          await s3.send(new PutObjectCommand({
            Key: key,
            Bucket: 'smm2viewer',
            Body: apiRes.data,
            ContentType: contentType
          }))
          // Soft expire data after an hour
          cacheAge[key] = true
          setTimeout(() => {
            delete cacheAge[key]
          }, 60 * 60 * 1000)

          return res => res.header('X-Strategy', 'Proxy').contentType(contentType).send(apiRes.data)
        }
      }
      if (!apiRes) {
        tgrLog.push([Date.now(), known ? 'cache check' : 'cache hit'])
        // If we didn't retrieve the API, or the API was cached, or the API failed, retrieve from S3.
        const obj = await s3.send(new GetObjectCommand({
          Key: key,
          Bucket: 'smm2viewer'
        })).catch(err => {
          if (err.name === 'NoSuchKey') return null
          return Promise.reject(err)
        })

        if (!obj) {
          // If the API couldn't handle the request, and we don't have anything cached, return error.
          if (apiError) {
            tgrLog.push([Date.now(), `cache error: ${apiError.name} ${apiError.message}`])
            // The API returned an error, return that error.
            return res => res.header('X-Strategy', 'ApiError').status(apiError.res?.status || 500).send(apiError.res?.statusText || 'TGRCode API Error')
          } else {
            tgrLog.push([Date.now(), 'cache error: no data'])
            // Dunno.. 404?
            return res => res.header('X-Strategy', 'Unknown').status(404).end()
          }
        } else {
          tgrLog.push([Date.now(), 'cache read'])
          // We retrieved a cached response from S3. Return it.
          return res => {
            res.header('X-Strategy', 'Cached').contentType(obj.ContentType)
            obj.Body.pipe(res)
          }
        }
      } else {
        // API returned something other than 200, and didn't error..
        tgrLog.push([Date.now(), `unexpected error: ${apiRes.status} ${apiRes.statusText}`])
        // Retry for a minute, or until we get a 200.
        if (Date.now() < start + 60 * 1000 && apiRes.status >= 500) {
          tgrLog.push([Date.now(), 'retry'])
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        } else {
          tgrLog.push([Date.now(), 'give up'])
          return res => res.header('X-Strategy', 'Unexpected').status(apiRes.status).send(apiRes.data)
        }
      }
    }
  }

  const mm2Handler = async (req, res) => {
    const tgrLog = []
    try {
      const { force } = req.query
      const [known, url] = req.originalUrl.startsWith('/known/')
        ? [true, req.originalUrl.split('/known/').join('/mm2/')]
        : [false, req.originalUrl]
      tgrLog.push([Date.now(), `${known ? 'known' : 'live'} ${url}`])

      const config = validateUrl(url)

      if (config) {
        const { courseCode, playerCode } = config.params
        if (courseCode) {
          const codeType = getCodeType(courseCode)
          if (codeType !== 'NSO_COURSE' && codeType !== 'OCW_COURSE') {
            throw new Error('🔴 Invalid Course Code')
          } else {
            console.log(`🟢 Course Code: ${courseCode}`)
          }
        } else if (playerCode) {
          const codeType = getCodeType(playerCode)
          if (codeType !== 'NSO_MAKER' && codeType !== 'OCW_MAKER') {
            throw new Error('🔴 Invalid Player Code')
          } else {
            console.log(`🟢 Player Code: ${playerCode}`)
          }
        } else {
          console.log('🟡 No Course or Player Code')
        }
      }
      const { courseCode, playerCode } = req.params
      if (courseCode) {
        const codeType = getCodeType(courseCode)
        if (codeType !== 'NSO_COURSE' && codeType !== 'OCW_COURSE') {
          throw new Error('🔴 Invalid Course Code')
        } else {
          console.log(`🟢 Course Code: ${courseCode}`)
        }
      } else if (playerCode) {
        const codeType = getCodeType(playerCode)
        if (codeType !== 'NSO_MAKER' && codeType !== 'OCW_MAKER') {
          throw new Error('🔴 Invalid Player Code')
        } else {
          console.log(`🟢 Player Code: ${playerCode}`)
        }
      } else {
        console.log('🟡 No Course or Player Code')
      }

      if (!config) {
        tgrLog.push([Date.now(), 'invalid url'])
        return res.status(400).send('Not a valid TGR Request')
      } else if (config.strategy === 'redirect') {
        tgrLog.push([Date.now(), 'redirect'])
        return res.redirect(`https://tgrcode.com${url}`)
      } else if (config.strategy === 'cache') {
        tgrLog.push([Date.now(), 'cache'])
        const key = `${url.substring(1).split('?force=1').join('').split('&force=1').join('').split('?').join('_').split('&').join('_')}.${url.includes('thumbnail') ? 'png' : 'json'}`
        tgrLog.push([Date.now(), `key: ${key}`])
        // console.log('translation', url, '->', key)

        /*
          De-duplicate requests for the same URL.
          The promise response will be a function that handles the response object.
        */
        const tgrPromise = tgrPromises[key]
          ? tgrPromises[key]
          : (tgrPromises[key] = callTgrApi(tgrLog, req.ip + (config.ipAppend || ''), known, !!(force), url, key).then(x => {
              delete tgrPromises[key]
              return x
            }))
        const tgrRes = await tgrPromise
        await tgrRes(res)
        return
      }
    } catch (err) {
      tgrLog.push([Date.now(), `error: ${err.name} ${err.message}`])
      console.error(`Err in ${req.url}:`, err)
      res.header('X-Strategy', 'InternalError').status(500).send({ error: err.stack || err })
    } finally {
      const logLine = []
      let lastTime = tgrLog[0]?.[0] || 0

      for (const [time, line] of tgrLog) {
        const delta = time - lastTime
        lastTime = time
        if (delta > 250) {
          logLine.push(`${delta}ms ${line}`)
        } else {
          logLine.push(line)
        }
      }

      console.log(`TGR ${req.url} ${logLine.join('; ')}`)
    }
  }

  app.get('/mm2/get_uncleared/:playerCode', async (req, res) => {
    const promise = await callTgrApi([], req.ip, false, false, `/mm2/get_posted/${req.params.playerCode}`, `get_posted_${req.params.playerCode}.json`)
    await promise(res)
  })
  app.get('/mm2/level_info/:courseCode', async (req, res, next) => {
    try {
      const { courseCode } = req.params
      if (!isOCWCourseCode(courseCode)) return next()
      // Proxy the request to https://server.opencourse.world/mm2/level_info/:courseCode using axios
      console.log(`Proxying ${req.originalUrl} to OpenCourseWorld`)
      const r = await axios.get(`https://server.opencourse.world/mm2/level_info/${courseCode}`)
      return res.header('X-Strategy', 'Proxy').send(r.data)
    } catch (err) {
      console.error(`Could not proxy request: ${err.message}`)
      return res.status(500).send({ error: err.message || err })
    }
  })

  app.get('/mm2/level_data/:courseCode', async (req, res, next) => {
    try {
      const { courseCode } = req.params
      if (!isOCWCourseCode(courseCode)) return next()
      // Proxy the request to https://server.opencourse.world/mm2/level_data/:courseCode using axios
      console.log(`Proxying ${req.originalUrl} to OpenCourseWorld`)
      const r = await axios.get(`https://server.opencourse.world/mm2/level_data/${courseCode}`, { responseType: 'arraybuffer' })
      return res.header('X-Strategy', 'Proxy').send(r.data)
    } catch (err) {
      console.error(`Could not proxy request: ${err.message}`)
      return res.status(500).send({ error: err.message || err })
    }
  })
  app.use('/mm2', mm2Handler)
  app.use('/known', mm2Handler)

  app.use(upload.single('image'), rest)

  const read = (key) => new Promise((resolve, reject) => {
    try {
      console.log(`Reading ${key}...`)
      s3.send(new GetObjectCommand({
        Bucket: 'smm2viewer',
        Key: key
      })).then(
        res => {
          const data = []
          res.Body.on('data', chunk => data.push(chunk))
          res.Body.on('end', () => resolve(Buffer.concat(data)))
        },
        err => err.message === 'NoSuchKey' ? resolve(null) : reject(new Error(`Error reading ${key}: ${err.message}`))
      )
    } catch (err) {
      if (err.code === 'NoSuchKey') {
        resolve(null)
      } else {
        reject(new Error(`Error reading ${key}: ${err.message}`))
      }
    }
  })
  const exists = (key) => new Promise((resolve, reject) => {
    try {
      s3.send(new HeadObjectCommand({
        Bucket: 'smm2viewer',
        Key: key
      })).then(
        res => resolve(true),
        // eslint-disable-next-line node/handle-callback-err
        err => resolve(false)
      )
    } catch (err) {
      if (err.code === 'NoSuchKey') {
        resolve(null)
      } else {
        reject(new Error(`Error checking for ${key}: ${err.message}`))
      }
    }
  })
  const write = (key, data, contentType) => new Promise((resolve, reject) => {
    try {
      s3.send(new PutObjectCommand({
        Bucket: 'smm2viewer',
        Key: key,
        Body: data,
        ContentType: contentType
      })).then(
        res => resolve(res),
        err => reject(new Error(`Error writing ${key}: ${err.message}`))
      )
    } catch (err) {
      reject(new Error(`Error writing ${key}: ${err.message}`))
    }
  })

  const courseEjs = () => fs.readFileSync('src-server/views/course.ejs', 'utf-8')
  const makerEjs = () => fs.readFileSync('src-server/views/maker.ejs', 'utf-8')
  const courseWidgetEjs = () => fs.readFileSync('src-server/views/course-widget.ejs', 'utf-8')
  const playerWidgetEjs = () => fs.readFileSync('src-server/views/player-widget.ejs', 'utf-8')

  const date = (n) => {
    if (!n) n = Date.now()
    if (n < 10000000000) n *= 1000
    if (n > Date.now()) n = Date.now()
    return new Date(n).toISOString()
  }

  const url = (req, path) => {
    const baseUrl = req.hostname === 'localhost'
      ? `http://${req.hostname}:${req.socket.localPort}`
      : parseInt(req.hostname.split('.')[0]) > 0
        ? `http://${req.hostname}:${req.socket.localPort}`
        : 'https://smm2.wizul.us'
    return new URL(path, baseUrl).toString()
  }
  const renderEjs = (template, data) => ejs.render(template(), {
    ...data,
    formatCode,
    playerWidget: (newData) => renderEjs(playerWidgetEjs, { ...data, ...newData }),
    courseWidget: (newData) => renderEjs(courseWidgetEjs, { ...data, ...newData }),
    date,
    url: (path) => url(data.req, path)
  })

  const overrides = {
    D2GW8450H: {
      ld: {
        name: 'Larry L. Sagan',
        givenName: 'Larry',
        additionalName: 'L.',
        familyName: 'Sagan',
        alternateName: 'CarlSagan42',
        gender: 'male',
        birthDate: '1989-04-08',
        email: 'sporefrog42@gmail.com',
        height: {
          '@type': 'QuantitativeValue',
          value: 5.67,
          unitText: 'ft'
        },
        weight: {
          '@type': 'QuantitativeValue',
          value: 150,
          unitText: 'lbs'
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: '2950 Whitehall Dr',
          addressLocality: 'Okemos',
          addressRegion: 'MI',
          postalCode: '48864',
          addressCountry: 'US'
        }
      },
      qna: [
        ['What is CarlSagan42\'s real name?', 'CarlSagan42\'s birth name was Larry L. Sagan.'],
        ['What is CarlSagan42\'s legal name?', 'CarlSagan42\'s legal name is Larry L. Sagan.'],
        ['What is CarlSagan42\'s middle name"', 'CarlSagan42\'s middle name is Lloyd.'],
        ['What is CarlSagan42 famous for?', 'CarlSagan42 is a popular Twitch streamer. He is known for his Mario Maker 2 streams, and his evil courses that frequently contain game-breaking glitches.'],
        ['What is CarlSagan42\'s birthday?', 'CarlSagan42 was born April 8, 1989.'],
        ['What is CarlSagan42\'s height?', 'CarlSagan42 is 5\' 8".'],
        ['What is CarlSagan42\'s weight?', 'CarlSagan42 weighs 150 lbs.'],
        ['What is CarlSagan42\'s address?', 'CarlSagan42 lives in Okemos, MI 48864'],
        ['What is CarlSagan42\'s email?', 'CarlSagan\'s business inquiry email address is sporefrog42@gmail.com.']
      ]
    }
  }

  const extras = {
    D2GW8450H: [
      {
        '@context': 'http://schema.org',
        '@type': 'FAQPage',
        mainEntity: overrides.D2GW8450H.qna.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: a
          }
        }))
      },
      {
        '@context': 'http://schema.org',
        '@type': 'Article',
        headline: 'CarlSagan42',
        image: 'https://studio.mii.nintendo.com/miis/image.png?data=00080f565c58636e62677278808d909da6b6bec5d4dbe6edeceff4050b11377e8188918c968c8f87919ca3b0bbc1cf&type=face&width=512&instanceCount=1',
        datePublished: '2023-02-01',
        dateModified: '2023-02-01',
        author: {
          '@type': 'Person',
          name: 'Wizulus',
          url: 'https://smm2.wizul.us/smm2/maker/NGD-SJG-21H'
        },
        keywords: 'CarlSagan42, Super Mario Maker 2, Twitch, Carl Sagan, Troll Level',
        description: 'CarlSagan42, also known as Larry L. Sagan, is a popular Twitch streamer. He is known for his Mario Maker 2 streams, and his evil courses that frequently contain game-breaking glitches.',
        url: 'https://smm2.wizul.us/smm2/maker/D2G-W84-50H'
      }
    ]
  }

  function wrapLd (ld) {
    return ld ? `<script type="application/ld+json">\n${JSON.stringify(ld, null, 4)}\n</script>` : ''
  }

  function ld (ld, extra) {
    if (!ld) return null
    const override = overrides[ld.identifier]
    return {
      ...ld,
      ...extra,
      ...override?.ld
    }
  }

  function playerLd (player, extra) {
    if (!player) return null
    return ld({
      '@context': 'http://schema.org',
      '@type': 'Person',
      name: player.name,
      image: player.mii_image,
      identifier: player.code,
      url: `https://smm2.wizul.us/smm2/maker/${formatCode(player.code)}`,
      address: {
        '@type': 'PostalAddress',
        addressCountry: player.country
      }
    }, extra)
  }

  function courseLd (course, extra) {
    if (!course) return null
    return ld({
      '@context': 'http://schema.org',
      '@type': 'CreativeWork',
      name: course.name,
      identifier: course.course_id,
      headline: `${formatCode(course.course_id)}: ${course.name}`,
      description: course.description,
      url: `https://smm2.wizul.us/smm2/level/${formatCode(course.course_id)}`,
      datePublished: date(course.uploaded),
      author: playerLd(course.uploader),
      contributors: [
        playerLd(course.first_completer, { disambiguatingDescription: 'First completer' }),
        playerLd(course.record_holder, { disambiguatingDescription: 'Record holder' })
      ].filter(Boolean)
    }, extra)
  }

  // Structured data: https://developers.google.com/search/docs/appearance/structured-data/search-gallery
  let [a, b, c] = ['<html><head>', '</head><body>', '</body></html>']
  const htmlFile = process.cwd() + '/pwa/index.html'
  if (fs.existsSync(htmlFile)) {
    ;[a, b] = fs.readFileSync(process.cwd() + '/pwa/index.html', 'utf-8').split('</head>')
    ;[b, c] = b.split('<body>')
    b = '</head>' + b + '<body>'
  }
  const courseHandler = async (req, res) => {
    try {
      // Load level info from S3
      const courseCode = stripCode(req.params.courseCode)
      const formatted = formatCode(courseCode)
      if (formatted !== req.params.courseCode) {
        return res.redirect(`/smm2/level/${formatted}`)
      }
      const key = `mm2/level_info/${courseCode}.json`
      const obj = await read(key)
      if (obj) {
        const course = JSON.parse(obj.toString('utf-8'))
        course.ld = courseLd(course)

        const ldHtml = wrapLd(course.ld)
        const exHtml = extras[courseCode]?.map(wrapLd)?.join('\n') || ''
        const cnHtml = `<link rel="canonical" href="${url(req, `/smm2/course/${formatted}`)}">`
        const esHtml = renderEjs(courseWidgetEjs, { ld: course.ld, course })
        const html = a + cnHtml + ldHtml + exHtml + b + esHtml + c
        res.type('text/html')
        res.send(html)
        if (course.uploader) {
          if (!(await exists(`mm2/user_info/${course.uploader.code}.json`))) {
            console.log(`Writing user info for ${course.uploader.code}...`)
            await write(`mm2/user_info/${course.uploader.code}.json`, JSON.stringify(course.uploader), 'application/json')
          }
        }
        if (course.first_completer) {
          if (!(await exists(`mm2/user_info/${course.first_completer.code}.json`))) {
            console.log(`Writing user info for ${course.first_completer.code}...`)
            await write(`mm2/user_info/${course.first_completer.code}.json`, JSON.stringify(course.first_completer), 'application/json')
          }
        }
        if (course.record_holder) {
          if (!(await exists(`mm2/user_info/${course.record_holder.code}.json`))) {
            console.log(`Writing user info for ${course.record_holder.code}...`)
            await write(`mm2/user_info/${course.record_holder.code}.json`, JSON.stringify(course.record_holder), 'application/json')
          }
        }
      } else {
        res.type('text/html')
        res.send(a + b + c)
      }
    } catch (err) {
      console.error(`Error in ${req.url}:`, err.message)
      res.status(500).send(err.message)
    }
  }
  app.get('/smm2/level/:courseCode', courseHandler)
  app.get('/smm2/course/:courseCode', courseHandler)

  const playerHandler = async (req, res) => {
    try {
      // Load level info from S3
      const playerCode = stripCode(req.params.playerCode)
      const formatted = formatCode(playerCode)
      if (formatted !== req.params.playerCode) {
        return res.redirect(`/smm2/maker/${formatted}`)
      }
      const key = `mm2/user_info/${playerCode}.json`
      const obj = await read(key)
      if (obj) {
        const player = JSON.parse(obj.toString('utf-8'))
        player.ld = playerLd(player)
        const ldHtml = wrapLd(player.ld)
        const exHtml = extras[playerCode]?.map(wrapLd)?.join('\n') || ''
        const cnHtml = `<link rel="canonical" href="${url(req, `/smm2/maker/${formatted}`)}">`
        const esHtml = renderEjs(playerWidgetEjs, { ld: player?.ld, player })
        const html = a + cnHtml + ldHtml + exHtml + b + esHtml + c
        res.type('text/html')
        res.send(html)
      } else {
        res.type('text/html')
        res.send(a + b + c)
      }
    } catch (err) {
      console.error(`Error in ${req.url}:`, err.message)
      res.status(500).send(err.message)
    }
  }
  app.get('/smm2/maker/:playerCode', playerHandler)
  app.get('/smm2/maker/:playerCode', playerHandler)
  app.use((req, res, next) => {
    try {
      if (req.method === 'GET' && !req.url.split('?').shift().split('/').pop().includes('.')) {
        console.log('Getting', req.method, req.url)
        res.sendFile(process.cwd() + '/pwa/index.html')
      } else {
        next()
      }
    } catch (err) {
      console.error(`Error in ${req.url}:`, err.message)
      res.status(500).send(err.message)
    }
  })

  app.listen().catch((err) => {
    console.log(err.toString())
    process.exit(1)
  })

  if (process.env.TRACING) process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
