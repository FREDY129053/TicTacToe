import { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import { FullUser, getUserById } from "@/pages/api/user";
import { decodeJWT } from "@/functions/decodeJWT";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<FullUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const uuid = decodeJWT(token);
    if (!uuid) return;

    getUserById(uuid).then(setUser).catch(console.error);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("meUsername", user.username);
      localStorage.setItem("meAvatar", user.avatar_url);
    }
  }, [user]);

  return (
    <div className="h-screen flex bg-[linear-gradient(180deg,#4e54c8_0%,#6e72d9_100%)] overflow-hidden">
      <Sidebar username={user?.username} avatar={user?.avatar_url} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
