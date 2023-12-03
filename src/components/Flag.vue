<script>
import countryFlagsSvg from 'country-flags-svg'
import { computed } from 'vue'

const countries = Object.fromEntries(countryFlagsSvg.countries.map(x => [x.iso2, x]))

export default {
  props: {
    iso2: String
  },
  setup (props) {
    window.countryFlagsSvg = countryFlagsSvg
    const country = computed(() => countries[props.iso2?.toUpperCase()])
    const overrides = {
      GB: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Flag_of_the_United_Kingdom_%281-2%29.svg'
    }
    return {
      country,
      overrides
    }
  }
}
</script>
<template>
  <span v-if="iso2">
    <img :src="overrides[iso2] || country.flag" class="flag" />
    <q-tooltip>{{country.name}} ({{ iso2 }})</q-tooltip>
  </span>
</template>
<style lang="scss" scoped>
  .flag {
    max-width: 40px;
    max-height: 27px;
  }
</style>
