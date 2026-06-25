'use client'

import { Navigation } from '@/components/navigation'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function Markets() {
  const marketData = [
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      price: '$42,350',
      change: '+2.4%',
      icon: '₿',
      trend: 'up',
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      price: '$2,280',
      change: '+1.8%',
      icon: '⟠',
      trend: 'up',
    },
    {
      name: 'Tech Stocks',
      symbol: 'TECH',
      price: '+0.9%',
      change: 'Top Gainer',
      icon: '📈',
      trend: 'up',
    },
  ]

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-4xl space-y-6">
            <h1 className="text-3xl font-bold">Markets Snapshot</h1>
            <p className="text-foreground/70">Quick market insights to keep you informed</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {marketData.map((item, i) => (
                <Card 
                  key={i}
                  className={`bg-gradient-to-br ${
                    item.trend === 'up' 
                      ? 'from-green-500/20 to-green-500/10 border-green-500/50' 
                      : 'from-red-500/20 to-red-500/10 border-red-500/50'
                  } p-6`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-3xl mb-2">{item.icon}</div>
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm text-foreground/60">{item.symbol}</p>
                      </div>
                      {item.trend === 'up' ? (
                        <TrendingUp className="w-6 h-6 text-green-500" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{item.price}</p>
                      <p className={`text-sm ${item.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {item.change}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Market Fact */}
            <Card className="bg-card/50 border-border/50 p-6">
              <h2 className="font-bold mb-2">Did You Know?</h2>
              <p className="text-foreground/70">
                The stock market has been operating for over 400 years. The oldest active stock exchange is the Amsterdam Stock Exchange, founded in 1602!
              </p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
