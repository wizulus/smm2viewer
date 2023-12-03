import { idToCode, codeToId, base30Decode, base30Encode, base30ReverseDecode, base30ReverseEncode, codeToBits, bitsToCode, newBase30Encode, newBase30Decode } from "./lib/id.mjs";
import fs from 'fs'

const bin = (n) => typeof n === 'bigint' ? n.toString(2).padStart(64, '_') : n
function testMethod(values, encode, decode) {
  for (const value of values()) {
    const encoded = encode(value);
    const decoded = decode(encoded);
    console.log(bin(value), bin(encoded), bin(decoded));
    if (decoded !== value) {
      throw new Error(`decoded mismatch: ${value} -> ${encoded} -> ${decoded}`);
    }
  }
}

function * bigInts() {
  let inc = 1n
  let i = 0n
  let max = 2n ** 64n
  while (i < max) {
    for (let a = 0; a < 10; a++) {
      for (let c = 0n; c < 100n; c++) {
        i += inc
        let b = 1n
        const m = i >> 8n
        while (b < m) {
          if (Math.random() < 0.5) {
            i ^= b
          }
          b *= 2n
        }
        yield i
      }
      inc *= 2n
    }
  }
}

function * levels () {
  let i = 0
  for (const line of fs.readFileSync('levels.txt', 'utf8').split('\n')) {
    if (!line) continue
    if (!(i++ % 30000)) {
      const code = line.split('/').pop().split('.')[0].split('_')[0]
      yield code
    }
  }
}

function * users () {
  for (const line of fs.readFileSync('users.txt', 'utf8').split('\n')) {
    if (!line) continue
    const code = line.split('/').pop().split('.')[0].split('_')[0]
    yield code
  }
}

function main() {
  // testMethod(bigInts, base30Encode, base30Decode)
  // testMethod(bigInts, base30ReverseEncode, base30ReverseDecode)

  // testMethod(bigInts, newBase30Encode, newBase30Decode)

  // testMethod(levels, base30ReverseDecode, x => base30ReverseEncode(x).padStart(9, '0'))
  testMethod(levels, base30Decode, base30Encode)
  testMethod(levels, newBase30Decode, x => newBase30Encode(x).padStart(9, '0'))

}

  // let lastBinary = ''
  // let lastNum = 0n
  // const deltas = new Set()
  // const bitsChanged = Array(64).fill(false)
  // fs.readFileSync('levels.txt', 'utf8').split('\n').slice(0, 10).forEach(line => {
  //   if (!line) return
  //   const code = line.split('/').pop().split('.')[0].split('_')[0]
  //   const id = codeToId(code)
  //   const binary = id.toString(2).padStart(64, '0')
  //   const value = BigInt('0b' + binary)
  //   const code2 = idToCode(id)
  //   if (code !== code2) {
  //     throw new Error(`code mismatch: ${code} ${code2}`)
  //   }
  //   if (lastBinary) {
  //     for (let i = 0; i < 64; i++) {
  //       if (lastBinary[i] !== binary[i]) {
  //         bitsChanged[i] = true
  //       }
  //     }
  //   }
  //   if (lastNum !== 0n) {
  //     deltas.add(Number(id - lastNum))
  //   }
  //   lastNum = id
  //   lastBinary = binary
  //   console.log(code, binary, code2)
  // })
  // console.log(bitsChanged.map((b, i) => b ? '_' : lastBinary[i]).join(''))

  //0000000000000000000000001111111111111111111111111100000000111111
  //000000000000000000001000__________________________11000101______
  //0000000000000000000011110000000000000000000000000011111111100000
  let lastBinary = ''
  const bitsChanged = Array(64).fill(false)
  fs.readFileSync('levels.txt', 'utf8').split('\n').forEach(line => {
    if (!line) return
    const code = line.split('/').pop().split('.')[0].split('_')[0]
    const id = codeToId(code)
    const binary = id.toString(2).padStart(64, '0')
    const code2 = idToCode(id)
    if (code !== code2) {
      throw new Error(`code mismatch: ${code} ${code2}`)
    }
    if (lastBinary) {
      for (let i = 0; i < 64; i++) {
        if (lastBinary[i] !== binary[i]) {
          bitsChanged[i] = true
        }
      }
    }
    lastBinary = binary
    console.log(code, binary, code2)
  })
  console.log(bitsChanged.map((b, i) => b ? '_' : lastBinary[i] ).join(''))

// }

//main()

// console.log(codeToId('000000001').toString(2).padStart(64, 0))
// console.log(base30ReverseDecode('000000001').toString(2).padStart(64, 0))
// //                                 1000__________________________01000101___000
// const myId = 0b0000000000000000000011111111111111111111111111111111111111111111n
// console.log(idToCode(myId))

// for (let i = 0; i < 100000; i++) {
//   console.log(idToCode(BigInt(i)))
// }