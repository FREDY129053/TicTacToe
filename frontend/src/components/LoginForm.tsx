import axios from "axios";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import Loading from "./Loading";

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal = ({ onClose }: LoginModalProps) => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username.length < 2) {
      setError("Длина никнейма должна быть минимум 2 символа")
      return
    }
    if (password.length < 3) {
      setError("Длина пароля должна быть минимум 3 символа")
      return
    }
    setError("");
    setIsLoading(true);
    axios
      .post(
        "http://localhost:8080/api/users/login",
        {
          username: username,
          password: password,
        },
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      )
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        router.push("/main");
      })
      .catch((error) => {
        setError(
          error.response?.data?.message ||
            error.response?.data?.detail ||
            "Ошибка авторизации"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="opacity-0 animate-fadein bg-white/10 border border-white/20 rounded-2xl shadow-xl px-8 py-10 w-96 text-white">
        <h2 className="text-2xl font-semibold mb-6 text-center">Вход</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            required={true}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white/10 border border-[#cfd2ff] text-white placeholder-[#cfd2ff] px-4 py-2 rounded-lg focus:outline-none focus:border-[#ffce00]"
          />
          <div className="relative">
            <input
              type={isVisiblePassword ? "text" : "password"}
              placeholder="Пароль"
              value={password}
              required={true}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border border-[#cfd2ff] text-white placeholder-[#cfd2ff] px-4 py-2 w-full rounded-lg focus:outline-none focus:border-[#ffce00]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6">
              <IoMdEyeOff
                onClick={() => setIsVisiblePassword(!isVisiblePassword)}
                className={`w-6 h-6 cursor-pointer absolute transition-opacity duration-200 ${
                  isVisiblePassword ? "opacity-100" : "opacity-0"
                }`}
                style={{ pointerEvents: isVisiblePassword ? "auto" : "none" }}
              />
              <IoMdEye
                onClick={() => setIsVisiblePassword(!isVisiblePassword)}
                className={`w-6 h-6 cursor-pointer absolute transition-opacity duration-200 ${
                  !isVisiblePassword ? "opacity-100" : "opacity-0"
                }`}
                style={{ pointerEvents: !isVisiblePassword ? "auto" : "none" }}
              />
            </span>
          </div>
          <div className="min-h-[5px] flex items-center ml-2">
            {error && (
              <span className="text-[#ff6b6b] text-sm leading-tight">
                {error}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`mt-2 bg-[#ffce00] hover:bg-[#ffd836] text-[#1c1c1c] rounded-xl py-2 cursor-pointer transition-colors duration-200 ${isLoading && "flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-[#ffe28c] disabled:text-[#9e9e9e]"}`}
          >
            {isLoading && <Loading className="!w-5 !h-5" isDark={true} />}
            Войти
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#cfd2ff] hover:text-white mt-2 cursor-pointer transition-colors duration-200"
          >
            Закрыть
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};
