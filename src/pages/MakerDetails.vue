<script>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFetch } from '@vueuse/core'
import { stripCode, formatCode, isMakerCode } from '../../lib/id.mjs'

export default {
  setup () {
    const route = useRoute()
    const router = useRouter()
    const makerCode = computed(() => route.params.makerCode)
    const parsed = computed(() => isMakerCode(makerCode.value) ? stripCode(makerCode.value) : null)
    const makerUrl = computed(() => parsed.value && `/mm2/user_info/${parsed.value}`)
    const { isFetching, data: maker } = useFetch(makerUrl, { refetch: true }).get().json()

    const categories = computed(() => {
      if (maker.value) {
        return [
          {
            name: 'Maker Information',
            stats: [
              { name: 'Maker Points', value: maker.value.maker_points },
              { name: 'Weekly Maker Points', value: maker.value.weekly_maker_points },
              { name: 'Uploaded Levels', value: `${maker.value.uploaded_levels} / ${maker.value.maximum_uploaded_levels}` },
              { name: 'Comments Enabled', value: maker.value.comments_enabled ? 'Yes' : 'No' },
              { name: 'Tags Enabled', value: maker.value.tags_enabled ? 'Yes' : 'No' }
            ]
          },
          {
            name: 'Play History',
            stats: [
              { name: 'Courses Played', value: maker.value.courses_played },
              { name: 'Clears', value: maker.value.courses_cleared },
              { name: 'Attempts', value: maker.value.courses_attempted },
              { name: 'Deaths', value: maker.value.courses_deaths },
              { name: 'Super World Clears', value: maker.value.unique_super_world_clears },
              { name: 'First Clears', value: maker.value.first_clears },
              { name: 'World Records', value: maker.value.world_records },
              { name: 'Easy High Score', value: maker.value.easy_highscore },
              { name: 'Normal High Score', value: maker.value.normal_highscore },
              { name: 'Expert High Score', value: maker.value.expert_highscore },
              { name: 'Super Expert High Score', value: maker.value.super_expert_highscore }
            ]
          },
          {
            name: 'Multiplayer History',
            stats: [
              { name: 'Versus Rank', value: maker.value.versus_rank_name },
              { name: 'Versus Plays', value: maker.value.versus_plays },
              { name: 'Versus Wins', value: maker.value.versus_won },
              { name: 'Versus Losses', value: maker.value.versus_lost },
              { name: 'Versus Win Streak', value: maker.value.versus_win_streak },
              { name: 'Versus Lose Streak', value: maker.value.versus_lose_streak },
              { name: 'Versus Kills', value: maker.value.versus_kills },
              { name: 'Versus Killed by Others', value: maker.value.versus_killed_by_others },
              { name: 'Versus Disconnected', value: maker.value.versus_disconnected },
              { name: 'Co-op Plays', value: maker.value.coop_plays },
              { name: 'Co-op Clears', value: maker.value.coop_clears }
            ]
          }
        ]
      } else {
        return []
      }
    })

    onMounted(() => {
      if (makerCode.value && !isMakerCode(makerCode.value)) {
        console.log(`${makerCode.value} is a level code. Navigating to course page.`)
        router.replace(`/smm2/level/${formatCode(makerCode.value)}`)
      }
    })

    return {
      route,
      router,
      makerCode,
      makerUrl,
      maker,
      parsed,
      formatCode,
      categories,
      isFetching
    }
  }
}
</script>

<template>
  <div class="maker-details mario-maker">
    <div class="text-center q-pt-xl" v-if="isFetching">
      <q-spinner-gears v-if="isFetching" size="80px" />
    </div>
    <div style="width: 400px; max-width: 100%; margin: 0 auto">
      <div class="category" v-for="(category, i) in categories" :key="i">
        <h5>{{category.name}}</h5>
        <div class="flex justify-space-between" style="max-width: 400px" v-for="(stat, i) in category.stats" :key="i">
          <div class="flex-shrink">{{stat.name}}</div>
          <div style="flex: 1;" class="q-px-md">
            <div style="border-bottom: dotted; height: 70%;" />
          </div>
          <div class="flex-shrink">{{stat.value}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
