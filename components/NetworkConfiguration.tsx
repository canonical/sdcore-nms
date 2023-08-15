"use client";
import { useState } from "react";
import { Input, Button } from "@canonical/react-components";

export default function NetworkConfiguration() {
  const [mcc, setMcc] = useState<string>("");
  const [mnc, setMnc] = useState<string>("");

  const handleMccChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMcc(e.target.value);
  };

  const handleMncChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMnc(e.target.value);
  };

  const handleSave = async () => {
    const plmnData = { mcc, mnc };

    try {
      const response = await fetch('/api/createNetworkSlice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plmnData),
      });

      if (!response.ok) {
        throw new Error(`Error creating network. Error code: ${response.status}`);
      }

    } catch (error) {
      console.error(error);
    }
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
