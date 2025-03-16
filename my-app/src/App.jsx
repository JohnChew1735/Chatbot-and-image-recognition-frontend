import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import process from "process";
import Home from "./main/Home";
import SignUp from "./main/signup";
import Login from "./main/login";
import LoginSuccess from "./main/loginSuccess";
import ChatHistory from "./main/chatHistory";
import ForgetPassword1 from "./main/forgetPassword1";
import ForgetPassword2 from "./main/forgetPassword2";

export default function App() {
  if (typeof window !== "undefined") {
    window.process = process;
  }
  const SITE_KEY = "6LfdQfQqAAAAAJ2Y82EqCPKGQplDyYVpQ8Bjzv9n";
  return (
    <GoogleReCaptchaProvider reCaptchaKey={SITE_KEY}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/LoginSuccess" element={<LoginSuccess />} />
          <Route path="/ChatHistory" element={<ChatHistory />} />
          <Route path="/ForgetPassword1" element={<ForgetPassword1 />} />
          <Route path="/ForgetPassword2" element={<ForgetPassword2 />} />
        </Routes>
      </BrowserRouter>
    </GoogleReCaptchaProvider>
  );
}
