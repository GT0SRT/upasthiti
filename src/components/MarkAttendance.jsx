import React, { useState, useEffect } from 'react';
import { CiCalendar } from 'react-icons/ci';
import { FaRegChartBar } from 'react-icons/fa';
import { IoIosCheckbox } from 'react-icons/io';
import { IoSaveOutline } from 'react-icons/io5';
import { LuCircleCheckBig } from 'react-icons/lu';
import { MdDelete } from "react-icons/md";
import { RiCheckboxBlankFill } from 'react-icons/ri';
import { RxCross2 } from 'react-icons/rx';

import {
  doc,
  getDocs,
  collection,
  arrayRemove,
  arrayUnion,
  query,
  where,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import useUserStore from '../store/userStore';
import { db } from './firebase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MarkAttendance = ({ groupName }) => {
  const user = useUserStore((state) => state.user);
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttendanceStats = async () => {
      if (!user?.MyGroups?.[groupName]?.students) return;

      const studentsData = await Promise.all(
        user.MyGroups[groupName].students.map(async (s) => {
          const usersRef = collection(db, "Users");
          const q = query(usersRef, where("email", "==", s.email));
          const snapshot = await getDocs(q);

          let presentCount = 0;
          let absentCount = 0;
          let attendanceStatus = "absent";

          const today = new Date();
          const year = today.getFullYear();
          const month = today.getMonth();
          const day = today.getDate();

          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const attendanceData = data?.otherGroups?.[groupName]?.attendance?.[year];

            if (attendanceData) {
              const present = attendanceData?.present?.[month] || [];
              const absent = attendanceData?.absent?.[month] || [];

              presentCount += present.length;
              absentCount += absent.length;

              if (present.includes(day)) {
                attendanceStatus = "present";
              } else if (absent.includes(day)) {
                attendanceStatus = "absent";
              }
            }
          }

          return {
            ...s,
            present: presentCount,
            absent: absentCount,
            attendanceStatus,
          };
        })
      );

      setStudents(studentsData);
    };

    fetchAttendanceStats();
  }, [groupName, user]);

  const handleAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, attendanceStatus: 'present' })));
  };

  const handleAllAbsent = () => {
    setStudents(prev => prev.map(s => ({ ...s, attendanceStatus: 'absent' })));
  };

  const handleToggleAttendance = (email) => {
    setStudents(prev =>
      prev.map(s =>
        s.email === email
          ? { ...s, attendanceStatus: s.attendanceStatus === 'present' ? 'absent' : 'present' }
          : s
      )
    );
  };

  const handleDelete = (email) => {
    setStudents(prev => prev.filter(s => s.email !== email));
  };

  const total = students.length;
  const totalPresent = students.filter(s => s.attendanceStatus === 'present').length;
  const totalAbsent = total - totalPresent;
  const rate = total ? ((totalPresent / total) * 100).toFixed(1) : 0;

  const overview = [
    { label: "Present Today", color: "text-green-400", count: totalPresent },
    { label: "Absent Today", color: "text-red-500", count: totalAbsent },
    { label: "Attendance Percentage", color: "text-yellow-400", count: `${rate}%` },
    { label: "Total students", color: "text-white", count: total },
  ];

const markAttendance = async (studentEmail, groupName, status) => {
  try {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("email", "==", studentEmail));
    const querySnapshot = await getDocs(q);

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    for (const docSnap of querySnapshot.docs) {
      const studentId = docSnap.id;
      const studentData = docSnap.data();
      const studentRef = doc(db, "Users", studentId);

      const base = `otherGroups.${groupName}.attendance.${year}`;
      const presentPath = `${base}.present.${month}`;
      const absentPath = `${base}.absent.${month}`;
      const holidayPath = `${base}.holiday.${month}`;

      if (status === "present") {
        await updateDoc(studentRef, {
          [presentPath]: arrayUnion(day),
          [absentPath]: arrayRemove(day),
          [holidayPath]: arrayRemove(day),
        });
      } else {
        await updateDoc(studentRef, {
          [absentPath]: arrayUnion(day),
          [presentPath]: arrayRemove(day),
          [holidayPath]: arrayRemove(day),
        });
      }

      // Recalculate present/absent
      const updatedPresent = new Set([
        ...(studentData?.otherGroups?.[groupName]?.attendance?.[year]?.present?.[month] || []),
        ...(status === 'present' ? [day] : []),
      ]);
      const updatedAbsent = new Set([
        ...(studentData?.otherGroups?.[groupName]?.attendance?.[year]?.absent?.[month] || []),
        ...(status === 'absent' ? [day] : []),
      ]);

      const totalDays = updatedPresent.size + updatedAbsent.size;
      const updatedRate = totalDays > 0 ? ((updatedPresent.size / totalDays) * 100).toFixed(1) : "0.0";

      await updateDoc(studentRef, {
        [`otherGroups.${groupName}.rate`]: updatedRate,
      });

      // ✅ UPDATE admin's MyGroups.{groupName}.students
      const instructorRef = doc(db, "Users", user.uid);
      const instructorSnap = await getDoc(instructorRef);
      const instructorData = instructorSnap.data();

      const groupStudents = instructorData?.MyGroups?.[groupName]?.students || [];

      const updatedStudents = groupStudents.map(s => {
        if (s.email === studentEmail) {
          return {
            ...s,
            present: updatedPresent.size,
            absent: updatedAbsent.size,
          };
        }
        return s;
      });

      await updateDoc(instructorRef, {
        [`MyGroups.${groupName}.students`]: updatedStudents,
        // [`MyGroups.${groupName}.rate`]: updatedRate,
      });
    }

  } catch (error) {
    console.error(`Error updating attendance for ${studentEmail}:`, error);
  }
};

  return (
    <>
      <div className="flex mt-7 justify-center items-center mb-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CiCalendar /> Attendance Calendar - {groupName}
        </h2>
      </div>

      <div className="pl-5 pr-5 m-3 mt-5 gap-5 flex justify-center items-center">
        {overview.map((item, index) => (
          <div key={index} className="flex flex-col md:flex-row justify-center items-center gap-3 bg-gray-800/30 border border-gray-700 rounded-xl p-4 w-1/4">
            <div>
              <h1 className={`text-xs text-center text-gray-400`}>{item.label}</h1>
              <h1 className={`text-lg text-center ${item.color}`}>{item.count}</h1>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800/30 mt-7 md:ml-7 md:mr-7 border border-gray-700 p-5 rounded-xl">
        <div className='flex gap-5 mb-4'>
          <div className='w-1/2'>
            <h2 className="text-xl font-semibold items-center gap-2">
              <CiCalendar className='inline' size={25} /> Take Attendance
            </h2>
            <p className='text-sm text-gray-500 ml-3'>{new Date().toDateString()}</p>
          </div>
          <div className='gap-2 flex flex-col md:flex-row md:gap-7 ml-auto'>
            <button onClick={handleAllPresent} className='bg-green-500 h-9 cursor-pointer p-2 text-sm rounded-lg flex'>
              <LuCircleCheckBig className='mt-1 mr-2' />All Present
            </button>
            <button onClick={handleAllAbsent} className='hover:bg-red-500 h-9 cursor-pointer bg-white text-red-500 hover:text-white p-2 text-sm rounded-lg border border-red-500 flex'>
              <RxCross2 className='mt-1 mr-2' />All Absent
            </button>
          </div>
        </div>

        <h2 className="font-semibold mb-3">Students ({students.length})</h2>

        <div className="flex flex-col gap-3 overflow-y-scroll max-h-screen">
          {students.map((student) => {
            const totalDays = (student.present || 0) + (student.absent || 0);
            const percent = totalDays > 0 ? ((student.present / totalDays) * 100).toFixed(1) : "0.0";
            return (
              <div
                key={student.email}
                className={`${student.attendanceStatus === 'present' ? 'bg-green-500/10 border-green-800' : 'bg-gray-800/30 border-gray-700'} border ml-3 mr-3 p-4 rounded-lg flex items-center`}
                onClick={() => handleToggleAttendance(student.email)}
              >
                <div className='mr-5 cursor-pointer'>
                  {student.attendanceStatus === 'present'
                    ? <IoIosCheckbox className='text-green-500' />
                    : <RiCheckboxBlankFill />}
                </div>
                <div>
                  <h3 className="font-semibold">{student.name}</h3>
                  <p className="text-gray-400 text-sm">
                    <FaRegChartBar className='inline mr-1 mb-1 text-green-500' />
                    {percent}%
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(student.email);
                    }}
                    className="bg-red-600/20 cursor-pointer hover:bg-red-600/40 p-2 rounded-lg"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className='border-t-1 border-gray-500 p-5 mt-7'>
          <button
            onClick={async () => {
              toast.dark("saving...",{position: 'top-center',autoClose:6000});
              for (const student of students) {
                await markAttendance(
                  student.email,
                  groupName,
                  student.attendanceStatus
                );
              }
              toast.dark("Attendance saved for all students",{position: 'top-center'})
              console.log("Attendance saved for all students");
              setTimeout(() => {location.reload();},2000);
            }}
            className='bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 cursor-pointer p-2 rounded-lg flex font-semibold mb-2 w-full justify-center mt-auto text-xs md:text-sm'
          >
            <IoSaveOutline className='mr-1' size={20} /> Save Attendance
          </button>
        </div>
      </div>
    </>
  );
};

export default MarkAttendance;