import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ForgetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  //check if username and email exist in database
  async function checkUserInfo() {
    try {
      const checkUsernameResponse = await fetch(
        "http://localhost:8000/checkUsernameExist",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        }
      );
      if (checkUsernameResponse.ok) {
        try {
          const getUserIDResponse = await fetch(
            "http://localhost:8000/get_userID_from_username",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username }),
            }
          );
          if (getUserIDResponse.ok) {
            const userData = await getUserIDResponse.json();

            try {
              const getEmailResponse = await fetch(
                "http://localhost:8000/get_email_with_userID",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userID: userData.result[0].id }),
                }
              );
              if (getEmailResponse.ok) {
                const data = await getEmailResponse.json();
                if (email === data.result[0].email) {
                  alert(
                    "User information found. Proceeding with password resetting."
                  );
                  navigate("/ForgetPassword2", {
                    state: { username, email, userID: userData.result[0].id },
                  });
                } else {
                  alert("User email is not found with this username.");
                  return;
                }
              } else {
                console.log("Email cannot be retrieved using this userID");
              }
            } catch (error) {
              console.error("Error getting the email of this userID");
            }
          } else {
            console.log("UserID not retrieved from username.");
            return;
          }
        } catch (error) {
          console.error("Error getting userID from username.");
        }
      } else {
        alert("Username does not exist. Please provide the correct username.");
        return;
      }
    } catch (error) {
      console.error("Error checking if username exist in database.");
    }
  }

  return (
    <div>
      <p></p>
      <button
        onClick={() => {
          navigate("/Login");
        }}
      >
        Back
      </button>
      <center>
        <h1>Please provide the information below</h1>
        <p></p>
        Email:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type="text"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        ></input>
        <p></p>
        Username:&nbsp;&nbsp;&nbsp;
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        ></input>
        <p></p>
        <button
          onClick={() => {
            checkUserInfo();
          }}
        >
          Submit
        </button>
      </center>
    </div>
  );
}
