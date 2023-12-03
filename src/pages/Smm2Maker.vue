<script>
import { computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFetch } from '@vueuse/core'
import { formatCode, stripCode } from '../../lib/id.mjs'
import { addressCard } from 'src/lib/icons'
import Flag from 'src/components/Flag.vue'
import MakerDetails from './MakerDetails.vue'

export default {
  components: { Flag, MakerDetails },
  setup () {
    const route = useRoute()
    const router = useRouter()
    const makerCode = computed(() => route.params.makerCode)
    const parsed = computed(() => stripCode(makerCode.value))
    const makerUrl = computed(() => parsed.value && `/mm2/user_info/${parsed.value}`)
    watchEffect(() => {
      if (parsed.value && makerCode.value !== formatCode(parsed.value)) {
        router.replace(`/smm2/maker/${stripCode(parsed.value)}/details`)
      }
    })
    const { isFetching, error: apiError, data: maker } = useFetch(makerUrl, {
      refetch: true,
      beforeFetch (ctx) {
        if (!parsed.value) ctx.cancel()
      },
      onFetchError (ctx) {
        console.log('fetchError', ctx, ctx.data)
        if (ctx.data?.error === 'Code corresponds to a level') {
          router.replace(`/smm2/level/${stripCode(parsed.value)}`)
        } else if (ctx.data?.error === 'No user with that ID') {
          router.replace(`/smm2/not-found/${stripCode(parsed.value)}`)
        }
        return ctx
      }
    }).get().json()

    return {
      route,
      router,
      makerCode,
      makerUrl,
      maker,
      parsed,
      addressCard,
      formatCode,
      apiError,
      isFetching
    }
  }
}
</script>
<template>
  <q-page class="q-ma-sm">
    <div class="text-center q-pt-xl" v-if="isFetching">
      <q-spinner-gears v-if="isFetching" size="80px" />
    </div>

    <div v-if="apiError" class="text-center q-pt-xl">
      <q-card class="inline-block bg-negative">
        <q-card-section>
          <div class="text-h6">Error Retrieving User</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <p v-if="apiError === true">This is most likely because the <a href="https://tgrcode.com/mm2/docs/" class="link">TGRCode API</a> is down. Please <a :href="`https://tgrcode.com/mm2/level_info/${levelCode.split('-').join('').toUpperCase()}`" class="link">check there</a> for more information.</p>
          <p v-else style="white-space: pre-wrap">{{apiError}}</p>
        </q-card-section>
        <q-card-section>
          <q-btn to="/" color="primary">Take me home</q-btn>
        </q-card-section>
      </q-card>
    </div>

    <div v-if="maker" style="width: 510px; max-width: 100%; margin: 0 auto">
      <div class="inline-block vertical-top">
        <img :src="maker.mii_image" class="avatar q-mr-sm" />
        <div class="inline-block vertical-top">
          <Flag :iso2="maker.country" class="q-mr-sm vertical-top" style="zoom: 2;" />
          <span class="mario-maker text-h3 vertical-top">
            {{maker.name}}
          </span>
          <br />
          <span class="text-h5">
            <span class="icon-16 q-mr-sm" v-html="addressCard" />
            <span class="mario-maker vertical-top">{{formatCode(maker.code)}}</span>
            <q-tooltip>Maker Code</q-tooltip>
          </span>
        </div>
      </div>
    </div>
    <q-tabs v-if="maker" active-color="primary">
      <q-route-tab :to="`/smm2/maker/${formatCode(parsed)}`" label="Details" />
      <q-route-tab :to="`/smm2/maker/${formatCode(parsed)}/uploaded-courses`" label="Uploaded Courses" />
      <q-route-tab :to="`/smm2/maker/${formatCode(parsed)}/world-records`" label="World Records" />
      <q-route-tab :to="`/smm2/maker/${formatCode(parsed)}/first-clears`" label="First Clears" />
      <q-route-tab :to="`/smm2/maker/${formatCode(parsed)}/uncleared`" label="Uncleared" />
    </q-tabs>
    <MakerDetails v-if="route.path.endsWith(route.params.makerCode)" />
    <router-view v-if="maker" />
  </q-page>
</template>
<style lang="scss" scoped>
  .avatar {
    background-color: white;
    width: 92px;
    height: 92px;
    border-radius: 10px;
  }
</style>
