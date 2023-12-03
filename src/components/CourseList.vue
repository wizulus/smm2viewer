<script>
import { ref, watchEffect } from 'vue'
import Course from './Course.vue'
export default {
  components: { Course },
  props: {
    courses: Array
  },
  setup (props) {
    const inView = ref([])
    watchEffect(() => {
      inView.value = Array.apply(null, Array(props.courses?.length || 0)).map(_ => false)
      if (inView.value.length < 3) {
        inView.value = inView.value.map(_ => true)
      }
    })
    return {
      inView,
      onIntersection (entry) {
        const index = parseInt(entry.target.dataset.id, 10)
        setTimeout(() => {
          inView.value.splice(index, 1, inView.value[index] || entry.isIntersecting)
        }, 50)
      }
    }
  }
}
</script>
<template>
  <div
        v-for="index in inView.length"
        :key="index"
        :data-id="index - 1"
        class="q-mb-sm"
        style="height: 158px;"
        v-intersection="onIntersection"
      >
      <transition name="q-transition--scale">
        <Course v-if="inView[index - 1] && courses[index - 1]" :course="courses[index - 1]" />
      </transition>
  </div>
</template>
