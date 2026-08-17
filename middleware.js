import { NextResponse } from 'next/server'
import PocketBase from 'pocketbase'

const PROTECTED_PREFIXES = ['/dashboard']
const AUTH_PAGES = ['/login', '/signup']

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  const isAuthPage = AUTH_PAGES.includes(pathname)

  if (!isProtected && !isAuthPage) {
    return NextResponse.next()
  }

  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
  pb.authStore.loadFromCookie(request.headers.get('cookie') || '')

  const response = NextResponse.next()

  if (isProtected && pb.authStore.isValid) {
    try {
      await pb.collection('users').authRefresh()
      response.headers.set('set-cookie', pb.authStore.exportToCookie({ httpOnly: false }))
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        pb.authStore.clear()
        response.headers.set('set-cookie', pb.authStore.exportToCookie({ httpOnly: false }))
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  if (isProtected && !pb.authStore.isValid) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && pb.authStore.isValid) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
