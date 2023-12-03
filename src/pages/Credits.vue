<template>
  <q-page>
    <div class="flex q-pa-sm justify-center">
      <div style="max-width: 400px;">
        <p>
          Thank you for coming to this page to learn more about this app.
        </p>

        <p>
          This app is built with Vue, Quasar, and Node.js. The app depends wholly on TheGreatRambler's API.
          Parsing and rendering of levels is done on the client using TheGreatRambler's Toost library, which
          is based on JiXiaomai's original level viewer.
        </p>

        <p>
          None of us have done this for profit, but we are paying for resources out of our own pocket.
          If you would like to support us, please see the donation links below.
          If you have any questions, comments, or bugs to report, please <a target="_blank" href="https://discord.gg/MdXD3hSuP5">contact me on Discord.</a>
        </p>

        <p>Thank you!<br />-𝒲𝔦𝓏𝔲𝔩𝔲𝔰 ℜ𝔢𝔡𝔦k𝔲𝔩𝔲𝔰</p>

        <h5>Credits</h5>
        <ul>
          <li><div style="overflow: auto"><strong>Wizulus Redikulus</strong> - UI and App <div style="float: right;">(Donate: <a href="https://www.buymeacoffee.com/wizulus">☕ Buy Me a Coffee</a>)</div></div></li>
          <li>
            <strong>TheGreatRambler</strong> - API and Transcoding (Donate: <a href="https://ko-fi.com/thegreatrambler">Ko-fi</a>)<br />
            <em>With help from:</em>
            <ul>
              <li>Tatiaus</li>
              <li>Gible_V</li>
              <li>Funnier04</li>
              <li>Warspyking</li>
              <li>AppleSinger</li>
              <li>T04Dw</li>
            </ul>
          </li>
          <li><strong>JiXiaomai</strong> - Level Decoder (<a href="https://github.com/JiXiaomai">GitHub</a>)</li>
        </ul>

        <h5>Change Log</h5>

        <p><em>2023-02-06</em></p>
        <ul>
          <li>Strictly enforce Course IDs vs. Player IDs.</li>
          <li>Course ID entry will now route directly to a course for a course code, directly to a player for a player code, or display a brief error otherwise.</li>
        </ul>

        <p><em>2023-01-08</em></p>
        <ul>
          <li>Fixed render order for icicles, on-off blocks, and ice coins. (<a href="/smm2/level/0QWBRPRFF">0QW-BRP-RFF</a>)</li>
          <li>Added upload date to level info.</li>
          <li>Fixed Refresh Level Info.</li>
          <li>Improved Upload Date display on courses.</li>
          <li>Reduced thumbnail loading API usage.</li>
          <li>Added way more loading messages from Discord.</li>
        </ul>

        <p><em>2022-12-21</em></p>
        <ul>
          <li>Made Hidden vs. Not Hidden more dramatic, while preserving an opaque info layer.</li>
          <li>Fixed most slope rendering (<a href="/smm2/level/M2LP8W1YG">M2L-P8W-1YG</a>) </li>
          <li>Added hotkey hints to tooltip.</li>
          <li>Defaulting Grid and Hidden to off because it looks horrible on Twitch and YouTube.</li>
          <li>Fixed Discord link occluding Open button on home page.</li>
        </ul>

        <p><em>2022-12-14</em></p>
        <ul>
          <li>Improved render order for all objects (<a href="/smm2/level/WXY3505GF">WXY-350-5GF</a>)</li>
          <li>Fixed semi-solid rendering order (<a href="/smm2/level/FGD3L3PJF">FGD-3L3-PJF</a>)</li>
          <li>Added <code>G</code>, <code>H</code>, and <code>F</code> hotkeys for Grid, Hidden, and Full-screen.</li>
          <li>Save Grid and Hidden preferences to browser.</li>
          <li>Revamped hidden block rendering.</li>
        </ul>

        <p><em>2022-12-07</em></p>
        <ul>
          <li>Added loading messages submitted on Discord.</li>
        </ul>

        <p><em>2022-12-06</em></p>
        <ul>
          <li>Fixed clear rate percentage with new API.</li>
          <li>Fixed subworlds not rendering when everything was off to the right (<a href="/smm2/level/JT5JYJ4TF">JT5-JYJ-4TF</a>)</li>
          <li>Added Advanced -> Refresh Level Info.</li>
          <li>Moved Toggle Blocks into Advanced menu.</li>
        </ul>

        <p><em>2022-11-28</em></p>
        <ul>
          <li>Added drawbridge tiles, and chain decor.</li>
        </ul>

        <p><em>2022-11-25</em></p>
        <ul>
          <li>Added the grid.</li>
          <li>Added layer toggles.</li>
          <li>Added hidden blocks toggle.</li>
          <li>Added full screen mode.</li>
          <li>Zoom will snap to 1:1 as you scroll by it.</li>
          <li>Discord banner will hide when the level loads.</li>
        </ul>

        <p><em>2022-11-24</em></p>
        <ul>
          <li>Fixed vertical alignment of vines.</li>
          <li>Fixed vertical alignment of bridges.</li>
          <li>Fixed alignment of 3D world semi-solids.</li>
          <li>Fixed alignment of Pokeys.</li>
          <li>Fixed appearance of Snow Pokeys.</li>
          <li>Moved One-Way Walls behind terrain.</li>
          <li>Fixed search form on home page so pressing enter will search.</li>
          <li>Fixed duplicate ground tiles appearing in tool tips.</li>
          <li>Modified render order so that objects hidden by ground would be revealed.</li>
        </ul>

        <p><em>2022-08-21</em></p>
        <ul>
          <li>Added keyboard navigation (arrow keys, numpad keys to pan, + / - to zoom).</li>
          <li>Added site footer.</li>
          <li>Hide site header and footer when zoomed in.</li>
          <li>Fixed search form on home page so pressing enter will search.</li>
        </ul>

        <p><em>2022-08-20</em></p>
        <ul>
          <li>Added a MakerCentral search form to the <router-link to="/">home page.</router-link></li>
          <li>Corrected rendering of ground blocks that sometimes left a blank space.</li>
          <li>In SMW, moved the first goal post to the background, and moved the second post to the foreground with 50% opacity so you can see blocks hidden behind it.</li>
          <li>Fixed zooming for Firefox so you can scroll with your mouse wheel to zoom in and out.</li>
          <li>Added loading text for cases where the API would take a while to respond.</li>
          <li>In collaboration with TheGreatRambler, greatly improved the loading time for levels.</li>
        </ul>

      </div>
    </div>
  </q-page>
</template>
