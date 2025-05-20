// pages/main.tsx
import CreateRoomForm from "@/components/CreateRoom";
import RoomInfo from "@/components/RoomInfo";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { IRoom } from "@/interfaces/IRoom";
import { getRooms } from "./api/room";
import MainLayout from "@/components/layouts/MainLayout";
import Loading from "@/components/Loading";

export default function Main() {
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = () => {
      getRooms().then(setRooms).catch(console.error).finally(() => setIsLoading(false));
    };

    fetchRooms();
    const interval = setInterval(fetchRooms, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MainLayout>
      {isLoading ? (
        <div className="flex items-center justify-center align-middle h-full"><Loading size="w-11 h-11" /></div>
      ) : (
        <RoomInfo rooms={rooms.filter((room) => room.member_count === 1)} />
      )}

      <button
        onClick={() => setIsCreateRoomOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#ffce00] hover:bg-[#ffd836] text-[#1c1c1c] px-6 py-3 rounded-full shadow-lg hover:scale-105 font-semibold flex items-center gap-2 cursor-pointer transition-all duration-200"
      >
        <FaPlus />
        <span className="hidden md:inline">Создать комнату</span>
      </button>

      <CreateRoomForm
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onSubmit={() => {}}
      />
    </MainLayout>
  );
}
