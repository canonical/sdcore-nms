"use client";
import { useState } from "react";
import { Input, Button } from "@canonical/react-components";
import {
  WEBUI_ENDPOINT,
  STATIC_NETWORK_SLICE_DATA,
  NETWORK_SLICE_NAME,
} from "@/config/sdcoreConfig";

export type NetworkSliceData = {
  "slice-id": {
    sst: number;
    sd: string;
  };
  "site-device-group": string[];
  "site-info": {
    "site-name": string;
    plmn: {
      mcc: string;
      mnc: string;
    };
    gNodeBs: {
      name: string;
      tac: string;
    }[];
    upf: {
      "upf-name": string;
      "upf-port": string;
    };
  };
};

export default function NetworkConfiguration() {
  const [mcc, setMcc] = useState<string>("");
  const [mnc, setMnc] = useState<string>("");

  const handleMccChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMcc(value);
  };

  const handleMncChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMnc(value);
  };

  const createNetworkSliceWithDeviceGroup = async () => {
    const url = `${WEBUI_ENDPOINT}/config/v1/network-slice/${NETWORK_SLICE_NAME}`;
    const headers = {
      "Content-Type": "application/json",
    };

    const networkSliceData: NetworkSliceData = {
      ...STATIC_NETWORK_SLICE_DATA,
      "site-info": {
        ...STATIC_NETWORK_SLICE_DATA["site-info"],
        plmn: { mcc: mcc, mnc: mnc },
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(networkSliceData),
      });

      if (!response.ok) {
        throw new Error(
          `Error creating network. Error code: ${response.status}`
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    await createNetworkSliceWithDeviceGroup();
  };

  return (
    <div className="ml-8">
      <h1 className="h1-heading--1 font-regular mb-8">Network Configuration</h1>
      <div className="mt-8">
        <Input
          type="number"
          id="mcc"
          label="MCC"
          placeholder="001"
          onChange={handleMccChange}
          stacked
        />
        <Input
          type="number"
          id="mnc"
          label="MNC"
          placeholder="01"
          onChange={handleMncChange}
          stacked
        />
        <Button appearance="positive" className="mt-8" onClick={handleSave}>
          Create Network
        </Button>
      </div>
    </div>
  );
}
