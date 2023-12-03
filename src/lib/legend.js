/** @typedef {{id:string,name:string,category:string}} Obj */

export const zOrder = [
  'Grid',
  'Info',
  'Foreground',
  'Contained Item',
  'Character',
  'Item',
  'Powerup',
  'Fire Bar',
  'Burner',
  'Snake Block',
  'Checkpoint Flag',
  'Swinging Claw',
  'Gizmo', // Catch-all for all other gizmos
  'Lift', // 'Lift', 'Seesaw', 'Lava Lift'
  'Skewer',
  'Grinder',
  'Bumper',
  'Track',
  'Conveyor',
  'Fixture',
  'Pipe',
  'Block',
  'On-Off',
  'Ground',
  'Coin',
  'Icicle',
  'Vine',
  'Axe',
  'Door',
  'Bridge',
  'One-Way',
  'Tree',
  'Drawbridge',
  'Semisolid',
  'Decor',
  'Background'
]

/** @type {Record<string,Obj>} */
export const legend = {
  A0: {
    name: 'Red Left Arrow',
    category: 'Info'
  },
  A1: {
    name: 'Red Right Arrow',
    category: 'Info'
  },
  A2: {
    name: 'Fast Blue Left Arrow',
    category: 'Info'
  },
  A3: {
    name: 'Fast Blue Right Arrow',
    category: 'Info'
  },
  B: {
    name: 'Parachute and Wings',
    category: 'Info'
  },
  B0: {
    name: 'Rotate Counter-Clockwise',
    category: 'Info'
  },
  B1: {
    name: 'Rotate Clockwise',
    category: 'Info'
  },
  C0: {
    name: 'Portal A',
    category: 'Info'
  },
  C1: {
    name: 'Portal B',
    category: 'Info'
  },
  C2: {
    name: 'Portal C',
    category: 'Info'
  },
  C3: {
    name: 'Portal D',
    category: 'Info'
  },
  C4: {
    name: 'Portal E',
    category: 'Info'
  },
  C5: {
    name: 'Portal F',
    category: 'Info'
  },
  C6: {
    name: 'Portal G',
    category: 'Info'
  },
  C7: {
    name: 'Portal H',
    category: 'Info'
  },
  C8: {
    name: 'Portal J',
    category: 'Info'
  },
  C9: {
    name: 'Portal K',
    category: 'Info'
  },
  D0: {
    name: 'Red Right Arrow',
    category: 'Info'
  },
  D1: {
    name: 'Red Left Arrow',
    category: 'Info'
  },
  D2: {
    name: 'Red Up Arrow',
    category: 'Info'
  },
  D3: {
    name: 'Red Down Arrow',
    category: 'Info'
  },
  E0: {
    name: 'Green Right Arrow',
    category: 'Info'
  },
  E1: {
    name: 'Green Left Arrow',
    category: 'Info'
  },
  E2: {
    name: 'Green Up Arrow',
    category: 'Info'
  },
  E3: {
    name: 'Green Down Arrow',
    category: 'Info'
  },
  F0: {
    name: 'Container Indicator',
    category: 'Info'
  },
  F1: {
    name: 'Container Indicator',
    category: 'Info'
  },
  G0: {
    name: 'Large arrow',
    category: 'Info'
  },
  JA: {
    name: 'Portal A',
    category: 'Info'
  },
  JB: {
    name: 'Portal B',
    category: 'Info'
  },
  JC: {
    name: 'Portal C',
    category: 'Info'
  },
  JD: {
    name: 'Portal D',
    category: 'Info'
  },
  JE: {
    name: 'Portal E',
    category: 'Info'
  },
  JF: {
    name: 'Portal F',
    category: 'Info'
  },
  JG: {
    name: 'Portal G',
    category: 'Info'
  },
  JH: {
    name: 'Portal H',
    category: 'Info'
  },
  JI: {
    name: 'Portal I',
    category: 'Info'
  },
  JJ: {
    name: 'Portal J',
    category: 'Info'
  },
  JK: {
    name: 'Portal K',
    category: 'Info'
  },
  JM: {
    name: 'Progressive Powerup',
    category: 'Info'
  },
  JP: {
    name: 'Parachute',
    category: 'Info'
  },
  JW: {
    name: 'Wings',
    category: 'Info'
  },
  M: {
    name: 'Mushroom',
    category: 'Info'
  },
  P: {
    name: 'Parachute',
    category: 'Info'
  },
  SD: {
    name: 'Snake Down Arrow',
    category: 'Info'
  },
  SDL: {
    name: 'Snale Up Left Arrow',
    category: 'Info'
  },
  SDR: {
    name: 'Snake Up Right Arrow',
    category: 'Info'
  },
  SL: {
    name: 'Snake Left Arrow',
    category: 'Info'
  },
  SR: {
    name: 'Snake Right Arrow',
    category: 'Info'
  },
  SU: {
    name: 'Snake Up Arrow',
    category: 'Info'
  },
  SE: {
    name: 'Snake End',
    category: 'Info'
  },
  SLD: {
    name: 'Snake Right Down Arrow',
    category: 'Info'
  },
  SLU: {
    name: 'Snake Right Up Arrow',
    category: 'Info'
  },
  SRD: {
    name: 'Snake Left Down Arrow',
    category: 'Info'
  },
  SRU: {
    name: 'Snake Left Up Arrow',
    category: 'Info'
  },
  SUL: {
    name: 'Snake Down Left Arrow',
    category: 'Info'
  },
  SUR: {
    name: 'Snake Down Right Arrow',
    category: 'Info'
  },
  W: {
    name: 'Wings',
    category: 'Info'
  },
  SS: {
    name: 'Snake Path',
    category: 'Info'
  },
  0: {
    name: 'Goomba',
    category: 'Character'
  },
  1: {
    name: 'Koopa Troopa',
    category: 'Character'
  },
  2: {
    name: 'Piranha Plant',
    category: 'Character'
  },
  3: {
    name: 'Hammer Bro',
    category: 'Character'
  },
  4: {
    name: 'Brick Block',
    category: 'Block'
  },
  5: {
    name: '? Block',
    category: 'Block'
  },
  6: {
    name: 'Hard Block',
    category: 'Block'
  },
  7: {
    name: 'Ground',
    category: 'Ground'
  },
  8: {
    name: 'Coin',
    category: 'Item',
    group: 'Coin'
  },
  10: {
    name: 'Trampoline',
    category: 'Item'
  },
  11: {
    name: 'Lift',
    category: 'Gizmo',
    group: 'Lift'
  },
  12: {
    name: 'Thwomp',
    category: 'Character'
  },
  13: {
    name: 'Bill Blaster',
    category: 'Gizmo'
  },
  14: {
    name: 'Mushroom Platform',
    category: 'Semisolid'
  },
  15: {
    name: 'Bob-omb',
    category: 'Character'
  },
  16: {
    name: 'Semisolid Platform',
    category: 'Semisolid'
  },
  17: {
    name: 'Bridge',
    category: 'Semisolid'
  },
  18: {
    name: 'P Switch',
    category: 'Item'
  },
  19: {
    name: 'POW Block',
    category: 'Item'
  },
  20: {
    name: 'Super Mushroom',
    category: 'Item'
  },
  21: {
    name: 'Donut Block',
    category: 'Block'
  },
  22: {
    name: 'Cloud Block',
    category: 'Block'
  },
  23: {
    name: 'Note Block',
    category: 'Block'
  },
  24: {
    name: 'Fire Bar',
    category: 'Gizmo',
    group: 'Fire Bar'
  },
  25: {
    name: 'Spiny',
    category: 'Character'
  },
  26: {
    name: 'Hard Block',
    category: 'Block'
  },
  27: {
    name: 'Flag Pole',
    category: 'Ground'
  },
  '27F': {
    name: 'Goal Pole Back',
    category: 'Background'
  },
  '27G': {
    name: 'Goal Pole Front',
    category: 'Foreground'
  },
  28: {
    name: 'Buzzy Beetle',
    category: 'Character'
  },
  29: {
    name: 'Hidden Block',
    category: 'Block'
  },
  30: {
    name: 'Lakitu',
    category: 'Character'
  },
  31: {
    name: "Lakitu's Cloud",
    category: 'Character'
  },
  32: {
    name: 'Banzai Bill',
    category: 'Character'
  },
  33: {
    name: '1-Up Mushroom',
    category: 'Item'
  },
  34: {
    name: 'Fire Flower',
    category: 'Item'
  },
  35: {
    name: 'Super Star',
    category: 'Item'
  },
  36: {
    name: 'Lava Lift',
    category: 'Gizmo',
    group: 'Lift'
  },
  38: {
    name: 'Start Arrow Sign',
    category: 'Decor'
  },
  39: {
    name: 'Magikoopa',
    category: 'Character'
  },
  40: {
    name: 'Spike Top',
    category: 'Character'
  },
  41: {
    name: 'Boo',
    category: 'Character'
  },
  42: {
    name: 'Koopa Clown Car',
    category: 'Gizmo'
  },
  43: {
    name: 'Spike Trap',
    category: 'Ground'
  },
  44: {
    name: 'Big Mushroom',
    category: 'Item'
  },
  45: {
    name: 'Shoe Goomba',
    category: 'Character'
  },
  46: {
    name: 'Dry Bones',
    category: 'Character'
  },
  47: {
    name: 'Cannon',
    category: 'Gizmo'
  },
  48: {
    name: 'Blooper',
    category: 'Character'
  },
  49: {
    name: 'Castle Bridge',
    category: 'Ground'
  },
  50: {
    name: 'Hop-Chops',
    category: 'Character'
  },
  51: {
    name: 'Skipsqueak',
    category: 'Character'
  },
  52: {
    name: 'Wiggler',
    category: 'Character'
  },
  53: {
    name: 'Conveyor Belt',
    category: 'Gizmo',
    group: 'Conveyor'
  },
  54: {
    name: 'Burner',
    category: 'Gizmo',
    group: 'Burner'
  },
  55: {
    name: 'Warp Door',
    category: 'Fixture',
    group: 'Door'
  },
  56: {
    name: 'Cheep Cheep',
    category: 'Character'
  },
  57: {
    name: 'Muncher',
    category: 'Character'
  },
  58: {
    name: 'Rocky Wrench',
    category: 'Character'
  },
  59: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  60: {
    name: 'Lava Bubble',
    category: 'Character'
  },
  61: {
    name: 'Chain Chomp',
    category: 'Character'
  },
  62: {
    name: 'Bowser',
    category: 'Character'
  },
  63: {
    name: 'Ice Block',
    category: 'Block'
  },
  64: {
    name: 'Vine',
    category: 'Gizmo',
    group: 'Vine'
  },
  65: {
    name: 'Stingby',
    category: 'Character'
  },
  66: {
    name: 'Arrow Sign',
    category: 'Decor'
  },
  67: {
    name: 'One-Way Wall',
    category: 'One-Way'
  },
  68: {
    name: 'Grinder',
    category: 'Gizmo',
    group: 'Grinder'
  },
  70: {
    name: '10-Coin',
    category: 'Item',
    group: 'Coin'
  },
  71: {
    name: 'Semisolid Platform',
    category: 'Semisolid'
  },
  '71A': {
    name: 'Semisolid Platform',
    category: 'Semisolid'
  },
  '71B': {
    name: 'Semisolid Platform',
    category: 'Semisolid'
  },
  '71C': {
    name: 'Semisolid Platform',
    category: 'Semisolid'
  },
  '71D': {
    name: 'Semisolid Platform',
    category: 'Semisolid'
  },
  '71E': {
    name: 'Semisolid Platform',
    category: 'Semisolid'
  },
  '71F': {
    name: 'Semisolid Platform',
    category: 'Semisolid'
  },
  '71G': {
    name: 'Semisolid Platform',
    category: 'Semisolid'
  },
  '71H': {
    name: 'Semisolid Platform',
    category: 'Semisolid'
  },
  72: {
    name: 'Koopa Troopa Car',
    category: 'Character'
  },
  74: {
    name: 'Spike',
    category: 'Character'
  },
  76: {
    name: 'Twister',
    category: 'Character'
  },
  77: {
    name: 'Boom Boom',
    category: 'Character'
  },
  78: {
    name: 'Pokey',
    category: 'Character'
  },
  79: {
    name: 'P Block',
    category: 'Block'
  },
  80: {
    name: 'Dash Block',
    category: 'Gizmo',
    group: 'Conveyor'
  },
  81: {
    name: 'SMB2 Mushroom',
    category: 'Item'
  },
  82: {
    name: 'Bumper',
    category: 'Gizmo',
    group: 'Bumper'
  },
  83: {
    name: 'Skewer',
    category: 'Gizmo',
    group: 'Skewer'
  },
  84: {
    name: 'Snake Block',
    category: 'Gizmo',
    group: 'Snake Block'
  },
  85: {
    name: 'Track Block',
    category: 'Gizmo'
  },
  86: {
    name: 'Charvaargh',
    category: 'Character'
  },
  87: {
    name: 'Gentle Slope',
    category: 'Ground'
  },
  88: {
    name: 'Steep Slope',
    category: 'Ground'
  },
  89: {
    name: 'Screen Scroll',
    category: 'Info'
  },
  90: {
    name: 'Checkpoint Flag',
    category: 'Fixture',
    group: 'Checkpoint Flag'
  },
  91: {
    name: 'Seesaw',
    category: 'Gizmo'
  },
  92: {
    name: 'Red Coin',
    category: 'Item',
    group: 'Coin'
  },
  93: {
    name: 'Clear Pipe',
    category: 'Fixture',
    group: 'Pipe'
  },
  95: {
    name: 'Key',
    category: 'Item'
  },
  96: {
    name: 'Ant Trooper',
    category: 'Character'
  },
  97: {
    name: 'Warp Box',
    category: 'Fixture',
    group: 'Door'
  },
  98: {
    name: 'Bowser Jr.',
    category: 'Character'
  },
  99: {
    name: 'ON/OFF Switch',
    category: 'Gizmo'
  },
  100: {
    name: 'Dotted-Line Block',
    category: 'Gizmo'
  },
  102: {
    name: 'Monty Mole',
    category: 'Character'
  },
  103: {
    name: 'Fish Bone',
    category: 'Character'
  },
  104: {
    name: 'Angry Sun',
    category: 'Character'
  },
  105: {
    name: 'Swinging Claw',
    category: 'Gizmo',
    group: 'Swinging Claw'
  },
  106: {
    name: 'Tree',
    category: 'Gizmo',
    group: 'Tree'
  },
  107: {
    name: 'Piranha Creeper',
    category: 'Character'
  },
  108: {
    name: 'Blinking Block',
    category: 'Gizmo'
  },
  110: {
    name: 'Spike Block',
    category: 'Block'
  },
  111: {
    name: 'Mechakoopa',
    category: 'Character'
  },
  112: {
    name: 'Crate',
    category: 'Item'
  },
  113: {
    name: 'Mushroom Trampoline',
    category: 'Semisolid',
    group: 'Lift'
  },
  114: {
    name: 'Purcupuffer',
    category: 'Character'
  },
  116: {
    name: 'Super Hammer',
    category: 'Item'
  },
  117: {
    name: 'Bully',
    category: 'Character'
  },
  118: {
    name: 'Icicle',
    category: 'Gizmo',
    group: 'Icicle'
  },
  119: {
    name: '! Block',
    category: 'Gizmo'
  },
  120: {
    name: 'Lemmy',
    category: 'Character'
  },
  121: {
    name: 'Morton',
    category: 'Character'
  },
  122: {
    name: 'Larry',
    category: 'Character'
  },
  123: {
    name: 'Wendy',
    category: 'Character'
  },
  124: {
    name: 'Iggy',
    category: 'Character'
  },
  125: {
    name: 'Roy',
    category: 'Character'
  },
  126: {
    name: 'Ludwig',
    category: 'Character'
  },
  127: {
    name: 'Cannon Box',
    category: 'Item'
  },
  128: {
    name: 'Propeller Box',
    category: 'Item'
  },
  129: {
    name: 'Goomba Mask',
    category: 'Item'
  },
  130: {
    name: 'Bullet Bill Mask',
    category: 'Item'
  },
  131: {
    name: 'Red POW Box',
    category: 'Item'
  },
  132: {
    name: 'ON/OFF Trampoline',
    category: 'Gizmo',
    group: 'Lift'
  },
  '107A': {
    name: 'Piranha Creeper',
    category: 'Character'
  },
  '70A': {
    name: '30-Coin',
    category: 'Item',
    group: 'Coin'
  },
  '70B': {
    name: '50-Coin',
    category: 'Item',
    group: 'Coin'
  },
  '52A': {
    name: 'Angry Wiggler',
    category: 'Character'
  },
  '96A': {
    name: 'Ant Trooper',
    category: 'Character'
  },
  '66E': {
    name: 'Arrow Sign',
    category: 'Decor'
  },
  '66C': {
    name: 'Arrow Sign',
    category: 'Decor'
  },
  '66D': {
    name: 'Arrow Sign',
    category: 'Decor'
  },
  '66G': {
    name: 'Arrow Sign',
    category: 'Decor'
  },
  '66A': {
    name: 'Arrow Sign',
    category: 'Decor'
  },
  '66F': {
    name: 'Arrow Sign',
    category: 'Decor'
  },
  '66B': {
    name: 'Arrow Sign',
    category: 'Decor'
  },
  '27A': {
    name: 'Axe',
    category: 'Fixture',
    group: 'Axe'
  },
  '32A': {
    name: "Bull's-Eye Banzai",
    category: 'Character'
  },
  '32B': {
    name: 'Banzai Bill',
    category: 'Character'
  },
  '32C': {
    name: 'Banzai Bill',
    category: 'Character'
  },
  '32H': {
    name: 'Banzai Bill',
    category: 'Character'
  },
  '44A': {
    name: 'Big Mushroom',
    category: 'Item'
  },
  '13A': {
    name: 'Bill Blaster',
    category: 'Gizmo'
  },
  '13B': {
    name: 'Bill Blaster',
    category: 'Gizmo'
  },
  '13C': {
    name: 'Bill Blaster',
    category: 'Gizmo'
  },
  '111B': {
    name: 'Zappa Mechakoopa',
    category: 'Character'
  },
  '111A': {
    name: 'Zappa Mechakoopa',
    category: 'Character'
  },
  '108A': {
    name: 'Blinking Block',
    category: 'Gizmo'
  },
  '48A': {
    name: 'Blooper Nanny',
    category: 'Character'
  },
  '41A': {
    name: 'Boo Buddies',
    category: 'Character'
  },
  '81J': {
    name: 'Boomerang Flower',
    category: 'Item'
  },
  '81H': {
    name: 'Boomerang Flower',
    category: 'Item'
  },
  '62A': {
    name: 'Bowser',
    category: 'Character'
  },
  '32E': {
    name: "Bull's-Eye Banzai",
    category: 'Character'
  },
  '32D': {
    name: "Bull's-Eye Banzai",
    category: 'Character'
  },
  '32F': {
    name: "Bull's-Eye Banzai",
    category: 'Character'
  },
  '32G': {
    name: "Bull's-Eye Banzai",
    category: 'Character'
  },
  '54A6': {
    name: 'Burner',
    category: 'Gizmo',
    type: 'Burner'
  },
  '54C': {
    name: 'Burner',
    category: 'Gizmo',
    group: 'Burner'
  },
  '54B': {
    name: 'Burner',
    category: 'Gizmo',
    group: 'Burner'
  },
  '54A3': {
    name: 'Burner',
    category: 'Gizmo',
    group: 'Burner'
  },
  '54A1': {
    name: 'Burner',
    category: 'Gizmo',
    group: 'Burner'
  },
  '54A7': {
    name: 'Burner',
    category: 'Gizmo',
    group: 'Burner'
  },
  '54A8': {
    name: 'Burner',
    category: 'Gizmo',
    group: 'Burner'
  },
  '54A4': {
    name: 'Burner',
    category: 'Gizmo',
    group: 'Burner'
  },
  '54A2': {
    name: 'Burner',
    category: 'Gizmo',
    group: 'Burner'
  },
  '54A': {
    name: 'Burner',
    category: 'Gizmo',
    group: 'Burner'
  },
  '54A5': {
    name: 'Burner',
    category: 'Gizmo',
    group: 'Burner'
  },
  '28B': {
    name: 'Buzzy Beetle',
    category: 'Character'
  },
  '28A': {
    name: 'Buzzy Beetle Shell',
    category: 'Item'
  },
  '47A': {
    name: 'Cannon',
    category: 'Gizmo'
  },
  '47C': {
    name: 'Cannon',
    category: 'Gizmo'
  },
  '47B': {
    name: 'Cannon',
    category: 'Gizmo'
  },
  '47EC': {
    name: 'Cannon',
    category: 'Gizmo'
  },
  '47E': {
    name: 'Cannon',
    category: 'Gizmo'
  },
  '47ED': {
    name: 'Cannon',
    category: 'Gizmo'
  },
  '47EA': {
    name: 'Cannon',
    category: 'Gizmo'
  },
  '47D': {
    name: 'Cannon',
    category: 'Gizmo'
  },
  '47EB': {
    name: 'Cannon',
    category: 'Gizmo'
  },
  '44D': {
    name: 'Cape Feather',
    category: 'Item'
  },
  '44E': {
    name: 'Cape Feather',
    category: 'Item'
  },
  '90B': {
    name: 'Checkpoint Flag',
    category: 'Fixture'
  },
  '90A': {
    name: 'Checkpoint Flag',
    category: 'Fixture'
  },
  '90C': {
    name: 'Checkpoint Flag',
    category: 'Fixture'
  },
  '56A': {
    name: 'Cheep Cheep',
    category: 'Character'
  },
  '61A': {
    name: 'Stump',
    category: 'Item'
  },
  '93C': {
    name: 'Clear Pipe',
    category: 'Fixture',
    group: 'Pipe'
  },
  '93A': {
    name: 'Clear Pipe',
    category: 'Fixture',
    group: 'Pipe'
  },
  '93J': {
    name: 'Clear Pipe',
    category: 'Fixture',
    group: 'Pipe'
  },
  '93B': {
    name: 'Clear Pipe',
    category: 'Fixture',
    group: 'Pipe'
  },
  '93D': {
    name: 'Clear Pipe',
    category: 'Fixture',
    group: 'Pipe'
  },
  '93E': {
    name: 'Clear Pipe',
    category: 'Fixture',
    group: 'Pipe'
  },
  '93F': {
    name: 'Clear Pipe',
    category: 'Fixture',
    group: 'Pipe'
  },
  '93G': {
    name: 'Clear Pipe',
    category: 'Fixture',
    group: 'Pipe'
  },
  '93H': {
    name: 'Clear Pipe',
    category: 'Fixture',
    group: 'Pipe'
  },
  '53C': {
    name: 'Conveyor Belt',
    category: 'Gizmo',
    group: 'Conveyor'
  },
  '95A': {
    name: 'Cursed Key',
    category: 'Item'
  },
  '100A': {
    name: 'Dotted-Line Block',
    category: 'Gizmo'
  },
  '46A': {
    name: 'Dry Bones Shell',
    category: 'Item'
  },
  '36A': {
    name: 'Fast Lava Lift',
    category: 'Gizmo',
    group: 'Lift'
  },
  '84A': {
    name: 'Fast Snake Block',
    category: 'Gizmo',
    group: 'Snake Block'
  },
  '24A': {
    name: 'Fire Bar',
    category: 'Gizmo',
    group: 'Fire Bar'
  },
  '3B': {
    name: 'Fire Bro',
    category: 'Character'
  },
  '34B': {
    name: 'Fire Flower',
    category: 'Item'
  },
  '42A': {
    name: 'Fire Koopa Clown Car',
    category: 'Gizmo'
  },
  '2B4': {
    name: 'Fire Piranha Plant',
    category: 'Character'
  },
  '2A': {
    name: 'Fire Piranha Plant',
    category: 'Character'
  },
  '2B0': {
    name: 'Fire Piranha Plant',
    category: 'Character'
  },
  '2B6': {
    name: 'Fire Piranha Plant',
    category: 'Character'
  },
  '2B2': {
    name: 'Fire Piranha Plant',
    category: 'Character'
  },
  '24B': {
    name: 'Fireball',
    category: 'Gizmo',
    group: 'Fire Bar'
  },
  '11A': {
    name: 'Lift',
    category: 'Gizmo',
    group: 'Lift'
  },
  '11D': {
    name: 'Flimsy Lift',
    category: 'Gizmo',
    group: 'Lift'
  },
  '11C': {
    name: 'Flimsy Lift',
    category: 'Gizmo',
    group: 'Lift'
  },
  '11E': {
    name: 'Flimsy Lift',
    category: 'Gizmo',
    group: 'Lift'
  },
  '81B': {
    name: 'Frog Suit',
    category: 'Item'
  },
  '81C': {
    name: 'Frog Suit',
    category: 'Item'
  },
  '4A': {
    name: 'Frozen Block',
    category: 'Block'
  },
  '8A': {
    name: 'Frozen Coin',
    category: 'Block',
    group: 'Coin'
  },
  '87A': {
    name: 'Gentle Slope',
    category: 'Ground'
  },
  '0A': {
    name: 'Goombrat',
    category: 'Character'
  },
  '3A': {
    name: 'Heavy Hammer Bro',
    category: 'Character'
  },
  '118A': {
    name: 'Icicle',
    category: 'Gizmo',
    group: 'Icicle'
  },
  '55B': {
    name: 'Key Door',
    category: 'Fixture',
    group: 'Door'
  },
  '1A': {
    name: 'Koopa Troopa',
    category: 'Character'
  },
  '11B': {
    name: 'Lift',
    category: 'Gizmo',
    group: 'Lift'
  },
  '15A': {
    name: 'Lit Bob-omb',
    category: 'Character'
  },
  '20A': {
    name: 'Master Sword',
    category: 'Item'
  },
  '104A': {
    name: 'Moon',
    category: 'Character'
  },
  '113A': {
    name: 'Mushroom Trampoline',
    category: 'Semisolid',
    group: 'Lift'
  },
  '113E': {
    name: 'Mushroom Trampoline',
    category: 'Semisolid',
    group: 'Lift'
  },
  '113C': {
    name: 'Mushroom Trampoline',
    category: 'Semisolid',
    group: 'Lift'
  },
  '113D': {
    name: 'Mushroom Trampoline',
    category: 'Semisolid',
    group: 'Lift'
  },
  '113B': {
    name: 'Mushroom Trampoline',
    category: 'Semisolid',
    group: 'Lift'
  },
  '132E': {
    name: 'Mushroom Trampoline',
    category: 'Semisolid',
    group: 'Lift'
  },
  '23A': {
    name: 'Note Block',
    category: 'Block'
  },
  '132B': {
    name: 'ON/OFF Trampoline',
    category: 'Gizmo',
    group: 'Lift'
  },
  '132D': {
    name: 'ON/OFF Trampoline',
    category: 'Gizmo',
    group: 'Lift'
  },
  '132C': {
    name: 'ON/OFF Trampoline',
    category: 'Gizmo',
    group: 'Lift'
  },
  '132A': {
    name: 'ON/OFF Trampoline',
    category: 'Gizmo',
    group: 'Lift'
  },
  '67A': {
    name: 'One-Way Wall',
    category: 'One-Way'
  },
  '67B': {
    name: 'One-Way Wall',
    category: 'One-Way'
  },
  '67C': {
    name: 'One-Way Wall',
    category: 'One-Way'
  },
  '79A': {
    name: 'P Block',
    category: 'Block'
  },
  '18B': {
    name: 'P Switch',
    category: 'Item'
  },
  '18A': {
    name: 'P Switch',
    category: 'Item'
  },
  '55A': {
    name: 'P Warp Door',
    category: 'Fixture',
    group: 'Door'
  },
  F2: {
    name: 'Parachute',
    category: 'Info',
    tooltip: true
  },
  para: {
    name: 'Parachute',
    category: 'Info',
    tooltip: true
  },
  '41D': {
    name: 'Peepa',
    category: 'Character'
  },
  '107B': {
    name: 'Piranha Creeper',
    category: 'Character'
  },
  '2A4': {
    name: 'Piranha Plant',
    category: 'Character'
  },
  '2A2': {
    name: 'Piranha Plant',
    category: 'Character'
  },
  '2A6': {
    name: 'Piranha Plant',
    category: 'Character'
  },
  '2A0': {
    name: 'Piranha Plant',
    category: 'Character'
  },
  '33A': {
    name: 'Poison Mushroom',
    category: 'Item'
  },
  '78A': {
    name: 'Snow Pokey',
    category: 'Character'
  },
  '77A': {
    name: 'Pom Pom',
    category: 'Character'
  },
  '81E': {
    name: 'Power Balloon',
    category: 'Item'
  },
  '81D': {
    name: 'Power Balloon',
    category: 'Item'
  },
  MUSH: {
    name: 'Progressive Power Up',
    category: 'Info'
  },
  '44G': {
    name: 'Propeller Mushroom',
    category: 'Item'
  },
  '44F': {
    name: 'Propeller Mushroom',
    category: 'Item'
  },
  '19A': {
    name: 'Red POW Block',
    category: 'Item'
  },
  '81A': {
    name: 'SMB2 Mushroom',
    category: 'Item'
  },
  '91B': {
    name: 'Seesaw',
    category: 'Gizmo'
  },
  '91C': {
    name: 'Seesaw',
    category: 'Gizmo'
  },
  '91A': {
    name: 'Seesaw',
    category: 'Gizmo'
  },
  '45B': {
    name: 'Shoe Goomba',
    category: 'Character'
  },
  '83A': {
    name: 'Skewer',
    category: 'Gizmo',
    group: 'Skewer'
  },
  '83C': {
    name: 'Skewer',
    category: 'Gizmo',
    group: 'Skewer'
  },
  '83B': {
    name: 'Skewer',
    category: 'Gizmo',
    group: 'Skewer'
  },
  '78C': {
    name: 'Snow Pokey',
    category: 'Character'
  },
  '78B': {
    name: 'Snow Pokey',
    category: 'Character'
  },
  '74B': {
    name: 'Snowball',
    category: 'Item'
  },
  '74A': {
    name: 'Spike Ball',
    category: 'Gizmo'
  },
  '110B': {
    name: 'Spike Block',
    category: 'Block'
  },
  '110C': {
    name: 'Spike Block',
    category: 'Block'
  },
  '110A': {
    name: 'Spike Block',
    category: 'Block'
  },
  '40A': {
    name: 'Spike Top',
    category: 'Character'
  },
  '40B6': {
    name: 'Spike Top',
    category: 'Character'
  },
  '40B2': {
    name: 'Spike Top',
    category: 'Character'
  },
  '40A0': {
    name: 'Spike Top',
    category: 'Character'
  },
  '40B0': {
    name: 'Spike Top',
    category: 'Character'
  },
  '40B4': {
    name: 'Spike Top',
    category: 'Character'
  },
  '40A4': {
    name: 'Spike Top',
    category: 'Character'
  },
  '40A2': {
    name: 'Spike Top',
    category: 'Character'
  },
  '40A6': {
    name: 'Spike Top',
    category: 'Character'
  },
  '25B': {
    name: 'Spiny',
    category: 'Character'
  },
  '25A': {
    name: 'Spiny Shell',
    category: 'Item'
  },
  '51A': {
    name: 'Spiny Skipsqueak',
    category: 'Character'
  },
  '88A': {
    name: 'Steep Slope',
    category: 'Ground'
  },
  '45A': {
    name: 'Stiletto Goomba',
    category: 'Character'
  },
  '45C': {
    name: 'Stiletto Goomba',
    category: 'Character'
  },
  '41C': {
    name: 'Stretch',
    category: 'Character'
  },
  '41B': {
    name: 'Stretch',
    category: 'Character'
  },
  '61B': {
    name: 'Stump',
    category: 'Item'
  },
  '81G': {
    name: 'Super Acorn',
    category: 'Item'
  },
  '81F': {
    name: 'Super Acorn',
    category: 'Item'
  },
  '44J': {
    name: 'Super Bell',
    category: 'Item'
  },
  '44H': {
    name: 'Super Bell',
    category: 'Item'
  },
  '116A': {
    name: 'Super Hammer',
    category: 'Item'
  },
  '44C': {
    name: 'Super Leaf',
    category: 'Item'
  },
  '44B': {
    name: 'Super Leaf',
    category: 'Item'
  },
  '34A': {
    name: 'Superball Flower',
    category: 'Item'
  },
  '34C': {
    name: 'Superball Flower',
    category: 'Item'
  },
  '105A': {
    name: 'Swinging Claw',
    category: 'Gizmo',
    group: 'Swinging Claw'
  },
  T6: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  T8: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  T12: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  T10: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  T4: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  T7: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  T5: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  T13: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  T9: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  T2: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  T1: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  T0: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  T000: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  T3: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  T11: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  T14: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  T15: {
    name: 'Track',
    category: 'Track',
    group: 'Track'
  },
  '85A': {
    name: 'Track Block',
    category: 'Gizmo'
  },
  T: {
    name: 'Track End',
    category: 'Track'
  },
  '10A': {
    name: 'Trampoline',
    category: 'Item'
  },
  '97A': {
    name: 'Warp Box (With Key)',
    category: 'Fixture',
    group: 'Door'
  },
  WI: {
    name: 'Wings',
    category: 'Info'
  },
  '45G': {
    name: "Yoshi's Egg",
    category: 'Item'
  },
  '45D': {
    name: "Yoshi's Egg",
    category: 'Item'
  },
  '45E': {
    name: "Yoshi's Egg",
    category: 'Item'
  },
  '45F': {
    name: "Yoshi's Egg",
    category: 'Item'
  }
}

const layoutKey = `
_BBBBBBIOOOPPPPP
______MMOOOPPPPP
===MMMMMOOOOOOPP
===MMMMXXXXXXXXX
GGGMMMMXXXXXXXXX
____TTBXXXXXXXXX
TTTTTTBXXXXXXXXX
TTTTTTTTBGGGGVVV
TTTTTTTTTGGGG___
TTTTTTTTTTTTTTTT
TTTTTTTTTTTTTTTT
TTTTTTTTGGGGGGGG
GGGGGGGGGGGGGGGG
GGGGGGGGGGGGGGGG
GGGGGGGGGGGGGGGG
GGGGGGGGGGGGGGGD
I___OOOOOOOOOOOO
I___OOOOOOOOOOOO
____OOOOOOOOOOOO
____OOOOOOOOOOOO
____OOOOOOOOOOOO
__ZZOOOOOOOOOOOO
__ZZOOOOOOOOOOOO
__ZZOOOOOOOOOOOO
GGGGPPPPPPOOOOOO
GGGGPPPPPPOOOOOO
GGGGGGGGGGGGGGGG
GGGGGGGGGGGGGGGG
GGGGGGGGGGGGGGGG
GGGGGGGGGGGGGGGG
GGGGGGGGGGGGGGGG
GGGGGGGGGGGGGGGG
GGGGTTTTTTTTTTTT
GGGGTTTTTTTTTTTT
TTTTTTTTTTTTTTTT
TTTTTTTTTTTTTTTT
________________
PPPPPPPPPPPPPPPP
PPPPPPPPPPPPPPB_
OOOOOOOOOOOOOOOZ
OOOOOOOOOOOOOOOZ
OOOOOOOOOOOOOOOZ
OOOOOOOOOOOOOOOZ
BBB_____________
________________
________________
________________
________________
`

const layoutMap = {
  _: null,
  B: 'Block',
  I: 'Coin',
  P: 'Fixture', // Pipe
  M: 'Semisolid', // Mushroom
  S: 'Semisolid', // Mushroom
  O: 'Gizmo', // Conveyors
  T: 'Track',
  G: 'Ground',
  Z: 'On-Off',
  V: 'Vine',
  X: 'Semisolid', // Exclude
  D: 'Drawbridge',
  '=': 'Bridge'
}

export const layout = layoutKey.trim().split('\n').map(line => line.split('').map(c => layoutMap[c]))

window.layout = layout
window.legend = legend
