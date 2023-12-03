<script>
import fireLitCave from 'assets/fire-lit-cave.webp'
import { ref, watchEffect } from 'vue'

export default {
  name: 'Error404',
  setup () {
    const message = ref('The level code is invalid.\nTry again.')
    const lines = ref(['', ''])

    watchEffect(async () => {
      const msgLines = message.value.split('\n')
      for (let i = 0; i < msgLines.length; i++) {
        lines.value[i] = ''.padEnd(msgLines[i].length, ' ')
      }
      for (let i = 0; i < msgLines.length; i++) {
        const line = msgLines[i]
        for (let c = 0; c <= line.length; c++) {
          lines.value[i] = line.substring(0, c) + ''.padEnd(line.length - c, ' ')
          await new Promise(resolve => setTimeout(resolve, 120))
        }
      }
    })

    return {
      fireLitCave,
      lines
    }
  }
}
</script>

<template>
  <router-link to="/" class="fullscreen bg-black text-white text-center flex flex-center">
    <div>
      <q-img :src="fireLitCave" width="100vw" height="100vh" fit="contain" style="max-height: 100vh; max-width: 100vw;">
        <span class="absolute-full flex flex-center">
          <div style="width: 100vh; height: 100vw; max-width: 100vw; max-height: 100vh; position: relative">
            <div style="position: absolute; top: calc(min(40vw, 37vh)); left: 0; width: 100%; font-size: calc(min(2.5vw, 3vh));" class="zelda">
              {{lines[0]}}<br />{{lines[1]}}
            </div>
          </div>
        </span>
      </q-img>
      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Go Home"
        no-caps
      />
    </div>
  </router-link>
</template>
