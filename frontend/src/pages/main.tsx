import CreateRoomForm from "@/components/CreateRoom";
import RoomInfo from "@/components/RoomInfo";
import Sidebar from "@/components/Sidebar";
import { decodeJWT } from "@/functions/decodeJWT";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FullUser, getUserById } from "./api/user";

export default function Main() {
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [user, setUser] = useState<FullUser | null>(null);

  const rooms = [
    {
      uuid: "dhsdjaaghjdgahdash",
      name: "ewqrt",
      isHard: false,
      membersIn: 1,
      memberAvatar: "https://i.ibb.co/vvTcSJr7/0df72d147985.png",
      memberUsername: "djashdaj",
    },
    {
      uuid: "dhsdjaaghjdgahdash",
      name: "ewqrt",
      isHard: true,
      membersIn: 1,
      memberAvatar: "https://i.ibb.co/vvTcSJr7/0df72d147985.png",
      memberUsername: "djashdaj",
    },
    {
      uuid: "dhsdjaaghjdgahdash",
      name: "ewqrt",
      isHard: true,
      membersIn: 1,
      memberAvatar: "https://i.ibb.co/vvTcSJr7/0df72d147985.png",
      memberUsername: "djashdaj",
    },
    {
      uuid: "dhsdjaaghjdgahdash",
      name: "ewqrt",
      isHard: false,
      membersIn: 1,
      memberAvatar: "https://i.ibb.co/vvTcSJr7/0df72d147985.png",
      memberUsername: "djashdaj",
    },
    {
      uuid: "dhsdjaaghjdgahdash",
      name: "ewqrt",
      isHard: true,
      membersIn: 1,
      memberAvatar: "https://i.ibb.co/vvTcSJr7/0df72d147985.png",
      memberUsername: "djashdaj",
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const uuid = decodeJWT(token);
    if (!uuid) return;

    getUserById(uuid).then(setUser).catch(console.error);
  }, []);

  return (
    <div className="h-screen flex bg-[linear-gradient(180deg,#4e54c8_0%,#6e72d9_100%)] overflow-hidden">
      <Sidebar username={user?.username} avatar={user?.avatar_url} />
      <div className="flex-1 overflow-y-auto p-6">
        <RoomInfo rooms={rooms} />
      </div>
      <button
        onClick={() => setIsCreateRoomOpen(true)}
        className="cursor-pointer fixed bottom-6 right-6 z-50 bg-[#ffce00] hover:bg-[#ffd836] text-[#1c1c1c] px-6 py-3 rounded-full shadow-lg transition-transform hover:scale-105 font-semibold flex items-center gap-2"
      >
        <FaPlus />
        <span className="hidden md:inline">Создать комнату</span>
      </button>
      <CreateRoomForm
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onSubmit={(data) => {
          console.log("Room data:", data);
          setIsCreateRoomOpen(false);
        }}
      />
    </div>
  );
}
