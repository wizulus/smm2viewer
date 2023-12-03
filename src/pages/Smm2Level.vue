<script>
import { reactive, ref, onMounted, onUnmounted, computed, getCurrentInstance, watchEffect, watch, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDate } from 'src/lib/util.js'
import { stripCode, formatCode, isCourseCode, isMakerCode } from '../../lib/id.mjs'
import { openLevel } from 'src/lib/toost'
import { Vector2 } from 'three'
// import Highlight from 'components/Highlight.vue'
import { shoePrints, heartCrack, heart, flagCheckered, stopwatch, addressCard, userHeadset, faceGrinBeam, faceSmile, faceTired, skull, tag, uploaded } from 'src/lib/icons'
import Tooltips from 'components/Tooltips.vue'
import World from 'components/World.vue'
import Maker from 'components/Maker.vue'
import { useFullscreen } from '@vueuse/core'
import googleTranslateIcon from 'assets/google-translate.png'
import { Notify } from 'quasar'
import { zOrder } from 'src/lib/legend'

export async function importAsset (path) {
  return `/assets/${path}`
}
export default {
  components: { Tooltips, World, Maker },
  async setup () {
    window.viewer = getCurrentInstance().proxy
    const viewCount = (parseInt(localStorage.getItem('viewCount')) || 0) + 1
    localStorage.setItem('viewCount', viewCount)
    const route = useRoute()
    const router = useRouter()
    const levelCode = computed(() => route.params.levelCode)
    const info = ref(null)
    const level = ref(null)
    const stuff = ref(null)
    const mouseDown = ref(false)
    const translate = ref(new Vector2(0, 0))
    const scale = ref(1)
    const pointerDistance = ref(0)
    const imgOverworld = ref(null)
    const imgSubworld = ref(null)
    const error = ref(null)
    const showMore = ref(false)
    const unloaded = ref(false)
    const errorUrl = ref(null)
    const loading = computed(() => levelCode.value === '000-000-000' || (!error.value && (!level.value || !levelCode.value)))
    const refreshing = ref(false)
    const loadingText = ref('')
    const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(document.body)

    const showHeader = inject('showHeader')
    const showFooter = inject('showFooter')
    const levelLoaded = inject('levelLoaded')

    watch([scale, isFullscreen], ([scale, isFullscreen]) => {
      const showToolbars = scale <= 1
      showHeader.value = showToolbars && !isFullscreen
      showFooter.value = showToolbars && !isFullscreen
    })

    watch(() => route.path, () => {
      error.value = null
      errorUrl.value = null
    })

    // let loadingIndex = 0
    let loadingTimer = null

    // const seenLoadingPhrases = []

    // const promotionExpired = Date.now() > new Date('2023-01-30').getTime()

    // // Verify user is in the US, and between the Hawaii and New York time zones
    // // const showFundraising = viewCount >= 5 &&
    // //   window.navigator.language === 'en-US' &&
    // //   new Date().getTimezoneOffset() / 60 >= 3 &&
    // //   new Date().getTimezoneOffset() / 60 <= 11
    // const showFundraising = false

    // const bmc = '<a style="color: #08f; text-decoration: none;" href="https://www.buymeacoffee.com/wizulus">☕ <u>buy me a coffee</u></a>'
    // const fundraisingPhrases = [
    //   `If you'd like to help cover hosting costs, you can ${bmc}.`,
    //   `I keep server costs as low as possible, but if you'd like to help me pay for hosting, you can ${bmc}.`,
    //   `Development doesn't cost a thing, but if you'd like to help me pay for hosting, you can ${bmc}.`,
    //   `This project is not for profit, but if you'd like to help me pay for hosting, you can ${bmc}.`
    // ]

    // const promotionPhrases = `
    //   Attempting to load the level... <br />We are currently experiencing issues due to the new update.<br />If you would like to get updates on our progress, please <a href="https://discord.gg/MdXD3hSuP5">join our Discord server</a>.
    // `.split('\n').map(line => line.trim()).filter(line => line.length)

    const discordLoadingPhrases = [
      ['What\'s Bowser\'s favorite food? Mari-o\'s', 'quagsire4smash🦖#5614'],
      ['Adding Spikes', 'leto83#4238'],
      ['Feeding SkipSqueaks', 'Zanderify#5930'],
      ['Praying Nintendo doesn\'t destroy this level viewer again', 'Anderzam#9525'],
      ['Don\'t kill Alabama Beach Mice, they\'re endangered', 'Evgeny#4670'],
      ['Saving the whales...', 'leto83#4238'],
      ['Adding third CP...', 'leto83#4238'],
      ['Trans rights!', 'quagsire4smash🦖#5614'],
      ['Scherbie draws cats', 'LouMarru#3909'],
      ['<i>Koopa dancing intensifies</i>', 'Snackboy#0342'],
      ['<i>Bah bah!</i>', 'Evgeny#4670'],
      ["Ducking from Cheesepopps' lasers", 'LouMarru#3909'],
      ['Calling your mom', 'leto83#4238'],
      ['Wood fired pizza? How is pizza going to get a job now?', 'rei ツ#0909'],
      ['Level viewer work ahead? Uh, yeah, I sure hope it does.', 'rei ツ#0909'],
      ['Hitting item blocks', 'Zanderify#5930'],
      ['Alright, how many boos do I have now', 'Courte#6953'],
      ['Adding Trolls…', 'jneen#7151'],
      ['Lowering the sprite limit…', 'jneen#7151'],
      ['Converting to 3DWorld…', 'jneen#7151'],
      ['Chasing undodog…', 'jneen#7151'],
      ['Unlocking superball again…', 'jneen#7151'],
      // ['Helping Setsuna reach 10k clears <sub>(edited)</sub>', 'RedPanda#5303'],
      ['Adding hot garbage…', 'loz#4413'],
      ['Finding CP0', 'quagsire4smash🦖#5614'],
      ['Restarting level after reaching CP', 'Peggy Sue#5942'],
      ['Farming 1-Ups', 'Peggy Sue#5942'],
      ['Verifying pick a path route', 'Peggy Sue#5942'],
      ['Rage booing your level', 'Peggy Sue#5942'],
      ['Adding dev exit...', 'KingJ0804#1405'],
      ['Adding the laughing sound effect...', 'KingJ0804#1405'],
      ['Dying at the last jump...', 'KingJ0804#1405'],
      ['Making Yoshi drop gaps comfortable...', 'Alex-GPTV#4601'],
      ['Sorting 🍄 Toads from 🐸 toad suits...', 'Alex-GPTV#4601'],
      ['Giving the bois shroom-stretchable clothes...', 'Alex-GPTV#4601'],
      ['Trying to 100% SMM2...', 'Alex-GPTV#4601'],
      ['Your level is typing...', 'Alex-GPTV#4601'],
      ['Throwing away mystery mushrooms...', 'Alex-GPTV#4601'],
      ['<code>TAL-KIN-GTO-THE-LEV-ELC-ODE...</code>', 'Alex-GPTV#4601'],
      ['Baking Goombread...', 'Anderzam#9525'],
      ['Loading Loading Messages...', 'leto83#4238'],
      ['Getting over it...', 'leto83#4238'],
      ['Saving Yoshis', 'Pombee#2105'],
      ['Finding Kaizo Blocks', 'Pombee#2105'],
      ['Exposing dev routes...', 'luke0verhere#6879'],
      ['Timmy Beware', 'Courte#6953'],
      ['The Toad is in another castle.', 'scsa2020#0095'],
      ['The Mario is in another castle.', 'scsa2020#0095'],
      ['The Luigi is in another castle.', 'scsa2020#0095'],
      ['The Toadette is in another castle.', 'scsa2020#0095'],
      ['The Yoshi is in another castle.', 'scsa2020#0095'],
      ['The Bowser is in another castle.', 'scsa2020#0095'],
      ['The princess is out on a date with Bowser...', 'scsa2020#0095'],
      ['This message couldn\'t be loaded...', 'scsa2020#0095'],
      ['Loading Mario in a spike room...', 'scsa2020#0095'],
      ['Loading boss rush level...', 'scsa2020#0095'],
      ['Waiting on little Timmy to finish building the level...', 'scsa2020#0095'],
      ['Thwomp suc in progress...', 'scsa2020#0095'],
      ['Hiding the red coins...', 'scsa2020#0095'],
      ['Turning off the lights in progress...', 'scsa2020#0095'],
      ['Generating lag machine...', 'scsa2020#0095'],
      ['Generating scuff Meowser battle...', 'scsa2020#0095'],
      ['Generating triple triple shell jumps...', 'scsa2020#0095'],
      ['Hoping Feller Stocks is on the rise...', 'scsa2020#0095'],
      ['Generating an one screen puzzle...', 'scsa2020#0095'],
      ['Recreating 100 Mario...', 'scsa2020#0095'],
      ['Where does the muncher came from?', 'scsa2020#0095'],
      ['Hiding the goal pole...', 'scsa2020#0095'],
      ['Recreating the mystery mushrooms...', 'scsa2020#0095'],
      ['Uploading a title screen level...', 'scsa2020#0095'],
      ['Generating a speed run level...', 'scsa2020#0095'],
      ['Creating a banger...', 'scsa2020#0095'],
      ['Patching cheese...', 'scsa2020#0095'],
      ['Peeking beyond the curtains I see...', 'scsa2020#0095'],
      ['Red coin challenge incoming...', 'scsa2020#0095'],
      ['Randomly placing red coins...', 'scsa2020#0095'],
      ['Starting a Red vs Pink coins debate...', 'scsa2020#0095'],
      ['Picking a path...', 'Keyz42#3168'],
      ['Submitted by Wizulus#0001', ''],

      ['Keeping it fresh', 'Zanderify#5930'],
      ['Pausing in a #LS level', 'Keyz42#3168'],
      ['Your level is in another castle', 'scsa2020#0095'],
      ['#ts #tp', 'scsa2020#0095'],
      ['Clearing uncleared levels...', 'Magicmason1000#7472'],
      ['You just got coconut malled', 'Bread Man#0214'],
      ['Burning hot garbage...', 'Magicmason1000#7472'],
      ['Getting trolled...', 'Magicmason1000#7472'],
      ['Helping Endless Runs', 'faithfulmum#0087'],
      ['Saving Endless Runs', 'faithfulmum#0087'],
      ['You filthy cheater..', 'Courte#6953'],
      ['Loading an impossible level', 'RedPanda#5303'],
      ['pway my webel plz', 'Courte#6953'],
      ['Aight you can\'t Boo it after this then', 'Courte#6953'],
      ['10 minute WR?! Where\'s that level viewer', 'Courte#6953'],
      ['If you\'re here its already too late', 'Courte#6953'],
      ['Clearing 42069 levels', 'scsa2020#0095'],
      ['Remembering to tun on the timer for the fans', 'scsa2020#0095'],
      ['Stealing world records', 'scsa2020#0095'],
      ['Generating #dgr level', 'scsa2020#0095'],
      ['Ordering a new box of 1-UPs...', 'Anderzam#9525'],
      ['Igniting garbage...', 'Project_Bacon#0016'],
      ['Generating TAS level', 'scsa2020#0095'],
      ['Level isn’t loading, you should probably play something else (not actually)', 'Keyz42#3168'],
      ['Putting a sledge bro in a claw', 'Jervimiah#1873'],
      ['Goop and Gorp incorporating', 'Jervimiah#1873'],
      ['Don\'t refresh. Nobody likes refreshing', 'Jervimiah#1873'],
      ['Completing an Anti', 'Jervimiah#1873'],
      ['Waiting for the snake block', 'Jervimiah#1873'],
      ['Beating a Mang level', 'Jervimiah#1873'],
      ['Renewing online subscription', 'Jervimiah#1873'],
      ['Exposing dev exits...', 'bìu#0771'],
      ['The bop bops are watching', 'faithfulmum#0087'],
      ['Show me the naked pipes!', 'Courte#6953'],
      ['Solving 32 digit cryptography level', 'Courte#6953'],
      ['Tired of lowering the clear rate?', 'Courte#6953'],
      ['Adding Shooter and Link tags...', 'Courte#6953'],
      ['Generating Link tutorial level', 'scsa2020#0095'],
      ['Timmy is placing koopas', 'burning kitsune mask#6595'],
      ['generating refreshing level...', 'KingJ0804#1405'],
      ['clearing a RNG level by strategy', 'Pickpokey#6577'],
      ['Carrying Super Expert runs...', 'QuartzWasTaken#8654'],
      ['Exposing the dev routes', 'Michael Ridinger#7564'],
      ['Finding kaizo levels', 'Panokin#4753'],
      ['Unhiding coin blocks over pits ', 'Manuwhat#7502'],
      ['Lowering lava to show contraptions', 'Manuwhat#7502'],
      ['Labeling doors and pipes with corresponding letters', 'Manuwhat#7502'],
      ['Playing chase with Nintendo', 'Manuwhat#7502'],
      ['Adding slide theme to anti-softlocks', 'Manuwhat#7502'],
      ['Missing editor', 'Manuwhat#7502'],
      ['Loading loading message...', 'QuartzWasTaken#8654'],

      ['Finding new glitches...', 'Rave444#3933'],
      ['Loading evil level design...', 'Jervimiah#1873'],
      ['Hiding the goal...', 'quagsire4smash🦖#5614'],
      ['Beware of the keydeath', 'Babagass#3505'],
      ['Finishing a maze level', 'Pickpokey#6577'],
      ['D:', 'PangaeaPanga']
    ]

    /** @type {Map<string, string[]>} */
    const quoteByName = new Map()
    for (const [quote, name] of discordLoadingPhrases) {
      if (!quoteByName.has(name)) quoteByName.set(name, [])
      quoteByName.get(name).push(`${quote}<br /><sub style="opacity: 0.25; font-size: 8pt">Submitted by ${name}</sub>`)
    }

    // const regularLoadingPhrases = `
    //   Growing Mushrooms...
    //   Waking Luigi...
    //   Texting Princess Peach...
    //   Laundering Mario's Hat...
    //   Finding Toad...
    //   Hatching Yoshi Eggs...
    //   Dropping Yoshi into a pit...
    //   Igniting Burners...
    //   Planting Fire Flowers...
    //   Drawing Bridge...
    //   Heating Lava...
    //   Raking Leaves...
    //   Burrying Moles...
    //   Carving Thwomps...
    //   Rallying Goombas...
    //   Kicking Koopa Troopas..
    //   Armoring Buzzy Beetles...
    //   Spawning Cheep-Cheeps...
    //   Bouncing Bullies...
    //   Revealing what is behind the goal...
    //   Hiding Kaizo Blocks...
    //   Tethering Chain Chomps...
    //   Filling Question Blocks...
    //   Taunting Wigglers...
    //   Watering Piranha Plants...
    //   Trolling CarlSagan42...
    //   Feeding Cheese to Ryukahr...
    //   Taking out Hot Garbage...
    //   Submitting Hot Garbage #DGR...
    //   Getting a boop from Shoujo's Yoshi...
    //   Requesting a song from TanukiDan...
    //   Polishing Aurateur's Head...
    //   Hugging Slade Pillow...
    //   Underestimating ThaBeast721...
    //   Stealing PangeaPanga's World Records...
    //   Making Juzcook laugh...
    //   Trolling Geek...
    //   Kneeling before BarbarousKing...
    // `.split('\n').map(line => line.trim()).filter(line => line.length)

    // const stillLoadingPhrases = `
    //   If you see this, we're still trying to contact the TGR API.
    //   Sometimes the API can take up to 20 seconds or more to respond.
    //   When the TGR API is temporarily unavailable, we automatically retry after 1 second.
    //   This page will continue to load for up to 2 minutes.
    //   Don't worry about refreshing. We'll keep trying.
    // `.split('\n').map(line => line.trim()).filter(line => line.length)

    const names = Array.from(quoteByName.keys())
    const seenNames = []
    const updateDiscordLoadingText = () => {
      // loadingIndex++
      if (!names.length) {
        // Refill names once everything has been seen.
        names.push(...seenNames)
      }
      // Show random message from names
      const name = names[Math.floor(Math.random() * names.length)]
      const i = Math.floor(Math.random() * quoteByName.get(name).length)
      const msg = quoteByName.get(name)[i]
      seenNames.push(name)
      names.splice(names.indexOf(name), 1)
      loadingText.value = msg
    }

    // const loadingPhrases = promotionExpired ? regularLoadingPhrases : promotionPhrases

    // const updateLoadingText = () => {
    //   loadingIndex++
    //   let msg
    //   // if (loadingIndex >= 7 && loadingIndex < 12) {
    //   //   // Show message from stillLoadingPhrases in order
    //   //   msg = stillLoadingPhrases[(loadingIndex - 7) % stillLoadingPhrases.length]
    //   // } else {
    //   if (!loadingPhrases.length) {
    //     // Refill loadingPhrases once everything has been seen.
    //     loadingPhrases.push(...seenLoadingPhrases)
    //   }
    //   if (loadingIndex === 1 && showFundraising) {
    //     // Show fundraising message.
    //     msg = fundraisingPhrases[Math.floor(Math.random() * fundraisingPhrases.length)]
    //   } else {
    //     // Show random message from loadingPhrases
    //     msg = loadingPhrases[(loadingIndex - 1) % loadingPhrases.length]
    //     const i = Math.floor(Math.random() * loadingPhrases.length)
    //     msg = loadingPhrases[i]
    //     seenLoadingPhrases.push(loadingPhrases.splice(i, 1)[0])
    //     // }
    //   }
    //   loadingText.value = msg
    // }

    watch(loading, l => {
      if (l) {
        // loadingIndex = 0
        updateDiscordLoadingText()
        loadingTimer = setInterval(updateDiscordLoadingText, 5000)
      } else {
        clearInterval(loadingTimer)
      }
    }, { immediate: true })

    onUnmounted(() => {
      clearInterval(loadingTimer)
      showHeader.value = true
      showFooter.value = true
    })

    const stuffStyle = computed(() => ({
      cursor: mouseDown.value ? 'grabbing' : 'grab',
      transformOrigin: 'top left',
      transform: `translate(${scale.value === 1 ? Math.round(translate.value.x) : translate.value.x}px, ${scale.value === 1 ? Math.round(translate.value.y) : translate.value.y}px) scale(${scale.value})`,
      touchAction: 'none',
      imageRendering: scale.value < 1.5 ? 'auto' : 'pixelated',
      transition: pointers.value.size
        ? ''
        : 'transform .25s ease-out',
      paddingTop: '50px'
    }))

    let dismiss
    /** @param {WheelEvent} ev */
    const onMouseWheel = (ev) => {
      ev.preventDefault()
      if (dismiss) {
        dismiss()
        dismiss = null
      }
      if (ev.deltaY) {
        const stuffRect = stuff.value.getBoundingClientRect()
        const zoomDir = -Math.sign(ev.deltaY)
        let zoom = 1 + zoomDir * 0.1
        const newZoom = scale.value * zoom
        // Snap to 1
        if (newZoom < 1 && scale.value > 1) {
          scale.value = 1
          zoom *= 1 / newZoom
          console.log('Snapped to 1:1 while zooming out')
          dismiss = Notify.create({
            message: 'Snapped to 1:1',
            color: 'green',
            textColor: 'white',
            position: 'top',
            timeout: 500
          })
        } else if (newZoom > 1 && scale.value < 1) {
          scale.value = 1
          zoom *= 1 / newZoom
          dismiss = Notify.create({
            message: 'Snapped to 1:1',
            color: 'green',
            textColor: 'white',
            position: 'top',
            timeout: 500
          })
        } else {
          scale.value = newZoom
        }

        const currentTx = (ev.x - stuffRect.left) - translate.value.x
        const desiredTx = currentTx * zoom
        const deltaTx = desiredTx - currentTx
        translate.value.x -= deltaTx

        const currentTy = (ev.y - stuffRect.top) - translate.value.y
        const desiredTy = currentTy * zoom
        const deltaTy = desiredTy - currentTy
        translate.value.y -= deltaTy
      }
    }

    const pointers = ref(new Map())
    const pointStart = ref(new Vector2(0, 0))
    const point = computed(() => {
      /** @type {Vector2} */
      const sum = Array.from(pointers.value.values())
        .reduce((a, b) => a.add(b), new Vector2(0, 0))

      return pointers.value.size
        ? sum.divideScalar(pointers.value.size)
        : sum
    })

    const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))

    const onPointerDown = (ev) => {
      const path = ev.path || ev.composedPath()
      const link = path.find(x => x.tagName === 'A' || x.tagName === 'BUTTON' || x.tagName === 'SECTION')
      if (link) {
        console.log(`Aborting onPointerDown because a ${link.tagName} element was touched.`)
        return
      }
      console.log('pointerDown', ev)
      const rect = stuff.value.getBoundingClientRect()
      if (ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom) {
        stuff.value.setPointerCapture(ev.pointerId)
        const pointer = new Vector2(ev.x, ev.y)
        pointers.value.set(ev.pointerId, pointer)
        pointStart.value = point.value
        if (pointers.value.size === 2) {
          pointerDistance.value = distance(...pointers.value.values())
        }
      }
    }

    const onPointerMove = (ev) => {
      if (pointers.value.size) {
        ev.preventDefault()
        ev.stopImmediatePropagation()
        const pointer = new Vector2(ev.x, ev.y)
        pointers.value.set(ev.pointerId, pointer)

        const movement = point.value.clone().sub(pointStart.value)
        translate.value.add(movement)
        pointStart.value = point.value

        if (pointers.value.size === 2) {
          const d = distance(...pointers.value.values())

          const stuffRect = stuff.value.getBoundingClientRect()
          const zoom = d / pointerDistance.value
          scale.value *= zoom

          const currentTx = (point.value.x - stuffRect.left) - translate.value.x
          const desiredTx = currentTx * zoom
          const deltaTx = desiredTx - currentTx
          translate.value.x -= deltaTx

          const currentTy = (point.value.y - stuffRect.top) - translate.value.y
          const desiredTy = currentTy * zoom
          const deltaTy = desiredTy - currentTy
          translate.value.y -= deltaTy

          pointerDistance.value = d
        }
      }
    }

    const onPointerUp = (ev) => {
      stuff.value.releasePointerCapture(ev.pointerId)
      pointers.value.delete(ev.pointerId)
      pointStart.value = point.value
    }

    const onKeyDown = (ev) => {
      console.log(ev)
      // if home is pressed, reset zoom and position
      if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) {
        return
      }
      if (ev.key === 'Home') {
        scale.value = 1
        translate.value.set(0, 0)
        ev.preventDefault()
      }
      if (ev.key === 'g') {
        showing.Grid = !showing.Grid
      }
      if (ev.key === 'h') {
        showing.Hidden = !showing.Hidden
      }
      // if (ev.key === 'x') {
      //   showing.Xray = !showing.Xray
      // }
      if (ev.key === 'f') {
        toggleFullscreen()
      }

      // If + or - is pressed, zoom in or out
      if (ev.key === '+' || ev.key === '-' || ev.key === '=') {
        const stuffRect = stuff.value.getBoundingClientRect()
        const zoomDir = ev.key === '+' || ev.key === '=' ? 1 : -1
        const zoom = 1 + zoomDir * 0.1
        scale.value *= zoom

        const stuffCenter = new Vector2(stuffRect.left + stuffRect.width / 2, stuffRect.top + stuffRect.height / 2)
        const currentTx = (stuffCenter.x - stuffRect.left) - translate.value.x
        const desiredTx = currentTx * zoom
        const deltaTx = desiredTx - currentTx
        translate.value.x -= deltaTx

        const currentTy = (stuffCenter.y - stuffRect.top) - translate.value.y
        const desiredTy = currentTy * zoom
        const deltaTy = desiredTy - currentTy
        translate.value.y -= deltaTy
      }

      // If arrow keys are pressed, move the image
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight' || ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
        const movement = new Vector2(0, 0)
        if (ev.key === 'ArrowLeft') {
          movement.x = 45
        } else if (ev.key === 'ArrowRight') {
          movement.x = -45
        } else if (ev.key === 'ArrowUp') {
          movement.y = 45
        } else if (ev.key === 'ArrowDown') {
          movement.y = -45
        }
        translate.value.add(movement)
      }

      // If Numpad keys are pressed, move the image
      if (ev.code === 'Numpad1' || ev.code === 'Numpad2' || ev.code === 'Numpad3' || ev.code === 'Numpad4' || ev.code === 'Numpad9' || ev.code === 'Numpad6' || ev.code === 'Numpad7' || ev.code === 'Numpad8') {
        const movement = new Vector2(0, 0)
        if (ev.code === 'Numpad1') {
          movement.x = 45 * 0.7
          movement.y = -45 * 0.7
        } else if (ev.code === 'Numpad2') {
          movement.y = -45
        } else if (ev.code === 'Numpad3') {
          movement.x = -45 * 0.7
          movement.y = -45 * 0.7
        } else if (ev.code === 'Numpad4') {
          movement.x = 45
        } else if (ev.code === 'Numpad6') {
          movement.x = -45
        } else if (ev.code === 'Numpad7') {
          movement.x = 45 * 0.7
          movement.y = 45 * 0.7
        } else if (ev.code === 'Numpad8') {
          movement.y = 45
        } else if (ev.code === 'Numpad9') {
          movement.x = -45 * 0.7
          movement.y = 45 * 0.7
        }
        translate.value.add(movement)
      }
    }
    onMounted(() => {
      // stuff.value.addEventListener('mousedown', onMouseDown, { passive: false })
      stuff.value.addEventListener('click', onClick, { passive: true })
      stuff.value.addEventListener('wheel', onMouseWheel, { passive: false })
      stuff.value.addEventListener('pointerdown', onPointerDown, { passive: false })
      stuff.value.addEventListener('pointerup', onPointerUp, { passive: false })
      stuff.value.addEventListener('pointermove', onPointerMove, { passive: false })
      stuff.value.addEventListener('pointercancel', onPointerUp, { passive: false })
      window.addEventListener('keydown', onKeyDown, { passive: false })
    })
    onUnmounted(() => {
      unloaded.value = true
      stuff.value?.removeEventListener('pointerdown', onPointerDown)
      stuff.value?.removeEventListener('pointerup', onPointerUp)
      stuff.value?.removeEventListener('pointermove', onPointerMove)
      stuff.value?.removeEventListener('pointercancel', onPointerUp)
      stuff.value?.removeEventListener('click', onClick)
      stuff.value?.removeEventListener('wheel', onMouseWheel)
      window.removeEventListener('keydown', onKeyDown)
    })

    const refreshLevelInfo = async (force = false) => {
      refreshing.value = true
      try {
        const parsed = stripCode(levelCode.value)
        if (levelCode.value === '000-000-000') {
          info.value = null
          return
        }
        if (isCourseCode(parsed)) {
          const nfo = await fetch(`/mm2/level_info/${parsed}${force ? '?force=1' : ''}`).then(x => {
            if (!x.ok) {
              throw new Error(`Failed to fetch level info: ${x.status} ${x.statusText}`)
            }
            return x.json()
          }).catch(err => {
            gtag('event', 'exception', {
              description: `TGRCode: ${err.message}`
            })
            console.error(err)
            error.value = err
            errorUrl.value = `https://tgrcode.com/mm2/level_info/${parsed}`
          })
          if (nfo?.error === 'Code corresponds to a maker') {
          // Maker code
            console.log(nfo.error)
            router.replace(`/smm2/maker/${formatCode(parsed)}/details`)
          } else if (nfo?.error) {
            error.value = nfo.error
          } else if (nfo) {
            info.value = nfo
            window.info = nfo
          }
        }
      } finally {
        refreshing.value = false
      }
    }

    watchEffect(async () => {
      try {
        if (!levelCode.value) return
        const parsed = stripCode(levelCode.value)
        if (!parsed) {
          // Invalid code
          console.log(`${levelCode.value} is not a valid code. Navigating home.`)
          router.push({
            path: '/',
            query: {
              code: levelCode.value
            }
          })
        } else if (isMakerCode(parsed)) {
          console.log(`${levelCode.value} is a maker code. Navigating to maker page.`)
          router.replace(`/smm2/maker/${formatCode(parsed)}/details`)
        } else if (isCourseCode(parsed)) {
          info.value = null
          translate.value.set(0, 0)
          scale.value = 1
          await Promise.all([
            refreshLevelInfo(),
            (async () => {
              if (levelCode.value === '000-000-000') {
                level.value = null
                return
              }
              level.value = null
              level.value = await openLevel(levelCode.value).catch(err => {
                gtag('event', 'exception', {
                  description: `TGRCode: ${err.message}`
                })
                if (err.message === 'Failed to fetch') {
                  console.error(err)
                  error.value = err
                  errorUrl.value = `https://tgrcode.com/mm2/level_data/${parsed}`
                } else {
                  console.log(err.message)
                  return Promise.reject(err)
                }
              })
              window.level = level.value
            })()
          ])

          levelLoaded.value = true
        } else {
          // Invalid code
          console.log(`${levelCode.value} is not a valid code. Navigating home.`)
          router.push({
            path: '/',
            query: {
              code: levelCode.value
            }
          })
        }
      } catch (err) {
        gtag('event', 'exception', {
          description: err.message
        })
        console.error(err)
        error.value = err
      }
    })

    const onClick = (ev) => {
      if (unloaded.value) return
      const sets = [
        [imgOverworld.value.$el, level.value.overworld.doors, imgOverworld.value.$el],
        [imgOverworld.value.$el, level.value.overworld.pipes, imgSubworld.value.$el],
        [imgSubworld.value.$el, level.value.subworld.doors, imgSubworld.value.$el],
        [imgSubworld.value.$el, level.value.subworld.pipes, imgOverworld.value.$el]
      ]

      for (const [img, objects, other] of sets) {
        const imgRect = img.getBoundingClientRect()
        if (ev.clientX >= imgRect.left && ev.clientX <= imgRect.right && ev.clientY >= imgRect.top && ev.clientY <= imgRect.bottom) {
          const x = (ev.clientX - imgRect.left) * (img.offsetWidth / imgRect.width)
          const y = (ev.clientY - imgRect.top) * (img.offsetHeight / imgRect.height)
          for (const obj of objects) {
            if (x >= obj.rect.left && x <= obj.rect.right && y >= obj.rect.top && y <= obj.rect.bottom) {
              const otherRect = other.getBoundingClientRect()
              const nextRect = new DOMRect(
                otherRect.left + obj.other.rect.left / (other.offsetWidth / otherRect.width),
                otherRect.top + obj.other.rect.top / (other.offsetHeight / otherRect.height),
                obj.other.rect.width / (other.offsetWidth / otherRect.width),
                obj.other.rect.height / (other.offsetHeight / otherRect.height)
              )
              focusRect(nextRect)
            }
          }
        }
      }
    }

    const center = (rect) => new Vector2((rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2)

    const focus = el => {
      if (el.$el) el = el.$el
      const stuffRect = stuff.value.getBoundingClientRect()
      const stuffCenter = center(stuffRect)
      const elRect = el.getBoundingClientRect()
      const elCenter = new Vector2((elRect.left + elRect.right) / 2, (elRect.top + elRect.bottom) / 2).multiplyScalar(1 / scale.value)
      const movement = new Vector2(
        (stuffCenter.x / scale.value - elCenter.x),
        (stuffCenter.y / scale.value - elCenter.y)
      ).multiplyScalar(scale.value)
      translate.value.add(movement)
    }
    const focusRect = rect => {
      const stuffRect = stuff.value.getBoundingClientRect()
      const stuffCenter = center(stuffRect)
      const elCenter = new Vector2((rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2).multiplyScalar(1 / scale.value)
      const movement = new Vector2(
        (stuffCenter.x / scale.value - elCenter.x),
        (stuffCenter.y / scale.value - elCenter.y)
      ).multiplyScalar(scale.value)
      translate.value.add(movement)
    }

    const backgroundColor = gameStyle => {
      switch (gameStyle) {
        case 'Overworld': return '#7686ff'
        case 'Underground': return '#111111'
        case 'Castle': return '#111111'
        case 'Airship': return '#7686ff'
        case 'Underwater': return '#2039ed'
        case 'Ghost': return '#111111'
        case 'Snow': return '#7686ff'
        case 'Desert': return '#e6d0a9'
        case 'Sky': return '#7686ff'
        case 'Forest': return '#012700'
        default: return '#000000'
      }
    }

    const googleTranslate = text => {
      const url = new URL('https://translate.google.com/?sl=auto&tl=en&text=input&op=translate')
      url.searchParams.set('sl', 'auto')
      url.searchParams.set('tl', 'en')
      url.searchParams.set('text', text)
      url.searchParams.set('op', 'translate')
      return url.toString()
    }

    const styleFn = offset => ({
      minHeight: offset ? `calc(100vh - ${offset}px)` : '100vh',
      maxHeight: offset ? `calc(100vh - ${offset}px)` : '100vh',
      height: offset ? `calc(100vh - ${offset}px)` : '100vh'
    })

    const exists = (category) => true
    const showing = reactive({
      ...Object.fromEntries(zOrder.map(c => [c, true])),
      Grid: (localStorage.getItem('showGrid') ?? 'false') === 'true',
      Hidden: (localStorage.getItem('showHidden') ?? 'false') === 'true',
      Xray: (localStorage.getItem('showXray') ?? 'false') === 'true',
      LiquidLevels: (localStorage.getItem('showLiquid') ?? 'true') === 'true',
      LiquidAnimation: (localStorage.getItem('showLiquidAnimation') ?? 'true') === 'true'
    })

    watch(() => showing, (val) => {
      localStorage.setItem('showGrid', val.Grid)
      localStorage.setItem('showHidden', val.Hidden)
      localStorage.setItem('showXray', val.Xray)
      localStorage.setItem('showLiquid', val.LiquidLevels)
      localStorage.setItem('showLiquidAnimation', val.LiquidAnimation)
    }, { deep: true })

    const having = reactive(Object.fromEntries(zOrder.map(c => [c, false])))

    const has = (category) => {
      having[category] = true
    }

    const showingSet = computed(() => new Set(
      Object.entries(showing).filter(([k, v]) => v).map(([k, v]) => k))
    )

    const saveOverworld = () => imgOverworld.value.save(`${formatCode(levelCode.value)}_overworld.png`)
    const saveSubworld = () => imgSubworld.value.save(`${formatCode(levelCode.value)}_subworld.png`)

    return {
      formatDate,
      styleFn,
      showFooter,
      error,
      imgOverworld,
      imgSubworld,
      level,
      formatCode,
      levelCode,
      route,
      router,
      stuff,
      stuffStyle,
      focus,
      shoePrints,
      heartCrack,
      info,
      heart,
      uploaded,
      flagCheckered,
      stopwatch,
      addressCard,
      userHeadset,
      faceGrinBeam,
      faceSmile,
      faceTired,
      skull,
      tag,
      backgroundColor,
      pointers,
      importAsset,
      showMore,
      errorUrl,
      toggleFullscreen,
      isFullscreen,
      googleTranslate,
      googleTranslateIcon,
      loadingText,
      exists,
      showing,
      showingSet,
      scale,
      having,
      has,
      saveOverworld,
      saveSubworld,
      refreshLevelInfo,
      refreshing,
      zOrder
    }
  }
}
</script>
<template>
  <q-page class="flex column position-relative" :style-fn="styleFn">
    <div
      ref="stuff"
      class="no-scroll"
      style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow: hidden;"
      :class="{hidden: error || !level || !levelCode}"
    >
      <div :style="stuffStyle" v-if="level && levelCode">
        <div>
          <div class="info-panel">
            <div class="text-h3 mario-maker">{{formatCode(levelCode)}}</div>
            <div class="text-h5 mario-maker"><a :href="googleTranslate(`${level.name}\n${level.description}`)" target="translate"><img :src="googleTranslateIcon" width="24" height="24" /><q-tooltip>Translate</q-tooltip></a> {{level.name}}</div>
            <div v-if="info">
              <span v-if="info.difficulty === 0" class="icon-16 q-mr-sm" v-html="faceGrinBeam" />
              <span v-else-if="info.difficulty === 1" class="icon-16 q-mr-sm" v-html="faceSmile" />
              <span v-else-if="info.difficulty === 2" class="icon-16 q-mr-sm" v-html="faceTired" />
              <span v-else-if="info.difficulty === 3" class="icon-16 q-mr-sm" v-html="skull" />
              <span class="mario-maker">{{info.difficulty_name}}</span>
              <span v-for="(tagName, i) in info.tags_name" :key="i">
                &nbsp;&nbsp;
                <span class="icon-16 q-mr-sm" v-html="tag" />
                <span class="mario-maker">{{tagName}}</span>
              </span>
            </div>
            <p class="mario-maker" v-if="level.description">{{level.description}}</p>
            <p class="mario-maker" v-if="level.clear_condition !== 'None'">Clear Condition: {{level.clear_condition}}</p>
          </div>
          <div class="info-panel q-pt-sm" v-if="info && ($q.screen.gt.sm || showMore)">
            <div v-if="info.uploader">
              <Maker v-model="info.uploader" />
            </div>
            <span>
              <span class="icon-16 q-mr-sm" v-html="userHeadset" />
              <span class="mario-maker text-h6">{{info.plays}}</span>
              <q-tooltip>Plays</q-tooltip>
            </span>
            &nbsp;&nbsp;
            <span>
              <span class="icon-16 q-mr-sm" style="color: #EE0011" v-html="heart" />
              <span class="mario-maker text-h6">{{info.likes}}</span>
              <q-tooltip>Likes</q-tooltip>
            </span>
            &nbsp;&nbsp;
            <span>
              <span class="icon-16 q-mr-sm" style="color: #EE11EE" v-html="heartCrack" />
              <span class="mario-maker text-h6">{{info.boos}}</span>
              <q-tooltip>Boos</q-tooltip>
            </span>
            <br />
            <span>
              <span class="icon-16 q-mr-sm" v-html="flagCheckered" />
              <span class="mario-maker text-h6">{{info.clears}}</span>
              <q-tooltip>Clears</q-tooltip>
            </span>
            &nbsp;&nbsp;
            <span>
              <span class="icon-16 q-mr-sm" v-html="shoePrints" />
              <span class="mario-maker text-h6">{{info.attempts}}</span>
              <q-tooltip>Attempts</q-tooltip>
            </span>
            &nbsp;&nbsp;
            <span class="mario-maker text-h6">
              {{(info.clear_rate_pretty || info.clear_rate)}}
              <q-tooltip>Clear Rate</q-tooltip>
            </span>
            <br />
            <span>
              <span class="icon-16 q-mr-sm" v-html="stopwatch" />
              <span class="mario-maker text-h6">{{info.upload_time_pretty}}</span>
              <q-tooltip>Clear Time</q-tooltip>
            </span>
            <br />
            <span>
              <span class="icon-16 q-mr-sm" v-html="uploaded" />
              <span class="mario-maker text-h6">{{formatDate(info.uploaded)}}</span>
              <q-tooltip>Uploaded Date</q-tooltip>
            </span>

          </div>
          <div class="info-panel q-pt-sm" v-if="info?.record_holder && ($q.screen.gt.sm || showMore)">
            <div class="mario-maker">World Record</div>
            <Maker v-model="info.record_holder">
              <span>
                <span class="icon-16 q-mr-sm" v-html="stopwatch" />
                <span class="mario-maker text-h6">{{info.world_record_pretty}}</span>
                <q-tooltip>World Record</q-tooltip>
              </span>
            </Maker>
          </div>
          <div class="info-panel q-pt-sm" v-if="info?.first_completer && ($q.screen.gt.sm || showMore)">
            <div class="mario-maker">First Clear</div>
            <Maker v-model="info.first_completer" />
          </div>
        </div>
        <section class="q-gutter-sm">
          <q-checkbox dense color="grey-8" v-model="showing.Grid" label="Grid">
            <q-tooltip>
              Shows or hides the grid. Press 'G' to toggle.
            </q-tooltip>
          </q-checkbox>
          <q-checkbox dense color="grey-8" v-model="showing.Hidden" label="Hidden">
            <q-tooltip>
              Reveals hidden objects. Press 'H' to toggle.
            </q-tooltip>
          </q-checkbox>
          <!-- <q-checkbox dense color="grey-8" v-model="showing.Xray" label="X-Ray">
            <q-tooltip>
              Reverse render order. Press 'X' to toggle.
            </q-tooltip>
          </q-checkbox> -->
          <q-btn size="sm" glossy color="grey-10" no-caps label="Advanced" icon-right="arrow_drop_down" dense>
            <q-menu>
              <q-list dense>
                <q-item dense clickable @click="refreshLevelInfo(true)" v-close-popup>
                  <q-item-section side>
                    <q-icon name="refresh" />
                  </q-item-section>
                  <q-item-section>
                    Refresh Level Info
                  </q-item-section>
                  <q-inner-loading :showing="refreshing" />
                </q-item>
                <q-item dense clickable>
                  <q-item-section>Toggle Blocks</q-item-section>
                  <q-item-section side>
                    <q-icon name="keyboard_arrow_right" />
                  </q-item-section>
                  <q-menu anchor="top end" self="top start">
                    <q-list dense>
                      <q-item v-for="c in zOrder" :key="c" dense>
                        <q-checkbox color="grey-8" v-model="showing[c]" :label="c" />
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-item>
                <q-item dense>
                  <q-item-section>
                    <q-checkbox v-model="showing.LiquidAnimation" label="Liquid Animation" />
                    <q-checkbox v-model="showing.LiquidLevels" label="Liquid Levels" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn size="sm" @click="toggleFullscreen" glossy :icon="isFullscreen ? 'fullscreen_exit' :'fullscreen'" color="grey-10" no-caps label="Full screen" dense>
            <q-tooltip>
              Fullscreen mode for Twitch and YouTube (Hides the header and footer). Press 'F' to toggle.
            </q-tooltip>
          </q-btn>

          <q-btn size="sm" @click="saveOverworld" glossy icon="download" color="grey-10" no-caps label="Save Overworld" dense />
          <q-btn size="sm" @click="saveSubworld" glossy icon="download" color="grey-10" no-caps label="Save Subworld" dense />
        </section>

        <div class="q-px-sm" v-if="$q.screen.lt.md">
          <q-btn outline color="primary" class="full-width" @click="showMore = !showMore">
            {{ showMore ? 'Show less...' : 'Show more...' }}
          </q-btn>
        </div>
        <div style="position: relative" class="q-my-sm">
          <Tooltips :scale="scale || 1" :level="level" :world="level.overworld" :tile-set="level.overworld.tileSet" :quad-tree="level.overworld.quadTree" :dimensions="level.overworld.tileSetDimensions" :grid="level.overworld.tileGrid">
            <World ref="imgOverworld" :level="level" :world="level.overworld" :showing="showingSet" @has="has" :scale="scale" />
          </Tooltips>
        </div>
        <div style="position: relative" class="q-my-sm">
          <Tooltips :scale="scale || 1" :level="level" :world="level.subworld" :tile-set="level.subworld.tileSet" :quad-tree="level.subworld.quadTree" :dimensions="level.subworld.tileSetDimensions" :grid="level.subworld.tileGrid">
            <World ref="imgSubworld" :level="level" :world="level.subworld" :showing="showingSet" @has="has" :scale="scale" />
          </Tooltips>
        </div>
      </div>
    </div>
    <div v-if="error" class="text-center q-pt-xl">
      <q-card class="inline-block bg-negative">
        <q-card-section>
          <div class="text-h6">Error Retrieving Level</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <p>
            We were unable to retrieve the level. <br />
            Error message: <code>{{ error?.message || error }}</code><br />
            If you continue to encounter this error, please <a href="https://discord.gg/MdXD3hSuP5">join our Discord server</a> and
            #ask-for-help.
          </p>
          <!-- <p v-if="error === true">This is most likely because the <a href="https://tgrcode.com/mm2/docs/" class="link">TGRCode API</a> is down. Please <a :href="errorUrl" class="link">check there</a> for more information.</p>
          <p v-else style="white-space: pre-wrap">{{error}}</p> -->
        </q-card-section>
        <q-card-section>
          <q-btn to="/" color="primary">Take me home</q-btn>
        </q-card-section>
      </q-card>
    </div>
    <q-inner-loading :showing="!error && (!level || !levelCode)">
      <span v-html="loadingText" />
    </q-inner-loading>
  </q-page>
</template>
<style lang="scss" scoped>
  .info-panel {
    display: inline-block;
    vertical-align: top;
    margin-left: 5px;
    width: 375px;
    max-width: 100vw;
  }
  .fade-down {
    background-image: linear-gradient(#000F, #0000);
    margin-bottom: -50px;
  }
</style>
