"use client";

import { useSession } from "next-auth/react";

export default function OneDrivePicker() {
  const { data: session } = useSession();

  const openPicker = () => {
    const accessToken = (session as any)?.accessToken;

    if (!accessToken) {
      alert("Not authenticated");
      return;
    }

    const odOptions = {
      clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID,
      action: "query",
      multiSelect: true,
      advanced: {
        accessToken,
      },
      success: function (files: any) {
        console.log("Selected files:", files);
      },
      cancel: function () {
        console.log("Picker cancelled");
      },
      error: function (err: any) {
        console.error(err);
      },
    };

    (window as any).OneDrive.open(odOptions);
  };

  return <button onClick={openPicker}>Pick from OneDrive</button>;
}