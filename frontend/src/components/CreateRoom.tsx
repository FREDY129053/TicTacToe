import { decodeJWT } from "@/functions/decodeJWT";
import axios from "axios";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
import Loading from "./Loading";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export default function CreateRoomForm({ isOpen, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [isDifficult, setIsDifficult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const uuid = decodeJWT(token);
    setIsLoading(true);
    axios
      .post(
        "http://localhost:8080/api/rooms",
        {
          user_uuid: uuid,
          name: name,
          is_difficult: isDifficult,
        },
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      )
      .then((response) =>
        router.push(`/game/${response.data.uuid}?is_hard=${isDifficult}`)
      )
      .catch((error) => {
        console.error(
          "Ошибка:",
          error.response ? error.response.data : error.message
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
    setName("");
    setIsDifficult(false);
    onSubmit();
  };

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
          className="absolute top-4 right-4 text-white hover:text-red-400 transition cursor-pointer"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
          Создание комнаты
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-1 text-sm text-[#cfd2ff]">
              Название комнаты
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              required
              className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 outline-none text-white placeholder-white/50 focus:ring-2 focus:ring-[#ffce00]"
              placeholder="Например, Комната акулы"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isHard"
              checked={isDifficult}
              onChange={(e) => setIsDifficult(e.target.checked)}
              name="isHard"
              className="absolute opacity-0 w-0 h-0 peer"
            />

            <label
              htmlFor="isHard"
              className="w-5 h-5 rounded-md border border-white/20 bg-white/10
               peer-checked:bg-[#ffce00] peer-checked:border-[#ffce00]
               transition-all flex items-center justify-center cursor-pointer"
            >
              <svg
                className="w-3 h-3 text-[#1c1c1c] opacity-0
                 peer-checked:opacity-100 transition"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </label>

            <div className="flex items-center gap-2">
              <label
                htmlFor="isHard"
                className="cursor-pointer text-base select-none text-white"
              >
                Сложная комната
              </label>

              <div className="relative group inline-block mt-1">
                <button
                  type="button"
                  aria-label="Что значит «сложная комната»?"
                  className="text-white/70 hover:text-[#ffce00] focus:outline-none"
                >
                  <FiHelpCircle size={16} />
                </button>

                <div
                  className="absolute -top-16 left-1/2 w-64 -translate-x-1/2
                   rounded-lg border border-white/20 bg-[#1c1c1c]/90
                   px-3 py-2 text-xs leading-relaxed text-white
                   opacity-0 invisible transition-opacity duration-200
                   group-hover:visible group-hover:opacity-100
                   group-focus-within:visible group-focus-within:opacity-100"
                >
                  У вас и у&nbsp;соперника будет только по&nbsp;три&nbsp;фишки —
                  крестики или нолики. Кто первым выстроит победную линию?
                  <span
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2
                     h-0 w-0 border-l-8 border-r-8 border-t-8
                     border-l-transparent border-r-transparent border-t-[#1c1c1c]/90"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`cursor-pointer mt-2 bg-[#ffce00] hover:bg-[#ffd836] text-[#1c1c1c] font-semibold rounded-2xl px-6 py-3 transition ${
              isLoading &&
              "flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-[#ffe28c] disabled:text-[#9e9e9e]"
            }`}
          >
            {isLoading && <Loading className="!w-5 !h-5" isDark={true} />}
            Создать
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
