import { useState } from "react";
import { GiTeacher } from "react-icons/gi";
import { FaRegCircle, FaRegDotCircle } from "react-icons/fa";
import { PiStudentBold } from "react-icons/pi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../Components/firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import useUserStore from "../store/userStore";

export default function AuthCard() {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!fname || !lname || !email || !password) {
      toast.dark("Please fill all required fields",{position: "top-center"});
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;

      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: fname,
          lastName: lname,
          photo: "",
          isAdmin: isAdmin,
        });

        toast.dark("User registered successfully", { position: "top-center",autoClose: 3000 });
        const dummyEvent = { preventDefault: () => {} }; 
        handleSubmit(dummyEvent);
      }
    } catch (error) {
      console.log(error.message);
      toast.dark(error.message, {
        position: "bottom-center",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.dark("Please enter email and password");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const userDoc = await getDoc(doc(db, "Users", userCredential.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        setUser({
          ...userCredential.user,
          ...userData,
        });

        toast.dark("User logged in successfully", { position: "top-center", autoClose: 3000 });
        navigate("/dashboard");
      } else {
        toast.dark("User data not found", { position: "bottom-center", autoClose: 3000 });
      }
    } catch (error) {
      console.log(error.message);
      toast.dark("Something went wrong", { position: "bottom-center", autoClose: 3000 });
    }
  };

  return (
    <div className="bg-[#1900409a] p-8 rounded-2xl shadow-2xl w-96 text-center text-white">
      <div className="mb-4 flex flex-col items-center justify-center">
        <h1 className="text-transparent font-bold text-2xl p-3 bg-clip-text bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
          Upasthiti
        </h1>
        <p className="text-gray-400 font-semibold">Future of Attendance Management</p>
      </div>

      <div className="flex bg-[#190040bb] rounded-full p-1 mb-6">
        <button
          className={`flex-1 text-center py-1 text-sm rounded-full ${isSignIn ? "bg-purple-600" : "text-gray-400"}`}
          onClick={() => setIsSignIn(true)}
        >
          Sign In
        </button>
        <button
          className={`flex-1 text-center py-1 text-sm rounded-full ${!isSignIn ? "bg-purple-600" : "text-gray-400"}`}
          onClick={() => setIsSignIn(false)}
        >
          Sign Up
        </button>
      </div>

      <div className="text-left space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Your Role</label>
          <div className="flex gap-4 justify-center mb-4">
            <button
              onClick={() => setIsAdmin(false)}
              className={`flex items-center gap-2 px-4 text-center py-2 w-1/2 rounded-lg border ${
                !isAdmin ? "border-purple-500 bg-purple-700/40" : "border-gray-600"
              }`}
            >
              {!isAdmin ? <FaRegDotCircle /> : <FaRegCircle />}
              <PiStudentBold />
              Student
            </button>
            <button
              onClick={() => setIsAdmin(true)}
              className={`flex items-center gap-2 w-1/2 text-center px-4 py-2 rounded-lg border ${
                isAdmin ? "border-purple-500 bg-purple-700/40" : "border-gray-600"
              }`}
            >
              {isAdmin ? <FaRegDotCircle /> : <FaRegCircle />}
              <GiTeacher />
              Teacher
            </button>
          </div>
        </div>

        {!isSignIn && (
          <div className="flex gap-4 justify-center mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                placeholder="Your First Name"
                value={fname}
                onChange={(ev) => setFname(ev.target.value)}
                className="w-full p-2 rounded-lg bg-[#190040bb] border border-gray-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                placeholder="Your Last Name"
                value={lname}
                onChange={(ev) => setLname(ev.target.value)}
                className="w-full p-2 rounded-lg bg-[#190040bb] border border-gray-700 focus:outline-none"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            required
            onChange={(ev) => setEmail(ev.target.value)}
            className="w-full p-2 rounded-lg bg-[#190040bb] border border-gray-700 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            required
            onChange={(ev) => setPassword(ev.target.value)}
            className="w-full p-2 rounded-lg bg-[#190040bb] border border-gray-700 focus:outline-none"
          />
        </div>
      </div>

      {isSignIn ? (
        <button
          className="w-full mt-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
          onClick={handleSubmit}
        >
          Sign in as {isAdmin ? "Teacher" : "Student"}
        </button>
      ) : (
        <button
          className="w-full mt-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
          onClick={handleRegister}
        >
          Sign up as {isAdmin ? "Teacher" : "Student"}
        </button>
      )}
    </div>
  );
}