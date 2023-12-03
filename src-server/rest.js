import fs from 'fs'
import crypto from 'crypto'
import AesCmac from 'node-aes-cmac'
import Jimp from 'jimp'
import { get, set } from './lib/redis.js'
import RestRouter from './lib/rest-router.js'
import WebError from './lib/web-error.js'
import { s3 } from './s3.js'
import { GetObjectCommand, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

const rest = new RestRouter()
export default rest

rest.get('/rest/test', async (req) => {
  const rec = await get('test') || { count: 0 }
  await set('test', { count: rec.count + 1 })
  return {
    message: 'Hello World'
  }
})

rest.post('/rest/generate-thumbnail', async (req, res) => {
  // Check request for files
  if (!req.file) {
    throw new WebError(400, 'No image file provided')
  }

  // Check for image file
  const image = req.file
  if (!image.mimetype.startsWith('image/')) {
    throw new WebError(400, 'File is not an image')
  }

  const filename = (image.originalname || 'thumbnail.jpg').split(/[/\\]/).pop()
  const fileWithoutExtension = filename.replace(/\.[^.]+$/, '')
  const newFilename = `${fileWithoutExtension}.btl`

  // Save the original image to S3
  const s3Key = `thumbnail_uploads/${Date.now().toString(16)}-${Buffer.from(req.ip || '?').toString('hex')}-${filename}`
  await s3.send(new PutObjectCommand({
    Bucket: 'smm2viewer',
    Key: s3Key,
    Body: image.buffer,
    ContentType: image.mimetype,
    Metadata: {
      'x-amz-meta-timestamp': new Date().toISOString(),
      'x-amz-meta-ip': req.ip || '?'
    }
  }))

  // Create thumbnail
  const thumbnail = await createThumbnail(image.buffer)

  // Return thumbnail as a download
  res.set('Content-Type', 'application/octet-stream')
  res.set('Content-Disposition', `attachment; filename="${newFilename}"`)
  res.send(thumbnail)
  res.end()
})

const thumbnailSize = 0x1bf9c
const thumbnailSalt = Buffer.from([0x9c, 0xbf, 0x01, 0x00])

async function createThumbnail (imageBuffer) {
  if (typeof imageBuffer === 'string') {
    imageBuffer = await fs.promises.readFile(imageBuffer)
  }
  const image = await Jimp.read(imageBuffer)
  const thumbnail = image.resize(640, 360, Jimp.RESIZE_BILINEAR)
  let quality = 95
  while (quality > 0) {
    console.log(`Quality: ${quality}`)
    const thumbnailBuffer = await thumbnail.quality(quality).getBufferAsync(Jimp.MIME_JPEG)
    if (thumbnailBuffer.length > thumbnailSize) {
      quality -= 5
    } else {
      break
    }
  }

  const thumbnailBuffer = await thumbnail.getBufferAsync(Jimp.MIME_JPEG)
  return encryptThumbnail(pad(thumbnailBuffer, thumbnailSize))
}

const thumbnailKeyInts = [
  0x39B399D2n, 0xFAE40B38n, 0x851BC213n, 0x8CB4E3D9n,
  0x7ED1C46An, 0xE8050462n, 0xD8D24F76n, 0xB52886FCn,
  0x67890BF0n, 0xF5329CB0n, 0xD597FB28n, 0x2B8EE0EAn,
  0x47574C51n, 0xF7569D9n, 0xCF1163AEn, 0xE4A153BFn,
  0xD1FAE468n, 0xD4C64738n, 0x360106F5n, 0xDD7EB113n,
  0xC296F3E2n, 0x2C58F258n, 0x79B554E1n, 0x85DF9D06n,
  0xAA307330n, 0x1410F69n, 0xB2F2C573n, 0x82B93EB1n,
  0xF351A11Cn, 0x63098693n, 0x885B5DA5n, 0x8872A8EDn,
  0xACD9CB13n, 0xED7FBCADn, 0xE6A41EC2n, 0x5F44E79Fn,
  0x8346F5B5n, 0x389FE6EDn, 0x507124B5n, 0xE9B23EAAn,
  0x577113F0n, 0xA95ED917n, 0x2F62D158n, 0x47843F86n,
  0xC65637D0n, 0x2F272052n, 0xBA4A4CC4n, 0xB5F146F6n,
  0x501B87A7n, 0x51FC3A93n, 0x6EDE3F02n, 0x3D265728n,
  0x9B809440n, 0x75B89229n, 0xF6A280CCn, 0x8537FA68n,
  0x5B5ED19An, 0x6FC05BB6n, 0xF4EF5261n, 0xAA1B7D4Fn,
  0xFCB26110n, 0xAD3D74n, 0xC0E73A4Bn, 0xF132E7C7n
]

function decrypt (buffer, keyInts) {
  const encrypted = buffer.subarray(0, buffer.length - 0x30)
  const cryptoConfig = buffer.subarray(encrypted.length, encrypted.length + 0x30)
  const iv = cryptoConfig.subarray(0, 0x10)
  let randomState = cryptoConfig.subarray(0x10, 0x20)
  const cmac = cryptoConfig.subarray(0x20, 0x30)
  const rng = new RNG()
  rng.setStateBuffer(randomState)
  const key = createKey(rng, keyInts, 0x10)
  randomState = rng.getStateBuffer()
  const aes = crypto.createDecipheriv('aes-128-cbc', key, iv)
  aes.setAutoPadding(false)
  let decrypted = aes.update(encrypted)
  decrypted = Buffer.concat([
    decrypted, aes.final(),
    iv,
    randomState,
    cmac
  ])

  return verifyCmac(decrypted, keyInts)
}

function verifyCmac (buffer, keyInts) {
  const data = buffer.subarray(0, buffer.length - 0x30)
  const cryptoConfig = buffer.subarray(data.length, data.length + 0x30)
  // iv (0x0 - 0x10) is ignored
  const randomState = cryptoConfig.subarray(0x10, 0x20)
  const cmac = cryptoConfig.subarray(0x20, 0x30)
  const rng = new RNG()
  rng.setStateBuffer(randomState)
  const key = createKey(rng, keyInts, 0x10)
  const computedCmac = AesCmac.aesCmac(key, data, { returnAsBuffer: true })
  if (!computedCmac.equals(cmac)) {
    throw new Error('CMAC mismatch')
  }
  return data
}

function verifyHmac (buffer, keyInts, salt = Buffer.alloc(0)) {
  const data = buffer.subarray(0, buffer.length - (0x30 + salt.length))
  const storedSalt = buffer.subarray(data.length, data.length + salt.length)
  const cryptoConfig = buffer.subarray(data.length + salt.length, buffer.length)
  if (!salt.equals(storedSalt)) {
    throw new Error('Salt mismatch')
  }
  const referenceHmac = cryptoConfig.subarray(0x00, 0x20)
  const randomState = cryptoConfig.subarray(0x20, 0x30)
  const rng = new RNG()
  rng.setStateBuffer(randomState)
  const key = createKey(rng, keyInts, 0x10)
  const computedHmac = crypto.createHmac('sha256', key).update(data).digest()
  if (!computedHmac.equals(referenceHmac)) {
    throw new Error('HMAC mismatch')
  }
  return data
}

function signHmac (buffer, keyInts, salt = Buffer.alloc(0)) {
  const data = Buffer.concat([buffer, salt])
  const randomState = crypto.randomBytes(0x10)
  const rng = new RNG()
  rng.setStateBuffer(randomState)
  const key = createKey(rng, keyInts, 0x10)
  const computedHmac = crypto.createHmac('sha256', key).update(buffer).digest()
  return Buffer.concat([
    buffer,
    salt,
    computedHmac,
    randomState
  ])
}

function encrypt (buffer, keyInts) {
  const iv = crypto.randomBytes(0x10)
  const randomState = crypto.randomBytes(0x10)
  const rng = new RNG()
  rng.setStateBuffer(randomState)
  const key = createKey(rng, keyInts, 0x10)
  const aes = crypto.createCipheriv('aes-128-cbc', key, iv)
  aes.setAutoPadding(false)
  let encrypted = aes.update(buffer)
  encrypted = Buffer.concat([
    encrypted, aes.final()
  ])

  const cmacKey = createKey(rng, keyInts, 0x10)
  const cmac = AesCmac.aesCmac(cmacKey, buffer, { returnAsBuffer: true })
  const cryptoConfig = Buffer.concat([iv, randomState, cmac])
  return Buffer.concat([encrypted, cryptoConfig])
}

function pad (buffer, length) {
  const ret = Buffer.alloc(length)
  buffer.copy(ret)
  return ret
}

function decryptThumbnail (buffer) {
  buffer = decrypt(buffer, thumbnailKeyInts)
  buffer = verifyHmac(buffer, thumbnailKeyInts, thumbnailSalt)
  return buffer
}

function encryptThumbnail (buffer) {
  if (buffer.length < thumbnailSize) {
    buffer = Buffer.concat([buffer, Buffer.alloc(thumbnailSize - buffer.length)])
  }
  if (buffer.length > thumbnailSize) {
    throw new Error('Image is too large')
  }
  buffer = signHmac(buffer, thumbnailKeyInts, thumbnailSalt)
  buffer = encrypt(buffer, thumbnailKeyInts)
  return buffer
}

class RNG {
  constructor (state) {
    if (state instanceof Buffer) {
      this.setStateBuffer(state)
    }
  }

  setSeed (seed) {
    const multiplier = 0x6C078965n
    let temp = seed
    /** @type {bigint[]} */
    this.state = []
    for (let i = 1; i < 5; i++) {
      temp ^= temp >> 30n
      temp = (temp * multiplier + i) & 0xFFFFFFFFn
      this.state.push(temp)
    }
  }

  setStateBuffer (buffer) {
    this.state = [...new Uint32Array(new Uint8Array(buffer).buffer)].map(BigInt)
  }

  getStateBuffer () {
    return Buffer.from(new Uint8Array(new Uint32Array(this.state.map(Number)).buffer))
  }

  setState (s0, s1, s2, s3) {
    this.state = [s0, s1, s2, s3]
  }

  u32 () {
    let temp = this.state[0]
    temp = (temp ^ (temp << 11n)) & 0xFFFFFFFFn
    temp ^= temp >> 8n
    temp ^= this.state[3]
    temp ^= this.state[3] >> 19n
    this.state[0] = this.state[1]
    this.state[1] = this.state[2]
    this.state[2] = this.state[3]
    this.state[3] = temp
    return temp
  }

  uint (max) {
    max = BigInt(max)
    const r32 = this.u32()
    const ret = (r32 * max) >> 32n
    return ret
  }
}

function createKeyValue (rng, table) {
  let value = 0n
  for (let i = 0; i < 4; i++) {
    const index = rng.uint(table.length)
    const shift = rng.uint(4) * 8n
    const byte = (table[index] >> shift) & 0xFFn
    value = (value << 8n) | byte
  }
  return value
}

function createKey (rng, table, size) {
  if (size % 4 !== 0) {
    throw new Error('Key size must be multiple of 4')
  }

  const key = Buffer.alloc(16)
  const bigArray = new BigUint64Array(1)
  const uint8Array = new Uint8Array(bigArray.buffer)
  for (let i = 0; i < size / 4; i++) {
    bigArray[0] = createKeyValue(rng, table)
    key[i * 4] = uint8Array[0]
    key[i * 4 + 1] = uint8Array[1]
    key[i * 4 + 2] = uint8Array[2]
    key[i * 4 + 3] = uint8Array[3]
  }
  return key
}
