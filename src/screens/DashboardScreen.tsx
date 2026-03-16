import { useAuth } from '../context/useAuth';

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  SGD: 'S$',
};

export function DashboardScreen() {
  const { businessProfile, loginValue, loginMethod, reset } = useAuth();

  const currency = businessProfile?.currency ?? 'INR';
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const businessName = businessProfile?.name ?? 'My Business';
  const location = businessProfile?.location ?? '';

  const greeting =
    loginMethod === 'mobile'
      ? `+91 ${loginValue}`
      : loginValue;

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div>
          <h1 className="text-lg font-bold">{businessName}</h1>
          {location && (
            <p className="text-blue-300 text-xs mt-0.5">📍 {location}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-blue-200 text-xs">{greeting}</p>
            <p className="text-white/40 text-xs">{currency}</p>
          </div>
          <button
            onClick={reset}
            className="text-xs text-blue-300 hover:text-white border border-white/20 rounded-lg px-3 py-1.5 transition-colors"
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Quick-answer cards */}
      <main className="px-6 py-6 space-y-4 max-w-lg mx-auto">
        <p className="text-blue-200 text-sm text-center mb-2">
          Here's your financial snapshot for today
        </p>

        {/* 1. Am I financially safe? */}
        <div className="bg-white/10 rounded-2xl p-5 border border-white/15">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🛡️</span>
            <h2 className="font-semibold text-base">Am I financially safe today?</h2>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-green-400">
              {symbol}42,500
            </span>
            <span className="text-green-300 text-sm mb-1">available</span>
          </div>
          <div className="mt-3 flex gap-3 text-sm">
            <div className="flex-1 bg-white/5 rounded-xl p-3">
              <p className="text-white/50 text-xs mb-0.5">Total Dues</p>
              <p className="text-red-300 font-semibold">{symbol}18,200</p>
            </div>
            <div className="flex-1 bg-white/5 rounded-xl p-3">
              <p className="text-white/50 text-xs mb-0.5">Cash In Hand</p>
              <p className="text-white font-semibold">{symbol}60,700</p>
            </div>
          </div>
          <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 rounded-full" style={{ width: '70%' }} />
          </div>
          <p className="text-white/40 text-xs mt-1.5">70% cash coverage ratio — <span className="text-green-300">Healthy</span></p>
        </div>

        {/* 2. Who should I buy from? */}
        <div className="bg-white/10 rounded-2xl p-5 border border-white/15">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🛒</span>
            <h2 className="font-semibold text-base">Who should I buy from?</h2>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'Mehta Traders', score: 95, terms: '30-day credit', badge: 'Best Deal' },
              { name: 'Raj Distributors', score: 82, terms: '15-day credit', badge: 'Reliable' },
              { name: 'Global Supplies Co.', score: 68, terms: 'Cash only', badge: null },
            ].map((v) => (
              <div
                key={v.name}
                className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{v.name}</p>
                  <p className="text-white/40 text-xs">{v.terms}</p>
                </div>
                <div className="flex items-center gap-2">
                  {v.badge && (
                    <span className="text-xs bg-blue-400/20 text-blue-300 px-2 py-0.5 rounded-full">
                      {v.badge}
                    </span>
                  )}
                  <span
                    className={`text-sm font-bold ${
                      v.score >= 90
                        ? 'text-green-400'
                        : v.score >= 75
                        ? 'text-yellow-400'
                        : 'text-orange-400'
                    }`}
                  >
                    {v.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Who should I pay first? */}
        <div className="bg-white/10 rounded-2xl p-5 border border-white/15">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💸</span>
            <h2 className="font-semibold text-base">Who should I pay first?</h2>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'Kapoor Steel', amount: 8500, due: 'Due today', urgency: 'high' },
              { name: 'Mehta Traders', amount: 5200, due: 'Due in 3 days', urgency: 'medium' },
              { name: 'Raj Distributors', amount: 4500, due: 'Due in 12 days', urgency: 'low' },
            ].map((v) => (
              <div
                key={v.name}
                className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      v.urgency === 'high'
                        ? 'bg-red-400'
                        : v.urgency === 'medium'
                        ? 'bg-yellow-400'
                        : 'bg-green-400'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">{v.name}</p>
                    <p
                      className={`text-xs ${
                        v.urgency === 'high'
                          ? 'text-red-300'
                          : v.urgency === 'medium'
                          ? 'text-yellow-300'
                          : 'text-white/40'
                      }`}
                    >
                      {v.due}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold">
                  {symbol}{v.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
