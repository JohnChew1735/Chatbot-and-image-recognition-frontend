import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    try {
      const loginResponse = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (loginResponse.ok) {
        alert("Login success. Navigating to login success page.");
        navigate("/LoginSuccess", { state: { username } });
      } else {
        alert("Login failed. Please try again or forget password.");
      }
    } catch (error) {
      console.error("Error logging in", error);
    }
  }

  return (
    <div>
      <p></p>
      <button onClick={() => navigate("/")}>Back</button>
      <center>
        <h1>Login</h1>
        <p></p>
        Username:&nbsp;&nbsp;&nbsp;
        <input
          type="text"
          onChange={(e) => setUsername(e.target.value)}
        ></input>
        <p></p>
        Password:&nbsp;&nbsp;&nbsp;
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <p></p>
        <button onClick={() => login()}>Login</button>
        &nbsp;
        <button
          onClick={() => {
            navigate("/ForgetPassword1");
          }}
        >
          Forget password
        </button>
      </center>
    </div>
  );
}
