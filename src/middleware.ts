// src/middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login', // Jika tidak login, lempar ke halaman /login
  },
})

// Config ini memberi tahu middleware untuk HANYA
// melindungi path yang dimulai dengan /admin
export const config = {
  matcher: ['/admin/:path*'],
}