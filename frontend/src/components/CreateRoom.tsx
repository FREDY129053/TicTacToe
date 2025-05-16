import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; isHard: boolean }) => void;
};

export default function CreateRoomForm({ isOpen, onClose, onSubmit }: Props) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadein">
      <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl shadow-black/30 p-8 w-[90%] max-w-md text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-red-400 transition"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
          Создание комнаты
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get("name") as string;
            const isHard = formData.get("isHard") === "on";
            onSubmit({ name, isHard });
          }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-1 text-sm text-[#cfd2ff]">
              Название комнаты
            </label>
            <input
              type="text"
              name="name"
              required
              className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 outline-none text-white placeholder-white/50 focus:ring-2 focus:ring-[#ffce00]"
              placeholder="Например, Комната акулы"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isHard"
              name="isHard"
              className="absolute opacity-0 w-0 h-0 peer"
            />
            <label
              htmlFor="isHard"
              className="w-5 h-5 rounded-md border border-white/20 bg-white/10 peer-checked:bg-[#ffce00] peer-checked:border-[#ffce00] transition-all flex items-center justify-center cursor-pointer"
            >
              <svg
                className="w-3 h-3 text-[#1c1c1c] opacity-0 peer-checked:opacity-100 transition"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </label>
            <label
              htmlFor="isHard"
              className="cursor-pointer text-base select-none text-white"
            >
              Сложная комната
            </label>
          </div>

          <button
            type="submit"
            className="cursor-pointer mt-2 bg-[#ffce00] hover:bg-[#ffd836] text-[#1c1c1c] font-semibold rounded-2xl px-6 py-3 transition"
          >
            Создать
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
