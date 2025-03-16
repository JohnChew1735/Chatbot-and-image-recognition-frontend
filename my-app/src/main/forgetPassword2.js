import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

export default function ForgetPassword2() {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, email, userID } = location.state || {};
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  const { executeRecaptcha } = useGoogleReCaptcha();

  //captcha check
  async function handleSubmit() {
    if (!executeRecaptcha) {
      alert("Captcha is not ready yet.");
      return;
    }

    const token = await executeRecaptcha("resetPassword");
    console.log("Recaptcha token:", token);
    try {
      const captchaResponse = await fetch(
        "http://localhost:8000/verify-recaptcha",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
      );

      const data = await captchaResponse.json();
      if (data.success) {
        alert("CAPTCHA verified! Proceeding with password resetting.");
        resetPassword();
      } else {
        alert("CAPTCHA verification failed.");
        return;
      }
    } catch (error) {
      console.error("Error with CAPTCHA", error);
    }
  }
  //reset password
  async function resetPassword() {
    if (password1 !== password2) {
      alert("Password dont match. Please try again.");
      return;
    }

    //reset password
    try {
      const response = await fetch("http://localhost:8000/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, password: password1 }),
      });

      if (response.ok) {
        alert("User password reset is done.");
        navigate("/");
      } else {
        console.log("User password reset is incomplete.");
      }
    } catch (error) {
      console.error("Error resetting password", error);
    }
  }

  return (
    <div>
      <p></p>
      <button
        onClick={() => {
          navigate("/ForgetPassword1");
        }}
      >
        Back
      </button>
      <center>
        <h1>Resetting password</h1>
        <p></p>
        Username:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input value={username} disabled></input>
        <p></p>
        Email:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input value={email} disabled></input>
        <p></p>
        New
        password:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type="password"
          value={password1}
          onChange={(e) => {
            setPassword1(e.target.value);
          }}
        ></input>
        <p></p>
        Confirm password:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type="password"
          value={password2}
          onChange={(e) => {
            setPassword2(e.target.value);
          }}
        ></input>
        <p></p>
        Captcha will be automatically verified
        <p></p>
        <button
          onClick={() => {
            handleSubmit();
          }}
        >
          Reset Password
        </button>
      </center>
    </div>
  );
}
