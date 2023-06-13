import express from 'express'
import { Looker40SDK } from '@looker/sdk'
import { DefaultSettings } from '@looker/sdk-rtl'
import { NodeSession } from '@looker/sdk-node'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const user = require('./user.json')
const app = express()
const port = process.env.PORT || 3000

app.use(cors())

let lookerSession

const config = {
    api_url: process.env.LOOKER_EMBED_API_URL,
    client_id: process.env.LOOKER_CLIENT_ID,
    client_secret: process.env.LOOKER_CLIENT_SECRET,
    verify_ssl: true
}

const embedSessions = {}

async function acquireEmbedSession(userAgent, user) {
    await acquireLookerSession()
    return acquireEmbedSessionInternal(userAgent, user)
}

// Generates a new Looker Session (Node Session) with config values
const acquireLookerSession = async () => {
    if (!lookerSession || !lookerSession.activeToken.isActive()) {
        const { api_url, client_id, client_secret, verify_ssl } = config
        try {
            const lookerSettings = DefaultSettings()
            lookerSettings.readConfig = () => {
                return {
                    client_id,
                    client_secret,
                }
            }
            lookerSettings.base_url = api_url
            lookerSettings.verify_ssl = verify_ssl
            lookerSession = new NodeSession(lookerSettings)
            lookerSession.login()
        } catch (error) {
            console.error('login failed', { error })
            throw error
        }
    }
}

// Using the Looker Session object we acquire the Embed session requesting the Looker SDK
const acquireEmbedSessionInternal = async (userAgent, user) => {
    try {
        const cacheKey = `${user.external_user_id}/${userAgent}`
        const embedSession = embedSessions[cacheKey]
        const request = {
            ...user,
            session_reference_token: embedSession?.session_reference_token,
        }
        const sdk = new Looker40SDK(lookerSession)
        const response = await sdk.ok(
            sdk.acquire_embed_cookieless_session(request, {
                headers: {
                    'User-Agent': userAgent,
                },
            })
        )
        embedSessions[cacheKey] = response
        const {
            authentication_token,
            authentication_token_ttl,
            navigation_token,
            navigation_token_ttl,
            session_reference_token_ttl,
            api_token,
            api_token_ttl,
        } = response
        return {
            api_token,
            api_token_ttl,
            authentication_token,
            authentication_token_ttl,
            navigation_token,
            navigation_token_ttl,
            session_reference_token_ttl,
        }
    } catch (error) {
        console.error('embed session acquire failed', { error })
        throw error
    }
}

// After creating an Embed session we start the process for cookieless embed to get a token for the user to use.
async function generateEmbedTokens(userAgent, user) {
    const cacheKey = `${user.external_user_id}/${userAgent}`
    const embedSession = embedSessions[cacheKey]
    if (!embedSession) {
        console.error(
            'embed session generate tokens failed, session not yet acquired'
        )
        throw new Error(
            'embed session generate tokens failed, session not yet acquired'
        )
    }
    await acquireLookerSession()
    try {
        const { api_token, navigation_token, session_reference_token } =
            embedSession
        const sdk = new Looker40SDK(lookerSession)
        const response = await sdk.ok(
            sdk.generate_tokens_for_cookieless_session(
                {
                    api_token,
                    navigation_token,
                    session_reference_token: session_reference_token || '',
                },
                {
                    headers: {
                        'User-Agent': userAgent,
                    },
                }
            )
        )
        const cacheKey = `${user.external_user_id}/${userAgent}`
        embedSessions[cacheKey] = response
        return {
            api_token: response.api_token,
            api_token_ttl: response.api_token_ttl,
            navigation_token: response.navigation_token,
            navigation_token_ttl: response.navigation_token_ttl,
            session_reference_token_ttl: response.session_reference_token_ttl,
        }
    } catch (error) {
        console.error('embed session generate tokens failed', { error })
        throw error
    }
}

app.get('/generate-embed-tokens', async function (req, res) {
    try {
        const tokens = await generateEmbedTokens(req.headers['user-agent'], user)
        res.json(tokens)
    } catch (err) {
        res.status(400).send({ message: err.message })
    }
})


app.get('/', (_, res) => {
    res.send('If you see this, the server is alive')
})

app.get('/acquire-embed-session', async function (req, res) {
    console.log(req)
    try {
        const tokens = await acquireEmbedSession(req.headers['user-agent'], user)
        res.json(tokens)
    } catch (err) {
        res.status(400).send({ message: err.message })
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
