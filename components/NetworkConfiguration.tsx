import { useState } from "react";

import { Form, Input, Button } from "@canonical/react-components";

export default function NetworkConfiguration() {
  const [mcc, setMcc] = useState("");
  const [mnc, setMnc] = useState("");

  const handleMccChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMcc(value);
  };

  const handleMncChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMnc(value);
  };

  async function handleSave() {
    await crateEmptyDeviceGroup();
    await createNetworkSliceWithDeviceGroup();
  }

  async function crateEmptyDeviceGroup() {
    const url = "http://10.152.183.20:5000/config/v1/device-group/cows";
    const headers = {
      "Content-Type": "application/json",
    };
    const data = {
      imsis: [],
      "site-info": "demo",
      "ip-domain-name": "pool1",
      "ip-domain-expanded": {
        dnn: "internet",
        "ue-ip-pool": "172.250.1.0/16",
        "dns-primary": "8.8.8.8",
        mtu: 1460,
        "ue-dnn-qos": {
          "dnn-mbr-uplink": 200000000,
          "dnn-mbr-downlink": 200000000,
          "traffic-class": {
            name: "platinum",
            arp: 6,
            pdb: 300,
            pelr: 6,
            qci: 8,
          },
        },
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error(error);
    }
  }

  async function createNetworkSliceWithDeviceGroup() {
    const url = "http://10.152.183.20:5000/config/v1/network-slice/default";
    const headers = {
      "Content-Type": "application/json",
    };
    const data = {
      "slice-id": {
        sst: "1",
        sd: "010203",
      },
      "site-device-group": ["cows"],
      "site-info": {
        "site-name": "demo",
        plmn: {
          mcc: "208",
          mnc: "93",
        },
        gNodeBs: [
          {
            name: "demo-gnb1",
            tac: 1,
          },
        ],
        upf: {
          "upf-name": "upf",
          "upf-port": "8805",
        },
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="ml-8">
      <h1 className="h1-heading--1 font-regular mb-8">Network Configuration</h1>
      <Form stacked>
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
      </Form>
    </div>
  );
}
