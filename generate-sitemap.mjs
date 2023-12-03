import { S3 } from '@aws-sdk/client-s3'
import fs from 'fs'

const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

async function * list (bucket, prefix) {
  let continuationToken
  while (true) {
    const res = await s3.listObjectsV2({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: '/',
      ContinuationToken: continuationToken
    })
    const { Contents, NextContinuationToken } = res
    for (const { Key } of Contents) {
      yield Key
    }
    if (!NextContinuationToken) break
    continuationToken = NextContinuationToken
  }
}

async function main () {
  // // Levels
  // const levelsLog = fs.createWriteStream('levels.txt')
  // for await (const key of list('smm2viewer', 'mm2/level_info/')) {
  //   console.log(key)
  //   levelsLog.write(key + '\n')
  // }
  // levelsLog.close()
  // Users
  const usersLog = fs.createWriteStream('users.txt')
  for await (const key of list('smm2viewer', 'mm2/user_info/')) {
    console.log(key)
    usersLog.write(key + '\n')
  }
  usersLog.close()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
