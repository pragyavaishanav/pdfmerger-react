"use client";
import OneDrivePicker from "./one-drive-picker";

import { signIn, signOut, useSession } from "next-auth/react";
async function getFiles(accessToken: string) {
    const res = await fetch(
      "https://graph.microsoft.com/v1.0/me/drive/root/children",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  
    return res.json();
  }
export default function MicrosoftLogin() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <button onClick={() => signIn("azure-ad")}>
        Sign in with Microsoft
      </button>
    );
  }

  return (
    <>
      <p>Signed in as {session.user?.email}</p>
      <button onClick={() => signOut()}>Sign out</button>
      <OneDrivePicker />
    </>
  );
}