import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { CiCalendar } from "react-icons/ci";
import useUserStore from "../store/userStore";
import { db } from "./firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";

export default function AttendanceCalendar({ subjectname,otherGroup }) {
  const user = useUserStore((state) => state.user);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [absentReason, setAbsentReason] = useState("");

  const today = new Date();
  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const year = currentMonth.getFullYear();

  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    const groupSource = otherGroup ? user?.otherGroups : user?.MyGroups;
    const groupAttendance = groupSource?.[subjectname]?.attendance?.[year] || {};

    const flatAttendance = {};

    ["present", "absent", "holiday"].forEach((status) => {
      const monthly = groupAttendance?.[status] || {};
      Object.entries(monthly).forEach(([month, days]) => {
        days?.forEach((day) => {
          const date = new Date(year, parseInt(month), day);
          const key = formatKey(date);
          flatAttendance[key] = { status };
        });
      });
    });

    setAttendance(flatAttendance);
  }, [user, subjectname, year, otherGroup]);


  const formatKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  
const markAttendance = async (status) => {
  const day = selectedDate.getDate();
  const month = selectedDate.getMonth();
  const isClearing = status === null;
  const userRef = doc(db, "Users", user.uid);
  const yearPath = `MyGroups.${subjectname}.attendance.${year}`;

  try {
    // Clear attendance
    if (isClearing) {
      await updateDoc(userRef, {
        [`${yearPath}.present.${month}`]: arrayRemove(day),
        [`${yearPath}.absent.${month}`]: arrayRemove(day),
        [`${yearPath}.holiday.${month}`]: arrayRemove(day),
      });
    }

    // Mark present
    else if (status === "present") {
      await updateDoc(userRef, {
        [`${yearPath}.present.${month}`]: arrayUnion(day),
        [`${yearPath}.absent.${month}`]: arrayRemove(day),
        [`${yearPath}.holiday.${month}`]: arrayRemove(day),
      });
    }

    // Mark absent
    else if (status === "absent") {
      await updateDoc(userRef, {
        [`${yearPath}.absent.${month}`]: arrayUnion(day),
        [`${yearPath}.present.${month}`]: arrayRemove(day),
        [`${yearPath}.holiday.${month}`]: arrayRemove(day),
      });
    }

    // Mark holiday
    else if (status === "holiday") {
      await updateDoc(userRef, {
        [`${yearPath}.holiday.${month}`]: arrayUnion(day),
        [`${yearPath}.present.${month}`]: arrayRemove(day),
        [`${yearPath}.absent.${month}`]: arrayRemove(day),
      });
    }

    // Get updated user data to calculate rate
    const updatedSnap = await getDoc(userRef);
    const updatedUser = updatedSnap.data();
    const attendanceData = updatedUser?.MyGroups?.[subjectname]?.attendance?.[year] || {};

    const updatedPresent = new Set(
      Object.values(attendanceData?.present || {}).flat()
    );
    const updatedAbsent = new Set(
      Object.values(attendanceData?.absent || {}).flat()
    );

    const totalDays = updatedPresent.size + updatedAbsent.size;
    const updatedRate = totalDays > 0 ? ((updatedPresent.size / totalDays) * 100).toFixed(1) : "0";

    await updateDoc(userRef, {
      [`MyGroups.${subjectname}.rate`]: updatedRate,
    });

    // update local state zustand
    setAttendance((prev) => ({
      ...prev,
      [formatKey(selectedDate)]: status ? { status } : undefined,
    }));

    useUserStore.getState().setUser({
      ...updatedUser,
      uid: user.uid,
    });

  } catch (error) {
    console.error("Error updating attendance in Firebase:", error);
  }
};

  const daysInMonth = new Date(year, currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(year, currentMonth.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    const next = new Date(year, currentMonth.getMonth() + 1, 1);
    if (next <= today) setCurrentMonth(next);
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, currentMonth.getMonth(), d));
  }

  return (
    <div className=" p-1 mt-7 md:mt-3 md:p-3 bg-gray-900 text-white grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2  rounded-2xl shadow-lg bg-gray-800/30 backdrop-blur-lg border border-gray-700 p-6">
        <div className="flex justify-center items-center mb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CiCalendar /> Attendance Calendar - {subjectname}
          </h2>
        </div>

        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-700 rounded-full">
            <ChevronLeft className="text-gray-200" />
          </button>
          <span className="font-semibold">
            {monthName} {year}
          </span>
          <button
            onClick={nextMonth}
            className={`p-2 rounded-full ${
              new Date(year, currentMonth.getMonth() + 1, 1) > today
                ? "cursor-not-allowed opacity-40"
                : "hover:bg-white/10"
            }`}
            disabled={new Date(year, currentMonth.getMonth() + 1, 1) > today}
          >
            <ChevronRight className="text-gray-200" />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-gray-300 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((date, idx) => {
            if (!date) return <div key={idx}></div>;

            const key = formatKey(date);
            const status = attendance[key]?.status;

            let classes =
              "flex items-center justify-center h-10 w-10 rounded-lg cursor-pointer transition-all ";

            if (date > today) {
              classes += "cursor-not-allowed opacity-40 bg-gray-700/40 text-gray-400";
            } else if (status === "present") {
              classes += "bg-green-600/40 backdrop-blur-md border border-green-400/30 text-white";
            } else if (status === "absent") {
              classes += "bg-red-600/40 backdrop-blur-md border border-red-400/30 text-white";
            } else if (status === "holiday") {
              classes += "bg-blue-600/40 backdrop-blur-md border border-blue-400/30 text-white";
            } else if (formatKey(today) === key) {
              classes += "bg-pink-600/40 backdrop-blur-md border border-pink-400/30 text-white";
            } else {
              classes += "hover:bg-white/10 text-gray-200";
            }

            return (
              <div
                key={idx}
                className={classes}
                onClick={() => {
                  if (date <= today) setSelectedDate(date);
                }}
              >
                {date.getDate()}
              </div>
            );
          })}
        </div>
      </div>

      {/* selected date */}
          <div className="md:col-span-1 rounded-2xl shadow-lg bg-gray-800/30 backdrop-blur-lg border border-gray-700 p-6 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Selected Date</h2>
        <p className="text-gray-200 font-semibold mb-2">
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        <p className="text-sm text-gray-300 mb-2">Status</p>
        <span
          className={`px-3 py-1 rounded-full text-sm backdrop-blur-md border ${
            attendance[formatKey(selectedDate)]?.status === "present"
              ? "bg-green-600/40 border-green-400/30 text-white"
              : attendance[formatKey(selectedDate)]?.status === "absent"
              ? "bg-red-600/40 border-red-400/30 text-white"
              : attendance[formatKey(selectedDate)]?.status === "holiday"
              ? "bg-blue-600/40 border-blue-400/30 text-white"
              : "bg-gray-700/40 border-gray-500/30 text-gray-200"
          }`}
        >
          {attendance[formatKey(selectedDate)]?.status || "Not Marked"}
        </span>

        {attendance[formatKey(selectedDate)]?.status === "absent" && formatKey(selectedDate) !== formatKey(today) && (
          <p className="mt-2 text-sm text-red-400">
            Reason: {attendance[formatKey(selectedDate)]?.reason || "Not provided"}
          </p>
        )}

        {selectedDate <= today && !otherGroup && (
          <>
            <p className="mt-4 text-sm text-gray-300">Mark Attendance</p>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => markAttendance("present")}
                  className="flex w-1/2 items-center gap-2 px-4 py-2 rounded-lg text-white transition bg-green-600/40 hover:bg-green-600/60 backdrop-blur-md border border-green-400/30"
                >
                  <Check size={16} /> Present
                </button>

                <button
                  onClick={() => markAttendance(null)}
                  className="flex w-1/2 items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition bg-pink-600/40 hover:bg-pink-600/60 backdrop-blur-md border border-pink-400/30"
                >
                  Clear
                </button>
              </div>

              {attendance[formatKey(selectedDate)]?.status !== "absent" && (
                <>
                  <textarea
                    value={absentReason}
                    onChange={(e) => setAbsentReason(e.target.value)}
                    placeholder="Enter reason for absence..."
                    className="w-full p-2 mt-2 rounded-lg bg-gray-900/40 border border-red-400/30 text-sm text-white resize-none"
                    rows={3}
                  />
                  <button
                    onClick={() => markAttendance("absent")}
                    className="flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-white transition bg-red-600/40 hover:bg-red-600/60 backdrop-blur-md border border-red-400/30"
                  >
                    <X size={16} /> Absent
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="md:col-span-3 rounded-2xl shadow-lg bg-gray-800/30 backdrop-blur-lg border border-gray-700 p-4">
        <h3 className="font-semibold mb-3">Legend</h3>
        <div className="flex flex-wrap gap-6 text-sm text-gray-200">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-green-600/40 backdrop-blur-md border border-green-400/30"></span>
            Present
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-red-600/40 backdrop-blur-md border border-red-400/30"></span>
            Absent
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-blue-600/40 backdrop-blur-md border border-blue-400/30"></span>
            Holiday
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-pink-600/40 backdrop-blur-md border border-pink-400/30"></span>
            Today
          </span>
          <span className="flex items-center gap-2 opacity-60">
            <span className="h-3 w-3 rounded bg-gray-700/40 backdrop-blur-md border border-gray-500/30"></span>
            Future Date (disabled)
          </span>
        </div>
      </div>
    </div>
  );
}