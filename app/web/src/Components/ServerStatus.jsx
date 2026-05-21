import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function ServerStatus() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();

    fetch("http://localhost:4000/health", { signal: controller.signal })
      .then((response) => setStatus(response.ok ? "online" : "offline"))
      .catch(() => setStatus("offline"));

    return () => controller.abort();
  }, []);

  if (status === "checking") {
    return null;
  }

  const isOnline = status === "online";

  return (
    <div
      className={`mb-5 flex items-start gap-3 rounded-xl border p-3 text-xs ${
        isOnline
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/20 bg-red-500/10 text-red-300"
      }`}
    >
      {isOnline ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      <span>{isOnline ? "Backend connected" : "Backend server is offline. Start the server on port 4000."}</span>
    </div>
  );
}
