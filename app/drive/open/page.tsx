'use client'

import { useEffect, useState } from 'react'
import { useCustomSearchParams } from './useCustomSearchParams'
import { LidarApp } from '@/app/components/lidar-app'

const FileLoader = () => {
  const { stateParam, code } = useCustomSearchParams();
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (stateParam === undefined || code === undefined) return;

    if (!stateParam || !code) {
      setError("Missing required URL parameters. Please open this file from Google Drive.");
      setLoading(false);
      return;
    }

    async function loadFile() {
      try {
        const state = JSON.parse(stateParam!);
        const fileId = state.ids?.[0];

        if (!fileId) {
          setError("No file ID found in state parameter");
          setLoading(false);
          return;
        }

        const tokenRes = await fetch("/api/drive/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!tokenRes.ok) {
          const { error: errMsg } = await tokenRes.json().catch(() => ({ error: "Unknown error" }));
          setError(errMsg || "Failed to get access token");
          setLoading(false);
          return;
        }

        const { accessToken } = await tokenRes.json();

        const fileUrl = `/api/drive/file?fileId=${encodeURIComponent(fileId)}&accessToken=${encodeURIComponent(accessToken)}`;
        setUrl(fileUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load file");
      } finally {
        setLoading(false);
      }
    }

    loadFile();
  }, [stateParam, code]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (loading || !url) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading file from Google Drive...</p>
      </div>
    );
  }

  return <LidarApp url={url} />;
};

export default FileLoader;
