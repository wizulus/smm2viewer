<script>
export default {
  props: {
    icon: {
      type: String,
      default: null
    },
    title: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: null
    }
  },
  emits: [
    'wonka'
  ],
  setup () {

  }
}
</script>
<template>
  <q-item tag="a" clickable v-ripple v-bind="$attrs" @click="$emit('wonka')">
    <q-item-section avatar v-if="icon" class="icon" >
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label v-if="caption">{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<style scoped>
  .icon {
    background-color: 'red'!important;
  }
</style>
