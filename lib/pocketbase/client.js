import PocketBase from 'pocketbase'

let pb

export function createClient() {
  if (!pb) {
    pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
    pb.authStore.onChange(() => {
      document.cookie = pb.authStore.exportToCookie({ httpOnly: false })
    })
  }
  return pb
}
