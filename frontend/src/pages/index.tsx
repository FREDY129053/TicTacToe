import { LoginModal } from "@/components/LoginForm";
import Image from "next/image";
import { useState } from "react";

import { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const FadeIn = ({ children, className = "", delay = 0 }: FadeInProps) => {
  return (
    <div
      className={`opacity-0 animate-fadein ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="w-full h-screen relative flex items-center justify-center">
      <div className="absolute inset-0 bg-enter-bg z-0">
        <ul className="circles absolute top-0 left-0 w-full h-full overflow-hidden">
          {Array.from(Array(12).keys()).map((index) => (
            <li key={index}>
              <Image
                priority={true}
                className="w-[90%] h-[90%] object-fill"
                src={"/ttt.png"}
                width={100}
                height={100}
                alt="tic-tac-toe"
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <FadeIn delay={100}>
          <div className="flex flex-col gap-16 items-center">
            <h3 className="text-center text-white font-mono leading-none text-4xl 2xl:text-6xl">
              <div className="flex flex-col gap-1 custom-anim">
                <span>TIC</span>
                <span>TAC</span>
                <span>TOE</span>
              </div>
              <span className="block text-[#cfd2ff] text-base 2xl:text-xl">
                by Lyubaya Akula
              </span>
            </h3>
            <div className="flex flex-col gap-6">
              <button
                onClick={() => setShowLogin(true)}
                className="bg-[#ffce00] hover:bg-[#ffd836] text-[#1c1c1c] cursor-pointer rounded-2xl px-6 py-3 transition-colors duration-200"
                type="button"
              >
                Играть онлайн
              </button>
              <button
                className="bg-[#7b81f1] hover:bg-[#9da1f9] text-white cursor-pointer rounded-2xl px-6 py-3 transition-colors duration-200"
                type="button"
              >
                Играть с ботом
              </button>
            </div>
          </div>
        </FadeIn>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </div>
    </div>
  );
}
