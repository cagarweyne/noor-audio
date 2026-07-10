// Brand logo: microphone/sound glyph in a gold gradient rounded square.
type AppLogoProps = {
  size?: number;
  showWordmark?: boolean;
};

export default function AppLogo({ size = 46, showWordmark = false }: AppLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center rounded-[13px] shadow-glow"
        style={{
          width: size,
          height: size,
          backgroundImage: "linear-gradient(150deg, #fec766, #cb7e19)",
        }}
      >
        <svg
          width={size * 0.56}
          height={size * 0.56}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#170a02"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z" />
          <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
        </svg>
      </div>
      {showWordmark && (
        <div>
          <div className="font-display text-3xl font-semibold leading-none">Noor</div>
          <div className="font-arabic text-[15px] text-gold-accent" dir="rtl">
            نور
          </div>
        </div>
      )}
    </div>
  );
}
