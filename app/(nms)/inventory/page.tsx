"use client"

import { useState } from "react";
import { Tabs } from "@canonical/react-components"

import GnbTable from "./gnbs";
import PageContent from "@/components/PageContent"
import PageHeader from "@/components/PageHeader"
import UpfTable from "./upfs";


export default function Gnbs() {
  const GNBS = "gnbs"
  const UPFS = "upfs"
  const [activeTab, setActiveTab] = useState(GNBS);

  return (
    <>
      <PageHeader title={`Inventory`}>
         {" "}
      </PageHeader>
      <PageContent>
        {
          <Tabs links={[{
              active: activeTab === GNBS,
              label: "gNodeBs",
              onClick: () => setActiveTab(GNBS),
            }, {
              active: activeTab === UPFS,
              label: "UPFs",
              onClick: () => setActiveTab(UPFS),
            }]} />
        }
        {activeTab === GNBS && <GnbTable/>}
        {activeTab === UPFS && <UpfTable/>}
      </PageContent>
    </>
  )
}