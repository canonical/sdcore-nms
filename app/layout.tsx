"use client";
import "./globals.scss";
import { Inter } from "next/font/google";
import React, { useState, useEffect, Suspense } from "react";
import { usePathname } from 'next/navigation'
import { checkBackendAvailable } from "@/utils/checkBackendAvailable";
import {
  Notification,
  Theme,
  List,
  Navigation,
  Row,
} from "@canonical/react-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const inter = Inter({ subsets: ["latin"] });
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [backendAvailable, setBackendAvailable] = useState<null | boolean>(
    null,
  );
  const pathname = usePathname()

  useEffect(() => {
    const fetchData = async () => {
      const isBackendAvailable = await checkBackendAvailable();
      setBackendAvailable(isBackendAvailable);
    };

    fetchData();
  }, []);

  return (
    <html lang="en">
      <head>
        <title>SD Core</title>
      </head>
      <body className={inter.className}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Navigation
            theme={Theme.DARK}
            logo={{
              src: "https://assets.ubuntu.com/v1/82818827-CoF_white.svg",
              title: "5G NMS",
              url: "/",
            }}
            items={[
              {
                label: "Network Configuration",
                url: "/network-configuration",
                isSelected: pathname === "/network-configuration",
              },
              {
                label: "Subscribers",
                url: "/subscribers",
                isSelected: pathname === "/subscribers",
              },
            ]}
          />
          {backendAvailable === false && (
            <Notification severity="negative" title="Error">
              {"Backend not available"}
            </Notification>
          )}
          {backendAvailable === true && (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
          )}
          <div style={{ flex: 1 }}></div>
          <footer className="l-footer--sticky p-strip--light">
            <Row>
              <p>
                © 2023 Canonical Ltd. <a href="#">Ubuntu</a> and{" "}
                <a href="#">Canonical</a> are registered trademarks of Canonical
                Ltd.
              </p>
              <List
                items={[
                  <a key="Legal information" href="https://ubuntu.com/legal">
                    Legal information
                  </a>,
                  <a
                    key="Documentation"
                    href="https://canonical-charmed-5g.readthedocs-hosted.com/en/latest/"
                  >
                    Documentation
                  </a>,
                  <a
                    key="Report a bug"
                    href="https://github.com/canonical/charmed-5g/issues/new/choose"
                  >
                    Report a bug
                  </a>,
                ]}
                middot
              />
            </Row>
          </footer>
        </div>
      </body>
    </html>
  );
}
