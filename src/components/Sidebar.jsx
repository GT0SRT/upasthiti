import { Home } from "lucide-react";
import { FaRegUser } from "react-icons/fa";
import { GrGroup } from "react-icons/gr";
import { IoIosHelpBuoy, IoMdExit } from "react-icons/io";
import { LuSparkles } from "react-icons/lu";
import { MdOutlineFeedback } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../store/userStore";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export default function Sidebar() {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  const menu = [
    { label: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },
    { label: "Groups", path: "/group", icon: <GrGroup size={20} /> },
    { label: "Profile", path: "/profile", icon: <FaRegUser size={20} /> },
    // { label: "Feedback", path: "/feedback", icon: <MdOutlineFeedback size={20} /> },
  ];

  const handleLogout = async () => {
    try {
      useUserStore.getState().clearUser();
      await signOut(auth);
      console.log("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex w-64 bg-gray-800 flex-col gap-4">
      <div className="flex gap-3 border-b-2 border-gray-700 pt-3 pb-3 ml-2 pl-2">
        <div className='w-10 h-10 mt-2 flex justify-center items-center rounded-xl bg-gradient-to-br from-purple-400 to-[blue]'><LuSparkles size={25}/></div>
        <div>
          <h2 className="text-2xl text-transparent font-bold bg-clip-text bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">upasthiti</h2>
          <p className="text-xs text-center text-gray-300">{user.isAdmin ? 'admin':'user'} Dashboard</p>
        </div>
      </div>
      {menu.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="flex items-center gap-3 p-2 ml-2 mr-2 rounded-lg hover:bg-gradient-to-br from-purple-400 to-[blue] transition"
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
      <button className='hover:bg-red-500 bg-gray-800 hover:text-white text-red-500 cursor-pointer p-1 text-sm rounded-lg border-2 border-red-500
      flex font-semibold m-2 w-22 ml-4' onClick={() => handleLogout()}><IoMdExit className='mt-1 mr-1' size={20}/>logout</button>
    </div>
  );
}