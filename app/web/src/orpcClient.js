import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";

const link = new RPCLink({
  url: `${import.meta.env.VITE_SERVER_URL || ""}/rpc`,  // ✅ dynamic
  headers: () => {
    const token = localStorage.getItem("expense_tracker_token");
    return {
      Authorization: token ? `Bearer ${token}` : "",
    };
  },
});

export const orpcClient = createORPCClient(link);
export default orpcClient;