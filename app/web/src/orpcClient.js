import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";

const link = new RPCLink({
  url: "http://localhost:4000/rpc",
  headers: () => {
    const token = localStorage.getItem("expense_tracker_token");
    return {
      Authorization: token ? `Bearer ${token}` : "",
    };
  },
});

export const orpcClient = createORPCClient(link);
export default orpcClient;
