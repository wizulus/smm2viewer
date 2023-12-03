<script>
import NSMBU from 'assets/game-style/NSMBU.png'
import SMB1 from 'assets/game-style/SMB1.png'
import SMB3 from 'assets/game-style/SMB3.png'
import SMW from 'assets/game-style/SMW.png'
import SM3DW from 'assets/game-style/SM3DW.png'
import staticAnimation from 'assets/static.webp'
import { heart, shoePrints, tag } from 'src/lib/icons'
import Flag from './Flag.vue'
import { ref, effect, computed } from 'vue'
import { loadImage, formatDate } from 'src/lib/util'
import { stripCode } from '../../lib/id.mjs'

export default {
  components: { Flag },
  props: {
    course: [Object, String]
  },
  setup (props) {
    const info = ref(null)
    const error = ref(null)
    const courseId = computed(() => typeof props.course === 'string' ? stripCode(props.course) : info.value?.course_id)
    const src = ref(staticAnimation)
    let abortImage = null
    let intersecting = false
    const imgLoading = ref(false)

    // onMounted(async () => {
    //   srcRef.value = `/mm2/level_thumbnail/${stripCode(courseId.value)}`
    //   src.value = await loadImage(srcRef)
    // })
    // onUnmounted(() => {
    //   srcRef.value = null
    // })

    const doLoadImage = () => {
      imgLoading.value = false
      if (abortImage) {
        console.log(`${courseId.value} already loading, aborting...`)
        abortImage()
      }
      if (!intersecting) {
        console.log(`${courseId.value} not intersecting, aborting...`)
        return
      }
      if (src.value !== staticAnimation) {
        console.log(`${courseId.value} already loaded, aborting...`)
        return
      }
      console.log(`Loading ${courseId.value} thumbnail...`)
      abortImage = loadImage(`/mm2/level_thumbnail/${stripCode(courseId.value)}`, (err, s, loading) => {
        imgLoading.value = loading
        if (err) {
          console.error(`Could not load ${courseId.value} thumbnail:`, err)
          error.value = err.message
        }
        if (s) {
          console.log(`Loaded ${courseId.value} thumbnail: ${s}`)
          src.value = s
          abortImage = null
        }
      })
    }

    effect(async () => {
      try {
        if (props.course && typeof props.course === 'object') {
          info.value = props.course
        } else if (typeof props.course === 'string') {
          info.value = null
          info.value = await fetch(`/known/level_info/${stripCode(props.course)}`).then(x => x.json())
        }
        src.value = staticAnimation
        doLoadImage()
      } catch (err) {
        err.value = err.message
      }
    })

    function onIntersection (entry) {
      intersecting = entry.isIntersecting
      doLoadImage()
    }
    const styleSrc = { NSMBU, SMB1, SMB3, SMW, SM3DW }
    return {
      info,
      styleSrc,
      heart,
      shoePrints,
      tag,
      staticAnimation,
      error,
      courseId,
      src,
      onIntersection,
      imgLoading,
      formatDate
    }
  }
}
</script>

<template>
  <router-link :to="`/smm2/course/${courseId}`" class="Course">
    <div class="flex no-wrap" v-if="info">
      <img class="style-img q-mr-sm" :src="styleSrc[info.game_style_name]" />
      <div class="course-name ellipsis">{{info.name}}</div>
    </div>
    <div>
      <div class="flex no-wrap" v-if="info">
        <div class="thumbnail-container">
          <q-img class="thumbnail-img" :src="src" v-intersection="onIntersection">
            <q-spinner size="50px" style="margin-top: 25px; margin-left:65px;" color="white" v-if="imgLoading" />
            <div class="absolute-bottom text-subtitle1 flex justify-between" style="padding: 0 5px">
              <span>{{ formatDate(info.uploaded).split(' ')[0] }}</span>
              <span>{{ formatDate(info.uploaded).split(' ')[1] }}</span>
            </div>
          </q-img>
        </div>
        <div class="flex-grow">
          <div class="flex">
            <div class="summary q-pa-sm flex-grow">
              <div class="text-h4 mario-maker">
                <span class="icon-32 q-mr-xs" v-html="heart" />
                {{info.likes}}
                <span class="icon-32 q-ml-md q-mr-xs" v-html="shoePrints" />
                {{info.attempts}}
              </div>
              <div class="text-h6">
                <span v-for="tagName in info.tags_name" :key="tagName" class="q-pr-sm">
                  <span class="icon-16 q-mr-xs" v-html="tag" />
                  {{tagName}}
                </span>
              </div>
            </div>
            <div class="flex-grow text-right gt-sm">
              <router-link v-if="info.uploader" tag="a" class="link" :to="`/smm2/maker/${info.uploader.code}/details`">
                <img :src="info.uploader.mii_image" class="q-mr-sm avatar shadow-4" />
              </router-link>
            </div>
          </div>
          <div class="text-right gt-sm">
            <Flag :iso2="info.uploader.country" class="q-mr-sm vertical-top" />
            <span class="mario-maker text-h5 vertical-top">
              {{info.uploader.name}}
            </span>
            <br />
            <slot />
          </div>
        </div>
      </div>

    </div>

  </router-link>
</template>

<style lang="scss" scoped>
.Course {
  display: block;
  text-decoration: none;
  background-color: #fffff4;
  color: #591d1e;
  border-radius: 8px;
  padding: 2px 8px;
  .flex-grow {
    flex-grow: 1;
  }
  .avatar {
    width: 80px;
    height: 80px;
    background-color: white;
    border-radius: 5px;
  }
  .style-img {
    width: 59.14px;
    height: 32px;
  }
  .course-name {
    font-size: 24px;
    line-height: 32px;
  }

  .thumbnail-img {
    width: 180px;
    height: 101.25px;
  }

  .thumbnail-container{
    position: relative;

    .uploaded {
      position: absolute;
      bottom:   0;
      left: 0;
      color: white;
      background-color: #0008;
    }
  }

  .q-pa-none {
    padding: 0!important;
  }
}
</style>
