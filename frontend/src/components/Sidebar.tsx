import React, { useState } from "react";
import { BsArrowLeftShort, BsPerson } from "react-icons/bs";
import { AiOutlineLogout } from "react-icons/ai";
import { FaRobot } from "react-icons/fa";
import Image from "next/image";

export default function Sidebar() {
  const [open, setOpen] = useState<boolean>(false);

  const Menus = [
    {
      title: "Профиль",
      icon: <BsPerson />,
      spacing: true,
      hover: "hover:bg-light-white",
    },
    { title: "Игра с ботом", icon: <FaRobot />, hover: "hover:bg-light-white" },
    { title: "Выход", icon: <AiOutlineLogout />, hover: "hover:bg-red-400 hover:text-white" },
  ];

  return (
    <div
      className={`bg-[rgba(0,0,0,0.3)] h-screen p-5 pt-8 ${
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
        <Image
          className={`${
            open && "w-16 h-16"
          } rounded-xl border-2 border-[#ffce00]`}
          src={"https://i.ibb.co/vvTcSJr7/0df72d147985.png"}
          width={100}
          height={100}
          alt="Avatar"
        />
        <p className={`${!open && "hidden"} text-white font-semibold`}>fredy</p>
      </div>

      <ul className="pt-2">
        {Menus.map((menu, index) => (
          <React.Fragment key={index}>
            <li
              className={`text-[#cfd2ff] flex items-center transition-transform gap-x-4 cursor-pointer p-2 ${menu.hover} rounded-md ${menu.spacing ? "mt-7" : "mt-2"}`}
            >
              <span className="text-2xl block float-left">{menu.icon} </span>
              <span
                className={`duration-300 text-base font-medium flex-1 ${
                  !open && "hidden"
                }`}
              >
                {menu.title}
              </span>
            </li>
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
}
