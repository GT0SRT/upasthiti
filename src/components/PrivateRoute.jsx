import { Navigate } from "react-router-dom";
import useUserStore from "../store/userStore";

const PrivateRoute = ({ children }) => {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;