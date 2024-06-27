import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getWalletConnectionStatus } from "./wallet-connection"; // Assuming we have a helper function to check wallet status

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Check if the request is for the API or the connect page
  if (url.pathname === "/connect" || url.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Determine the wallet connection status
  const isConnected = await getWalletConnectionStatus();

  // Redirect logic based on wallet connection status
  if (isConnected) {
    if (url.pathname === "/") {
      url.pathname = "/chat";
      return NextResponse.redirect(url);
    }
  } else {
    if (url.pathname !== "/connect") {
      url.pathname = "/connect";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Middleware config to specify the paths to be matched
export const config = {
  matcher: ["/", "/chat", "/connect", "/api/:path*"],
};
