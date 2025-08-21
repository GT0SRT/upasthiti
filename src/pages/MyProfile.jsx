import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useUserStore from "../store/userStore";
import { CiEdit } from "react-icons/ci";

export default function MyProfile () {
  const user = useUserStore((state) => state.user);

  return (
    <div className="flex h-screen bg-gray-900 text-white">      
      {window.innerWidth <= 767 ?  (<></>): <Sidebar />}

      <div className="flex-1 overflow-y-auto flex flex-col">
        <div><Navbar /></div>
        <div className="p-6 flex flex-col md:flex-row md:items-center gap-4">
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>
        <div className="p-5 m-3 mb-0 mt-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/30 border border-gray-700 backdrop-blur-lg rounded-2xl shadow-lg p-6 flex flex-col items-center">
            <div className="ml-auto"><CiEdit size={25}/></div>
            <img
              src="https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg"
              alt="Profile"
              className="w-24 h-24 opacity-80 rounded-full border-4 border-purple-500/50 mb-4"
            />
            <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>

            <div className="mt-2 w-full flex flex-col gap-3">
              <button className="w-full py-2 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 transition font-semibold">
                Change Password
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-gray-800/30 border border-gray-700 backdrop-blur-lg rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Full Name</p>
                  <p className="font-semibold">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Role</p>
                  <p className="font-semibold">{user.isAdmin? 'Teacher':'student'}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
        {/* <RecentGroups groups={user?.MyGroups}/> */}

        {!user.isAdmin ? (
          <div className="mt-0 p-4 bg-gray-800/30 border border-gray-700 rounded-xl  m-9">
            <h2 className="text-xl font-semibold mb-2">Tips for managing Groups</h2>
            <div className="grid">
              <ul className="list-disc list-inside text-gray-500 text-sm space-y-2">
                <li>Students can mark attendance as present, absent, or holiday via the calendar.</li>
                <li>Admins can create and manage groups with full attendance control.</li>
                <li>Students can join groups through invite links shared by admins.</li>
                <li>Attendance stats are auto-calculated with monthly and yearly summaries.</li>
                <li>Admins can view and manage all their groups from the dashboard.</li>
                <li>All users can track attendance history and group participation live.</li>
              </ul>
            </div>
          </div>
        ):(<></>)}
      
      </div>
    </div>
  );
}