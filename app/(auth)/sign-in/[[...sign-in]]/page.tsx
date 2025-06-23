import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="heading-secondary mb-4">
            Welcome to Prism
          </h1>
          <p className="text-light">
            Sign in to start building amazing React Native apps with AI
          </p>
        </div>
        
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-white/95 backdrop-blur-lg shadow-professional border-0 rounded-xl-professional',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'bg-white border border-gray-200 hover:bg-gray-50 rounded-professional',
              socialButtonsBlockButtonText: 'text-gray-700',
              formButtonPrimary: 'bg-black hover:bg-gray-900 rounded-professional',
              footerActionLink: 'text-black hover:text-gray-700'
            }
          }}
        />
      </div>
    </div>
  )
} 