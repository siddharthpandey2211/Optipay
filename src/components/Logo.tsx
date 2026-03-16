interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { icon: 40, text: 'text-2xl' },
  md: { icon: 56, text: 'text-3xl' },
  lg: { icon: 72, text: 'text-4xl' },
};

export function Logo({ size = 'md' }: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Logo Mark */}
      <div
        className="relative flex items-center justify-center rounded-2xl bg-white shadow-lg"
        style={{ width: icon, height: icon }}
      >
        <svg
          width={icon * 0.65}
          height={icon * 0.65}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="OptiPay logo mark"
        >
          {/* Coin / dollar circle */}
          <circle cx="18" cy="18" r="16" fill="#1a2151" />
          <path
            d="M18 8v2M18 24v2M13 13.5c0-1.5 2.5-2.5 5-2.5s5 1 5 2.5-2.5 2-5 2-5 1-5 2.5S15.5 22.5 18 22.5s5-1 5-2.5"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand name */}
      <div className="text-center">
        <span className={`${text} font-bold tracking-tight text-white`}>
          Opti<span className="text-blue-300">Pay</span>
        </span>
        <p className="text-blue-200 text-xs mt-0.5 tracking-wide">
          Smart Vendor &amp; Cash Flow Manager
        </p>
      </div>
    </div>
  );
}
