import "@/styles/globals.css";
import { AnimatePresence, motion } from "framer-motion";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait">
      <motion.div
      className="min-h-screen bg-[linear-gradient(180deg,#4e54c8_0%,#6e72d9_100%)]"
        key={router.route}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.25 }}
      >
        <Component {...pageProps} />
      </motion.div>
    </AnimatePresence>
  );
}
