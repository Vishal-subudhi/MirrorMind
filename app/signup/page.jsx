import AuthForm from '@/components/auth/AuthForm'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthForm mode="signup" />
    </div>
  )
}
