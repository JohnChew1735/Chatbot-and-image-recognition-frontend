import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function signUp() {
    if (!username) {
      alert("Username cannot be empty. Please try again.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert(" Invalid email format. Please enter a valid email address.");
      return;
    }
    if (!password) {
      alert("Password cannot be empty. Please try again. ");
      return;
    }
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
        alert(
          "Username already exist. Please try loggin in or forget password."
        );
        return;
      } else {
        try {
          const checkEmailResponse = await fetch(
            "http://localhost:8000/checkEmailExist",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            }
          );
          if (checkEmailResponse.ok) {
            alert(
              "Email already associated with another username. Please try logging in or forget password."
            );
            return;
          } else {
            try {
              const signUpResponse = await fetch(
                "http://localhost:8000/signup",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ username, email, password }),
                }
              );
              if (signUpResponse.ok) {
                alert("Sign up success. Navigating back to main page.");
                navigate("/");
              } else {
                alert("Sign up failed.");
                return;
              }
            } catch (error) {
              console.error("Error signing up.", error);
            }
          }
        } catch (error) {
          console.error("Error checking if email exist.");
        }
      }
    } catch (error) {
      console.error("Error checking if username exist");
    }
  }

  return (
    <div>
      <p></p>
      <button onClick={() => navigate("/")}>Back</button>
      <center>
        <h1>Sign up</h1>
        <p></p>
        Username: &nbsp;&nbsp;&nbsp;
        <input
          onChange={(e) => setUsername(e.target.value)}
          type="text"
        ></input>
        <p></p>
        Email:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input onChange={(e) => setEmail(e.target.value)} type="text"></input>
        <p></p>
        Password:&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        ></input>
        <p></p>
        <button onClick={() => signUp()}>Sign up</button>
      </center>
    </div>
  );
}
