import { useEffect, useState } from "react";
import { CiCalendar } from "react-icons/ci";
import { FaRegBell } from "react-icons/fa";
import { IoBookOutline } from "react-icons/io5";
import { TbUserPlus } from "react-icons/tb";
import Invite from "./Invite";
import useUserStore from "../store/userStore";
import AttendanceCalendar from "./AttendanceCalendar";
import { RxCross2 } from "react-icons/rx";
import { RiDeleteBinLine } from "react-icons/ri";
import { deleteField, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { toast } from "react-toastify";
import MarkAttendance from "./MarkAttendance";


export default function SubjectCard({ subject, teacher ,otherGroup }) {
  const user = useUserStore((state) => state.user);
  const [showInvite, setShowInvite] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [inviteCode, setInviteCode] = useState(null);

  useEffect(() => {
    if (user.isAdmin && user.MyGroups?.[subject]?.inviteCode) {
      setInviteCode(user.MyGroups[subject].inviteCode);
    }
  }, [user, subject]);
  const [copiedCode, setCopiedCode] = useState("");

const calculateOverallAttendanceRate = () => {
  if (user.isAdmin) {
    const students = user.MyGroups?.[subject]?.students || [];

    if (students.length === 0) return "0%";

    const totalRates = students.reduce((acc, student) => {
      const present = student.present || 0;
      const absent = student.absent || 0;
      const total = present + absent;
      const rate = total === 0 ? 0 : (present / total) * 100;
      return acc + rate;
    }, 0);

    const averageRate = totalRates / students.length;
    return averageRate.toFixed(1) + "%";
  }

  // For non-admins
  const groupAttendance = otherGroup ? user.otherGroups?.[subject]?.attendance : user.MyGroups?.[subject]?.attendance;

  let presentCount = 0;
  let absentCount = 0;

  Object.values(groupAttendance).forEach((yearData) => {
    
    const presentByMonth = yearData.present || {};
    const absentByMonth = yearData.absent || {};

    Object.values(presentByMonth).forEach((days) => {
      presentCount += days.length;
    });

    Object.values(absentByMonth).forEach((days) => {
      absentCount += days.length;
    });
  });

  const total = presentCount + absentCount;
  if (total === 0) return "0%";

  return ((presentCount / total) * 100).toFixed(1) + "%";

};

async function handleDelete(subjectName) {
  const confirmed = window.confirm(`Are you sure you want to delete the subject "${subjectName}"?`);
  if (!confirmed) return;

  const user = useUserStore.getState().user;
  if (!user || !user.uid) return;

  const userRef = doc(db, "Users", user.uid);

  try {
    await updateDoc(userRef, {
      [`MyGroups.${subjectName}`]: deleteField(),
    });
    useUserStore.setState((state) => {
      const newMyGroups = { ...state.user.MyGroups };
      delete newMyGroups[subjectName];
      return {
        user: {
          ...state.user,
          MyGroups: newMyGroups,
        },
      };
    });

    console.log(`Subject '${subjectName}' deleted successfully.`);
    toast.dark(`Subject ${subjectName} deleted successfully.`,{position: 'top-center'});
  } catch (error) {
    console.error("Error deleting subject:", error);
  }
}

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Invite code copied!");

      setTimeout(() => {
      setCopiedCode("");
    }, 5000);

    } catch (err) {
      console.log(err);
      toast.error("Failed to copy code.");
    }
  };

  return (
    <div className="bg-gray-800/30 border border-gray-700 p-5 w-[45%] rounded-2xl shadow-2xl text-left text-white flex flex-col relative">
      <div className="flex">
        <div className='w-10 h-10 mt-2 flex justify-center items-center rounded-xl bg-gradient-to-br from-purple-400 to-[blue]'>
          <IoBookOutline size={25} />
        </div>
        {otherGroup ? (<></>):(<div onClick={() => handleDelete(subject)} className="float-right mt-2 ml-auto cursor-pointer"><RiDeleteBinLine size={20}/></div>)}
      </div>

      <div className="flex-1">
        <h1 className='text-transparent pt-1 pb-1 font-bold text-lg bg-clip-text bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'>{subject}</h1>
        <p className='text-gray-400 mb-2 text-xs font-semibold'>{teacher}</p>
      </div>

      <div className="flex pl-1 pr-2">
        <h1 className="text-[11px] md:text-sm text-gray-400">Attendance Rate</h1>
        <span className="text-green-600 ml-auto text-xs md:text-sm">{calculateOverallAttendanceRate()}</span>
      </div>

      <div className="flex justify-end md:gap-3 pt-2 flex-col md:flex-row">
        {user.isAdmin && inviteCode && (
          <button
            onClick={() => handleCopyCode(inviteCode)}
            className='bg-gray-900/10 border-1 border-gray-700 cursor-pointer p-2 text-xs md:text-sm rounded-lg
            flex font-semibold mb-2 w-full justify-center mt-auto'
          >
            {copiedCode === inviteCode ? "Copied!" : `Invite Code: ${inviteCode}`}
          </button>
        )}

        <button
          onClick={() => setShowAttendance(true)}
          className='bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 cursor-pointer p-2 rounded-lg
        flex font-semibold mb-2 w-full justify-center mt-auto text-xs md:text-sm'
        >
          <CiCalendar className='mr-1' size={20} /> Attendance
        </button>
      </div>

      {user.isAdmin && (
        <button className='bg-yellow-600/10 border-1 border-yellow-600 text-yellow-600 hover:text-white cursor-pointer p-1 md:p-2 text-xs md:text-sm rounded-lg
          flex font-semibold mb-2 w-full justify-center mt-auto' onClick={() => toast.dark("Low attendance alert sent to the appropriate students", { position: "top-center", autoClose: 3000})}>
          <FaRegBell className='mt-1 md:mr-2' size={15} /> Send Low Attendance Alert
        </button>
      )}

      {showInvite && <Invite groupName={subject} onClose={() => setShowInvite(false)} />}

      {showAttendance && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-2xl w-full max-w-4xl h-[90vh] overflow-y-auto p-3 m-2 relative">
            <div onClick={() => setShowAttendance(false)} className="float-right cursor-pointer"><RxCross2 size={20}/></div>
            {
              !user.isAdmin ? (<AttendanceCalendar subjectname={subject} otherGroup={otherGroup}  />):(
                <MarkAttendance groupName={subject}/>
              )
            }
          </div>
        </div>
      )}
    </div>
  );
}