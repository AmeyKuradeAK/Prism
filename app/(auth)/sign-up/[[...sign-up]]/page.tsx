import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Join NativeForge
          </h1>
          <p className="text-slate-600">
            Create your account and start building React Native apps with AI
          </p>
        </div>
        
        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-xl border-0',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'bg-white border border-slate-200 hover:bg-slate-50',
              socialButtonsBlockButtonText: 'text-slate-700',
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
              footerActionLink: 'text-blue-600 hover:text-blue-700'
            }
          }}
        />
      </div>
    </div>
  )
} 