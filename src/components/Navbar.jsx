import { useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";
import { RiMenu2Fill } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { RxCross2 } from "react-icons/rx";
import useUserStore from "../store/userStore";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export default function Navbar() {
  const [menu,setMenu] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
        setMenu(!menu);
  }

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
    <div className="h-18 bg-gray-800 flex items-center justify-between px-6">
      <RiMenu2Fill onClick={toggleMenu} className={`m-2 cursor-pointer ${window.innerWidth <= 767 ? 'block':'hidden'}`} size={25} />
      <h1 className='text-transparent font-bold text-xl p-3 bg-clip-text bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'>upasthiti</h1>
      <div className='gap-3 flex ml-auto mr-3'>
          <div className="group relative">
              <img
                src="https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg"
                alt="Profile"
                className="w-12 h-12 opacity-80 rounded-full border-2 cursor-pointer border-purple-500/50 "
              />
              <div className='hidden group-hover:block absolute bg-white'>
                  <div className='hidden group-hover:block -top-1 -left-20 absolute bg-gray-800 w-36 p-2 shadow-md rounded-md shadow-black'>
                    <p className='text-white text-center text-lg font-semibold hover:cursor-pointer hover:scale-105'><Link to={"/profile"}>My Profile</Link></p>
                    <div className='flex items-center justify-center'>
                    <button onClick={() => handleLogout()} className='bg-red-500 hover:bg-gray-800 hover:text-red-500 cursor-pointer p-1 text-sm rounded-lg border-2 border-red-500
                    flex font-semibold m-2'><IoMdExit className='mt-1 mr-1' size={20}/>logout</button>
                    </div>
                  </div>
              </div>
          </div>
      </div>
      
              {
                  menu ? (
                  <>
                  <div className='min-h-[100%] absolute flex h-full top-0 left-0 z-50 bg-gray-800'>
                    <Sidebar/>
                    <RxCross2 onClick={toggleMenu} className='ml-auto m-2 mt-5 cursor-pointer' size={25}/>
                  </div>
                  </>
                  ):(
                    <>
                    </>
                  )
              }
    </div>
  );
}
