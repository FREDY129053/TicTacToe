import CreateRoomForm from "@/components/CreateRoom";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import React, { useState } from "react";
import { FaPlus, FaStar } from "react-icons/fa";

export default function Main() {
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const rooms = [
    {
      name: "ewqrt",
      isHard: false,
      memberCount: 1,
      hostAvatar: "https://i.ibb.co/vvTcSJr7/0df72d147985.png",
      hostUsername: "djashdaj",
    },
    {
      name: "nmnbf",
      isHard: true,
      memberCount: 1,
      hostAvatar: "https://i.ibb.co/vvTcSJr7/0df72d147985.png",
      hostUsername: "djsahdahy713278",
    },
    {
      name: "2345y6uyjhgbvfc",
      isHard: false,
      memberCount: 1,
      hostAvatar: "https://i.ibb.co/vvTcSJr7/0df72d147985.png",
      hostUsername: "djashdaj",
    },
    {
      name: "vcbnm,jkiu76tre",
      isHard: true,
      memberCount: 1,
      hostAvatar: "https://i.ibb.co/vvTcSJr7/0df72d147985.png",
      hostUsername: "djsahdahy713278",
    },
    {
      name: "867tuyhgnf",
      isHard: false,
      memberCount: 1,
      hostAvatar: "https://i.ibb.co/vvTcSJr7/0df72d147985.png",
      hostUsername: "djashdaj",
    },
    {
      name: "3124567cxvcxvh d",
      isHard: true,
      memberCount: 1,
      hostAvatar: "https://i.ibb.co/vvTcSJr7/0df72d147985.png",
      hostUsername: "gysfd",
    },
    {
      name: "566554342324324",
      isHard: false,
      memberCount: 1,
      hostAvatar: "https://i.ibb.co/vvTcSJr7/0df72d147985.png",
      hostUsername: "gysfd",
    },
    {
      name: "adesgrdhfjgkhljk",
      isHard: false,
      memberCount: 1,
      hostAvatar: "https://i.ibb.co/vvTcSJr7/0df72d147985.png",
      hostUsername: "djashdaj",
    },
    {
      name: "fds",
      isHard: true,
      memberCount: 1,
      hostAvatar: "https://i.ibb.co/vvTcSJr7/0df72d147985.png",
      hostUsername: "djashdaj",
    },
  ];

  return (
    <div className="h-screen flex bg-[linear-gradient(180deg,#4e54c8_0%,#6e72d9_100%)] overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-xl shadow-md shadow-black/20 p-5 transition hover:shadow-xl hover:scale-105"
            >
              {/* Заголовок и сложность */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl font-bold break-words max-w-[70%]">
                  {room.name}
                </h2>
                <div className="flex items-center gap-1 text-[#ffce00]">
                  {room.isHard && <FaStar />}
                </div>
              </div>

              {/* Хост и игроки */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0">
                    <Image
                      src={room.hostAvatar}
                      alt={room.hostUsername}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-white font-medium truncate max-w-[150px]">
                    {room.hostUsername}
                  </span>
                </div>
                <span className="text-[#cfd2ff] whitespace-nowrap">
                  {room.memberCount} / 2
                </span>
              </div>
            </div>
          ))}
        </div>
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
