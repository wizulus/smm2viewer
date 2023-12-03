<script>
import { computed } from 'vue'
export default {
  props: {
    tileSet: String,
    dimensions: Object,
    grid: Object,
    tile: Object
  },
  setup (props) {
    const style = computed(() => {
      const style = ({
        display: 'inline-block',
        backgroundImage: `url('${props.tileSet}')`,
        backgroundPosition: `${-props.tile.tx * (props.dimensions.x / props.grid.x)}px ${-props.tile.ty * (props.dimensions.y / props.grid.y)}px`,
        width: `${(props.dimensions.x / props.grid.x) * props.tile.tw}px`,
        height: `${(props.dimensions.y / props.grid.y) * props.tile.th}px`
      // transform: props.tile.width === props.tile.tw && props.tile.height === props.tile.th
      //   ? ''
      //   : `scale(${props.tile.width / props.tile.tw} ${props.tile.height / props.tile.th})`
      })
      return style
    })
    return {
      style
    }
  }
}
</script>
<template>
  <span :style="style" />
</template>
