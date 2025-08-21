import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import useUserStore from "../store/userStore";
import { FaRegChartBar } from "react-icons/fa";
import { MdCoPresent, MdOutlineCancelPresentation, MdOutlineGroup } from "react-icons/md";
import RecentGroups from "../components/RecentGroups";
import { useEffect, useState } from "react";
import JoinGroup from "../components/JoinGroup";

// Attendance count for non admin groups
function countAttendance(groups) {
  let present = 0;
  let absent = 0;
  let groupCount = 0;

  Object.values(groups).forEach((group) => {
    if (!group.attendance) return;

    groupCount += 1;
    const attendance = group.attendance;

    Object.values(attendance).forEach((yearData) => {
      const presentData = yearData.present || {};
      const absentData = yearData.absent || {};

      Object.values(presentData).forEach((daysArray) => {
        present += daysArray.length;
      });

      Object.values(absentData).forEach((daysArray) => {
        absent += daysArray.length;
      });
    });
  });

  return { present, absent, groupCount };
}

export default function DashboardPage() {
  const user = useUserStore((state) => state.user);
  const [totalGroups, setTotalGroups] = useState(0);
  const [totalPresent, setTotalPresent] = useState(0);
  const [totalAbsent, setTotalAbsent] = useState(0);
  const [overallRate, setOverallRate] = useState("0%");

  useEffect(() => {
    if (!user) return;

    if (user.isAdmin) {
      const myGroups = user.MyGroups || {};
      let totalPresentToday = 0;
      let totalAbsentToday = 0;

      Object.values(myGroups).forEach((group) => {
        const students = group.students || [];
        students.forEach((student) => {
          if (student.present) totalPresentToday += 1;
          if (student.absent) totalAbsentToday += 1;
        });
      });

      const totalGroupsCount = Object.keys(myGroups).length;
      const totalDays = totalPresentToday + totalAbsentToday;
      const rate = totalDays === 0 ? "0%" : ((totalPresentToday / totalDays) * 100).toFixed(1) + "%";

      setTotalGroups(totalGroupsCount);
      setTotalPresent(totalPresentToday);
      setTotalAbsent(totalAbsentToday);
      setOverallRate(rate);

    } else {
      const myGroups = user.MyGroups || {};
      const otherGroups = user.otherGroups || {};

      const myGroupsAttendance = countAttendance(myGroups);
      const otherGroupsAttendance = countAttendance(otherGroups);

      const totalGroupsCount = myGroupsAttendance.groupCount + otherGroupsAttendance.groupCount;
      const totalPresentCount = myGroupsAttendance.present + otherGroupsAttendance.present;
      const totalAbsentCount = myGroupsAttendance.absent + otherGroupsAttendance.absent;

      const totalDays = totalPresentCount + totalAbsentCount;
      const rate = totalDays === 0 ? "0%" : ((totalPresentCount / totalDays) * 100).toFixed(1) + "%";

      setTotalGroups(totalGroupsCount);
      setTotalPresent(totalPresentCount);
      setTotalAbsent(totalAbsentCount);
      setOverallRate(rate);
    }
  }, [user]);

 const overview = [
    { label: "Total Groups", path: "/dashboard", icon: <MdOutlineGroup size={30} />, color: "text-white", count: totalGroups },
    { label: "Present Days", path: "/dashboard", icon: <MdCoPresent size={30} />, color: "text-green-400", count: totalPresent },
    { label: "Absent Days", path: "/dashboard", icon: <MdOutlineCancelPresentation size={30} />, color: "text-red-500", count: totalAbsent },
    { label: "Attendance Rate", path: "/dashboard", icon: <FaRegChartBar size={30} />, color: "text-yellow-300", count: overallRate },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {typeof window !== "undefined" && window.innerWidth <= 767 ? null : <Sidebar />}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar />
        <div className="p-6">
          <h1 className="text-xl font-bold">Dashboard Overview</h1>
        </div>
        <div className="pl-5 pr-5 m-3 gap-5 flex justify-center items-center">
          {overview.map((item, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row justify-center items-center gap-3 bg-gray-800/30 border border-gray-700 rounded-xl p-4 w-1/4"
            >
              <div>
                <h1 className="text-sm text-center text-gray-400">{item.label}</h1>
                <h1 className={`text-lg text-center text-green ${item.color}`}>{item.count}</h1>
              </div>
              <div className={`${item.color}`}>{item.icon}</div>
            </div>
          ))}
        </div>

        {!user?.isAdmin && <JoinGroup />}

        <RecentGroups groups={user?.MyGroups} />

        {user.isAdmin ? (
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
