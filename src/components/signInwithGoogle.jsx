import { useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth, db } from "../Components/firebase";
import { toast } from "react-toastify";
import { setDoc, doc } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";

const SignInWithGoogle = ({ isAdmin }) => {
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const user = result.user;

          await setDoc(doc(db, "Users", user.uid), {
            email: user.email,
            firstName: user.displayName,
            photo: user.photoURL,
            lastName: "",
            isAdmin: isAdmin,
          });

          toast.success("User logged in Successfully", {
            position: "top-center",
          });

          window.location.href = "/";
        }
      })
      .catch((error) => {
        console.error("Redirect login error:", error);
        toast.error("Google login failed");
      });
  }, [isAdmin]);

  const googleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  return (
    <div>
      <button
        type="button"
        onClick={googleLogin}
        className="border-1 text-md mt-1 pl-5 pr-5 pt-1 pb-1 border-gray-600 rounded-lg cursor-pointer text-white bg-gray-800/10 hover:bg-transparent"
      >
        signin with <FcGoogle size={20} className="inline pb-1" />
      </button>
    </div>
  );
};

export default SignInWithGoogle;