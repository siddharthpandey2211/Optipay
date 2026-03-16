import { useMemo, useRef, useState } from 'react'
import './App.css'

type ScreenId =
  | 'auth'
  | 'dashboard'
  | 'vendors'
  | 'ledger'
  | 'inventory'
  | 'liquidity'
  | 'transaction'

type VendorStatus = 'Critical' | 'Safe' | 'Overdue'

type LedgerEntry = {
  id: number
  type: 'credit' | 'debit'
  title: string
  detail: string
  amount: number
  date: string
  attachment?: boolean
}

type Vendor = {
  id: number
  name: string
  commodity: string
  balance: number
  dueAmount: number
  score: number
  daysOverdue: number
  phone: string
  lastPaymentDays: number
  status: VendorStatus
  ledger: LedgerEntry[]
}

type SuggestedPayment = {
  vendorId: number
  amount: number
}

type RecordedTransaction = {
  vendorId: number
  type: 'credit' | 'debit'
  amount: number
  date: string
  screenshotName?: string
}

type PurchaseCartItem = {
  vendorId: number
  vendorName: string
  commodity: string
  quantity: number
  unitLabel: string
  unitRate: number
  amount: number
}

const screens: Array<{ id: ScreenId; label: string; caption: string }> = [
  { id: 'auth', label: 'Auth', caption: 'Secure entry' },
  { id: 'dashboard', label: 'Dashboard', caption: 'Command center' },
  { id: 'vendors', label: 'Vendors', caption: 'Directory' },
  { id: 'ledger', label: 'Ledger', caption: 'Truth source' },
  { id: 'inventory', label: 'Inventory', caption: 'Smart buy' },
  { id: 'liquidity', label: 'Liquidity', caption: 'Smart pay' },
  { id: 'transaction', label: 'Transaction', caption: 'Daily entry' },
]

const vendors: Vendor[] = [
  {
    id: 1,
    name: 'Raju Dairy',
    commodity: 'Milk',
    balance: 48200,
    dueAmount: 5000,
    score: 9,
    daysOverdue: 42,
    phone: '+91 98765 10001',
    lastPaymentDays: 17,
    status: 'Critical',
    ledger: [
      { id: 101, type: 'credit', title: 'Milk Supply (50L)', detail: 'Morning delivery batch', amount: 2500, date: '15 Mar 2026', attachment: true },
      { id: 102, type: 'debit', title: 'UPI Payment', detail: 'Partial settlement', amount: 5000, date: '11 Mar 2026' },
      { id: 103, type: 'credit', title: 'Milk Supply (80L)', detail: 'Festival weekend stock', amount: 4100, date: '09 Mar 2026', attachment: true },
    ],
  },
  {
    id: 2,
    name: 'Sharma Wholesale',
    commodity: 'Spices',
    balance: 22000,
    dueAmount: 3500,
    score: 7,
    daysOverdue: 12,
    phone: '+91 98765 10002',
    lastPaymentDays: 8,
    status: 'Overdue',
    ledger: [
      { id: 201, type: 'credit', title: 'Turmeric & Chilli Mix', detail: 'Restock order', amount: 6800, date: '14 Mar 2026' },
      { id: 202, type: 'debit', title: 'Cash Payment', detail: 'Market visit settlement', amount: 4000, date: '08 Mar 2026' },
    ],
  },
  {
    id: 3,
    name: 'Green Basket Traders',
    commodity: 'Vegetables',
    balance: 8700,
    dueAmount: 1800,
    score: 5,
    daysOverdue: 5,
    phone: '+91 98765 10003',
    lastPaymentDays: 4,
    status: 'Safe',
    ledger: [
      { id: 301, type: 'credit', title: 'Vegetable Crates', detail: 'Daily inventory refill', amount: 3200, date: '15 Mar 2026' },
      { id: 302, type: 'debit', title: 'Bank Transfer', detail: 'Routine payment', amount: 2500, date: '12 Mar 2026' },
    ],
  },
  {
    id: 4,
    name: 'Metro Rice Depot',
    commodity: 'Rice',
    balance: 50000,
    dueAmount: 2000,
    score: 8,
    daysOverdue: 28,
    phone: '+91 98765 10004',
    lastPaymentDays: 15,
    status: 'Critical',
    ledger: [
      { id: 401, type: 'credit', title: 'Rice Bags (20)', detail: 'Monthly procurement', amount: 18000, date: '13 Mar 2026', attachment: true },
      { id: 402, type: 'debit', title: 'Cheque Payment', detail: 'Scheduled payment cycle', amount: 12000, date: '01 Mar 2026' },
    ],
  },
  {
    id: 5,
    name: 'Annapurna Grains',
    commodity: 'Rice',
    balance: 2000,
    dueAmount: 1200,
    score: 4,
    daysOverdue: 3,
    phone: '+91 98765 10005',
    lastPaymentDays: 2,
    status: 'Safe',
    ledger: [
      { id: 501, type: 'credit', title: 'Rice Bags (5)', detail: 'Top-up purchase', amount: 4600, date: '10 Mar 2026' },
      { id: 502, type: 'debit', title: 'UPI Payment', detail: 'Instant transfer', amount: 4000, date: '12 Mar 2026' },
    ],
  },
]

const commodityOptions = [
  { name: 'Milk', icon: '🥛' },
  { name: 'Rice', icon: '🌾' },
  { name: 'Gas', icon: '⛽' },
  { name: 'Vegetables', icon: '🥬' },
]

const commodityUnitRate: Record<string, number> = {
  Milk: 58,
  Rice: 72,
  Gas: 1150,
  Vegetables: 40,
}

const commodityUnitLabel: Record<string, string> = {
  Milk: 'L',
  Rice: 'kg',
  Gas: 'cylinder',
  Vegetables: 'kg',
}

const REQUIRED_DATA_MESSAGE = 'Required data is empty. Please fill.'
const PAYMENT_METHODS = ['UPI', 'Cash', 'GPay'] as const
const PAYMENT_WINDOW_DAYS = 30
const UPCOMING_DUE_PRIORITY_DAYS = 10

type PaymentMethod = '' | (typeof PAYMENT_METHODS)[number]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

const parseDate = (value: string) => {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const isSameMonthAndYear = (left: Date, right: Date) =>
  left.getMonth() === right.getMonth() && left.getFullYear() === right.getFullYear()

const mergePurchaseItems = (base: PurchaseCartItem[], incoming: PurchaseCartItem[]) => {
  const merged = [...base]

  for (const item of incoming) {
    const existingIndex = merged.findIndex(
      (existing) => existing.vendorId === item.vendorId && existing.commodity === item.commodity,
    )

    if (existingIndex === -1) {
      merged.push(item)
      continue
    }

    const existing = merged[existingIndex]
    const nextQuantity = existing.quantity + item.quantity
    merged[existingIndex] = {
      ...existing,
      quantity: nextQuantity,
      amount: nextQuantity * existing.unitRate,
    }
  }

  return merged
}

function App() {
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([])
  const [activeScreen, setActiveScreen] = useState<ScreenId>('auth')
  const [authMode, setAuthMode] = useState<'mobile' | 'email'>('mobile')
  const [authInput, setAuthInput] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const [showBusinessSetup, setShowBusinessSetup] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [businessLocation, setBusinessLocation] = useState('')
  const [authFeedback, setAuthFeedback] = useState('')
  const [selectedVendorId, setSelectedVendorId] = useState(0)
  const [vendorSearch, setVendorSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | VendorStatus>('All')
  const [selectedCommodity, setSelectedCommodity] = useState<string | null>(null)
  const [buyQuantities, setBuyQuantities] = useState<Record<number, string>>({})
  const [purchaseCart, setPurchaseCart] = useState<PurchaseCartItem[]>([])
  const [inventoryFeedback, setInventoryFeedback] = useState('')
  const [cashToday, setCashToday] = useState('')
  const [planGenerated, setPlanGenerated] = useState(false)
  const [planFeedback, setPlanFeedback] = useState('')
  const [suggestedPayments, setSuggestedPayments] = useState<SuggestedPayment[]>([])
  const [plannedBatchPayments, setPlannedBatchPayments] = useState<SuggestedPayment[]>([])
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit')
  const [transactionAmount, setTransactionAmount] = useState('')
  const [transactionDate, setTransactionDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('')
  const [transactionFeedback, setTransactionFeedback] = useState('')
  const [recordedTransactions, setRecordedTransactions] = useState<RecordedTransaction[]>([])
  const [vendorDueAdjustments, setVendorDueAdjustments] = useState<Record<number, number>>({})
  const [paymentScreenshot, setPaymentScreenshot] = useState<{ name: string; previewUrl: string } | null>(null)
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string | null>(null)
  const [creditCalendarSelectedDate, setCreditCalendarSelectedDate] = useState<string | null>(null)
  const [lastAction, setLastAction] = useState('Ready for today: 2 vendors are approaching starvation risk.')

  const selectedVendor = vendors.find((vendor) => vendor.id === selectedVendorId) ?? vendors[0]

  const filteredVendors = useMemo(
    () =>
      vendors.filter((vendor) => {
        const matchesSearch = `${vendor.name} ${vendor.commodity}`
          .toLowerCase()
          .includes(vendorSearch.toLowerCase())
        const matchesStatus = statusFilter === 'All' ? true : vendor.status === statusFilter
        return matchesSearch && matchesStatus
      }),
    [statusFilter, vendorSearch],
  )

  const totalDebt = vendors.reduce((sum, vendor) => sum + vendor.balance, 0)
  const now = new Date()
  const calendarYear = now.getFullYear()
  const calendarMonthIndex = now.getMonth()
  const calendarDaysInMonth = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate()
  const calendarFirstDay = new Date(calendarYear, calendarMonthIndex, 1).getDay()
  const calendarMonthLabel = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
  const debitTransactionDates = new Set(
    recordedTransactions.filter((t) => t.type === 'debit').map((t) => t.date),
  )
  const creditTransactionDates = new Set(
    recordedTransactions.filter((t) => t.type === 'credit').map((t) => t.date),
  )
  const basePaymentsThisMonth = vendors.reduce(
    (sum, vendor) =>
      sum +
      vendor.ledger
        .filter((entry) => entry.type === 'debit')
        .reduce((entrySum, entry) => {
          const entryDate = parseDate(entry.date)
          if (!entryDate || !isSameMonthAndYear(entryDate, now)) {
            return entrySum
          }
          return entrySum + entry.amount
        }, 0),
    0,
  )
  const dailyEntryPaymentsThisMonth = recordedTransactions
    .filter((entry) => {
      if (entry.type !== 'debit') {
        return false
      }

      const entryDate = parseDate(entry.date)
      return entryDate ? isSameMonthAndYear(entryDate, now) : false
    })
    .reduce((sum, entry) => sum + entry.amount, 0)
  const paymentThisMonth = basePaymentsThisMonth + dailyEntryPaymentsThisMonth
  const effectiveDue = (vendorId: number, rawDue: number) =>
    Math.max(0, rawDue - (vendorDueAdjustments[vendorId] ?? 0))

  const pendingAmount = Math.max(0, totalDebt - paymentThisMonth)

  const comparisonVendors = selectedCommodity
    ? vendors.filter((vendor) => vendor.commodity === selectedCommodity).sort((left, right) => left.balance - right.balance)
    : []

  const selectedCommodityUnitRate = selectedCommodity ? commodityUnitRate[selectedCommodity] ?? 0 : 0
  const selectedCommodityUnitLabel = selectedCommodity ? commodityUnitLabel[selectedCommodity] ?? 'kg' : 'kg'
  const currentCommoditySelections: PurchaseCartItem[] = selectedCommodity
    ? comparisonVendors
        .map((vendor) => {
          const quantity = Number(buyQuantities[vendor.id]) || 0
          if (quantity <= 0) {
            return null
          }

          return {
            vendorId: vendor.id,
            vendorName: vendor.name,
            commodity: selectedCommodity,
            quantity,
            unitLabel: selectedCommodityUnitLabel,
            unitRate: selectedCommodityUnitRate,
            amount: quantity * selectedCommodityUnitRate,
          }
        })
        .filter((item): item is PurchaseCartItem => item !== null)
    : []

  const pendingSmartBuyItems = selectedCommodity
    ? mergePurchaseItems(purchaseCart, currentCommoditySelections)
    : purchaseCart
  const pendingSmartBuyTotal = pendingSmartBuyItems.reduce((sum, item) => sum + item.amount, 0)

  const recommendedVendor = comparisonVendors[0]
  const disposableCash = Number(cashToday) || 0
  const otpComplete = otp.every((digit) => digit.trim().length === 1)
  const authReady = authInput.trim().length > 0 && otpComplete
  const businessSetupComplete =
    businessName.trim().length > 0 &&
    businessLocation.trim().length > 0
  const canAccessApp = isOtpVerified && businessSetupComplete
  const vendorById = (id: number) => vendors.find((vendor) => vendor.id === id)
  const batchTotal = plannedBatchPayments.reduce((sum, payment) => sum + payment.amount, 0)

  const rankedVendorsForLiquidity = [...vendors].sort((left, right) => {
    const leftDaysRemaining = PAYMENT_WINDOW_DAYS - left.daysOverdue
    const rightDaysRemaining = PAYMENT_WINDOW_DAYS - right.daysOverdue

    const leftOverdue = leftDaysRemaining < 0
    const rightOverdue = rightDaysRemaining < 0

    if (leftOverdue !== rightOverdue) {
      return leftOverdue ? -1 : 1
    }

    if (leftOverdue && rightOverdue) {
      if (leftDaysRemaining !== rightDaysRemaining) {
        return leftDaysRemaining - rightDaysRemaining
      }
      return right.dueAmount - left.dueAmount
    }

    const leftIn10DayRange = leftDaysRemaining >= 0 && leftDaysRemaining <= UPCOMING_DUE_PRIORITY_DAYS
    const rightIn10DayRange = rightDaysRemaining >= 0 && rightDaysRemaining <= UPCOMING_DUE_PRIORITY_DAYS

    if (leftIn10DayRange !== rightIn10DayRange) {
      return leftIn10DayRange ? -1 : 1
    }

    if (leftIn10DayRange && rightIn10DayRange) {
      if (leftDaysRemaining !== rightDaysRemaining) {
        return leftDaysRemaining - rightDaysRemaining
      }
      return right.dueAmount - left.dueAmount
    }

    if (leftDaysRemaining !== rightDaysRemaining) {
      return leftDaysRemaining - rightDaysRemaining
    }

    return right.dueAmount - left.dueAmount
  })

  const vendorPriorityRank = new Map(
    rankedVendorsForLiquidity.map((vendor, index) => [vendor.id, index]),
  )

  const notifications = vendors
    .map((vendor) => {
      const daysRemaining = PAYMENT_WINDOW_DAYS - vendor.daysOverdue
      const overdue = daysRemaining < 0

      return {
        vendorId: vendor.id,
        name: vendor.name,
        overdue,
        daysRemaining,
        countdown: overdue
          ? `${Math.abs(daysRemaining)} days overdue`
          : daysRemaining === 0
            ? 'Due today'
            : `${daysRemaining} days remaining`,
        summary: overdue
          ? `${Math.abs(daysRemaining)} day(s) overdue`
          : `${daysRemaining} day(s) remaining`,
      }
    })
    .sort((left, right) => {
      const leftRank = vendorPriorityRank.get(left.vendorId) ?? Number.MAX_SAFE_INTEGER
      const rightRank = vendorPriorityRank.get(right.vendorId) ?? Number.MAX_SAFE_INTEGER
      return leftRank - rightRank
    })

  const nearestDueNotification = notifications[0]
  const upcomingDueVendors = notifications
    .filter((item) => !item.overdue)
    .slice(0, 3)
  const overdueVendors = notifications
    .filter((item) => item.overdue)
    .slice(0, 3)

  const buildLiquidityPlan = (availableCash: number): SuggestedPayment[] => {
    let remainingCash = availableCash

    const plan: SuggestedPayment[] = []

    for (const vendor of rankedVendorsForLiquidity) {
      if (remainingCash <= 0) {
        break
      }

      const dueNow = Math.min(effectiveDue(vendor.id, vendor.dueAmount), vendor.balance)
      if (dueNow <= 0) {
        continue
      }
      const allocation = Math.min(dueNow, remainingCash)

      plan.push({ vendorId: vendor.id, amount: allocation })
      remainingCash -= allocation
    }

    return plan
  }

  const mustPay = suggestedPayments.filter((payment) => {
    const vendor = vendorById(payment.vendorId)
    return vendor?.status === 'Critical'
  })

  const backlog = suggestedPayments.filter((payment) => {
    const vendor = vendorById(payment.vendorId)
    return vendor?.status !== 'Critical'
  })

  const handleProtectedNavigation = (screen: ScreenId) => {
    if (screen === 'auth' || canAccessApp) {
      setActiveScreen(screen)
      return
    }

    setActiveScreen('auth')
    setShowBusinessSetup(isOtpVerified)
    setAuthFeedback('Complete business setup to continue into the app.')
    setLastAction('Access locked until business setup is completed.')
  }

  const handleVerifyOtp = () => {
    if (!authReady) {
      setAuthFeedback(REQUIRED_DATA_MESSAGE)
      return
    }

    setIsOtpVerified(true)
    setShowBusinessSetup(true)
    setAuthFeedback('Verification complete. Finish business setup to continue.')
    setLastAction('OTP verified. Business setup is now required.')
  }

  const handleCompleteSetup = () => {
    if (!businessSetupComplete) {
      setAuthFeedback(REQUIRED_DATA_MESSAGE)
      return
    }

    setAuthFeedback('Business setup completed.')
    setLastAction('Business setup completed. Dashboard is now active.')
    setActiveScreen('dashboard')
  }

  const handleGeneratePlan = () => {
    if (!cashToday.trim()) {
      setPlanFeedback(REQUIRED_DATA_MESSAGE)
      return
    }

    const nextPlan = buildLiquidityPlan(disposableCash)
    if (nextPlan.length === 0) {
      setPlanGenerated(false)
      setSuggestedPayments([])
      setPlanFeedback(REQUIRED_DATA_MESSAGE)
      return
    }

    setPlanGenerated(true)
    setSuggestedPayments(nextPlan)
    setPlannedBatchPayments([])
    setPlanFeedback('Nearest due payments prioritized and split generated.')
    setLastAction("Liquidity plan generated for today's available cash.")
  }

  const handleConfirmAll = () => {
    if (!planGenerated) {
      setPlanFeedback(REQUIRED_DATA_MESSAGE)
      return
    }

    if (suggestedPayments.length === 0) {
      setPlanFeedback(REQUIRED_DATA_MESSAGE)
      return
    }

    const primaryPayment = suggestedPayments[0]
    setPlannedBatchPayments(suggestedPayments)
    setSelectedVendorId(primaryPayment.vendorId)
    setTransactionType('debit')
    setTransactionAmount(String(suggestedPayments.reduce((sum, payment) => sum + payment.amount, 0)))
    setTransactionDate(new Date().toISOString().slice(0, 10))
    setPaymentMethod('')
    setTransactionFeedback('')
    setPlanFeedback('Plan moved as a single batch payment with split details.')
    setLastAction('Liquidity split transferred to transaction confirmation.')
    setActiveScreen('transaction')
  }

  const handleAddOtherCommodity = () => {
    if (!selectedCommodity) {
      return
    }

    if (currentCommoditySelections.length === 0) {
      setInventoryFeedback(REQUIRED_DATA_MESSAGE)
      return
    }

    setPurchaseCart((current) => mergePurchaseItems(current, currentCommoditySelections))
    setBuyQuantities({})
    setSelectedCommodity(null)
    setInventoryFeedback('Items added. Select another grain or vegetable.')
  }

  const handleConfirmSmartBuy = () => {
    if (pendingSmartBuyItems.length === 0) {
      setInventoryFeedback(REQUIRED_DATA_MESSAGE)
      return
    }

    const vendorTotals = new Map<number, number>()
    for (const item of pendingSmartBuyItems) {
      const current = vendorTotals.get(item.vendorId) ?? 0
      vendorTotals.set(item.vendorId, current + item.amount)
    }

    const batchPayments = Array.from(vendorTotals.entries()).map(([vendorId, amount]) => ({
      vendorId,
      amount,
    }))

    const totalAmount = batchPayments.reduce((sum, entry) => sum + entry.amount, 0)
    setPlannedBatchPayments(batchPayments)
    setSelectedVendorId(batchPayments[0].vendorId)
    setTransactionType('credit')
    setTransactionAmount(String(totalAmount))
    setTransactionDate(new Date().toISOString().slice(0, 10))
    setPaymentMethod('')
    setTransactionFeedback('')
    setLastAction('Smart buy basket moved to transaction for bill generation.')
    setActiveScreen('transaction')

    setBuyQuantities({})
    setPurchaseCart([])
    setSelectedCommodity(null)
    setInventoryFeedback('')
  }

  const handleSaveTransaction = () => {
    if (!transactionAmount.trim() || !transactionDate.trim() || (transactionType === 'debit' && !paymentMethod) || (!plannedBatchPayments.length && !selectedVendorId)) {
      setTransactionFeedback(REQUIRED_DATA_MESSAGE)
      return
    }

    const amountValue = Number(transactionAmount)
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setTransactionFeedback(REQUIRED_DATA_MESSAGE)
      return
    }

    const parsedTransactionDate = parseDate(transactionDate)
    if (!parsedTransactionDate) {
      setTransactionFeedback('Please enter a valid transaction date.')
      return
    }

    const transactionDateValue = parsedTransactionDate.toISOString().slice(0, 10)

    if (plannedBatchPayments.length > 0) {
      setRecordedTransactions((current) => [
        ...current,
        ...plannedBatchPayments.map((payment) => ({
          vendorId: payment.vendorId,
          type: transactionType,
          amount: payment.amount,
          date: transactionDateValue,
          screenshotName: paymentScreenshot?.name,
        })),
      ])
      if (transactionType === 'debit') {
        setVendorDueAdjustments((current) => {
          const next = { ...current }
          for (const payment of plannedBatchPayments) {
            next[payment.vendorId] = (next[payment.vendorId] ?? 0) + payment.amount
          }
          return next
        })
      }
    } else {
      setRecordedTransactions((current) => [
        ...current,
        {
          vendorId: selectedVendorId,
          type: transactionType,
          amount: amountValue,
          date: transactionDateValue,
          screenshotName: paymentScreenshot?.name,
        },
      ])
      if (transactionType === 'debit') {
        setVendorDueAdjustments((current) => ({
          ...current,
          [selectedVendorId]: (current[selectedVendorId] ?? 0) + amountValue,
        }))
      }
    }

    setPaymentScreenshot(null)
    setTransactionFeedback(
      transactionType === 'debit' ? `${paymentMethod} payment confirmed.` : 'Stock credited successfully.',
    )
    if (plannedBatchPayments.length > 0) {
      setLastAction(
        `Batch payment confirmed via ${paymentMethod} for ${plannedBatchPayments.length} vendors (${formatCurrency(batchTotal)}).`,
      )
      return
    }

    setLastAction(`${transactionType === 'credit' ? 'Credit' : 'Debit'} transaction saved for ${selectedVendor.name}${transactionType === 'debit' ? ` via ${paymentMethod}` : ''}.`)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">OP</div>
          <div>
            <p className="eyebrow">Operational finance</p>
            <h1>OptiPay</h1>
          </div>
        </div>

        <nav className="screen-nav" aria-label="OptiPay screens">
          {screens.map((screen) => (
            <button
              key={screen.id}
              type="button"
              className={screen.id === activeScreen ? 'nav-chip active' : 'nav-chip'}
              onClick={() => handleProtectedNavigation(screen.id)}
            >
              <span>{screen.label}</span>
              <small>{screen.caption}</small>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <h2>{screens.find((screen) => screen.id === activeScreen)?.caption}</h2>
          </div>
          <button
            type="button"
            className="fab"
            onClick={() => handleProtectedNavigation('transaction')}
            aria-label="Log transaction"
          >
            +
          </button>
        </header>

        {activeScreen === 'auth' && (
          <section className="screen auth-screen">
            <div className="auth-hero card">
              <p className="eyebrow">Secure entry point</p>
              <div className="auth-logo">OptiPay</div>
              <h3>Verification first. Friction low.</h3>
              <p>Mobile-first authentication for Indian SMEs with OTP-based access and fast business onboarding.</p>
            </div>

            <div className="auth-panel card">
              <div className="segmented-control">
                <button type="button" className={authMode === 'mobile' ? 'active' : ''} onClick={() => setAuthMode('mobile')}>
                  Mobile Number
                </button>
                <button type="button" className={authMode === 'email' ? 'active' : ''} onClick={() => setAuthMode('email')}>
                  Email
                </button>
              </div>

              <label className="field">
                <span>{authMode === 'mobile' ? 'Mobile Number' : 'Email Address'}</span>
                <input
                  value={authInput}
                  onChange={(event) => setAuthInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleVerifyOtp()
                    }
                  }}
                />
              </label>

              <div className="otp-row">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpInputRefs.current[index] = element
                    }}
                    value={digit}
                    maxLength={1}
                    onChange={(event) => {
                      const nextValue = event.target.value.replace(/\D/g, '').slice(-1)
                      const next = [...otp]
                      next[index] = nextValue
                      setOtp(next)

                      if (nextValue && index < otp.length - 1) {
                        otpInputRefs.current[index + 1]?.focus()
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        handleVerifyOtp()
                      }

                      if (event.key === 'Backspace' && !otp[index] && index > 0) {
                        otpInputRefs.current[index - 1]?.focus()
                      }
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={handleVerifyOtp}
              >
                Verify OTP
              </button>

              <button
                type="button"
                className="text-button"
                onClick={() => {
                  if (!isOtpVerified) {
                    setAuthFeedback(REQUIRED_DATA_MESSAGE)
                    return
                  }

                  setShowBusinessSetup((current) => !current)
                }}
              >
                Register New Business
              </button>

              {authFeedback && <p className="helper-text">{authFeedback}</p>}

              {showBusinessSetup && (
                <div className="setup-panel">
                  <p className="eyebrow">Business setup</p>
                  <label className="field">
                    <span>Business Name</span>
                    <input
                      value={businessName}
                      onChange={(event) => setBusinessName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          handleCompleteSetup()
                        }
                      }}
                    />
                  </label>
                  <label className="field">
                    <span>Location</span>
                    <input
                      value={businessLocation}
                      onChange={(event) => setBusinessLocation(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          handleCompleteSetup()
                        }
                      }}
                    />
                  </label>
                  <button type="button" className="primary-button" onClick={handleCompleteSetup}>
                    Continue to Dashboard
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {activeScreen === 'dashboard' && (
          <section className="screen dashboard-screen">
            <div className="hero-debt card debt-card">
              <div>
                <p className="eyebrow">Total outstanding debt</p>
                <h3>{formatCurrency(totalDebt)}</h3>
              </div>
              <div className="trend-pill danger">▲ Up 6% this week</div>
            </div>

            <section className="dashboard-notifications card">
              <div className="section-heading">
                <h3>Notifications</h3>
                <span>Nearest due first</span>
              </div>
              <p className="helper-text">{lastAction}</p>
              <div className="notification-list">
                {notifications.slice(0, 4).map((item) => (
                  <article
                    key={item.vendorId}
                    className={
                      item.vendorId === nearestDueNotification?.vendorId
                        ? 'notification-item nearest-due'
                        : 'notification-item'
                    }
                  >
                    <strong>{item.name}</strong>
                    <span>{item.summary}</span>
                    <small>{item.countdown}</small>
                  </article>
                ))}
              </div>
            </section>

            <div className="risk-strip">
              <div className="section-heading">
                <h3>Upcoming Dues</h3>
                <span>Closest payment deadlines first</span>
              </div>
              <div className="risk-cards">
                {upcomingDueVendors.map((item) => {
                  const vendor = vendorById(item.vendorId)
                  if (!vendor) {
                    return null
                  }

                  return (
                    <article key={vendor.id} className="risk-card card">
                      <strong>{vendor.name}</strong>
                      <span>{item.countdown}</span>
                      <small>{formatCurrency(vendor.balance)} pending</small>
                    </article>
                  )
                })}
                {upcomingDueVendors.length === 0 && (
                  <article className="risk-card card">
                    <strong>No upcoming dues</strong>
                    <span>All vendors are currently beyond due window.</span>
                  </article>
                )}
              </div>

              <div className="section-heading">
                <h3>Overdue</h3>
                <span>Vendors pending past due date</span>
              </div>
              <div className="risk-cards overdue-cards">
                {overdueVendors.map((item) => {
                  const vendor = vendorById(item.vendorId)
                  if (!vendor) {
                    return null
                  }

                  return (
                    <article key={vendor.id} className="risk-card overdue-card card">
                      <strong>{vendor.name}</strong>
                      <span>{item.countdown}</span>
                      <small>{formatCurrency(vendor.balance)} pending</small>
                    </article>
                  )
                })}
                {overdueVendors.length === 0 && (
                  <article className="risk-card overdue-card card">
                    <strong>No overdue vendors</strong>
                    <span>All dues are within the active payment window.</span>
                  </article>
                )}
              </div>
            </div>

            <div className="stats-grid">
              <article className="stat-card card">
                <span>Active Vendors</span>
                <strong>{vendors.length}</strong>
              </article>
              <article className="stat-card card">
                <span>Payment This Month</span>
                <strong>{formatCurrency(paymentThisMonth)}</strong>
              </article>
              <article className="stat-card card">
                <span>Pending Amount</span>
                <strong>{formatCurrency(pendingAmount)}</strong>
              </article>
            </div>
          </section>
        )}

        {activeScreen === 'vendors' && (
          <section className="screen vendors-screen">
            <div className="toolbar card">
              <label className="field grow">
                <span>Search vendors or commodity</span>
                <input value={vendorSearch} onChange={(event) => setVendorSearch(event.target.value)} placeholder="Search Rice, Milk, Sharma..." />
              </label>
              <label className="field compact">
                <span>Filter by status</span>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'All' | VendorStatus)}>
                  <option>All</option>
                  <option>Critical</option>
                  <option>Safe</option>
                  <option>Overdue</option>
                </select>
              </label>
            </div>

            <div className="vendor-list card">
              {[...filteredVendors]
                .sort((left, right) => {
                  const leftRank = vendorPriorityRank.get(left.id) ?? Number.MAX_SAFE_INTEGER
                  const rightRank = vendorPriorityRank.get(right.id) ?? Number.MAX_SAFE_INTEGER
                  return leftRank - rightRank
                })
                .map((vendor) => (
                <button
                  key={vendor.id}
                  type="button"
                  className="vendor-row"
                  onClick={() => {
                    setSelectedVendorId(vendor.id)
                    setActiveScreen('ledger')
                  }}
                >
                  <div className="vendor-avatar">{vendor.name.charAt(0)}</div>
                  <div className="vendor-meta">
                    <strong>{vendor.name}</strong>
                    <span>{vendor.commodity}</span>
                  </div>
                  <div className="vendor-balance">
                    <strong>{formatCurrency(vendor.balance)}</strong>
                    <span className={`status-badge ${vendor.status.toLowerCase()}`}>{vendor.score}/10 Criticality</span>
                  </div>
                </button>
                ))}
            </div>
          </section>
        )}

        {activeScreen === 'ledger' && (
          <section className="screen ledger-screen">
            <div className="profile-card card">
              <div>
                <p className="eyebrow">Vendor profile</p>
                <h3>{selectedVendor.name}</h3>
                <span>{selectedVendor.commodity} supply partner</span>
              </div>
              <div className="profile-metrics">
                <a href={`tel:${selectedVendor.phone}`} className="metric-chip">
                  {selectedVendor.phone}
                </a>
                <div className="metric-chip">{selectedVendor.lastPaymentDays} days remain to complete dues</div>
              </div>
            </div>

            <div className="ledger-list card">
              {selectedVendor.ledger.map((entry) => (
                <article key={entry.id} className="ledger-row">
                  <div className={`ledger-marker ${entry.type}`}>{entry.type === 'credit' ? '+' : '-'}</div>
                  <div className="ledger-copy">
                    <strong>{entry.title}</strong>
                    <span>{entry.detail}</span>
                    <small>{entry.date}</small>
                  </div>
                  <div className="ledger-amount-group">
                    <strong className={entry.type === 'credit' ? 'amount-in' : 'amount-out'}>
                      {entry.type === 'credit' ? '+' : '-'}
                      {formatCurrency(entry.amount)}
                    </strong>
                    {entry.attachment && <span className="paperclip">📎 Bill View</span>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeScreen === 'inventory' && (
          <section className="screen inventory-screen">
            <div className="commodity-grid">
              {commodityOptions.map((commodity) => (
                <button key={commodity.name} type="button" className="commodity-card card" onClick={() => setSelectedCommodity(commodity.name)}>
                  <span className="commodity-icon">{commodity.icon}</span>
                  <strong>{commodity.name}</strong>
                </button>
              ))}
            </div>

            {selectedCommodity && (
              <div className="comparison-modal card">
                <div className="modal-heading">
                  <div>
                    <p className="eyebrow">Smart buy comparison</p>
                    <h3>{selectedCommodity} vendor comparison</h3>
                  </div>
                  <button type="button" className="text-button" onClick={() => setSelectedCommodity(null)}>
                    Close
                  </button>
                </div>

                <div className="comparison-grid">
                  {comparisonVendors.length > 0 ? (
                    comparisonVendors.map((vendor) => (
                      <article key={vendor.id} className={vendor.id === recommendedVendor?.id ? 'comparison-card recommended' : 'comparison-card'}>
                        <strong>{vendor.name}</strong>
                        <span>
                          Current Debt: {formatCurrency(vendor.balance)} {vendor.balance > 20000 ? '(High)' : '(Low)'}
                        </span>
                        <label className="field">
                          <span>Buy Quantity ({selectedCommodityUnitLabel})</span>
                          <input
                            value={buyQuantities[vendor.id] ?? ''}
                            onChange={(event) => {
                              const value = event.target.value.replace(/[^0-9]/g, '')
                              setBuyQuantities((current) => ({
                                ...current,
                                [vendor.id]: value,
                              }))
                            }}
                            placeholder="0"
                          />
                        </label>
                        <small>
                          Current Debt + Buy Value: {formatCurrency(vendor.balance)} +{' '}
                          {formatCurrency((Number(buyQuantities[vendor.id]) || 0) * selectedCommodityUnitRate)} ={' '}
                          {formatCurrency(vendor.balance + (Number(buyQuantities[vendor.id]) || 0) * selectedCommodityUnitRate)}
                        </small>
                        {vendor.id === recommendedVendor?.id && <small>Recommended to balance debt load</small>}
                      </article>
                    ))
                  ) : (
                    <article className="comparison-card full-width">
                      <strong>No direct comparison data</strong>
                      <span>Add more vendors in this category to unlock A vs B analysis.</span>
                    </article>
                  )}
                </div>

                {comparisonVendors.length > 0 && (
                  <div className="wizard-controls">
                    <button type="button" className="text-button" onClick={handleAddOtherCommodity}>
                      Add Other Grain / Vegetable
                    </button>
                  </div>
                )}
              </div>
            )}

            {pendingSmartBuyItems.length > 0 && (
              <div className="wizard card">
                <div className="section-heading">
                  <h3>Smart Buy Basket</h3>
                  <span>{formatCurrency(pendingSmartBuyTotal)} total</span>
                </div>
                {pendingSmartBuyItems.map((item, index) => (
                  <div key={`${item.vendorId}-${item.commodity}-${index}`} className="plan-row">
                    <strong>
                      {item.vendorName} - {item.commodity}
                    </strong>
                    <span>
                      {item.quantity} {item.unitLabel} ({formatCurrency(item.amount)})
                    </span>
                  </div>
                ))}
                <button type="button" className="primary-button wide" onClick={handleConfirmSmartBuy}>
                  Confirm All for Bill Generation
                </button>
              </div>
            )}

            {inventoryFeedback && <p className="helper-text">{inventoryFeedback}</p>}
          </section>
        )}

        {activeScreen === 'liquidity' && (
          <section className="screen liquidity-screen">
            <div className="wizard card">
              <p className="eyebrow">Liquidity optimizer</p>
              <div className="wizard-controls">
                <label className="field grow">
                  <span>Disposable Cash Today</span>
                  <input
                    value={cashToday}
                    onChange={(event) => setCashToday(event.target.value.replace(/[^0-9]/g, ''))}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        handleGeneratePlan()
                      }
                    }}
                  />
                </label>
                <button type="button" className="primary-button" onClick={handleGeneratePlan}>
                  Generate Plan
                </button>
              </div>
              {planFeedback && <p className="helper-text">{planFeedback}</p>}
            </div>

            {planGenerated && (
              <div className="plan-grid">
                <section className="plan-card critical card">
                  <div className="section-heading">
                    <h3>Must Pay</h3>
                    <span>Tier 1 critical vendors</span>
                  </div>
                  {mustPay.map((vendor) => (
                    <div key={vendor.vendorId} className="plan-row">
                      <strong>{vendorById(vendor.vendorId)?.name}</strong>
                      <span>{formatCurrency(vendor.amount)}</span>
                    </div>
                  ))}
                </section>

                <section className="plan-card card">
                  <div className="section-heading">
                    <h3>Backlog</h3>
                    <span>Oldest debts to chip away</span>
                  </div>
                  {backlog.map((vendor) => (
                    <div key={vendor.vendorId} className="plan-row">
                      <strong>{vendorById(vendor.vendorId)?.name}</strong>
                      <span>{formatCurrency(vendor.amount)}</span>
                    </div>
                  ))}
                </section>
              </div>
            )}

            {planGenerated && (
              <button type="button" className="primary-button wide" onClick={handleConfirmAll}>
                Confirm All
              </button>
            )}
          </section>
        )}

        {activeScreen === 'transaction' && (
          <section className="screen transaction-screen">
            <div className="transaction-form card">
              <div className="segmented-control transaction-toggle">
                <button type="button" className={transactionType === 'credit' ? 'active' : ''} onClick={() => setTransactionType('credit')}>
                  Credit (Stock In)
                </button>
                <button type="button" className={transactionType === 'debit' ? 'active' : ''} onClick={() => setTransactionType('debit')}>
                  Debit (Payment Out)
                </button>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>{plannedBatchPayments.length > 0 ? 'Vendor Selection (Batch)' : 'Vendor Selector'}</span>
                  <select
                    value={selectedVendorId}
                    onChange={(event) => {
                      setSelectedVendorId(Number(event.target.value))
                      setTransactionFeedback('')
                    }}
                    disabled={plannedBatchPayments.length > 0}
                  >
                    <option value={0} disabled>Select vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Amount</span>
                  <input
                    value={transactionAmount}
                    onChange={(event) => {
                      setTransactionAmount(event.target.value.replace(/[^0-9]/g, ''))
                      setTransactionFeedback('')
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        handleSaveTransaction()
                      }
                    }}
                    readOnly={plannedBatchPayments.length > 0}
                  />
                </label>
                <label className="field">
                  <span>Date</span>
                  <input
                    type="date"
                    value={transactionDate}
                    onChange={(event) => {
                      setTransactionDate(event.target.value)
                      setTransactionFeedback('')
                    }}
                  />
                </label>
              </div>

              {transactionType === 'debit' && plannedBatchPayments.length > 0 && (
                <div className="batch-breakdown card">
                  <p className="eyebrow">Suggested monetary division</p>
                  {plannedBatchPayments.map((payment) => (
                    <div key={payment.vendorId} className="batch-row">
                      <strong>{vendorById(payment.vendorId)?.name}</strong>
                      <span>{formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              {transactionType === 'debit' && (
                <div className="payment-method-panel">
                  <p className="eyebrow">Confirm via payment mode</p>
                  <div className="payment-method-options">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method}
                        type="button"
                        className={paymentMethod === method ? 'method-chip active' : 'method-chip'}
                        onClick={() => {
                          setPaymentMethod(method)
                          setTransactionFeedback('')
                        }}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {transactionType === 'credit' && (
                <div className="upload-area">
                  <span>📷 Upload Bill</span>
                  <small>Camera capture and OCR placeholder</small>
                </div>
              )}

              {transactionType === 'debit' && (
                <label className="field">
                  <span>Attach Payment Screenshot</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null
                      if (file) {
                        setPaymentScreenshot({ name: file.name, previewUrl: URL.createObjectURL(file) })
                      } else {
                        setPaymentScreenshot(null)
                      }
                      setTransactionFeedback('')
                    }}
                  />
                  {paymentScreenshot && (
                    <img
                      src={paymentScreenshot.previewUrl}
                      alt="Payment screenshot preview"
                      className="screenshot-preview"
                    />
                  )}
                </label>
              )}

              <button
                type="button"
                className="primary-button"
                onClick={handleSaveTransaction}
              >
                {plannedBatchPayments.length > 0 ? 'Confirm Batch Payment' : 'Confirm Payment'}
              </button>
              {transactionFeedback && <p className="helper-text">{transactionFeedback}</p>}
            </div>

            {transactionType === 'credit' && (
              <div className="payment-calendar card">
                <div className="section-heading">
                  <h3>Purchase Calendar</h3>
                  <span>{calendarMonthLabel}</span>
                </div>
                <div className="cal-day-labels">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
                <div className="cal-grid">
                  {Array.from({ length: calendarFirstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="cal-cell empty" />
                  ))}
                  {Array.from({ length: calendarDaysInMonth }, (_, i) => i + 1).map((day) => {
                    const dateStr = `${calendarYear}-${String(calendarMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const hasPurchase = creditTransactionDates.has(dateStr)
                    const isSelected = creditCalendarSelectedDate === dateStr
                    return (
                      <button
                        key={day}
                        type="button"
                        className={`cal-cell${hasPurchase ? ' has-purchase' : ''}${isSelected ? ' selected' : ''}`}
                        onClick={() => setCreditCalendarSelectedDate(isSelected ? null : dateStr)}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
                {creditCalendarSelectedDate && (
                  <div className="cal-detail">
                    {recordedTransactions
                      .filter((t) => t.type === 'credit' && t.date === creditCalendarSelectedDate)
                      .map((t, index) => {
                        const vendor = vendorById(t.vendorId)
                        return (
                          <div key={index} className="cal-event">
                            <strong>{vendor?.name}</strong>
                            <span>Bought: {formatCurrency(t.amount)}</span>
                            <small>Due: {formatCurrency(effectiveDue(t.vendorId, vendor?.dueAmount ?? 0))}</small>
                          </div>
                        )
                      })}
                    {recordedTransactions.filter((t) => t.type === 'credit' && t.date === creditCalendarSelectedDate).length === 0 && (
                      <p className="helper-text">No purchases recorded on this date.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {transactionType === 'debit' && (
              <div className="payment-calendar card">
                <div className="section-heading">
                  <h3>Payment Calendar</h3>
                  <span>{calendarMonthLabel}</span>
                </div>
                <div className="cal-day-labels">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
                <div className="cal-grid">
                  {Array.from({ length: calendarFirstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="cal-cell empty" />
                  ))}
                  {Array.from({ length: calendarDaysInMonth }, (_, i) => i + 1).map((day) => {
                    const dateStr = `${calendarYear}-${String(calendarMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const hasPayment = debitTransactionDates.has(dateStr)
                    const isSelected = calendarSelectedDate === dateStr
                    return (
                      <button
                        key={day}
                        type="button"
                        className={`cal-cell${hasPayment ? ' has-payment' : ''}${isSelected ? ' selected' : ''}`}
                        onClick={() => setCalendarSelectedDate(isSelected ? null : dateStr)}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
                {calendarSelectedDate && (
                  <div className="cal-detail">
                    {recordedTransactions
                      .filter((t) => t.type === 'debit' && t.date === calendarSelectedDate)
                      .map((t, index) => (
                        <div key={index} className="cal-event">
                          <strong>{vendorById(t.vendorId)?.name}</strong>
                          <span>{formatCurrency(t.amount)}</span>
                          {t.screenshotName && <small>📎 {t.screenshotName}</small>}
                        </div>
                      ))}
                    {recordedTransactions.filter((t) => t.type === 'debit' && t.date === calendarSelectedDate).length === 0 && (
                      <p className="helper-text">No payments recorded on this date.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
