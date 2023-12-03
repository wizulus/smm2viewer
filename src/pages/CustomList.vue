<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useFetch } from '@vueuse/core'
import CourseList from 'src/components/CourseList.vue'
import { isCourseCode, stripCode } from '../../lib/id.mjs'

export default {
  components: { CourseList },
  setup () {
    const route = useRoute()
    const gist = computed(() => route.query.gist)
    const gistUrl = computed(() => new URL(gist.value, 'https://gist.githubusercontent.com'))
    const { isFetching, data } = useFetch(gistUrl)
    const courses = computed(() => data.value?.split('\n').map(x => stripCode(x)).filter(x => isCourseCode(x)))

    return {
      isFetching,
      data,
      courses
    }
  }
}
</script>
<template>
  <q-page>
    <h1>Custom List</h1>
      <q-spinner-gears v-if="isFetching" size="80px" />
      <CourseList v-if="courses" :courses="courses" />
  </q-page>
</template>
