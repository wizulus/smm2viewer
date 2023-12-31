<script>
import NavLink from 'components/NavLink.vue'
import { formatCode, isCourseCode, isMakerCode, stripCode } from '../../lib/id.mjs'
import { defineComponent, ref, watchEffect, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import wizulus from 'assets/icon.png'
import ribbon from 'assets/discord-ribbon.png'
import { Notify } from 'quasar'

export default defineComponent({
  name: 'MainLayout',

  components: {
    NavLink
  },

  setup () {
    const route = useRoute()
    const router = useRouter()

    const leftDrawerOpen = ref(false)
    const levelCode = ref('')
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
          position: 'top-right',
          timeout: 1000
        })
      }
    }
    const showHeader = ref(true)
    const showFooter = ref(true)
    const levelLoaded = ref(false)

    provide('showHeader', showHeader)
    provide('showFooter', showFooter)
    provide('levelLoaded', levelLoaded)

    watchEffect(() => {
      if (route.params?.levelCode) {
        levelCode.value = formatCode(route.params.levelCode)
      }
    })

    const promotionExpired = Date.now() > new Date('2023-01-30').getTime()

    return {
      showHeader,
      showFooter,
      search,
      stripCode,
      levelCode,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      wizulus,
      promotionExpired,
      ribbon,
      levelLoaded
    }
  }
})
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated v-model="showHeader">
      <q-toolbar>
        <!-- <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        /> -->

        <q-toolbar-title>
          <router-link to="/" class="link" style="text-decoration: none;">
            <img :src="wizulus" width="32" height="32" style="vertical-align: middle" />
            Wizulus's SMM2 Viewer
          </router-link>
        </q-toolbar-title>

        <q-form class="flex q-gutter-sm" @submit="search">
          <q-input
            dense
            v-model="levelCode"
            class="mario-maker"
            input-class="text-center"
            rounded
            outlined
            autofocus
            type="text"
            placeholder="LEV-ELC-ODE"
            lazy-rules="ondemand"
            hide-bottom-space
          />
          <q-btn dense rounded type="submit" color="primary">Open</q-btn>
        </q-form>

      </q-toolbar>
    </q-header>

    <!-- <q-drawer
      v-model="leftDrawerOpen"
      bordered
    >
      <q-list v-if="linksList">
        <q-item-label
          header
        >
          Links
        </q-item-label>

        <NavLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer> -->

    <q-page-container>
      <router-view v-slot="{ Component }">
        <suspense :timeout="250">
          <template #default>
            <component :is="Component"/>
          </template>
          <template #fallback>
            <q-page>
              <q-inner-loading :showing="true" />
            </q-page>
          </template>
        </suspense>
      </router-view>
    </q-page-container>

    <q-footer class="bg-accent" v-model="showFooter" style="max-height: 22px; overflow-y: hidden;">
      <div class="flex justify-center" style="gap: 5px 40px;">
        <div>
          Created by Wizulus
        </div>
        <div>
          <a class="icon-link text-white" href="https://discord.gg/MdXD3hSuP5" target="_blank">
            <svg width="16" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor"/></g><defs><clipPath id="clip0"><rect width="71" height="55" fill="white"/></clipPath></defs></svg>
            <span>Discord</span>
          </a>
        </div>
        <div>
          <a class="icon-link text-white" href="https://twitter.com/wizulus" target="_blank">
            <svg width="16" height="16" aria-hidden="true" focusable="false" data-prefix="fa-brands" data-icon="twitter" class="q-icon svg-inline--fa fa-twitter fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" fill="currentColor"/></svg>
            <span>Twitter</span>
          </a>
        </div>
        <div>
          <router-link tag="a" class="icon-link text-white" to="/about">
            <span>About</span>
          </router-link>
        </div>
      </div>
    </q-footer>
    <a v-if="!promotionExpired && !levelLoaded" class="promotion" :class="{'off-screen': !showHeader}" href="https://discord.gg/MdXD3hSuP5">
      <img :src="ribbon" title="Join the Discord" style="width: 150px" />
    </a>
  </q-layout>
</template>

<style lang="scss">
.q-body--layout-animate {
  overflow: hidden;
}
.promotion {
  position: fixed;
  top: 50px;
  right: 0;
  &.off-screen {
    right: -150px;
    top: -150px;
  }
  transition: right 0.25s ease-out,
              top 0.25s ease-out;
}
</style>
