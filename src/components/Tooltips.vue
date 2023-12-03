<script>
import Sprite from 'components/Sprite.vue'
import { ref, watchEffect, computed } from 'vue'
import { uniq } from 'src/lib/util.js'
import { importImage } from 'src/lib/images'

export default {
  components: { Sprite },
  props: {
    level: Object,
    world: Object,
    tileSet: String,
    dimensions: Object,
    grid: Object,
    quadTree: Object,
    scale: Number
  },
  setup (props) {
    const tip = ref([])
    const position = ref({ x: 0, y: 0 })
    const tileSetSrc = ref('')
    const coords = ref(null)
    const worldSize = computed(() => {
      return {
        x: props.world.right_boundary, // - props.world.left_boundary,
        y: props.world.top_boundary // - props.world.bottom_boundary
      }
    })

    watchEffect(async () => {
      tileSetSrc.value = props.tileSet && await importImage(props.tileSet)
    })

    const onMouseMove = async ev => {
      const rect = {
        x: ev.offsetX,
        y: ev.offsetY,
        width: 1,
        height: 1
      }
      coords.value = {
        x: Math.floor(rect.x / 16) + 1,
        y: Math.floor((worldSize.value.y - rect.y) / 16) + 1
      }

      const imgs = uniq(props.quadTree.retrieve(rect), x => [x.type, x.tx, x.ty, x.path, x.path].join(','))
      for (const img of imgs) {
        if (img.path && !img.src) {
          img.src = await importImage(img.path)
        }
      }
      // console.log('tip', imgs)
      tip.value = imgs// .filter(x => !x.path || !x.path.includes('/CMN/')) // Hide markers like letters, wings, and arrows.
      position.value = {
        x: ev.offsetX,
        y: ev.offsetY
      }
    }
    const onMouseOut = ev => {
      tip.value = []
      coords.value = null
    }
    const json = img => {
      return Object.fromEntries(Object.entries(img).filter(([, v]) => typeof v !== 'object'))
    }
    const describe = image => {
      return [...new Set([image.type, image.category, image.name])].filter(x => x).join(', ')
    }
    const onMouseDown = () => {
      try {
        console.log('tip', JSON.parse(JSON.stringify(tip.value)))
      } catch (err) {
        // console.log('tip', tip.value)
      }
    }

    return {
      tileSetSrc,
      tip,
      position,
      onMouseMove,
      onMouseOut,
      json,
      describe,
      onMouseDown,
      coords,
      worldSize
    }
  }
}
</script>
<template>
  <div class="Tooltips" @mousemove="onMouseMove" @mouseout="onMouseOut" @mousedown="onMouseDown">
    <slot />
    <div v-for="(image, j) of tip" :key="j"
      :style="{
        position: 'absolute',
        zIndex: 100,
        left: `${image.x}px`,
        top: `${image.y}px`,
        width: `${image.width}px`,
        height: `${image.height}px`,
        boxSizing: 'border-box',
        border: `solid 2px ${image.color || 'white'}`,
        pointerEvents: 'none'
      }"
    />
    <div class="tip q-gutter-xs"
      v-if="coords || tip.length"
      :style="{
        top: `${position.y - 32}px`,
        left: `${position.x + 16}px`
      }"
    >
      <div class="coords">
        <code style="font-size: 8px">{{coords.x}}, {{coords.y}}</code>
      </div>
      <span v-for="(image, j) of tip" :key="j">
        <div class="inline-block vertical-top">

          <img v-if="image.type === 'image'" :src="image.src" :width="image.width" :height="image.height" style="vertical-align: middle;" />
          <Sprite v-if="image.type === 'tile'" :tile-set="tileSetSrc" :tile="image" :dimensions="dimensions" :grid="grid" style="vertical-align: middle;" />
        </div>
      </span>
      <div v-if="tip.length >= 3" style="font-size: 6px; width: 75px; white-space:normal;">
        Hint: Press 'H' to toggle hidden blocks
      </div>
      <div v-if="tip.length === 0" style="font-size: 6px; width: 75px; white-space:normal;">
        {{
          position.y > 1000 || position.x > 1000
          ? (scale === 1 ? 'Hint: Scroll mouse wheel to zoom' : 'Hint: Press Home to reset zoom')
          : `Hint: Press 'G' to toggle grid`
        }}
      </div>

    </div>
  </div>
</template>
<style lang="scss" scoped>
  .tip {
    position: absolute;
    white-space: nowrap;
    background-color: #300;
    border: solid 1px white;
    border-radius: 5px;
    padding: 10px;
    z-index: 2;
    min-width: 48px;
  }
  .coords {
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    text-align: center;
  }
</style>
