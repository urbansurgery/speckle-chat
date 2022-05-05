import * as functions from 'firebase-functions'
import express, { Request, Response } from 'express'
import cors from 'cors'
import * as crypto from 'crypto'
import { request } from 'undici'

const app = express()

app.use(
  express.json(),
  cors({
    origin: true
  })
)

export const relayWebhook = functions.https.onRequest(app)

app.post('*', async (req: Request, res: Response) => {
  void [req, res]

  const secret = process.env.SECRET_KEY as string

  const hash = crypto
    .createHmac('sha256', secret)
    .update(req.body.payload)
    .digest('hex')
  const signatureHeader = req.headers['x-webhook-signature']

  if (signatureHeader !== hash) {
    res.status(401).send('Invalid signature')
  }

  const webhookObject = JSON.parse(req.body.payload)

  console.log(webhookObject)
  const {
    activityMessage: message,
    event: { event_name: event },
    server: { canonicalUrl: host },
    streamId
  } = webhookObject

  let previewImageUrl = ''
  let linkUrl = ''
  let commitId = ''
  let commitMessage = ''

  if (event === 'commit_create') {
    commitId = webhookObject.event.data.id
    console.log(webhookObject.event.data.commit)
  }
  if (event === 'commit_update') {
    commitId = webhookObject.event.data.new.id
    console.log()
  }

  if (event === 'commit_update' || event === 'commit_create') {
    commitMessage = webhookObject.event.data.commit.message
    previewImageUrl = `${host}/preview/${streamId}/commits/${commitId}`
    linkUrl = `${host}/streams/${streamId}/commits/${commitId}`
  } else if (event === 'stream_update' || event === 'stream_create') {
    previewImageUrl = `${host}/preview/${streamId}`
    linkUrl = `${host}/streams/${streamId}`
  }

  const { statusCode, headers, trailers, body } = await request(
    'https://chat.googleapis.com/v1/spaces/AAAAIhCWPwc/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=KJ3KMwN43kf8ra8DdQXepnbJrgRdjdxOahL1vYn9B4k%3D',
    {
      method: 'POST',
      body: JSON.stringify({
        cards: [
          {
            sections: [
              {
                widgets: [
                  {
                    keyValue: {
                      topLabel: 'Commit',
                      content: `${message}`,
                      contentMultiline: 'false',
                      bottomLabel: `${commitMessage}`
                    }
                  }
                ]
              },
              {
                widgets: [
                  {
                    image: {
                      imageUrl: `${previewImageUrl}`,
                      onClick: {
                        openLink: {
                          url: `${linkUrl}`
                        }
                      }
                    }
                  },
                  {
                    buttons: [
                      {
                        textButton: {
                          text: 'OPEN IN SPECKLE',
                          onClick: {
                            openLink: {
                              url: `${linkUrl}`
                            }
                          }
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })
    }
  )
  void [statusCode, headers, trailers, webhookObject, body]

  res.sendStatus(200) // Logged as a bug/issue

  return
})
