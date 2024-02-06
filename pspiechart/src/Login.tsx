import PocketBase from "pocketbase";

/*
Component for the login into the server.
Nothing fancy here. 
Usernams/passwords are stored on a pocketbase database stored in the pocketbase folder. Thus, when trying to login, your query
is sent there.
Unlimited attempts at login.
I do not know what login is -- ask higher up.
*/

// const PB_SERVER_URL = import.meta.env.VITE_PB_SERVER_URL as string;
const myURL = new URL(window.location.href);
myURL.port = "8093";

const PB_SERVER_URL = myURL.origin;

export const pb = new PocketBase(PB_SERVER_URL);
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

  // assuming there's already a subdomain
  const pbAdminLink = `${PB_SERVER_URL}/_`

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
      {admin ? (
        <a
          className="text-sm text-rush underline -mt-4"
          href={pbAdminLink}
        >
          Admin Dashboard
        </a>
      ) : (
        <></>
      )}
      <Button onClick={login}>Login</Button>
    </FullpageForm>
  );
}
