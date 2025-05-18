import React from "react";
import { IRoom } from "@/interfaces/IRoom";
import { FaStar } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export default function RoomInfo({ rooms }: { rooms: IRoom[] }) {
  return (
    <>
      {rooms.length !== 0 ? (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <Link
              href={`/game/${room.uuid}?is_hard=${room.is_difficult}`}
              key={room.uuid}
            >
              <div className="bg-white/5 border border-white/10 rounded-xl shadow-md shadow-black/20 p-5 transition hover:shadow-xl hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white text-xl font-bold break-words max-w-[70%]">
                    {room.name}
                  </h2>
                  <div className="flex items-center gap-1 text-[#ffce00]">
                    {room.is_difficult && <FaStar />}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0">
                      <Image
                        src={room.host_avatar}
                        alt={room.host_username}
                        width={60}
                        height={60}
                        className="w-full h-full object-fill"
                      />
                    </div>
                    <span className="text-white font-medium truncate max-w-[150px]">
                      {room.host_username}
                    </span>
                  </div>
                  <span className="text-[#cfd2ff] whitespace-nowrap">
                    {room.member_count} / 2
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-white text-2xl flex items-center justify-center h-full min-h-[calc(100vh-200px)]">
          Нет игровых комнат, но вы можете создать...
        </div>
      )}
    </>
  );
}
