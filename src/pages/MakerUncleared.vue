<script>
import MakerLevelList from './MakerLevelList.vue'
export default {
  components: { MakerLevelList }
}
</script>
<template>
  <MakerLevelList api="get_uncleared" :filter="x => !x.clears" />
</template>
