"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function OneDrivePicker() {
  const { data: session } = useSession();

  const openPicker = () => {
    const accessToken = (session as any)?.accessToken;

    console.log("Session:", session);
    console.log("Access Token:", accessToken ? "exists" : "MISSING");
    console.log("OneDrive SDK:", (window as any).OneDrive ? "loaded" : "NOT LOADED");

    if (!accessToken) {
      alert("Not authenticated — access token is missing from session");
      return;
    }

    if (!(window as any).OneDrive) {
      alert("OneDrive SDK not loaded yet");
      return;
    }

    const odOptions = {
      clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID,
      action: "query",
      multiSelect: true,
      advanced: {
        accessToken,
        redirectUri: `${window.location.origin}/microsoft`,
      },
      success: function (files: any) {
        console.log("✅ Selected files:", files);
      },
      cancel: function () {
        console.log("❌ Picker cancelled");
      },
      error: function (err: any) {
        console.error("🔴 Picker error:", err);
      },
    };

    console.log("Opening picker with options:", odOptions);
    (window as any).OneDrive.open(odOptions);
  };

  return <Button onClick={openPicker}>Pick from OneDrive</Button>;
}