import './App.css'
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { Route, Router, Routes } from 'react-router-dom';
import MyGroup from './pages/MyGroup';
import MyProfile from './pages/MyProfile';
import { ToastContainer } from 'react-toastify';
import PrivateRoute from './components/PrivateRoute';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './components/firebase';
import useUserStore from './store/userStore';
import { useEffect } from 'react';

function App() {
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const refreshUserFromFirestore = async (uid) => {
      if (!uid) return;
      const docRef = doc(db, "Users", uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        useUserStore.setState(() => ({
          user: {
            ...snap.data(),
            uid: uid,
          },
        }));
      }
    };

    refreshUserFromFirestore(user?.uid);
  }, [user?.uid]);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/attendance" element={<PrivateRoute><AttendancePage /></PrivateRoute>} />
        <Route path="/group" element={<PrivateRoute><MyGroup /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><MyProfile /></PrivateRoute>} />
      </Routes>
    </>
  )
}

export default App