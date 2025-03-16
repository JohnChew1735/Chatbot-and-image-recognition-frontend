import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ChatHistory() {
  const [userTextQuestion, setUserTextQuestion] = useState("");
  const [botTextAnswer, setBotTextAnswer] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [tempImageUrl, setTempImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [askImageMode, setAskImageMode] = useState(false);
  const location = useLocation();
  const { username, userID, chatID } = location.state || {};
  const navigate = useNavigate();

  //ask bot the question
  async function askTextQuestion(userTextQuestion) {
    if (!userTextQuestion.trim() && !imageUrl) {
      alert("Please input some information to ask the bot");
      return;
    }
    try {
      setIsLoading(true);
      const askTextQuestionResponse = await fetch(
        "http://localhost:11434/api/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "mistral",
            prompt: userTextQuestion,
            image: imageUrl || null,
            stream: false,
          }),
        }
      );
      if (askTextQuestionResponse.ok) {
        const data = await askTextQuestionResponse.json();
        setBotTextAnswer(data.response);
        await addUserMessages();
        addBotMessages(data.response);
        setConversation((prev) => [
          ...prev,
          {
            question: userTextQuestion,
            image: tempImageUrl,
            answer: data.response,
          },
        ]);
        setUserTextQuestion("");
        setImageUrl("");
        setTempImageUrl("");
        setIsLoading(false);
      } else {
        console.log(`HTTP error! ${askTextQuestionResponse.status}`);
      }
    } catch (error) {
      console.error("Error asking text question", error);
    }
  }

  //upload an image
  async function uploadImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "askBot");

    try {
      setIsUploading(true);
      const uploadImageResponse = await fetch(
        "https://api.cloudinary.com/v1_1/dz6b6ajwi/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (uploadImageResponse.ok) {
        const data = await uploadImageResponse.json();
        setTempImageUrl(data.secure_url);
        setImageUrl(data.secure_url);
        setIsUploading(false);
        console.log("Uploaded image url:", data.secure_url);
      } else {
        console.log("Error uploading image");
      }
    } catch (error) {
      console.error("Error uploding image");
    }
  }

  //hande ask question
  async function askImage(imageUrl) {
    if (!imageUrl) {
      alert("Please provide an image URL to proceed.");
      return;
    }

    try {
      setIsLoading(true);
      const requestBody = { imageUrl };
      const analyseImageResponse = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (analyseImageResponse.ok) {
        const data = await analyseImageResponse.json();
        let botResponse;

        if (!data.tags || data.tags.length === 0) {
          botResponse =
            "The bot is unable to recognize the image. Please try another image.";
        } else {
          botResponse = `The image contains object similar to the followings: ${data.tags.join(
            ","
          )}`;
        }
        setBotTextAnswer(botResponse);
        setConversation((prev) => [
          ...prev,
          {
            question: (
              <img
                src={tempImageUrl}
                style={{ width: "200px", height: "200px" }}
              ></img>
            ),
            answer: botResponse,
          },
        ]);
        setUserTextQuestion("");
        setImageUrl("");
        setTempImageUrl("");
        setIsLoading(false);
        await addUserMessages();
        addBotMessages(botResponse);
      } else {
        console.error("Server error:", analyseImageResponse.status);
      }
    } catch (error) {
      console.error("Error analyzing the image", error);
    }
  }

  //console.log(chatID)
  useEffect(() => {
    console.log("chat ID: ", chatID);
  }, [chatID]);

  //retrieve old messages from chatID
  useEffect(() => {
    async function getOldMessages() {
      if (!chatID || chatID === 0) return;
      try {
        const response = await fetch("http://localhost:8000/get_all_messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatID }),
        });
        if (response.ok) {
          const data = await response.json();
          setConversation((prev) => {
            const newMessages = [];
            for (let index = 0; index < data.data.length; index++) {
              const message = data.data[index];

              if (message.sender === "user") {
                if (
                  message.messages &&
                  message.messages.includes("cloudinary")
                ) {
                  newMessages.push({
                    image: message.messages,
                    answer: null,
                  });
                } else {
                  newMessages.push({
                    question: message.messages,
                    answer: null,
                  });
                }
              } else if (message.sender === "bot") {
                if (
                  newMessages.length > 0 &&
                  newMessages[newMessages.length - 1].answer === null
                ) {
                  newMessages[newMessages.length - 1].answer = message.messages;
                } else {
                  newMessages.push({
                    question: null,
                    answer: message.message,
                  });
                }
              }
            }
            return prev.length === 0 ? newMessages : prev;
          });
        } else {
          console.log("Error retrieving old messages for chatID");
        }
      } catch (error) {
        console.error("Error getting old messages", error);
      }
    }
    getOldMessages();
  }, [chatID]);

  //add user messages
  async function addUserMessages() {
    try {
      const addUserMessagesResponse = await fetch(
        "http://localhost:8000/send_message_as_user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatID,
            sender: "user",
            messages: userTextQuestion || imageUrl,
          }),
        }
      );
      if (addUserMessagesResponse.ok) {
        console.log("User messages added into the table.");
      } else {
        console.log("User messages not added into the table.");
      }
    } catch (error) {
      console.error("Error adding messages into table as user");
    }
  }

  //add bot messages
  async function addBotMessages(botTextAnswer) {
    try {
      const addBotMessagesResponse = await fetch(
        "http://localhost:8000/send_message_as_bot",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatID,
            sender: "bot",
            messages: botTextAnswer,
          }),
        }
      );
      if (addBotMessagesResponse.ok) {
        console.log("Bot messages added into the table.");
      } else {
        console.log("Bot messages not added into the table.");
      }
    } catch (error) {
      console.error("Error adding messages into table as bot");
    }
  }

  return (
    <div>
      <p></p>
      <button
        style={{ cursor: "pointer" }}
        onClick={() =>
          navigate("/LoginSUccess", { state: { username, userID } })
        }
      >
        Back
      </button>
      <p></p>
      <button
        style={{ cursor: "pointer" }}
        onClick={() => {
          const userconfirm = window.confirm(
            "Are you sure you want to log out?"
          );
          if (userconfirm) {
            navigate("/");
            alert("Log out successfully");
          }
        }}
      >
        Logout
      </button>
      <div
        style={{
          border: "1px solid black",
          width: "1700px",
          height: "700px",
          backgroundColor: "#D3D3D3",
          padding: "10px",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          margin: "20px auto",
          padding: "10px",
          flexDirection: "column",
        }}
      >
        {(() => {
          let conversationHistory = [];
          for (let index = 0; index < conversation.length; index++) {
            conversationHistory.push(
              <div key={index}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "yellow",
                      padding: "10px",
                      borderRadius: "5px",
                      width: "fit-content",
                      maxWidth: "90%",
                      marginBottom: "5px",
                      padding: "20px",
                      alignSelf: "flex-end",
                    }}
                  >
                    <strong>You: </strong>
                    {conversation[index].question}
                    {conversation[index].image && (
                      <div>
                        <p>Uploaded Image:</p>
                        <img
                          src={conversation[index].image}
                          alt="Uploaded"
                          style={{ width: "200px", marginTop: "10px" }}
                        ></img>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#B5EAAA",
                    padding: "10px",
                    borderRadius: "5px",
                    width: "fit-content",
                    maxWidth: "90%",
                    alignSelf: "flex-start",
                    padding: "20px",
                  }}
                >
                  <strong>Bot: </strong>
                  {conversation[index].answer}
                </div>
              </div>
            );
          }
          return conversationHistory;
        })()}
        {isLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <div
              style={{
                backgroundColor: "#FFD580",
                padding: "20px",
                borderRadius: "5px",
                width: "fit-content",
                maxWidth: "90%",
                fontStyle: "italic",
                opacity: 0.7,
              }}
            >
              <strong>Bot: </strong>Thinking...
            </div>
          </div>
        )}
      </div>
      <p></p>
      <center>
        {askImageMode === true
          ? "Ask about the image below:"
          : "Ask your questions below:"}
        <p></p>
        {askImageMode === true ? null : (
          <textarea
            style={{
              width: "1500px",
              height: "50px",
              bottom: "20px",
              backgroundColor: "#FFFFF0",
              value: userTextQuestion,
            }}
            onChange={(e) => setUserTextQuestion(e.target.value)}
            disabled={isLoading}
          ></textarea>
        )}
        <p></p>
        {tempImageUrl && (
          <div style={{ marginTop: "10px" }}>
            <p>
              <strong>Uploaded Image:</strong>
            </p>
            <img
              src={tempImageUrl}
              alt="Uploaded preview"
              width="200px"
              style={{ borderRadius: "5px" }}
            />
          </div>
        )}
        <p></p>
        {askImageMode === true ? (
          <button
            style={{
              cursor: "pointer",
              borderRadius: "10px",
              backgroundColor: "green",
              color: "white",
              height: "25px",
              width: "120px",
              fontSize: "18px",
            }}
            onClick={() => {
              askImage(tempImageUrl);
            }}
            disabled={isUploading}
          >
            Ask Bot Img
          </button>
        ) : (
          <button
            style={{
              cursor: "pointer",
              borderRadius: "10px",
              backgroundColor: "green",
              color: "white",
              height: "25px",
              width: "120px",
              fontSize: "18px",
            }}
            disabled={isLoading}
            onClick={() => askTextQuestion(userTextQuestion)}
          >
            Ask Bot Text
          </button>
        )}
        &nbsp;&nbsp;&nbsp;
        <button
          style={{
            cursor: "pointer",
            borderRadius: "10px",
            backgroundColor: "purple",
            color: "white",
            fontSize: "18px",
          }}
          onClick={() => setAskImageMode(!askImageMode)}
        >
          {askImageMode === true ? "Ask Text" : "Ask Image"}
        </button>
        {askImageMode === true ? (
          <>
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={uploadImage}
            ></input>{" "}
            &nbsp;&nbsp;&nbsp;
            {isUploading === true ? (
              <button disabled>Uploading</button>
            ) : (
              <button
                style={{
                  cursor: "pointer",
                  borderRadius: "10px",
                  backgroundColor: "blue",
                  color: "white",
                  fontSize: "18px",
                }}
                onClick={() => document.getElementById("fileInput").click()}
              >
                Upload an image
              </button>
            )}
          </>
        ) : null}
      </center>
      <p></p>
    </div>
  );
}
