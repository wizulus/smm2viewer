<script>
import { defineComponent, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'App',
  setup () {
    const router = useRouter()
    const route = useRoute()
    router.afterEach((to) => {
      gtag('event', 'page_view', {
        page_title: to.name,
        page_location: to.fullPath,
        page_path: to.path
      })
      gtag('event', 'screen_view', {
        app_name: 'smm2viewer',
        screen_name: to.name
      })
    })
    // const q = useQuasar()
    onMounted(() => {
      gtag('event', 'page_view', {
        page_title: route.name,
        page_location: route.fullPath,
        page_path: route.path
      })
      gtag('event', 'screen_view', {
        app_name: 'smm2viewer',
        screen_name: route.name
      })
      console.log('Loading toost.')
      if (!document.head.querySelector('[data-form="toost"]')) {
        const script = document.createElement('script')
        script.setAttribute('data-for', 'toost')
        script.setAttribute('async', '')
        script.setAttribute('defer', '')
        script.setAttribute('type', 'text/javascript')
        script.setAttribute('src', '/toost/index.min.js')
        document.head.appendChild(script)
      }
    })

    return {
    }
  }
})
</script>
<template>
  <router-view />
</template>
