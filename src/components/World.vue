<script>
import { ref, watch, computed, onUnmounted } from 'vue'
import { images, loadImages, loadImagesFromSrc } from 'src/lib/images'
import lavaGif from 'assets/liquid/smb-lava.gif'
import poisonGif from 'assets/liquid/smb-poison.gif'
import waterGif from 'assets/liquid/smb-water.gif'
import starLg from 'assets/background/star-lg.png'
import starSm from 'assets/background/star-sm.png'
import { CircleQuadtree } from 'src/lib/quad-tree'
import { layout, zOrder } from 'src/lib/legend.js'

export default {
  props: {
    level: Object,
    world: Object,
    showing: Object,
    scale: Number,
    having: Object
  },
  emits: ['has'],
  async setup (props, { emit }) {
    const renderScale = 1
    const level = computed(() => props.level)
    const world = computed(() => props.world)
    const width = computed(() => world.value && (world.value.right_boundary /* - world.value.left_boundary */) * renderScale)
    const height = computed(() => world.value && (world.value.top_boundary /* - world.value.bottom_boundary */) * renderScale)
    const background = ref(null)
    const foreground = ref(null)
    const canvas = ref(null)
    const liquidType = computed(() => {
      switch (world.value?.theme) {
        case 'Castle': return 'lava'
        case 'Forest': return world.value.night_time ? 'poison' : 'water'
        default: return null
      }
    })
    const liquidClass = computed(() => {
      switch (world.value?.liquid_mode) {
        case 'Rising or Falling': return 'rising-or-falling'
        case 'Rising and Falling': return 'rising-and-falling'
        case 'Static': return 'static'
        default: return null
      }
    })
    const liquidGif = computed(() => {
      switch (liquidType.value) {
        case 'lava': return lavaGif
        case 'poison': return poisonGif
        case 'water': return waterGif
        default: return null
      }
    })
    const liquidColor = computed(() => {
      switch (liquidType.value) {
        case 'lava': return '#ab0405'
        case 'poison': return '#6b049c'
        case 'water': return '#0a32b2'
        default: return null
      }
    })
    const stars = computed(() => {
      if (world.value?.night_time) {
        const stars = Math.floor(width.value * height.value * 0.0003375)
        return Array(stars).fill(0).map((_, i) => ({
          x: Math.floor(Math.random() * width.value),
          y: Math.floor(Math.random() * height.value),
          polarity: i % 2
        }))
      } else {
        return []
      }
    })

    let starTimer = null
    onUnmounted(() => {
      if (starTimer) clearInterval(starTimer)
    })

    const getLiquidLevels = {
      'rising-or-falling': () => [
        world.value.liquid_start_height,
        world.value.liquid_end_height
      ],
      'rising-and-falling': () => [
        world.value.liquid_start_height,
        world.value.liquid_end_height
      ],
      static: () => [
        world.value.liquid_start_height
      ]
    }

    // Liquid Level
    const liquidColors = {
      water: '#00f',
      lava: '#f00',
      acid: '#0f0',
      poison: '#f0f'
    }

    const drawLiquidLevels = (ctx) => {
      if (!liquidType.value) return
      const liquidLevels = getLiquidLevels[liquidClass.value]()
      // Draw a wave at each level
      for (const level of liquidLevels) {
        ctx.save()
        ctx.strokeStyle = liquidColors[liquidType.value]
        ctx.beginPath()
        ctx.moveTo(0, height.value - (level * 16) - 8)
        for (let x = 0; x <= width.value; x += 4) {
          ctx.lineTo(x, height.value - (level * 16) + Math.cos(x / (16 / Math.PI)) * 2 - 8)
        }
        ctx.stroke()
        ctx.restore()
      }
    }

    watch([canvas, background, foreground, level, world, liquidType, liquidClass, () => props.showing], async ([canvas, background, foreground, level, world, liquidType, liquidClass, showing]) => {
      if (!canvas || !level || !world) return
      /** @type {CanvasRenderingContext2D} */
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.scale(renderScale, renderScale)
      ctx.imageSmoothingEnabled = false

      const [[starLgImg, starSmImg]] = await Promise.all([
        loadImagesFromSrc([starLg, starSm]),
        loadImages([
          world.tileSet,
          ...world.images.map(x => x.path)
        ])
      ])

      const order = [...zOrder].reverse().map(name => ({
        opacity: 1,
        categories: [name],
        queues: []
      }))

      if (showing.has('Hidden')) {
        order.push(...zOrder.slice(1).filter(x => x !== 'Info').map(name => ({
          opacity: 0.5,
          categories: [name],
          queues: []
        })))
        order.push({
          opacity: 1,
          categories: ['Info'],
          queues: []
        })
      }
      // if (showing.has('Xray')) {
      //   order.reverse()
      // }

      // const order = [
      //   {
      //     opacity: 1,
      //     categories: ['Decor', 'Semisolid', 'Background', 'One-Way'],
      //     queues: []
      //   },
      //   {
      //     opacity: 1,
      //     categories: ['Vine'],
      //     queues: []
      //   },
      //   {
      //     opacity: 1,
      //     categories: ['Coin', 'Block', 'Ground', 'Bridge'],
      //     queues: []
      //   },
      //   {
      //     opacity: 1.0,
      //     categories: ['Character', 'Item', 'Ground', 'Block', 'Track', 'Gizmo', 'Item', 'Fixture', 'Bridge', 'Character'],
      //     queues: []
      //   },
      //   {
      //     opacity: showing.has('Hidden') ? 0.5 : 0,
      //     categories: ['One-Way', 'Vine'],
      //     queues: []
      //   },
      //   {
      //     opacity: 1,
      //     categories: ['Info', 'Foreground'],
      //     queues: []
      //   },
      //   {
      //     opacity: 1,
      //     categories: ['Grid'],
      //     queues: []
      //   }
      // ]

      const drawsByCategory = {}

      let globalAlpha = 1.0
      for (const layer of order) {
        for (const category of layer.categories) {
          if (!drawsByCategory[category]) {
            drawsByCategory[category] = []
          }
          if (showing.has(category)) {
            layer.queues.push(drawsByCategory[category])
          }
        }
      }
      // Object.fromEntries(order.map(category => [category, []]))

      const tileSet = images[world.tileSet]
      world.tileSetDimensions = {
        x: tileSet.naturalWidth,
        y: tileSet.naturalHeight
      }
      ctx.globalAlpha = 1
      const tw = tileSet.naturalWidth / world.tileGrid.x
      const th = tileSet.naturalHeight / world.tileGrid.y
      for (const tile of [...world.tiles].reverse()) {
        const category = layout[tile.ty][tile.tx]
        const draw = () => {
          if (!globalAlpha) return
          ctx.save()
          ctx.globalAlpha = globalAlpha
          ctx.drawImage(
            tileSet,
            tile.tx * tw,
            tile.ty * th,
            tile.tw * tw,
            tile.th * th,
            tile.x,
            tile.y,
            tile.w,
            tile.h
          )
          ctx.restore()
        }
        if (!drawsByCategory[category || 'Ground']) {
          console.log(category, tile)
          throw new Error(`No category ${category}`)
        }
        drawsByCategory[category || 'Ground'].push(draw)
      }

      for (const image of world.images) {
        drawsByCategory[image.group || image.category || 'Ground'].push(() => {
          if (!globalAlpha) return
          ctx.save()
          ctx.translate(image.x + image.width / 2, image.y + image.height / 2)
          // ctx.rotate(image.angle)
          ctx.globalAlpha = 1 // showing.has('Hidden') ? (image.opacity ? image.opacity : 1) * globalAlpha : 1
          if (showing.has('Hidden')) {
            ctx.globalAlpha = globalAlpha
          }
          if (showing.has('Xray')) {
            ctx.globalCompositeOperation = 'hard-light'
          }
          ctx.drawImage(images[image.path], -image.width / 2, -image.height / 2, image.width, image.height)
          ctx.restore()
        })
      }

      // Foreground
      /** @type {CanvasRenderingContext2D} */
      const fgCtx = foreground.getContext('2d')
      fgCtx.clearRect(0, 0, foreground.width, foreground.height)

      // Grid
      drawsByCategory.Grid.push(() => {
        // Draw a grid, 16 x 16 pixels
        fgCtx.save()

        fgCtx.strokeStyle = '#999'
        for (let x = 0; x <= width.value; x += 16) {
          fgCtx.lineWidth = x / 16 % 24 === 0 ? 2 : 1
          fgCtx.beginPath()
          fgCtx.moveTo(x + 0.5, 0)
          fgCtx.lineTo(x + 0.5, height.value + 1)
          fgCtx.stroke()
        }
        for (let y = 0; y <= height.value; y += 16) {
          fgCtx.beginPath()
          fgCtx.lineWidth = (height.value - y) / 16 % 14 === 0 ? 2 : 1
          fgCtx.moveTo(0, y + 0.5)
          fgCtx.lineTo(width.value + 1, y + 0.5)
          fgCtx.stroke()
        }

        fgCtx.strokeStyle = '#666'
        fgCtx.setLineDash([1, 1])
        fgCtx.lineWidth = 1
        fgCtx.beginPath()
        for (let x = 0; x <= width.value; x += 16) {
          fgCtx.moveTo(x + 0.5, 0)
          fgCtx.lineTo(x + 0.5, height.value + 1)
        }
        for (let y = 0; y <= height.value; y += 16) {
          fgCtx.moveTo(0, y + 0.5)
          fgCtx.lineTo(width.value + 1, y + 0.5)
        }
        fgCtx.stroke()

        fgCtx.restore()
      })

      for (const [key, value] of Object.entries(drawsByCategory)) {
        if (value.length) {
          emit('has', key)
        }
      }
      for (const layer of order) {
        globalAlpha = layer.opacity
        for (const queue of layer.queues) {
          for (const draw of queue) {
            draw()
          }
        }
      }

      // Background
      /** @type {CanvasRenderingContext2D} */
      const bgCtx = background.getContext('2d')
      bgCtx.fillStyle = world.backgroundColor
      bgCtx.fillRect(0, 0, width.value, height.value)
      console.log('showing', showing)
      if (showing.has('LiquidLevels')) {
        drawLiquidLevels(ctx)
      }

      // Star background
      if (world.night_time) {
        if (starTimer) clearInterval(starTimer)
        const field = new CircleQuadtree({ x: 0, y: 0, width: (width.value / renderScale), height: (height.value / renderScale) })
        const stars = Math.floor(((width.value * height.value) / renderScale) * 0.0003375)
        for (let i = 0; i < stars; i++) {
          while (true) {
            const star = {
              x: Math.floor(Math.random() * (width.value / renderScale)),
              y: Math.floor(Math.random() * (height.value / renderScale)),
              polarity: i % 2,
              radius: 10
            }
            if (field.retrieve(star).length) continue
            field.insert(star)
            break
          }
        }

        let twinkle = 0
        starTimer = setInterval(() => {
          twinkle++
          for (const star of field) {
            bgCtx.fillRect(star.x - 2, star.y - 2, 5, 5)
            bgCtx.drawImage((twinkle + star.polarity) % 2 ? starLgImg : starSmImg, star.x - 2, star.y - 2)
          }
        }, 170)
      }
    }, { deep: false, immediate: true })

    const gridOpacity = computed(() => {
      if (!props.showing.has('Grid')) return 0

      if (props.scale >= 1) {
        // Between 1 and 2 fade it to 0.5, then 0.5 after 2
        return Math.max(2 - props.scale, 0.5)
      } else {
        return Math.pow(props.scale, 3)
      }
    })

    const save = (name) => {
      // Combine the background, foreground, and canvas into one image,
      // then download it as a PNG.
      const saveCanvas = document.createElement('canvas')
      saveCanvas.width = width.value
      saveCanvas.height = height.value
      const saveCtx = saveCanvas.getContext('2d')
      saveCtx.drawImage(background.value, 0, 0)
      saveCtx.drawImage(canvas.value, 0, 0)
      saveCtx.globalAlpha = 0.25
      saveCtx.drawImage(foreground.value, 0, 0)
      if (props.showing.has('LiquidLevels')) {
        drawLiquidLevels(saveCtx)
      }
      const link = document.createElement('a')
      link.download = name
      link.href = saveCanvas.toDataURL('image/png')
      link.click()
    }

    return {
      renderScale,
      background,
      foreground,
      canvas,
      width,
      height,
      liquidGif,
      liquidType,
      liquidColor,
      liquidClass,
      stars,
      gridOpacity,
      save
    }
  }
}
</script>

<template>
  <div :style="{width: `${width/renderScale + 1}px`, height: `${height/renderScale + 1}px`, position: 'relative'}">
    <canvas :width="width/renderScale" :height="height/renderScale" ref="background" class="background" />
    <canvas :width="width/renderScale + 1" :height="height/renderScale + 1" ref="foreground" class="foreground" :style="{opacity:gridOpacity}" />
    <canvas :width="width" :height="height" ref="canvas" :style="`zoom: ${1 / renderScale}`" :data-scale="renderScale" />
    <div
      v-if="liquidType && showing.has('LiquidAnimation')"
      :class="{
        liquid: true,
        [liquidType]: true,
        [liquidClass]: true
      }"
      :style="{
        backgroundImage:`url('${liquidGif}')`,
        '--start': `${(1 + world.liquid_start_height) * 16}px`,
        '--end': `${(1 + world.liquid_end_height) * 16}px`,
        '--speed': `${world.liquid_speed}s`,
        '--color': liquidColor
      }"
      :data-start="world.liquid_start_height"
      :data-end="world.liquid_end_height"
      :data-speed="world.liquid_speed"
    />
    <!-- <img v-for="(star, i) in stars" :key="i" :src="star.src" :style="{
      position: 'absolute',
      left: `${star.x}px`,
      top: `${star.y}px`
    }" /> -->
  </div>
</template>

<style lang="scss" scoped>
  .background {
    z-index: -1;
    position: absolute;
  }
  .foreground {
    z-index: 1;
    position: absolute;
    transform: translateX(-0.5px) translateY(-0.5px);
    pointer-events: none;
  }
  .liquid {
    pointer-events: none;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: var(--start);
    opacity: .5;
    &:before {
      content: '';
      display: inline-block;
      position: absolute;
      top: 16px;
      width: 100%;
      height: calc(100% - 16px);
      background-color: var(--color);
    }
  }
  .rising-and-falling {
    animation: 5s ease-in-out rising-and-falling infinite alternate;
  }
  .rising-or-falling {
    animation: 5s ease-in-out rising-or-falling infinite;
  }

  @keyframes rising-and-falling {
    from {
      height: var(--start);
    }
    to {
      height: var(--end);
    }
  }
  @keyframes rising-or-falling {
    0% {
      opacity: 0;
      height: var(--start);
    }
    10% {
      opacity: 0.5;
      height: var(--start);
    }
    90% {
      opacity: 0.5;
      height: var(--end);
    }
    100% {
      opacity: 0;
      height: var(--end);
    }
  }
</style>
