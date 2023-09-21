import PocketBase from "pocketbase";

export const pb = new PocketBase("http://pb.localhost/");
pb.autoCancellation(false);

import FullpageForm from "./components/fullpage-form";
import { Button } from "./controls/button";
import Textbox from "./controls/textbox";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Login() {
  const [searchParams] = useSearchParams();
  const admin = searchParams.get("admin") != undefined;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const login = () => {
    if (admin) {
      pb.admins.authWithPassword(username, password);
      if (pb.authStore.isValid) {
        navigate("/");
      }
    }
  };

  return (
    <FullpageForm>
      <span className="text-2xl">Login</span>
      <Textbox
        placeholder={admin ? "Admin Email" : "Username/Email"}
        value={username}
        setValue={setUsername}
      />
      <Textbox
        placeholder="Password"
        password
        value={password}
        setValue={setPassword}
      />
      <Button onClick={login}>Login</Button>
    </FullpageForm>
  );
}
