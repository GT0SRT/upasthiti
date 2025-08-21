import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { FaPlus } from 'react-icons/fa6'
import SubjectCard from '../components/SubjectCard'
import useUserStore from '../store/userStore'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../Components/firebase'
import { toast } from 'react-toastify'

const MyGroup = () => {
  const user = useUserStore((state) => state.user);
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [instructorName, setInstructorName] = useState("");

  const generateInviteCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  useEffect(() => {
    setInviteCode(generateInviteCode());
  }, []);

  useEffect(() => {
    if (user?.isAdmin) {
      setInstructorName(`${user.firstName} ${user.lastName}`);
    }
  }, [user]);

const handleCreate = async (e) => {
  e.preventDefault();
  if (!groupName) return;

  const uid = user.uid;
  const year = new Date().getFullYear();

  const makeMonths = () => {
    const months = {};
    for (let i = 0; i < 12; i++) {
      months[i] = [];
    }
    return months;
  };

  const userDocRef = doc(db, "Users", uid);

  let groupData;

  if (user.isAdmin) {
    // Admin logic
    groupData = {
      subjectName: groupName,
      inviteCode: inviteCode,
      instructorName: instructorName || user.name,
      rate: 0,
      createdAt: Date.now(),
      students: [],
    };
  } else {
    // Student logic
    groupData = {
      subjectName: groupName,
      instructorName: instructorName || user.name,
      createdAt: Date.now(),
      rate: 0,
      attendance: {
        [year]: {
          present: makeMonths(),
          absent: makeMonths(),
          holiday: makeMonths(),
        },
      },
    };
  }

  await updateDoc(userDocRef, {
    [`MyGroups.${groupName}`]: groupData,
  });

  const updatedUser = {
    ...user,
    MyGroups: {
      ...(user.MyGroups || {}),
      [groupName]: groupData,
    },
  };

  useUserStore.getState().setUser(updatedUser);

  toast.success("Group created successfully");

  setShowModal(false);
  setGroupName("");
  setInstructorName("");
};

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {window.innerWidth <= 767 ? (<></>) : (<Sidebar />)}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className='block'><Navbar /></div>
        <div className="p-6 flex">
          <h1 className="text-xl font-bold">My Groups</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:scale-105 cursor-pointer p-2 text-sm rounded-2xl flex font-semibold ml-auto"
          ><FaPlus className='mt-1 mr-1' size={15} />Create</button>
        </div>
        <div className='p-5 md:ml-5 pt-0 flex flex-wrap gap-7 md:gap-7'>
          {(user.MyGroups
            ? Object.entries(user.MyGroups)
            : []
          ).map(([key, group]) => (
            <SubjectCard
              key={key}
              subject={group.subjectName}
              teacher={user.isAdmin ? (null):(group.instructorName)}
              attendance={group.attendance?.[new Date().getFullYear()]?.[new Date().getMonth()]?.length || 0}
            />
          ))}
        </div>

        {user.isAdmin ? (<></>) : (
          <>
            <div className="p-6 flex">
              <h1 className="text-xl font-bold">Other Groups</h1>
            </div>
            <div className='p-5 md:ml-5 pt-0 flex flex-wrap gap-7 md:gap-7'>
              {user.otherGroups && Object.keys(user.otherGroups).length > 0 ? (
                Object.entries(user.otherGroups).map(([key, group]) => (
                  <SubjectCard
                    key={key}
                    subject={group.subjectName}
                    teacher={group.instructorName}
                    attendance={
                      group.attendance?.[new Date().getFullYear()]?.[new Date().getMonth()]?.length || 0
                    }
                    otherGroup={true}
                  />
                ))
              ) : (
                <p className="text-gray-400 text-sm px-4 py-2">
                  You're not part of any teacher's group yet.
                </p>
              )}
            </div>
          </>
        )}

        {/* Create Group */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-gray-800 border border-white/20 rounded-2xl shadow-lg p-6 w-96">
              <h2 className="text-lg font-semibold mb-4">Create New Group</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1">Group Name</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700/40 border border-gray-500/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter group name"
                    required
                  />
                </div>

                {!user.isAdmin && (
                  <div>
                    <label className="block text-gray-300 mb-1">Instructor Name</label>
                    <input
                      type="text"
                      value={instructorName}
                      onChange={(e) => setInstructorName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700/40 border border-gray-500/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Enter instructor name"
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="submit"
                    className='bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 cursor-pointer p-2 text-sm rounded-lg
                    flex font-semibold mb-2 w-full justify-center mt-auto'
                  >Create</button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className='bg-gray-600/50 cursor-pointer p-2 text-sm rounded-lg
                    flex font-semibold mb-2 w-full justify-center mt-auto'
                  >Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyGroup