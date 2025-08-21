import React, { useState } from "react";
import { TbUserPlus } from "react-icons/tb";
import { MdDelete } from "react-icons/md";

export default function Invite({ groupName, onClose }) {
  const [studentEmail, setStudentEmail] = useState("");
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1e1f24] w-[90%] md:w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center pb-4">
          <h1 className="text-xl font-bold">Invite Students - {groupName}</h1>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        
        <div className="bg-gray-800/30 border border-gray-700 p-5 rounded-xl mb-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><TbUserPlus /> Invite Student</h2>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="email"
              placeholder="student@email.com"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="flex-1 p-2 rounded-lg bg-gray-900 border border-gray-600 focus:outline-none"
            />
          </div>
          <button
            className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 cursor-pointer scale-99 hover:scale-100 mt-4 w-full py-2 rounded-lg font-semibold"
          >Send Invitation</button>
        </div>
      </div>
    </div>
  );
}