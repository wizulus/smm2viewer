
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'Home Page', path: '', component: () => import('pages/Index.vue') },
      { name: 'Credits', path: 'credits', component: () => import('pages/Credits.vue') },
      { name: 'Thumbnail', path: 'thumbnail', component: () => import('pages/Thumbnail.vue') },
      { name: 'About', path: 'about', component: () => import('pages/Credits.vue') },
      {
        name: 'Level Viewer',
        path: '/smm2/level/:levelCode',
        component: () => import('pages/Smm2Level.vue')
      },
      {
        name: 'Course Viewer',
        path: '/smm2/course/:levelCode',
        component: () => import('pages/Smm2Level.vue')
      },
      {
        name: 'Legend',
        path: '/smm2/legend',
        component: () => import('pages/Legend.vue')
      },
      {
        name: 'Custom List',
        path: '/smm2/custom',
        component: () => import('pages/CustomList.vue')
      },
      {
        path: '/smm2/player/:makerCode/',
        component: () => import('pages/Smm2Maker.vue'),
        children: [
          { name: 'Player Details', path: 'details', component: () => import('pages/MakerDetails.vue') },
          { name: 'Player Uploaded Levels', path: 'uploaded-levels', component: () => import('pages/MakerUploadedLevels.vue') },
          { name: 'Player Uploaded Courses', path: 'uploaded-courses', component: () => import('pages/MakerUploadedLevels.vue') },
          { name: 'Player World Records', path: 'world-records', component: () => import('pages/MakerWorldRecords.vue') },
          { name: 'Player First Clears', path: 'first-clears', component: () => import('pages/MakerFirstClears.vue') },
          { name: 'Player Uncleared', path: 'uncleared', component: () => import('pages/MakerUncleared.vue') }
        ]
      },
      {
        path: '/smm2/maker/:makerCode/',
        component: () => import('pages/Smm2Maker.vue'),
        children: [
          { name: 'Maker Details', path: 'details', component: () => import('pages/MakerDetails.vue') },
          { name: 'Maker Uploaded Levels', path: 'uploaded-levels', component: () => import('pages/MakerUploadedLevels.vue') },
          { name: 'Maker Uploaded Courses', path: 'uploaded-courses', component: () => import('pages/MakerUploadedLevels.vue') },
          { name: 'Maker World Records', path: 'world-records', component: () => import('pages/MakerWorldRecords.vue') },
          { name: 'Maker First Clears', path: 'first-clears', component: () => import('pages/MakerFirstClears.vue') },
          { name: 'Maker Uncleared', path: 'uncleared', component: () => import('pages/MakerUncleared.vue') }
        ]
      }
    ]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
