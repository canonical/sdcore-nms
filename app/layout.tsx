"use client";
import "./globals.scss";
import { Inter } from "next/font/google";
import { Navigation } from "@canonical/react-components";
import React, { useState, useEffect } from "react";
import { checkBackendAvailable } from "@/utils/checkBackendAvailable";
import { Notification, Theme } from "@canonical/react-components";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [backendAvailable, setBackendAvailable] = useState<null | boolean>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      const isBackendAvailable = await checkBackendAvailable();
      setBackendAvailable(isBackendAvailable);
    };

    fetchData();
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation
          theme={Theme.DARK}
          logo={{
            src: "https://assets.ubuntu.com/v1/82818827-CoF_white.svg",
            title: "SD-Core NMS",
            url: "/",
          }}
          items={[
            {
              label: "Network Configuration",
              url: "/network-configuration",
            },
            {
              label: "Subscribers",
              url: "/subscribers",
            },
          ]}
        />
        {backendAvailable === false && (
          <Notification severity="negative" title="Error">
            {"Backend not available"}
          </Notification>
        )}
        {backendAvailable === true && children}
      </body>
    </html>
  );
}
