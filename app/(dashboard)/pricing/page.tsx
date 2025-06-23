import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import PricingPlans from '@/components/PricingPlans'

export default async function PricingPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Choose Your <span className="text-black">Plan</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Scale your React Native development with AI-powered tools. 
            From hobbyist to enterprise, we've got you covered.
          </p>
        </div>

        {/* Custom Pricing Plans */}
        <PricingPlans />



        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use my own AI API keys?</h3>
              <p className="text-gray-600">
                Yes! With Plus plan and above, you can bring your own Claude, OpenAI, Mistral, or DeepSeek API keys 
                for full control and potentially lower costs.
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens if I exceed my limits?</h3>
              <p className="text-gray-600">
                For generation limits, you'll get a friendly reminder to upgrade. Projects and features 
                are hard-limited to ensure fair usage.
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600">
                Absolutely! Upgrade or downgrade anytime. Changes take effect immediately, 
                and we'll prorate billing accordingly.
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                Spark plan is forever free! For paid plans, you can cancel within 7 days for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 