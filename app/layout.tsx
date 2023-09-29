"use client";
import "./globals.scss";
import { Inter } from "next/font/google";
import React, { useState, useEffect } from "react";
import { checkBackendAvailable } from "@/utils/checkBackendAvailable";
import {
  Notification,
  Theme,
  List,
  Navigation,
  Row,
  Strip,
} from "@canonical/react-components";

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
