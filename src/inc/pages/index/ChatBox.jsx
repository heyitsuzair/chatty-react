import React, { useContext, useEffect, useState } from "react";
import { Date, InputIconned, Text2Xl, TextSm } from "../../components/commons";
import ScrollToBottom from "react-scroll-to-bottom";
import { socket } from "../../config";
import { authContext } from "../../context/auth";
import { contactContext } from "../../context/contact";
import jwt_decode from "jwt-decode";

const ChatBox = ({ friend_id, messages, selectedContact }) => {
  const [inputMessage, setInputMessage] = useState("");

  const { user } = useContext(authContext);
  const logged_in_user = localStorage.getItem("chatty-user")
    ? jwt_decode(localStorage.getItem("chatty-user"))
    : "";

  const { contacts, setContacts } = useContext(contactContext);

  /**
   * @function onMessageSubmit
   *
   * Triggers When Someone Add A New Message
   *
   * Call The API to send a new message
   */
  const onMessageSubmit = (e) => {
    e.preventDefault();
    if (inputMessage === "") {
      return;
    }
    const socketData = {
      message_id: messages._id,
      update: {
        receiver_id: friend_id._id,
        sender_id: user,
        message: inputMessage,
      },
    };
    /**
     * Emit A Socket
     */
    socket.emit("sendMessage", socketData);
  };

  const callSocket = () => {
    /**
     * When Someone Opens Chatbox
     */
    const readConversationData = {
      message_id: messages._id,
      update: {
        receiver_id: user,
        sender_id: friend_id._id,
      },
    };
    socket.emit("readingConversation", readConversationData);

    socket.on("messageReceived", (message) => {
      setInputMessage("");
      /**
       * Find Message Against ID
       */
      const find_messages = contacts.find(
        (contact) => contact.messages._id === message._id
      );
      /**
       * Update Messages
       */
      find_messages.messages.messages = message.messages;
      /**
       * Remove This Message And Add Again
       */
      const filtered = contacts.filter(
        (contact) => contact.messages._id !== message._id
      );
      setContacts([find_messages, ...filtered]);
    });
  };

  const onFocusInput = () => {
    /**
     * When Someone Focus Chat
     */
    const readConversationData = {
      message_id: messages._id,
      update: {
        receiver_id: user,
        sender_id: friend_id._id,
      },
    };
    socket.emit("readingConversation", readConversationData);
  };

  /**
   * Props For Type Message Input
   */
  const msgInput = {
    inputProps: {
      placeholder: "Type Message...",
      name: "message",
      value: inputMessage,
      onChange: (e) => setInputMessage(e.target.value),
      onFocus: () => onFocusInput(),
    },
    icon: "fa fa-paper-plane",
  };
  const LAST_ACTIVE =
    friend_id.last_active === "Online" ? (
      "Online"
    ) : (
      <Date text="Active" date={friend_id.last_active} />
    );

  useEffect(() => {
    /**
     * Make All Messages Seen
     */
    callSocket();
    //eslint-disable-next-line
  }, []);

  return (
    <div>
      <header className="p-4 border-b border-indigo-500">
        <Text2Xl
          text={friend_id?.username}
          classes="leading-tight text-center tracking-tight font-semibold !text-gray-900 dark:!text-white"
        />
        <TextSm
          text={LAST_ACTIVE}
          classes={`leading-tight tracking-tight font-medium !text-black dark:!text-gray-500 mt-2 text-center`}
        />
      </header>
      <ScrollToBottom
        className="chats h-[86.5vh] md:h-[85vh] lg:h-[69vh] overflow-x-hidden"
        followButtonClassName="hidden"
      >
        {messages?.messages.map((message) => {
          return (
            <div key={message._id}>
              {message.sender_id === logged_in_user.user_id ? (
                <div className="flex items-start justify-end">
                  <TextSm
                    text={message.message}
                    classes="leading-tight text-right w-auto m-2 rounded-full p-2.5 lg:p-5 bg-indigo-600 tracking-tight font-semibold"
                  />
                </div>
              ) : (
                <div className="flex items-start justify-start">
                  <TextSm
                    text={message.message}
                    classes="leading-tight text-left w-auto m-2 rounded-full p-2.5 lg:p-5 bg-gray-500 dark:bg-gray-700 tracking-tight font-semibold"
                  />
                </div>
              )}
            </div>
          );
        })}
      </ScrollToBottom>
      <div className="send-message-box">
        <form onSubmit={onMessageSubmit}>
          <InputIconned {...msgInput} />
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
