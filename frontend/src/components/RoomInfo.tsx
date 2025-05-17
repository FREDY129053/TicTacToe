import React from "react";
import { IRoom } from "@/interfaces/IRoom";
import { FaStar } from "react-icons/fa";
import Image from "next/image";

export default function RoomInfo({ rooms }: { rooms: IRoom[] }) {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      {rooms.map((room) => (
        <div
          key={room.uuid}
          className="bg-white/5 border border-white/10 rounded-xl shadow-md shadow-black/20 p-5 transition hover:shadow-xl hover:scale-105"
        >
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
                  src={room.memberAvatar}
                  alt={room.memberUsername}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-white font-medium truncate max-w-[150px]">
                {room.memberUsername}
              </span>
            </div>
            <span className="text-[#cfd2ff] whitespace-nowrap">
              {room.membersIn} / 2
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
