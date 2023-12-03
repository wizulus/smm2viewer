<script>
import { ref, computed, onMounted, watchEffect, getCurrentInstance } from 'vue'
export default {
  props: {
    rect: DOMRect,
    color: { type: String, default: 'red' },
    link: { type: Object, default: () => ({}) }
  },
  setup (props) {
    const step = ref(0)
    const self = getCurrentInstance().proxy
    watchEffect(() => {
      // eslint-disable-next-line vue/no-mutating-props
      props.link.highlight = self
    })
    const steps = computed(() => [
      `0px 0px 5px 1px ${props.color}`,
      `0px 0px 5px 5px ${props.color}`
    ])

    const style = computed(() => ({
      ...(props.color
        ? {
            boxShadow: steps.value[step.value % steps.value.length],
            transition: 'box-shadow 1s ease-in-out'
          }
        : {
            outline: 'solid 1px orange'
          }
      ),
      position: 'absolute',
      left: `${props.rect?.x}px`,
      top: `${props.rect?.y}px`,
      width: `${props.rect?.width}px`,
      height: `${props.rect?.height}px`,
      cursor: 'pointer'
    }))

    let timer = null
    const onTransitionEnd = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(onTransitionEnd, 5000)
      step.value++
    }

    onMounted(() => {
      onTransitionEnd()
    })

    const onPointerDown = (ev) => {
      ev.cancelBubble = true
    }

    return {
      style,
      onTransitionEnd,
      onPointerDown
    }
  }
}
</script>
<template>
  <div v-bind="$attrs" @pointerdown="onPointerDown" class="Highlight" :style="style" @transitionend="onTransitionEnd">
    <slot />
  </div>
</template>
