"use client";

import React, { useEffect, useState } from "react";
import { BsArrowLeftShort, BsPerson } from "react-icons/bs";
import { AiOutlineLogout } from "react-icons/ai";
import { SiGoogleclassroom } from "react-icons/si";
import { FaRobot } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Sidebar({
  username,
  avatar,
  onClick,
}: {
  username: string | undefined;
  avatar: string | undefined;
  onClick?: () => void;
}) {
  const [open, setOpen] = useState<boolean>(true);
  const [isReady, setIsReady] = useState(false);
  const [showText, setShowText] = useState(open);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth <= 480) {
        setIsMobile(true);
        setOpen(false);
      } else {
        setIsMobile(false);
        const saved = localStorage.getItem("isOpenSidebar");
        setOpen(saved !== null ? JSON.parse(saved) : true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    setIsReady(true);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => setShowText(true), 200);
      return () => clearTimeout(timeout);
    } else {
      setShowText(false);
    }
  }, [open]);

  const handleToggle = () => {
    setOpen((prev) => {
      if (!isMobile)
        localStorage.setItem("isOpenSidebar", JSON.stringify(!prev));
      return !prev;
    });
  };

  const router = useRouter();
  const path = router.pathname;

  if (!isReady) return null;

  const Menus = [
    {
      title: "Профиль",
      icon: <BsPerson />,
      spacing: true,
      hover: "hover:bg-light-white",
      to: "/me",
      isShow: path !== "/me",
    },
    {
      title: "Комнаты",
      icon: <SiGoogleclassroom />,
      spacing: true,
      hover: "hover:bg-light-white",
      to: "/main",
      isShow: path !== "/main",
    },
    {
      title: "Игра с ботом",
      icon: <FaRobot />,
      hover: "hover:bg-light-white",
      to: "/bot",
      spacing: true,
      isShow: path !== "/bot",
    },
    {
      title: "Выход",
      icon: <AiOutlineLogout />,
      hover: "hover:bg-red-400 hover:text-white",
      spacing: true,
      onClick: onClick,
    },
  ];

  const MobileArrowButton = (
    <button
      className="fixed top-4 left-4 z-50 bg-white rounded-full p-2 shadow-lg transition-all duration-300"
      onClick={handleToggle}
      aria-label={open ? "Закрыть меню" : "Открыть меню"}
      style={{
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <BsArrowLeftShort
        className={`text-dark-purple text-3xl transition-all duration-300 ${
          open ? "" : "rotate-180"
        }`}
      />
    </button>
  );

  return (
    <>
      {isMobile && MobileArrowButton}
      <div
        className={`
          ${
            isMobile
              ? `fixed top-0 left-0 w-screen h-screen bg-[#4045ac] z-40 flex flex-col p-5 pt-8
                transition-all duration-300
                ${
                  open
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                }
              `
              : `bg-[rgba(0,0,0,0.3)] h-screen ${open && "mr-0"} p-5 pt-8 ${
                  open ? "w-56" : "w-20"
                } relative transition-all duration-300 z-10`
          }
        `}
        style={isMobile ? { minWidth: 0, maxWidth: "100vw" } : {}}
      >
        {!isMobile && (
          <BsArrowLeftShort
            className={`bg-white border border-dark-purple text-dark-purple text-3xl rounded-full absolute transition-all duration-300
              -right-3.5 top-9
              ${!open ? "rotate-180" : ""}
              cursor-pointer`}
            onClick={handleToggle}
          />
        )}

        <div className="flex flex-col gap-4 items-center justify-center mt-8 mb-4">
          {avatar && username ? (
            <>
              <Image
                className={`rounded-xl border-2 border-[#ffce00] transition-all duration-300 ${
                  open ? "w-16 h-16" : "w-10 h-10"
                }`}
                src={avatar}
                width={100}
                height={100}
                alt="Avatar"
              />
              <p
                className={`${
                  !open && !isMobile ? "hidden" : ""
                } text-white font-semibold`}
              >
                {username}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center w-full">
              <div
                className={`rounded-xl border-2 border-[#ffce00] bg-[#22253a] animate-pulse transition-all duration-300 ${
                  open ? "w-16 h-16" : "w-10 h-10"
                }`}
              />
              <div
                className={`transition-all duration-300 rounded bg-[#22253a] animate-pulse ${
                  open
                    ? "opacity-100 max-w-[64px] mt-5"
                    : "opacity-0 max-w-0 mt-0"
                }`}
                style={{ width: 64, height: 18 }}
              />
            </div>
          )}
        </div>

        <ul className="pt-2">
          {Menus.map((menu, index) => (
            <React.Fragment key={index}>
              {(menu.isShow == undefined || menu.isShow) && (
                <>
                  {menu.to ? (
                    <Link href={menu.to}>
                      <li
                        className={`text-[#cfd2ff] flex items-center transition-transform gap-x-4 cursor-pointer p-2 ${
                          menu.hover
                        } rounded-md ${menu.spacing ? "mt-7" : "mt-2"}`}
                      >
                        <span className="text-2xl block float-left">
                          {menu.icon}{" "}
                        </span>
                        <span
                          className={`duration-300 text-base whitespace-nowrap font-medium flex-1 transition-all ${
                            open && showText
                              ? "opacity-100 max-w-[200px] ml-0"
                              : "opacity-0 max-w-0 ml-[-8px] pointer-events-none"
                          }`}
                          style={{
                            transitionProperty: "opacity,max-width,margin",
                          }}
                        >
                          {showText && menu.title}
                        </span>
                      </li>
                    </Link>
                  ) : (
                    <li
                      onClick={menu.onClick}
                      className={`text-[#cfd2ff] flex items-center transition-transform gap-x-4 cursor-pointer p-2 ${
                        menu.hover
                      } rounded-md ${menu.spacing ? "mt-7" : "mt-2"}`}
                    >
                      <span className="text-2xl block float-left">
                        {menu.icon}{" "}
                      </span>
                      <span
                        className={`duration-300 text-base whitespace-nowrap font-medium flex-1 transition-all ${
                          open && showText
                            ? "opacity-100 max-w-[200px] ml-0"
                            : "opacity-0 max-w-0 ml-[-8px] pointer-events-none"
                        }`}
                        style={{
                          transitionProperty: "opacity,max-width,margin",
                        }}
                      >
                        {showText && menu.title}
                      </span>
                    </li>
                  )}
                </>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </>
  );
}
