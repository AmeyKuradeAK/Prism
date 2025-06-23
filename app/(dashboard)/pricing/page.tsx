import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PricingTable } from '@clerk/nextjs'
import PricingPlans from '@/components/PricingPlans'

export default async function PricingPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Choose Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Plan</span>
          </h1>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Scale your React Native development with AI-powered tools. 
            From hobbyist to enterprise, we've got you covered.
          </p>
        </div>

        {/* Custom Pricing Plans */}
        <PricingPlans />

        {/* Clerk's Official Pricing Table (if configured) */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Alternative Billing</h2>
            <p className="text-white/60">
              Powered by Clerk + Stripe (if you prefer the official billing component)
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <PricingTable />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Can I use my own AI API keys?</h3>
              <p className="text-white/70">
                Yes! With Nova plan and above, you can bring your own Claude, OpenAI, Mistral, or DeepSeek API keys 
                for full control and potentially lower costs.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">What happens if I exceed my limits?</h3>
              <p className="text-white/70">
                For generation limits, you'll get a friendly reminder to upgrade. Projects and features 
                are hard-limited to ensure fair usage.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Can I change plans anytime?</h3>
              <p className="text-white/70">
                Absolutely! Upgrade or downgrade anytime. Changes take effect immediately, 
                and we'll prorate billing accordingly.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Is there a free trial?</h3>
              <p className="text-white/70">
                Spark plan is forever free! For paid plans, you can cancel within 7 days for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 