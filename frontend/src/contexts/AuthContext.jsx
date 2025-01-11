import { createContext, useEffect, useReducer, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

let AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      //store user in localstorage
      localStorage.setItem("user", JSON.stringify(action.payload));
      return { user: action.payload };
    case "LOGOUT":
      //remove user in localstorage
      localStorage.removeItem("user");
      return { user: null };
    default:
      return state;
  }
};

const AuthContextProvider = ({ children }) => {
  let [state, dispatch] = useReducer(AuthReducer, {
    user: null,
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    try {
      // axios.get('/api/users/me').then(res => {
      //     let user = res.data;
      //     if (user) {
      //         dispatch({ type: 'LOGIN', payload: user })
      //     } else {
      //         dispatch({ type: "LOGOUT" });
      //     }
      // })
      const token = localStorage.getItem("twj");
      if (token) {
        axios
          .get("/api/users/me", {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
          })
          .then((res) => {
            let user = res.data;
            if (user) {
              dispatch({ type: "LOGIN", payload: user });
            } else {
              dispatch({ type: "LOGOUT" });
            }
          });
      }
    } catch (e) {
      dispatch({ type: "LOGOUT" });
    }
    setLoading(false);
  }, []);

  // if (loading) {
  //   // Render a loading spinner or fallback UI while fetching
  //   return (
  //     <div style={{ textAlign: "center", marginTop: "20%" }}>
  //       <p>Loading...</p>
  //       {/* You can replace this with a spinner component */}
  //     </div>
  //   );
  // }

  return (
    <AuthContext.Provider value={{ ...state, dispatch ,loading}}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider };
