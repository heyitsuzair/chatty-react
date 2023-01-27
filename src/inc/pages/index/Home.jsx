import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlainButton, SpinnerLarge } from "../../components/commons";
import { socket } from "../../config";
import { RoutePaths } from "../../config/routes";
import { authContext } from "../../context/auth";
import { contactContext } from "../../context/contact";
import ChatBox from "./ChatBox";
import Contacts from "./Contacts";

const Home = () => {
  document.title = "Chatty";

  const { user } = useContext(authContext);

  const { fetchContacts } = useContext(contactContext);

  const [isLoading, setIsLoading] = useState(true);

  /**
   * RRD Helpers
   */
  const navigate = useNavigate();

  /**
   * Socket Io Configuration
   */
  const callSocket = () => {
    const user = localStorage.getItem("chatty-user");
    if (user) {
      socket.emit("onLogin", user);

      socket.on("userConnected", (user_id) => {
        console.log("Logged In: " + user_id);
      });
      socket.on("userDisConnected", (user_id) => {
        console.log("Logged Out: " + user_id);
      });
    }
  };

  /**
   * @function onLogout
   *
   * Triggers When Someone Logs out
   */
  const onLogout = () => {
    const user = localStorage.getItem("chatty-user");
    socket.emit("onLogout", user);
    localStorage.removeItem("chatty-user");

    navigate(RoutePaths.login);
  };

  useEffect(() => {
    /**
     * Protected Route
     */
    if (!user) {
      navigate(RoutePaths.login);
      return;
    }
    callSocket();
    fetchContacts(setIsLoading);
    //eslint-disable-next-line
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="h-screen flex items-center justify-center">
          <SpinnerLarge />
        </div>
      ) : (
        <div className="h-screen lg:p-5">
          <PlainButton
            icon="fa fa-sign-out -ml-2"
            textColor="text-indigo-700 dark:text-white"
            onClick={() => onLogout()}
            buttonColor="dark:bg-indigo-600 fixed right-20 top-3 dark:hover:bg-indigo-700 bg-indigo-300 hover:bg-indigo-400"
            isSquare
            text=""
          />
          <div className="bg-white rounded-xl shadow-md dark:border h-[94vh] dark:bg-gray-800 dark:border-gray-700">
            <div className="grid grid-cols-12">
              <div className="col-span-12 lg:col-span-4 border-r border-indigo-500">
                <Contacts />
              </div>
              <div className="col-span-12 lg:col-span-8">
                <ChatBox />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
