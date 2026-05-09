import { useState, useCallback } from "react";

function useUpload() {
  const [loading, setLoading] = useState(false);

  const upload = useCallback(async (input) => {
    setLoading(true);
    try {
      let response;
      if ("file" in input && input.file) {
        const formData = new FormData();
        formData.append("file", input.file);
        response = await fetch("/api/upload", { method: "POST", body: formData });
      } else if ("url" in input) {
        response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: input.url }),
        });
      }
      if (!response?.ok) throw new Error("Upload failed");
      return await response.json();
    } finally {
      setLoading(false);
    }
  }, []);

  return { upload, loading };
}

export default useUpload;
