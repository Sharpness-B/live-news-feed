import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../data/services/authservice";
import { userInfoRef, readIsPayingUser } from "../data/services/firestore";
import { onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext();
export const useUser = () => useContext(AuthContext);

const Auth = (props) => {
  const [user, setuser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const cleanup = onAuthStateChanged(auth, (user) => setuser(user));
    return cleanup;
  }, []);

  useEffect( async () => {
    if (user != null) {
      const cleanUp = onSnapshot(userInfoRef(user), (snapshot) => {
        setUserInfo(snapshot.data());
      });

      // Add payment info
      try{
        const isPayingUser = await readIsPayingUser(user);
        user.isPayingUser = isPayingUser
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
