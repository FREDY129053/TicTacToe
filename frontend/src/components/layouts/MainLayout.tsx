import { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import { FullUser, getUserById, logout } from "@/pages/api/user";
import { decodeJWT } from "@/functions/decodeJWT";
import { useRouter } from "next/router";

export default function MainLayout({
  children,
  isBot = false,
}: {
  children: React.ReactNode;
  isBot?: boolean;
}) {
  const [user, setUser] = useState<FullUser | null>(null);
  const [, setIsLogout] = useState(false);
  const router = useRouter()

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

  const handleLogout = () => {
    logout().then(setIsLogout).catch(console.error);
    localStorage.clear();
    router.push("/")
  };

  return (
    <div className="h-screen flex bg-[linear-gradient(180deg,#4e54c8_0%,#6e72d9_100%)] overflow-hidden">
      <Sidebar
        username={user?.username}
        avatar={user?.avatar_url}
        onClick={handleLogout}
      />
      <main className={`flex-1 ${isBot ? "p-0" : "overflow-y-auto p-6"}`}>
        {children}
      </main>
    </div>
  );
}
