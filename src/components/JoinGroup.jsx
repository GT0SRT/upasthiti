import React, { useState } from "react";
import { db } from "../components/firebase";
import { collection, getDocs, doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { toast } from "react-toastify";
import useUserStore from "../store/userStore";
import { useNavigate } from "react-router-dom";

const JoinGroup = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  const makeMonths = () => {
    const months = {};
    for (let i = 0; i < 12; i++) {
      months[i] = [];
    }
    return months;
  };

const handleJoinGroup = async () => {
  if (!code) return toast.dark("Please enter invite code",{position: "top-center"});
  setLoading(true);

  try {
    const usersSnap = await getDocs(collection(db, "Users"));
    let found = null;

    // finding matching admin group
    for (const uDoc of usersSnap.docs) {
      const u = uDoc.data();
      if (!u.isAdmin) continue;

      const groups = u.MyGroups || {};
      for (const [gName, gData] of Object.entries(groups)) {
        if (gData.inviteCode === code) {
          found = {
            adminUid: uDoc.id,
            groupName: gName,
            groupData: gData
          };
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      toast.dark("Invalid invite code",{position: "top-center"});
      setLoading(false);
      return;
    }

    const { adminUid, groupName, groupData } = found;

    //  Check if already joined
    const studentRef = doc(db, "Users", user.uid);
    const studentSnap = await getDoc(studentRef);
    const studentData = studentSnap.data();
    const alreadyInGroup = studentData?.otherGroups?.[groupName];

    if (alreadyInGroup) {
      toast.dark(`You've already joined "${groupName}"`, { position: "top-center" });
      setCode("");
      setLoading(false);
      navigate("/group");
      return;
    }

    const year = new Date().getFullYear();

    // adding student to database
    const adminGroupRef = doc(db, "Users", adminUid);
    const studentObj = {
      name: user.firstName + " " + user.lastName,
      email: user.email,
      present: 0,
      absent: 0
    };

    await updateDoc(adminGroupRef, {
      [`MyGroups.${groupName}.students`]: arrayUnion(studentObj)
    });

    // group in students OtherGroups
    const newGroupObj = {
      subjectName: groupData.subjectName || "",
      instructorName: groupData.instructorName || "",
      createdAt: Date.now(),
      attendance: {
        [year]: {
          present: makeMonths(),
          absent: makeMonths(),
          holiday: makeMonths(),
        }
      }
    };
    await updateDoc(studentRef, {
      [`otherGroups.${groupName}`]: newGroupObj
    });
    

    // Update local state
    useUserStore.setState(prev => ({
      user: {
        ...prev.user,
        otherGroups: {
          ...(prev.user.otherGroups || {}),
          [groupName]: newGroupObj
        }
      }
    }));

    toast.dark(`Joined "${groupName}" group, please check other groups!`,{position: "top-center"});
    setCode("");

    // update firebase
    // const refreshUserFromFirestore = async (uid) => {
    //     const docRef = doc(db, "Users", uid);
    //     const snap = await getDoc(docRef);
    //     if (snap.exists()) {
    //       useUserStore.setState(() => ({
    //         user: {
    //           ...snap.data(),
    //           uid: uid,
    //         },
    //       }));
    //     }
    //   };
    // refreshUserFromFirestore(user.uid);

    navigate("/group")

  } catch (error) {
    console.error(error);
    toast.dark("Error joining group",{position: "top-center"});
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="mt-7 p-4 bg-gray-800/30 border border-gray-700 rounded-xl md:w-[93%]  m-9">
      <h2 className="text-xl font-semibold mb-4">Join a Group</h2>
      <div className="flex md:gap-3 md:flex-row flex-col">
        <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter Invite Code"
            className="w-full p-2 rounded bg-gray-900/30 border border-gray-600 text-white mb-4"
        />
        <button
            onClick={handleJoinGroup}
            disabled={loading}
            className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 cursor-pointer scale-99 hover:scale-100 md:w-32 py-2 h-10 rounded-lg font-semibold"
        >
            {loading ? "Joining..." : "Join Group"}
        </button>
      </div>
    </div>
  );
};

export default JoinGroup;
