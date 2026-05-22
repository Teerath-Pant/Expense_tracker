import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

export default function ServerStatus() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();
    const serverUrl = import.meta.env.VITE_SERVER_URL || "";
    const healthUrl = serverUrl ? `${serverUrl}/health` : "/health";

    fetch(healthUrl, { signal: controller.signal })
      .then((response) => setStatus(response.ok ? "online" : "offline"))
      .catch(() => setStatus("offline"));

    return () => controller.abort();
  }, []);

  if (status === "checking" || status === "online") {
    return null;
  }

  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>Backend server is offline.</span>
    </div>
  );
}
