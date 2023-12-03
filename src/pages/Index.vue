<script>
import { Notify } from 'quasar'
import { computed, defineComponent, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { formatCode, isCourseCode, isMakerCode, stripCode } from '../../lib/id.mjs'

export default defineComponent({
  name: 'PageIndex',
  async setup () {
    const router = useRouter()
    const route = useRoute()
    const levelCode = ref(stripCode(route.query.code) || '')
    const search = () => {
      const parsed = stripCode(levelCode.value)
      const formatted = formatCode(parsed)
      if (isCourseCode(parsed)) {
        router.push(`/smm2/course/${formatted}`)
      } else if (isMakerCode(parsed)) {
        router.push(`/smm2/maker/${formatted}`)
      } else {
        Notify.create({
          message: 'Invalid code',
          color: 'negative',
          position: 'center',
          timeout: 1000
        })
      }
    }
    const options = {
      gameStyle: [
        'Any',
        'SMB1',
        'SMB3',
        'SMW',
        'NSMBU',
        'SM3DW'
      ],
      theme: [
        'Any',
        'Overworld',
        'Underground',
        'Castle',
        'Airship',
        'Underwater',
        'Ghost house',
        'Snow',
        'Desert',
        'Sky',
        'Forest'
      ],
      difficulty: [
        'Any',
        'Easy',
        'Normal',
        'Expert',
        'Super Expert'
      ],
      tags: [
        'Any',
        'Auto',
        'Autoscroll',
        'Boss Fight',
        'Link',
        'Multiplayer',
        'Music',
        'One Player Only',
        'Pixel Art',
        'Puzzle',
        'Shooter',
        'Short',
        'Speedrun',
        'Standard',
        'Technical',
        'Themed'
      ],
      sortType: [
        'By Likes',
        'By Date',
        'By Clear Rate'
      ],
      sortOrder: [
        'Ascending',
        'Descending'
      ],
      searchMode: [
        'Levels',
        'Users',
        'Worlds'
      ]
    }

    const defaultForm = {
      gameStyle: options.gameStyle[0],
      theme: options.theme[0],
      difficulty: options.difficulty[0],
      tags: options.tags[0],
      sortType: options.sortType[0],
      sortOrder: options.sortOrder[0],
      searchMode: options.searchMode[0]
    }
    let previousSearch = null
    if (process.env.CLIENT) {
      try {
        previousSearch = JSON.parse(localStorage.getItem('mc-search'))
      } catch (err) {
        console.warn('Failed to parse search from localStorage', err)
      }
    }
    const searchTerm = ref(previousSearch?.searchTerm || '')
    const filters = ref({
      ...defaultForm,
      ...(previousSearch?.filters || {})
    })
    const reset = () => {
      searchTerm.value = ''
      filters.value = { ...defaultForm }
      localStorage.removeItem('mc-search')
    }
    const saveSearch = () => {
      localStorage.setItem('mc-search', JSON.stringify({
        searchTerm: searchTerm.value,
        filters: filters.value
      }))
    }
    const submitSearch = () => {
      saveSearch()
      window.location.href = searchUrl.value
    }

    const searchUrl = computed(() => {
      const url = new URL(`https://makercentral.io/levels/search/${encodeURIComponent(searchTerm.value || '_')}`)
      for (const [key, value] of Object.entries(filters.value)) {
        if (value !== options[key][0]) {
          url.searchParams.set(key, value)
        }
      }
      return url.href
    })

    return {
      levelCode,
      stripCode,
      search,
      searchTerm,
      filters,
      searchUrl,
      options,
      reset,
      saveSearch,
      submitSearch,
      isMakerCode,
      isCourseCode
    }
  }
})
</script>

<template>
  <q-page>
    <div class="flex q-pa-sm justify-center">
      <q-form @submit="search" style="z-index:1">
        <div>
          <div class="text-h6 mario-maker">Level Code:</div>
          <div class="flex q-gutter-sm">
            <q-input
              v-model="levelCode"
              class="mario-maker"
              input-class="text-center"
              rounded
              outlined
              autofocus
              type="text"
              placeholder="LEV-ELC-ODE"
              :rules="[
                x => !!stripCode(levelCode) || isMakerCode(levelCode) || isCourseCode(levelCode) || 'Invalid course or player code'
              ]"
              lazy-rules="ondemand"
              hide-bottom-space
            />
            <q-btn rounded type="submit" color="primary">Open</q-btn>
          </div>
        </div>
      </q-form>
    </div>
    <div class="text-h6 q-mt-lg text-center">
      <router-link to="/credits" class="link">Credits</router-link>
    </div>
    <q-form style="width: 800px; max-width: 100%; margin: 0 auto" @submit="submitSearch">
      <q-card>
        <q-card-section class="bg-mc-light">
          <span class="text-h5 mario-maker"><span style="color:#fff">MAKER</span><span style="color:#6193ff">CENTRAL</span></span>
        </q-card-section>
        <q-card-section class="inset-shadow bg-mc-accent">
          <div>Search over 29 million levels...</div>
            <div class="text-center">
              <q-input
                v-model="searchTerm"
                borderless
                dense
                class="input-px"
                bg-color="mc-dark"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
                <template v-slot:append>
                  <q-select
                    v-model="filters.searchMode"
                    :options="options.searchMode"
                    class="mc-select-border"
                    dense
                    borderless
                    hide-bottom-space
                  />
                </template>
              </q-input>
            </div>
            <div class="text-center text-h6 q-my-md">Filters</div>
            <div class="flex justify-center q-gutter-md">
              <div class="cell">
                <div class="text-center text-bold">Game Style</div>
                <q-select
                  class="mc-select-border"
                  bg-color="mc-dark"
                  v-model="filters.gameStyle"
                  :options="options.gameStyle"
                  borderless
                  dense
                  placeholder="Any"
                  hide-bottom-space
                />
              </div>
              <div class="cell">
                <div class="text-center text-bold">Theme</div>
                <q-select
                  class="mc-select-border"
                  bg-color="mc-dark"
                  v-model="filters.theme"
                  :options="options.theme"
                  borderless
                  dense
                  placeholder="Any"
                  hide-bottom-space
                />
                </div>
              <div class="cell">
                <div class="text-center text-bold">Difficulty</div>
                <q-select
                  class="mc-select-border"
                  bg-color="mc-dark"
                  v-model="filters.difficulty"
                  :options="options.difficulty"
                  borderless
                  dense
                  placeholder="Any"
                  hide-bottom-space
                />
                </div>
              <div class="cell">
                <div class="text-center text-bold">Tags</div>
                <q-select
                  class="mc-select-border"
                  bg-color="mc-dark"
                  v-model="filters.tags"
                  :options="options.tags"
                  borderless
                  dense
                  placeholder="Any"
                  hide-bottom-space
                />
                </div>
            </div>
            <div class="text-center text-h6 q-my-md">Sort</div>
            <div class="flex justify-center q-gutter-md">
              <div class="cell">
                <div class="text-center text-bold">Sort By</div>
                <q-select
                  class="mc-select-border"
                  bg-color="mc-dark"
                  v-model="filters.sortType"
                  :options="options.sortType"
                  borderless
                  dense
                  placeholder="By Likes"
                  hide-bottom-space
                />
              </div>
              <div class="cell">
                <div class="text-center text-bold">Order</div>
                <q-select
                  class="mc-select-border"
                  bg-color="mc-dark"
                  v-model="filters.sortOrder"
                  :options="options.sortOrder"
                  borderless
                  dense
                  placeholder="Ascending"
                  hide-bottom-space
                />
              </div>
            </div>
            <div class="q-mb-md q-mt-lg q-gutter-sm flex justify-center">
              <q-btn type="a" color="mc-primary" no-caps :href="searchUrl" @click="saveSearch">Search</q-btn>
              <q-btn color="mc-dark" no-caps @click="reset">Reset</q-btn>
            </div>
        </q-card-section>
      </q-card>

    </q-form>
    <div style="width: 800px; max-width: 100%">
    </div>
  </q-page>
</template>
<style lang="scss" scoped>
  .cell {
    min-width: 140px;
  }
</style>
