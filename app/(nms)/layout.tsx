"use client";

import "../globals.scss";
import { AuthProvider, useAuth } from "@/utils/auth";
import { CookiesProvider } from "react-cookie";
import { Inter } from "next/font/google";
import { is401UnauthorizedError, is403ForbiddenError } from "@/utils/errors";
import { List, Row } from "@canonical/react-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Navigation from "@/components/Navigation";
import React from "react";

const inter = Inter({ subsets: ["latin"] });
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (is401UnauthorizedError(error) || is403ForbiddenError(error)) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
  noLayout?: boolean;
}) {
  useAuth();

  return (
    <CookiesProvider>
      <html lang="en">
        <head>
          <title>Aether SD-Core</title>
          <link
            rel="shortcut icon"
            href="https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png"
            type="image/x-icon"
          />
        </head>
        <body className={inter.className}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <div className="l-application" role="presentation">
                <Navigation />
                <main className="l-main">
                  <div className="p-panel">{children}</div>
                  <footer className="l-footer--sticky p-strip--light">
                    <Row>
                      <p>
                        © 2025 Canonical Ltd. <a href="#">Ubuntu</a> and{" "}
                        <a href="#">Canonical</a> are registered trademarks of
                        Canonical Ltd.
                      </p>
                      <List
                        items={[
                          <a
                            key="Legal information"
                            href="https://ubuntu.com/legal"
                          >
                            Legal information
                          </a>,
                        ]}
                        middot
                      />
                    </Row>
                  </footer>
                </main>
              </div>
            </AuthProvider>
          </QueryClientProvider>
        </body>
      </html>
    </CookiesProvider>
  );
}
