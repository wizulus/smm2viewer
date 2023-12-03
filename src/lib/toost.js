import { markRaw } from 'vue'
import { waitFor } from './util'
import { stripCode } from '../../lib/id.mjs'
import { RectQuadtree } from 'src/lib/quad-tree.js'
import { Vector2 } from 'three'
import { layout, legend } from 'src/lib/legend.js'

const decorate = obj => ({
  ...obj,
  index: obj.flag >> 20 & 0x0F,
  rotation: [270, 90, 180, 0][((obj.flag >> 4 & 0x0F) / 2) % 4]
})

/**
     * @param {DOMRect} rect
     * @param {Vector2} around
     * @param {(0|90|180|270)} degrees
     */
const rotateRect = (rect, around, degrees) => {
  const radians = (degrees / 360) * (Math.PI * 2)
  const a = new Vector2(rect.left, rect.top).rotateAround(around, radians)
  const b = new Vector2(rect.right, rect.top).rotateAround(around, radians)
  const c = new Vector2(rect.right, rect.bottom).rotateAround(around, radians)
  const d = new Vector2(rect.left, rect.bottom).rotateAround(around, radians)
  switch (degrees) {
    case 0: return rect
    case 90:
      return new DOMRect(
        d.x,
        d.y,
        a.x - d.x,
        c.y - d.y
      )
    case 180:
      return new DOMRect(
        c.x,
        c.y,
        d.x - c.x,
        b.y - c.y
      )
    case 270:
      return new DOMRect(
        b.x,
        b.y,
        c.x - b.x,
        a.y - b.y
      )
    default: {
      throw new Error(`Unexpected angle: ${degrees}`)
    }
  }
}

const linkDoors = (doors, world) => {
  for (const door of doors) {
    door.otherIndex = door.index % 2 ? door.index - 1 : door.index + 1
    door.other = doors.find(x => x.index === door.otherIndex && x.name === door.name)
    if (door.name === 'Door') {
      door.rect = new DOMRect(
        door.x / 10 - 8,
        world.top_boundary - door.y / 10 - 24,
        door.w * 16,
        door.h * 16
      )
    } else if (door.name === 'Warp Box') {
      door.rect = new DOMRect(
        door.x / 10 - 8,
        world.top_boundary - door.y / 10 - 8,
        door.w * 16,
        door.h * 16
      )
    }
    door.color = 'red'
  }
}
const linkPipes = (pipes, others, world) => {
  for (const pipe of pipes) {
    pipe.other = others.find(x => x.index === pipe.index)
    pipe.rect = rotateRect(
      new DOMRect(
        pipe.x / 10 - 24,
        world.top_boundary - pipe.y / 10 - 8,
        pipe.w * 16,
        pipe.h * 16
      ),
      new Vector2(pipe.x / 10, world.top_boundary - pipe.y / 10),
      pipe.rotation
    )
    pipe.color = 'red'
  }
}

let initialized = false
let lastError = null
async function waitForToost () {
  console.log('Waiting for script to load')
  await waitFor(() => window.runtimeInitialized)
  if (!initialized) {
    console.log('Initializing script')
    window.Module.onAbort = what => {
      if (lastError !== what) {
        console.error('Abort: ', what)
        lastError = what
      }
    }
    initialized = true
  }
}

function loadLevel (input) {
  return window.Module.ccall('loadLevel', 'bool', ['string'], [input], { async: true })
}
function processLevel (input) {
  return window.Module.ccall('processLevel', 'bool', ['string'], [input], { async: true })
}

const backgroundColor = (gameStyle, night) => {
  // return '#161449'
  switch (gameStyle) {
    case 'Overworld': return night ? '#000000' : '#7686ff'
    case 'Underground': return night ? '#000000' : '#111111'
    case 'Castle': return night ? '#000000' : '#111111'
    case 'Airship': return night ? '#000000' : '#7686ff'
    case 'Underwater': return night ? '#161449' : '#2039ed'
    case 'Ghost': return night ? '#000000' : '#111111'
    case 'Snow': return night ? '#000000' : '#7686ff'
    case 'Desert': return night ? '#000000' : '#e6d0a9'
    case 'Sky': return night ? '#000000' : '#7686ff'
    case 'Forest': return night ? '#000000' : '#012700'
    default: return '#000000'
  }
}

const readLevelHeader = (arrayBuffer) => {
  const dv = new DataView(arrayBuffer)
  return {
    startY: dv.getUint8(0), // uint8_t StartY        = 0; //-
    goalY: dv.getUint8(1), // uint8_t GoalY         = 0; //-
    goalX: dv.getInt16(2, true), // int16_t GoalX         = 0; //-
    timer: dv.getInt16(4, true), // int16_t Timer         = 0; //-
    clearCA: dv.getInt16(6, true), // int16_t ClearCA       = 0; //-
    dateYear: dv.getUint16(8, true), // int16_t DateYY        = 0; //?
    dateMonth: dv.getUint8(10), // int8_t DateMM         = 0; //?
    dateDay: dv.getUint8(11), // int8_t DateDD         = 0; //?
    dateHour: dv.getUint8(12), // int8_t DateH          = 0; //?
    dateMinute: dv.getUint8(13), // int8_t DateM          = 0; //?
    uploadDate: new Date(dv.getUint16(8, true), dv.getUint8(10) - 1, dv.getUint8(11), dv.getUint8(12), dv.getUint8(13)),
    autoscrollSpeed: dv.getUint8(14), // uint8_t AutoscrollSpd = 0; //-
    clearCC: dv.getUint8(15), // uint8_t ClearCC       = 0; //-
    clearCRC: dv.getInt32(16, true), // int32_t ClearCRC      = 0; //-
    gameVer: dv.getInt32(20, true), // int32_t GameVer       = 0; //-
    mFlag: dv.getInt32(24, true), // int32_t MFlag         = 0; //?
    clearAttempts: dv.getInt32(28, true), // int32_t ClearAttempts = 0; //-
    clearTime: dv.getInt32(32, true), // int32_t ClearTime     = 0; //-
    creationId: dv.getUint32(36, true), // uint32_t CreationID   = 0; //?
    uploadId: dv.getBigUint64(40, true), // int64_t UploadID      = 0; //?
    clearVer: dv.getInt32(48, true), // int32_t ClearVer      = 0; //-
    gameStyle: dv.getInt16(52, true) // int16_t GameStyle     = 0; //-
  }
}

const readMapHeader = (arrayBuffer) => {
  const dv = new DataView(arrayBuffer)
  return {
    theme: dv.getUint8(0), // uint8_t Theme          = 0; //-
    autoscrollType: dv.getUint8(1), // uint8_t AutoscrollType = 0; //-
    borFlag: dv.getUint8(2), // uint8_t BorFlag        = 0; //-
    orientation: dv.getUint8(3), // uint8_t Ori            = 0; //-
    liquidEndHeight: dv.getUint8(4), // uint8_t LiqEHeight     = 0; //-
    liquidMode: dv.getUint8(5), // uint8_t LiqMode        = 0; //-
    liquidSpeed: dv.getUint8(6), // uint8_t LiqSpd         = 0; //-
    liquidStartHeight: dv.getUint8(7), // uint8_t LiqSHeight     = 0; //-
    right: dv.getUint32(8, true), // int32_t BorR           = 0; //-
    top: dv.getUint32(12, true), // int32_t BorT           = 0; //-
    left: dv.getUint32(16, true), // int32_t BorL           = 0; //-
    bottom: dv.getUint32(20, true), // int32_t BorB           = 0; //-
    flag: dv.getUint32(24, true), // int32_t Flag           = 0; //-
    objectCount: dv.getUint32(28, true), // int32_t ObjCount       = 0; //-
    soundCount: dv.getUint32(32, true), // int32_t SndCount       = 0; //-
    snakeCount: dv.getUint32(36, true), // int32_t SnakeCount     = 0; //-
    clearPipeCount: dv.getUint32(40, true), // int32_t ClearPipCount  = 0; //-
    creeperCount: dv.getUint32(44, true), // int32_t CreeperCount   = 0; //-
    iBlockCount: dv.getUint32(48, true), // int32_t iBlkCount      = 0; //-
    trackBlockCount: dv.getUint32(52, true), // int32_t TrackBlkCount  = 0; //-
    junk: new Uint8Array(arrayBuffer.slice(56, 60)),
    // fseek(levelPtr, Offset + 0x3C, SEEK_SET);
    groundCount: dv.getUint32(60, true), // fread(&MapHdr.GroundCount, sizeof(MapHdr.GroundCount), 1, levelPtr);
    trackCount: dv.getUint32(64, true), // fread(&MapHdr.TrackCount, sizeof(MapHdr.TrackCount), 1, levelPtr);
    iceCount: dv.getUint32(68, true) // fread(&MapHdr.IceCount, sizeof(MapHdr.IceCount), 1, levelPtr);
  }
}

const ENCRYPTED_SIZE = 376832
// const DECRYPTED_SIZE = 376768

export async function openLevel (levelCode) {
  await waitForToost()
  levelCode = stripCode(levelCode)
  const arrayBuffer = await fetch(`/mm2/level_data/${levelCode}`).then(x => {
    if (!x.ok) {
      return x.text().then(text => {
        throw new Error(`Could not fetch level ${levelCode}: ${x.status} ${x.statusText}: ${text}`)
      })
    }
    return x.arrayBuffer()
  })

  if (arrayBuffer.byteLength === ENCRYPTED_SIZE) {
    console.log(`Writing ${levelCode} (${arrayBuffer.byteLength} bytes) to FS`)
    window.FS.writeFile(levelCode, new Uint8ClampedArray(arrayBuffer))

    if (!(await loadLevel(levelCode))) {
      throw new Error('Could not load level')
    }
  } else { // } if (arrayBuffer.byteLength === DECRYPTED_SIZE) {
    console.log(`Writing ${levelCode}.lvl (${arrayBuffer.byteLength} bytes) to FS`)
    window.FS.writeFile(`${levelCode}.lvl`, new Uint8ClampedArray(arrayBuffer))

    if (!(await processLevel(levelCode))) {
      throw new Error('Could not process level')
    }
  }

  const data = window.FS.readFile(`${levelCode}.lvl`).buffer
  console.log(`Read ${data.byteLength} bytes from ${levelCode}.lvl`)
  window.data = data
  const dv = new DataView(data)
  window.dv = dv
  const levelHeader = readLevelHeader(data)
  window.levelHeader = levelHeader
  const overworldMapHeader = readMapHeader(data.slice(0x200))
  const subworldMapHeader = readMapHeader(data.slice(0x2e0e0))
  window.overworldMapHeader = overworldMapHeader
  window.subworldMapHeader = subworldMapHeader
  const overworld = JSON.parse(window.FS.readFile(`${levelCode}-overworld.json`, { encoding: 'utf8' }))
  const subworld = JSON.parse(window.FS.readFile(`${levelCode}-subworld.json`, { encoding: 'utf8' }))

  overworld.night_time = overworldMapHeader.flag === 2
  subworld.night_time = subworldMapHeader.flag === 2
  const global = {
    name: overworld.name,
    description: overworld.description,
    clear_time: overworld.clear_time,
    clear_time_pretty: overworld.clear_time_pretty,
    game_version: overworld.game_version,
    game_version_raw: overworld.game_version_raw,
    gamestyle: overworld.gamestyle,
    gamestyle_raw: overworld.gamestyle_raw,
    gamever: overworld.gamever,
    timer: overworld.timer,
    clear_attempts: overworld.clear_attempts,
    clear_condition: overworld.clear_condition,
    clear_condition_category: overworld.clear_condition_category,
    clear_condition_category_raw: overworld.clear_condition_category_raw,
    clear_condition_magnitude: overworld.clear_condition_magnitude,
    clear_condition_type: overworld.clear_condition_type,
    clear_condition_type_raw: overworld.clear_condition_type_raw
  }
  Object.keys(global).forEach(x => {
    delete overworld[x]
    delete subworld[x]
  })
  const level = {
    header: levelHeader,
    ...global,
    overworld,
    subworld
  }

  overworld.doors = level.overworld.objects.filter(x => x.name === 'Door' || x.name === 'Warp Box').map(decorate)
  subworld.doors = level.subworld.objects.filter(x => x.name === 'Door' || x.name === 'Warp Box').map(decorate)
  overworld.pipes = level.overworld.objects.filter(x => x.name === 'Pipe').map(decorate).filter(x => x.index)
  subworld.pipes = level.subworld.objects.filter(x => x.name === 'Pipe').map(decorate).filter(x => x.index)
  linkDoors(overworld.doors, level.overworld)
  linkDoors(subworld.doors, level.subworld)
  linkPipes(overworld.pipes, subworld.pipes, level.overworld)
  linkPipes(subworld.pipes, overworld.pipes, level.subworld)

  for (const world of [overworld, subworld]) {
    // Nintendo: 160 pixels per nintendo block, y=0 is the bottom, always referencing the center. x and y are given in subpixel, w and h are given in blocks
    // Me: 16 pixels per block, y=0 is the top, always referencing the top left.
    const nintendoRect = ({ x, y, w, h }) => {
      // const nintendoWidth = w * 160
      // const nintendoHeight = h * 160
      const pixelWidth = w * 16
      const pixelHeight = h * 16
      const pixelX = x / 10 - 8
      const pixelY = world.top_boundary - (y / 10 - 8) - pixelHeight
      return new DOMRect(pixelX, pixelY, pixelWidth, pixelHeight)
    }
    for (const object of world.objects) {
      object.rect = nintendoRect(object)
    }
    world.semisolids = world.objects.filter(x => x.id === 16 || x.id === 14).reverse()
      .sort((a, b) =>
        a.rect.y < b.rect.y
          ? -1
          : a.rect.y > b.rect.y
            ? 1
            : a.rect.x < b.rect.x
              ? -1
              : a.rect.x > b.rect.x
                ? 1
                : 0
      )
    let j = 0
    const semiDraws = []
    for (const semi of world.semisolids) {
      semi.style = semi.flag >> 18 & 0x3
      semi.semi_type = semi.flag >> 18 & 3
      if (semi.id === 16) {
        // Semisolid Platform
        for (let y = 0; y < semi.h; y++) {
          for (let x = 0; x < semi.w; x++) {
            const isTop = y === 0
            const isBottom = y === semi.h - 1
            const spriteY = isTop ? 3 : isBottom ? 6 : 4 + ((y + x) % 2)
            const isLeft = x === 0
            const isRight = x === semi.w - 1
            const spriteX = semi.style * 3 + (isLeft ? 7 : isRight ? 9 : 8)
            semiDraws.push({
              order: j++,
              x: semi.rect.x + x * 16,
              y: semi.rect.y + y * 16,
              w: 16,
              h: 16,
              tw: 1,
              th: 1,
              tx: spriteX,
              ty: spriteY,
              category: 'Semisolid'
            })
          }
        }
      } else if (semi.id === 14) {
      // Mushroom Platform
        const isOdd = semi.w % 2
        for (let y = 0; y < semi.h; y++) {
          for (let x = 0; x < semi.w; x++) {
            const isTop = y === 0
            const isBottom = y > 1
            const spriteY = isTop ? 2 + semi.style : ((isOdd ? 3 : 1) + isBottom)
            const isLeft = x === 0
            const isRight = x === semi.w - 1
            //         0123456789  4 => 4.5 => 2.25 => 2 => 4; 5 => 5.5 => 2.75 => 2 => 4
            // (xxXxx) (xxxXXxxx)  Math.floor((x + .5 / 2) * 2 === Math.floor(semi.w / 2) - 1
            //    X        XX
            const isStem = isOdd ? (x === Math.floor(semi.w / 2)) : x === semi.w / 2 - 1 || x === semi.w / 2
            const spriteX = isTop ? 3 + (isLeft ? 0 : isRight ? 2 : 1) : 6 + (isOdd ? 0 : !(x % 2))
            if (isTop || isStem) {
              semiDraws.push({
                order: j++,
                x: semi.rect.x + x * 16,
                y: semi.rect.y + y * 16,
                w: 16,
                h: 16,
                tw: 1,
                th: 1,
                tx: spriteX,
                ty: spriteY,
                category: 'Semisolid'
              })
            }
          }
        }
      }
    }

    // Tweaks to make things align
    world.tiles.forEach(tile => {
      tile.category = layout[tile.ty][tile.tx]
      if (tile.category === 'Vine') {
        tile.y = Math.ceil(tile.y / 16) * 16
      } else if (tile.category === 'Bridge') {
        tile.y -= 8
      } else if (tile.category === 'Semisolid') {
        tile.y = Math.ceil(tile.y / 16) * 16
        tile.x = Math.floor(tile.x / 16) * 16
      }
    })

    const tilesSeen = new Set()
    world.tiles = [
      ...[...semiDraws].reverse(),
      ...[...world.tiles].reverse()
        .filter(tile => {
          const key = `${tile.x},${tile.y}`
          // Avoid repeat ground tiles
          if (tile.category === 'Ground' && tilesSeen.has(key) && tile.tx === 7 && tile.ty === 15) {
            return false
          } else if (tile.category === 'Ground') {
            tilesSeen.add(key)
          }
          const category = layout[tile.ty][tile.tx]
          return category !== 'Semisolid'
        })
    ]

    world.tileSet = `/assets/img/Tile/${level.gamestyle_raw}-${world.theme_raw}${world.night_time ? 'A' : ''}.png`
    world.tileSetDimensions = {
      x: 1024,
      y: 3072
    }
    world.tileGrid = {
      x: 16,
      y: 48
    }
    world.backgroundColor = backgroundColor(world.theme, world.night_time)
    world.quadTree = markRaw(new RectQuadtree({
      x: 0,
      y: 0,
      width: world.right_boundary,
      height: world.top_boundary
    }, 4))
    // const tileKeys = new Set()

    // 🪓
    const axe = world.images.find(x => x.path.endsWith('27A.png'))
    if (axe) {
      // Draw the draw bridge 14 tiles wide to the left of the axe by adding tiles to world.tiles
      // axe = {
      //   "path": "/assets/img/21847/OBJ/27A.png",
      //   "angle": 0,
      //   "opacity": 0,
      //   "x": 224,
      //   "y": 336,
      //   "width": 32,
      //   "height": 64,
      //   "id": "27A",
      //   "category": "Fixture",
      //   "name": "Axe"
      // }
      // const drawBridge = {
      //   category: 'Ground',
      //   w: 16,
      //   h: 16,
      //   tw: 1,
      //   th: 1,
      //   tx: 15,
      //   ty: 15,
      //   x: 0,
      //   y: 0
      // }

      for (let xo = 0; xo < 14; xo++) {
        world.tiles.push({
          category: 'Ground',
          w: 16,
          h: 16,
          tw: 1,
          th: 1,
          tx: 15,
          ty: 15,
          x: axe.x - 16 * (xo + 1),
          y: axe.y + 64
        })
      }
      // Add the chain ⛓
      world.images.push({
        path: '/img/bridge-chain.png',
        angle: 0,
        category: 'Decor',
        height: 16,
        width: 32,
        x: axe.x - 32,
        y: axe.y + 48
      })
    }

    for (const tile of world.tiles) {
      // const key = [tile.category, tile.x, tile.y].join(',')
      // if (!tileKeys.has(key)) {
      // tileKeys.add(key)
      world.quadTree.insert({
        type: 'tile',
        category: tile.category,
        order: tile.order,
        x: tile.x,
        y: tile.y,
        width: tile.w,
        height: tile.h,
        tx: tile.tx,
        ty: tile.ty,
        tw: tile.tw,
        th: tile.th
      })
      // }
    }

    const containers = new Set()

    for (const image of world.images) {
      image.path = '/assets' + image.path
        .split('/cid/').join('/CID/')
        .split('/dly/').join('/DLY/')
        .split('/obj/').join('/OBJ/')
        .split('/cmn/').join('/CMN/')
        .split('/cmr/').join('/CMR/')
      image.id = image.path.split('/').pop().split('.').shift()
      if (image.id === 'F1') {
        containers.add(`${image.x},${image.y}`)
      }

      // Tweaks to make things align
      if (/^71[A-Z]?$/.test(image.id)) {
        // 3D World Semisolid Platform
        image.y += 8
        image.x -= 8
      } else if (/^78[A-Z]?$/.test(image.id)) {
        // Make Pokey align
        image.y += 8
        console.log(image.path, image.id, world.theme)
        // Make snow pokey snowier
        if (world.theme === 'Snow') {
          if (image.id === '78') {
            image.id = '78B'
            image.path = image.path.replace('/78.', '/78B.')
          } else if (image.id === '78A') {
            image.id = '78C'
            image.path = image.path.replace('/78A.', '/78C.')
          }
        }
      }

      const obj = legend[image.id]
      if (obj) {
        image.category = obj.category
        image.group = obj.group || obj.category
        image.name = obj.name
      }
      world.quadTree.insert({
        type: 'image',
        ...image
      })
    }

    // Tweaks to make items appear on top when they are in containers
    const itemCategories = new Set([
      'Item',
      'Coin',
      'Powerup',
      'Character',
      'Vine'
    ])
    world.images.forEach(image => {
      if (itemCategories.has(image.group || image.category) && containers.has(`${image.x},${image.y}`)) {
        image.group = 'Contained Item'
      }
    })

    for (const obj of [...world.doors, ...world.pipes]) {
      world.quadTree.insert({
        type: 'portal',
        ...obj,
        x: obj.rect.left,
        y: obj.rect.top,
        width: obj.rect.width,
        height: obj.rect.height,
        color: '#00FF00'
      })
    }
  }

  window.FS.unlink(levelCode)
  window.FS.unlink(`${levelCode}.lvl`)
  window.FS.unlink(`${levelCode}-overworld.json`)
  window.FS.unlink(`${levelCode}-subworld.json`)

  return level
}
