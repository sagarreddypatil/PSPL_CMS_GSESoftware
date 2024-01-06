import PocketBase from "pocketbase";

const PB_SERVER = import.meta.env.VITE_PB_SERVER as string;
export const pb = new PocketBase(PB_SERVER);
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
      <div className="-mt-4">
        {admin ? (
          <a
            className="text-sm text-rush underline"
            href="#"
            onClick={() => {
              navigate("/login");
            }}
          >
            Normal Login
          </a>
        ) : (
          <a
            className="text-sm text-rush underline"
            href="#"
            onClick={() => {
              navigate("/login?admin");
            }}
          >
            Admin Login
          </a>
        )}
      </div>
      <Button onClick={login}>Login</Button>
    </FullpageForm>
  );
}
