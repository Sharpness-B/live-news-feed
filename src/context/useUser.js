import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../data/services/authservice";
import { userInfoRef, readIsPayingUser } from "../data/services/firestore";
import { onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Cookies from 'js-cookie';

export const AuthContext = createContext();
export const useUser = () => useContext(AuthContext);

const Auth = (props) => {
  const [user, setuser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // Retrieve user from cookie when component mounts
  useEffect(() => {
    const storedUser = Cookies.get('user');
    if (storedUser) {
      setuser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const cleanup = onAuthStateChanged(auth, (user) => {
      setuser(user);
      Cookies.set('user', JSON.stringify(user), { expires: 1 }); // Store user data in a cookie
    });
    return cleanup;
  }, []);

  useEffect( async () => {
    if (user != null) {
      const cleanUp = onSnapshot(userInfoRef(user), (snapshot) => {
        setUserInfo(snapshot.data());
      });

      // Add payment info
      try{
        if (user.email.endsWith("@finansavisen.no")) {
          user.isPayingUser = true;
        } 
        else {
          const isPayingUser = await readIsPayingUser(user);
          user.isPayingUser = isPayingUser;
        }
      } catch (error) {
        console.log("Database error: could not fetch user payment info", error);
        user.isPayingUser = false
      }

      return cleanUp;
    }
  }, [user]); 

  const value = { user, userInfo };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
};

export default Auth;