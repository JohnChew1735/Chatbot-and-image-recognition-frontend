import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LoginSuccess() {
  const location = useLocation();
  const { username } = location.state || {};
  const [userID, setUserID] = useState(0);
  const navigate = useNavigate();
  const [askUserNewChatTitle, setAskUserNewChatTitle] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  //get userID
  useEffect(() => {
    async function getUserID() {
      try {
        const getUserIDResponse = await fetch(
          "http://localhost:8000/getUserID",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
          }
        );
        if (getUserIDResponse.ok) {
          const data = await getUserIDResponse.json();
          setUserID(data.userID.id);
        } else {
          console.log("User ID not retrieved.");
        }
      } catch (error) {
        console.error("Error getting userID", error);
      }
    }
    getUserID();
  }, [username]);

  //check chat history associated with user
  useEffect(() => {
    if (userID === 0) return;
    async function getChatHistory() {
      try {
        const getChatHistoryResponse = await fetch(
          "http://localhost:8000/checkChatHistory",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID }),
          }
        );
        const data = await getChatHistoryResponse.json();
        console.log("chat history", data.chatHistory);
        setChatHistory(data.chatHistory);

        if (!data.chatHistory || data.chatHistory.length === 0) {
          setAskUserNewChatTitle(true);
        }
      } catch (error) {
        console.error("Error getting chat history", error);
      }
    }
    getChatHistory();
  }, [userID]);

  //ask new user chat title
  useEffect(() => {
    if (!askUserNewChatTitle) return;
    if (askUserNewChatTitle === true) {
      setTimeout(() => {
        let userChatTitle = "";
        while (!userChatTitle || userChatTitle.trim() === "") {
          userChatTitle = window.prompt("Please enter a new chat title.");
        }
        if (!userChatTitle || userChatTitle.trim() === "") {
          alert("Chat title cannot be empty. Please enter a new chat title.");
        }
        console.log("newUserTitle", userChatTitle);
        addNewChatTitle(userChatTitle);
      }, 100);
    }
  }, [askUserNewChatTitle]);

  //add new chat title
  async function addNewChatTitle(userChatTitle) {
    try {
      setAskUserNewChatTitle(false);
      const addNewTitleResponse = await fetch(
        "http://localhost:8000/adding_new_chat_title",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID, userChatTitle }),
        }
      );
      if (addNewTitleResponse.ok) {
        alert("New chat title added. Navigating to the new chat page");
        navigate("/ChatHistory", { state: { username, userID } });
      } else {
        console.log("New chat title not added.");
      }
    } catch (error) {
      console.error("Error adding new chat title.", error);
    }
  }

  //delete chat history
  async function deleteChatHistory(chatID) {
    try {
      console.log(chatID);
      const response = await fetch(
        "http://localhost:8000/delete_chat_history",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatID }),
        }
      );
      if (response.ok) {
        alert("Chat deleted successfully.");
        setChatHistory((prev) => prev.filter((chat) => chat.id !== chatID));
      } else {
        console.log("Chat is not deleted");
      }
    } catch (error) {
      console.error("Error deleting chat history", error);
    }
  }

  //edit chat name
  async function editChatName(chatID) {
    const userconfirm = window.confirm(
      "Are you sure you want to edit this chat name?"
    );
    if (userconfirm) {
      const userTitle = window.prompt(
        "Please provide a new title for this chat."
      );
      if (userTitle) {
        try {
          const response = await fetch(
            "http://localhost:8000/edit_chat_history",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatID, chatName: userTitle }),
            }
          );

          if (response.ok) {
            alert("Chat name edited successfully.");
            setChatHistory((prev) => {
              const updatedChatHistory = [...prev];
              for (let index = 0; index < updatedChatHistory.length; index++) {
                if (updatedChatHistory[index].id === chatID) {
                  updatedChatHistory[index].chatName = userTitle;
                  break;
                }
              }

              return updatedChatHistory;
            });
          } else {
            alert("Chat is not edited successfully.");
          }
        } catch (error) {
          console.error("Error editing chat name.", error);
        }
      } else {
        alert("No new title was provided. Editing for this title ended.");
        return;
      }
    } else {
      alert("Chat title was not edited.");
      return;
    }
  }

  return (
    <div>
      <p></p>
      <div>
        &nbsp;Logged in as &nbsp;
        <strong style={{ color: "green" }}>{username}</strong>
        <p></p>
        <button
          style={{ cursor: "pointer" }}
          onClick={() => {
            const userConfirm = window.confirm(
              "Are you sure you want to log out?"
            );
            if (userConfirm) {
              navigate("/");
              alert("Log out successful.");
            }
          }}
        >
          Logout
        </button>
        <center>
          <h1>Chat history</h1>
          <p></p>
          <h3>
            Please click on any of the below chats name to continue with the
            chat
          </h3>
          <table
            style={{
              width: "80%",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid black" }}>Chat Name</th>
                <th style={{ border: "1px solid black" }}>Action</th>
                <th style={{ border: "1px solid black" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let userChatHistoryName = [];
                if (!chatHistory || chatHistory.length === 0) return;
                for (let index = 0; index < chatHistory.length; index++) {
                  userChatHistoryName.push(
                    <tr key={index}>
                      <td
                        style={{ border: "1px solid black", cursor: "pointer" }}
                        onClick={() =>
                          navigate("/ChatHistory", {
                            state: {
                              username,
                              userID,
                              chatID: chatHistory[index].id,
                            },
                          })
                        }
                      >
                        {chatHistory[index].chatName}
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        <button
                          style={{
                            backgroundColor: "red",
                            color: "white",
                            borderRadius: "10px",
                            border: "none",
                            cursor: "pointer",
                            width: "70px",
                            height: "20px",
                          }}
                          onClick={() => {
                            const userConfirm = window.confirm(
                              "Are you sure you want to delete this chat?"
                            );
                            if (userConfirm) {
                              deleteChatHistory(chatHistory[index].id);
                            } else {
                              alert("Chat history not deleted.");
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        <button
                          style={{
                            borderRadius: "10px",
                            backgroundColor: "orange",
                            color: "white",
                            border: "none",
                            width: "70px",
                            height: "20px",
                            cursor: "pointer",
                          }}
                          onClick={() => editChatName(chatHistory[index].id)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                }
                return userChatHistoryName;
              })()}
            </tbody>
          </table>
          <p></p>
          <button
            style={{
              cursor: "pointer",
              width: "80px",
              height: "50px",
              fontSize: "15px",
              borderRadius: "10px",
              backgroundColor: "green",
              color: "white",
              border: "none",
            }}
            onClick={() => {
              const userConfirm = window.confirm(
                "Are you sure you want to open a new chat with the bot?"
              );
              if (userConfirm) {
                const userTitle = window.prompt(
                  "Please provide a new chat title name."
                );
                if (userTitle) {
                  addNewChatTitle(userTitle);
                } else {
                  alert("New chat title was not provided.");
                }
              } else {
                alert("New chat title addition was not confirmed.");
                return;
              }
            }}
          >
            New chat
          </button>
        </center>
      </div>
    </div>
  );
}
