import PocketBase from 'pocketbase'

let pb
let authPromise

export function createClient() {
  if (!pb) {
    pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
    pb.authStore.onChange(() => {
      document.cookie = pb.authStore.exportToCookie({ httpOnly: false })
    })
  }
  return pb
}

export function ensureAuth() {
  const client = createClient()
  if (client.authStore.isValid) return Promise.resolve(client)
  if (!authPromise) {
    authPromise = client.collection('users')
      .authWithPassword(process.env.NEXT_PUBLIC_DEMO_EMAIL, process.env.NEXT_PUBLIC_DEMO_PASSWORD)
      .then(() => client)
      .catch((err) => { authPromise = null; throw err })
  }
  return authPromise
}
