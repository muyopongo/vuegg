import open from 'oauth-open'
import axios from 'axios'
import shortid from 'shortid'
import promisify from 'es6-promisify'

const CLIENT_ID = process.env.CLIENT_ID
const REDIRECT_URL = process.env.CALLBACK_URL
const SCOPE = 'read:user repo'

const auth = {
  authorizeUser,
  getAuthenticatedUser
}

async function authorizeUser () {
  const oauthOpen = promisify(open)

  const STATE = shortid.generate()
  const authUrl = 'https://github.com/login/oauth/authorize'
    .concat('?client_id=').concat(CLIENT_ID)
    .concat('&redirect_uri=').concat(REDIRECT_URL)
    .concat('&state=').concat(STATE)
    .concat('&scope=').concat(SCOPE)

  try {
    let resp = await oauthOpen(authUrl)

    if (resp.state === STATE) {
      return await _getAccessToken(resp.code)
    } else {
      console.error('The states do not match, this request could be compromised')
      return false
    }
  } catch (e) {
    console.error(e)
    return false
  }
}

async function _getAccessToken (code) {
  try {
    let resp = await axios.post('/api/get-access-token', { code: code })
    return resp.data
  } catch (e) {
    console.error(e)
    return false
  }
}

/**
 * Retrieves the current authenticated user info
 *
 * @param  {[type]} token
 * @return {object} Authenticated user
 */
async function getAuthenticatedUser (token) {
  try {
    let resp = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': 'bearer '.concat(token)
      }
    })
    return resp.data
  } catch (e) {
    console.error(e)
    return false
  }
}

export default auth
