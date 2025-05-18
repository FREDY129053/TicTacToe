import React, { useState } from "react";
import { BsArrowLeftShort, BsPerson } from "react-icons/bs";
import { AiOutlineLogout } from "react-icons/ai";
import { SiGoogleclassroom } from "react-icons/si"
import { FaRobot } from "react-icons/fa";
import Image from "next/image";
import Loading from "./Loading";
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
  const router = useRouter();
  const path = router.pathname;

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
        onClick={() => setOpen(!open)}
      />

      <div className="flex flex-col gap-4 items-center justify-center">
        {avatar && username ? (
          <>
            <Image
              className={`${
                open && "w-16 h-16"
              } rounded-xl border-2 border-[#ffce00]`}
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
          <Loading variant="dots" />
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
                        className={`duration-300 text-base font-medium flex-1 ${
                          !open && "hidden"
                        }`}
                      >
                        {menu.title}
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
                      className={`duration-300 text-base font-medium flex-1 ${
                        !open && "hidden"
                      }`}
                    >
                      {menu.title}
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
