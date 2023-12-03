<script>
import { formatCode, stripCode } from '../../lib/id.mjs'
import { addressCard } from 'src/lib/icons'
import Flag from 'components/Flag.vue'

export default {
  components: { Flag },
  props: {
    modelValue: Object
  },
  setup () {
    return {
      formatCode,
      stripCode,
      addressCard
    }
  }
}
</script>
<template>
  <a v-if="modelValue" class="link" :href="`/smm2/maker/${stripCode(modelValue.code)}`">
    <img :src="modelValue.mii_image" class="q-mr-sm avatar vertical-top" />
    <div class="inline-block vertical-top">
      <Flag :iso2="modelValue.country" class="q-mr-sm vertical-top" />
      <span class="mario-maker text-h5 vertical-top">
        {{modelValue.name}}
      </span>
      <br />
      <span>
        <span class="icon-16 q-mr-sm" v-html="addressCard" />
        <span class="mario-maker vertical-top">{{formatCode(modelValue.code)}}</span>
        <q-tooltip>Maker Code</q-tooltip>
      </span>
      <br />
      <slot />
    </div>
  </a>
</template>
<style lang="scss" scoped>
  .avatar {
    width: 48px;
    height: 48px;
    background-color: white;
    border-radius: 5px;
  }
</style>
