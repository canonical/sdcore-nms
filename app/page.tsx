"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import SubscriberTable from "@/components/SubscriberTable";

import canonicalUbuntuLogo from "@/public/Canonical-Ubuntu+logo-2021_RGB_reverse.svg";
import NetworkConfiguration from "@/components/NetworkConfiguration";
import { Button, Notification } from "@canonical/react-components";
import { checkBackendAvailable } from "@/utils/checkBackendAvailable";


export default function Home() {
  const views = ["network configuration", "subscribers", "network slices"];
  const [view, setView] = useState<string>(views[0]);
  const [backendAvailable, setBackendAvailable] = useState(false);


  const handleViewNetworkConfiguration = () => {
    setView(views[0]);
  };
  const handleViewSubscribers = () => {
    setView(views[1]);
  };

  useEffect(() => {
    const fetchData = async () => {
      const isBackendAvailable = await checkBackendAvailable();
      setBackendAvailable(isBackendAvailable);
    };

    fetchData();
  }, []);


  return (
    <main className="flex min-h-screen flex-col items-start justify-start">
      <div className="grid grid-cols-12">
        <nav className="fixed col-span-2 flex h-screen flex-col items-start bg-[#333]">
        
          <Image
            src={canonicalUbuntuLogo}
            priority={true}
            alt="Canonical Ubuntu Logo"
            width={200}
            className="mx-8 mb-4"
          />
          <Button
            appearance="base"
            className="is-dark u-no-margin--bottom"
            onClick={handleViewNetworkConfiguration}
          >
            Network Configuration
          </Button>
          <Button
            appearance="base"
            className="is-dark u-no-margin--bottom"
            onClick={handleViewSubscribers}
          >
            Subscribers
          </Button>
        </nav>
        <div className="col-span-12 ml-[16rem] mt-8 flex w-10/12 flex-col items-start">

          {!backendAvailable && (
            <Notification severity="negative" title="Error">
              {"Backend not available"}
            </Notification>
          )}

          {backendAvailable && view === views[0] && <NetworkConfiguration />}
          {backendAvailable && view === views[1] && <SubscriberTable />}
        </div>
      </div>
    </main>
);

}
