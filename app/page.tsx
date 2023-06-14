"use client";
import { useState } from "react";
import Image from "next/image";

import SubscriberTable from "@/components/SubscriberTable";

import canonicalUbuntuLogo from "@/public/Canonical-Ubuntu+logo-2021_RGB_reverse.svg";
import NetworkConfiguration from "@/components/NetworkConfiguration";

export default function Home() {
  const views = ["network configuration", "subscribers", "network slices"];
  const [view, setView] = useState(views[0]);

  const handleViewNetworkConfiguration = () => {
    setView(views[0]);
  };
  const handleViewSubscribers = () => {
    setView(views[1]);
  };
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
          <button
            className="p-button--base is-dark u-no-margin--bottom"
            onClick={handleViewNetworkConfiguration}
          >
            Network Configuration
          </button>
          <button
            className="p-button--base is-dark u-no-margin--bottom"
            onClick={handleViewSubscribers}
          >
            Subscribers
          </button>
        </nav>
        <div className="col-span-12 ml-[16rem] mt-8 flex w-10/12 flex-col items-start">
          {view == views[0] && <NetworkConfiguration />}
          {view == views[1] && <SubscriberTable />}
        </div>
      </div>
    </main>
  );
}
