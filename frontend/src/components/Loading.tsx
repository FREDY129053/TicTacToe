import clsx from "clsx";
import { motion } from "framer-motion";

interface LoadingProps {
  size?: string;
  variant?: "spinner" | "dots";
  className?: string;
  isDark?: boolean
}

export default function Loading({
  size = "w-6 h-6",
  variant = "spinner",
  className = "",
  isDark = false,
}: LoadingProps) {
  if (variant === "dots") {
    return (
      <div className={clsx("flex items-center gap-1", className)}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={clsx("block rounded-full bg-[#ffce00]", size)}
            style={{ width: 6, height: 6 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx("relative", size, className)}>
      <motion.div
        className="relative w-full h-full"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke={isDark ? "#1c1c1c" : "#ffce00"}
            strokeWidth="1.5"
            strokeOpacity="0.2"
            fill="none"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke={isDark ? "#1c1c1c" : "#ffce00"}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </motion.div>
    </div>
  );
}
