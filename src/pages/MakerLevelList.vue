<script>
import { computed, watchEffect, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatCode, stripCode } from '../../lib/id.mjs'
import { addressCard } from 'src/lib/icons'
import CourseList from 'src/components/CourseList.vue'

export default {
  components: { CourseList },
  props: {
    api: String,
    filter: {
      type: Function,
      default: () => true
    }
  },
  setup (props) {
    const route = useRoute()
    const router = useRouter()
    const makerCode = computed(() => route.params.makerCode)
    const parsed = computed(() => stripCode(makerCode.value))
    const levelsUrl = computed(() => parsed.value && `/mm2/${props.api}/${parsed.value}`)
    const isFetching = ref(false)
    const error = ref(null)
    const courses = ref([])
    watchEffect(async () => {
      try {
        if (!makerCode.value) return
        courses.value = []
        isFetching.value = true
        const res = await fetch(levelsUrl.value).then(x => x.text())
        isFetching.value = false
        try {
          const lvls = JSON.parse(res)
          courses.value = lvls.courses.filter(x => props.filter(x))
        } catch (err) {
          throw new Error(err)
        }
      } catch (err) {
        console.error('Could not fetch levels:', err)
        error.value = err.message || err.toString()
      }
    })
    // const { isFetching, error, data: levels } = useFetch(levelsUrl, {
    //   refetch: true,
    //   afterFetch (ctx) {
    //     try {
    //       JSON.parse(ctx.data)
    //     } catch (err) {
    //       console.warn('Could not parse response:', err)
    //       throw new Error(ctx.data)
    //     }
    //   }
    // }).get().json()

    return {
      isFetching,
      error,
      route,
      router,
      makerCode,
      parsed,
      addressCard,
      formatCode,
      courses
    }
  }
}
</script>
<template>
  <div style="width: 800px; max-width: 100%; margin: 0 auto">
    <div class="text-center q-pt-xl" v-if="isFetching">
      <q-spinner-gears v-if="isFetching" size="80px" />
    </div>
    <div v-if="error" class="text-center q-pt-xl">
      <q-card class="inline-block bg-negative">
        <q-card-section>
          <div class="text-h6">Error Retrieving Data</div>
          <pre>{{error}}</pre>
        </q-card-section>
      </q-card>
    </div>
    <div class="maker-uploaded-levels mario-maker" v-if="courses">
      <CourseList :courses="courses" />
    </div>
  </div>
</template>
