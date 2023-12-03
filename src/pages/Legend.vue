<script>
import legendLib from 'src/lib/legend.cjs'
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'

export default {
  setup () {
    const legend = useStorage('legend', legendLib)
    window.legend = legend.value
    const names = computed(() => Array.from(new Set(legend.value.files.map(x => x.name).filter(x => x))).sort())
    const categories = [
      'Block',
      'Ground',
      'Semisolid',
      'Item',
      'Character',
      'Track',
      'Gizmo',
      'Fixture',
      'Info'
    ]
    // const categories = computed(() => {
    //   return Array.from(new Set(legend.value.files.map(x => x.category).filter(x => x))).sort()
    // })
    const sort = () => {
      legend.value.files.sort((a, b) => a.name > b.name ? 1 : -1)
    }
    return {
      legend: ref(legend),
      categories,
      names,
      sort
    }
  }
}
</script>

<template>
  <q-page>
    <datalist id="names">
      <option v-for="name in names" :key="name" :value="name" />
    </datalist>
    <q-btn @click="sort">Sort</q-btn>
    <div v-for="file in legend.files" :key="file.id">
      <img :src="file.src" style="width: 64px; image-rendering: pixelated" />
      <q-input list="names" type="text" v-model="file.name" class="inline-block vertical-top" outlined />
      <q-select v-model="file.category" :options="categories" class="inline-block vertical-top" outlined />
      <span>{{file.id}}</span>
    </div>
  </q-page>
</template>
