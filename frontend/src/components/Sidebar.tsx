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
}: {
  username: string | undefined;
  avatar: string | undefined;
}) {
  const [open, setOpen] = useState<boolean>(true);
  const [isReady, setIsReady] = useState(false);
  const [showText, setShowText] = useState(open);

  useEffect(() => {
    const saved = localStorage.getItem("isOpenSidebar");
    if (saved !== null) setOpen(JSON.parse(saved));
    setIsReady(true);
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
      spacing: true,
    },
    {
      title: "Выход",
      icon: <AiOutlineLogout />,
      hover: "hover:bg-red-400 hover:text-white",
      spacing: true,
    },
  ];

  return (
    <div
      className={`bg-[rgba(0,0,0,0.3)] h-screen ${open && "mr-2"} p-5 pt-8 ${
        open ? "w-56" : "w-20"
      } relative duration-300`}
    >
      <BsArrowLeftShort
        className={`bg-white border border-dark-purple text-dark-purple text-3xl rounded-full absolute -right-3.5 top-9 cursor-pointer ${
          !open && "rotate-180"
        }`}
        onClick={() => handleToggle()}
      />

      <div className="flex flex-col gap-4 items-center justify-center">
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
            <p className={`${!open && "hidden"} text-white font-semibold`}>
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
  );
}
