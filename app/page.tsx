"use client";
import { useState } from "react";
import Image from "next/image";

import SubscriberTable from "@/components/SubscriberTable";
import NetworkSliceConfiguration from "@/components/NetworkSliceConfiguration";

import canonicalUbuntuLogo from "@/public/Canonical-Ubuntu+logo-2021_RGB_reverse.svg";

export default function Home() {
  const [toggleView, setToggleView] = useState(true);
  const handleViewSubscribers = () => {
    setToggleView(true);
  };
  const handleViewNetworkSlices = () => {
    setToggleView(false);
  };
  return (
    <main className="flex flex-col justify-start items-start min-h-screen">
      <div className="grid grid-cols-12">
        <nav className="fixed col-span-2 flex flex-col items-start bg-[#333] h-screen">
          <Image
            src={canonicalUbuntuLogo}
            priority={true}
            alt="Canonical Ubuntu Logo"
            width={200}
            className="mb-4 mx-8"
          />
          <button
            className="p-button--base is-dark u-no-margin--bottom"
            onClick={handleViewSubscribers}
          >
            Subscribers
          </button>
          <button
            className="p-button--base is-dark u-no-margin--bottom"
            onClick={handleViewNetworkSlices}
          >
            Network-Slices
          </button>
        </nav>
        <div className="col-span-12 w-10/12 flex flex-col items-start ml-[16rem] mt-8">
          {toggleView && <SubscriberTable />}
          {!toggleView && <NetworkSliceConfiguration />}
        </div>
      </div>
    </main>
  );
}
