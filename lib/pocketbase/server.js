import PocketBase from 'pocketbase'
import { cookies } from 'next/headers'

export function createServerClient() {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
  const cookieStore = cookies()
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')
  pb.authStore.loadFromCookie(cookieHeader)
  return pb
}
