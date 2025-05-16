import { useRouter } from "next/router";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export const LoginModal = ({ onClose }) => {
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push('/main')
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="opacity-0 animate-fadein bg-white/10 border border-white/20 rounded-2xl shadow-xl px-8 py-10 w-96 text-white">
        <h2 className="text-2xl font-semibold mb-6 text-center">Вход</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            className="bg-white/10 border border-[#cfd2ff] text-white placeholder-[#cfd2ff] px-4 py-2 rounded-lg focus:outline-none focus:border-[#ffce00]"
          />
          <input
            type="password"
            placeholder="Password"
            className="bg-white/10 border border-[#cfd2ff] text-white placeholder-[#cfd2ff] px-4 py-2 rounded-lg focus:outline-none focus:border-[#ffce00]"
          />
          <button
            type="submit"
            className="mt-4 bg-[#ffce00] hover:bg-[#ffd836] text-[#1c1c1c] rounded-xl py-2 cursor-pointer"
          >
            Войти
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#cfd2ff] hover:text-white mt-2 cursor-pointer"
          >
            Закрыть
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};
