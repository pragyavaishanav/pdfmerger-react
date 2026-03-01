"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export interface OneDriveFile {
  id: string;
  name: string;
  size?: number;
}

interface DriveItem {
  id: string;
  name: string;
  folder?: { childCount: number };
  file?: { mimeType: string };
  size?: number;
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface OneDrivePickerProps {
  onFilesPicked: (files: OneDriveFile[]) => void;
}

export default function OneDrivePicker({ onFilesPicked }: OneDrivePickerProps) {
  const { data: session } = useSession();
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: "root", name: "My Files" },
  ]);

  const accessToken = (session as any)?.accessToken;

  const fetchItems = useCallback(
    async (folderId: string) => {
      if (!accessToken) return;
      setLoading(true);
      setError(null);
      try {
        const endpoint =
          folderId === "root"
            ? "https://graph.microsoft.com/v1.0/me/drive/root/children"
            : `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`;

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData?.error?.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        setItems(data.value || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  const openBrowser = () => {
    if (!accessToken) {
      alert("Not authenticated — access token is missing");
      return;
    }
    setIsOpen(true);
    setSelected(new Set());
    setBreadcrumbs([{ id: "root", name: "My Files" }]);
    fetchItems("root");
  };

  const navigateToFolder = (item: DriveItem) => {
    setBreadcrumbs((prev) => [...prev, { id: item.id, name: item.name }]);
    setSelected(new Set());
    fetchItems(item.id);
  };

  const navigateToBreadcrumb = (index: number) => {
    const crumb = breadcrumbs[index];
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setSelected(new Set());
    fetchItems(crumb.id);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    const pickedFiles: OneDriveFile[] = items
      .filter((item) => selected.has(item.id) && item.file)
      .map((item) => ({ id: item.id, name: item.name, size: item.size }));

    setIsOpen(false);
    onFilesPicked(pickedFiles);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const pdfItems = items.filter(
    (item) => item.folder || item.name.toLowerCase().endsWith(".pdf")
  );

  if (!isOpen) {
    return <Button onClick={openBrowser}>Pick from OneDrive</Button>;
  }

  return (
    <div
      style={{
        border: "1px solid #333",
        borderRadius: 8,
        padding: 16,
        maxWidth: 600,
        background: "#1a1a2e",
      }}
    >
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.id}>
            {i > 0 && <span style={{ margin: "0 4px", color: "#666" }}>/</span>}
            <button
              onClick={() => navigateToBreadcrumb(i)}
              style={{
                background: "none",
                border: "none",
                color: i === breadcrumbs.length - 1 ? "#fff" : "#888",
                cursor: "pointer",
                fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                padding: "2px 4px",
              }}
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </div>

      {loading && <p style={{ color: "#aaa" }}>Loading...</p>}
      {error && <p style={{ color: "#f66" }}>Error: {error}</p>}

      {!loading && !error && pdfItems.length === 0 && (
        <p style={{ color: "#aaa" }}>No PDF files or folders here.</p>
      )}

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {pdfItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 6,
                background: selected.has(item.id) ? "#2a2a4e" : "transparent",
                cursor: "pointer",
              }}
              onClick={() => {
                if (item.folder) navigateToFolder(item);
                else toggleSelect(item.id);
              }}
            >
              <span style={{ fontSize: 18 }}>{item.folder ? "📁" : "📄"}</span>
              <span style={{ flex: 1, color: "#eee" }}>{item.name}</span>
              {item.folder ? (
                <span style={{ color: "#888", fontSize: 12 }}>
                  {item.folder.childCount} items
                </span>
              ) : (
                <>
                  <span style={{ color: "#888", fontSize: 12 }}>
                    {formatSize(item.size)}
                  </span>
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={selected.size === 0}>
          Select {selected.size > 0 ? `(${selected.size})` : ""}
        </Button>
      </div>
    </div>
  );
}
