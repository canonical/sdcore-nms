"use client";
import React, { useState, useEffect } from "react";

import {
  Row,
  Col,
  Button,
  MainTable,
  List,
  Strip,
  Chip,
  Icon,
} from "@canonical/react-components";

import DeviceGroupEmptyState from "@/components/DeviceGroupEmptyState";

type NetworkSlice = {
  SliceName: string;
  "slice-id": {
    sst: string;
    sd: string;
  };
  "site-device-group": any;
  "site-info": {
    "site-name": string;
    plmn: {
      mcc: string;
      mnc: string;
    };
    gNodeBs: any;
  };
};

export default function NetworkSlice({ params }: { params: { name: string } }) {
  const [data, setData] = useState<NetworkSlice | null>(null);
  const [hasError, setHasError] = useState(false);

  const fetchNetworkSlice = async () => {
    try {
      const response = await fetch(`/api/network-slice/${params.name}`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch network slice");
      }
      const fetchedData: NetworkSlice = await response.json();
      console.log(fetchedData);
      setData(fetchedData);
    } catch (error) {
      console.error(error);
      setHasError(true);
    }
  };

  useEffect(() => {
    fetchNetworkSlice();
  }, [params.name]);

  if (hasError) {
    return <div>404: Network Slice Not Found</div>;
  }

  const mcc = data?.["site-info"]?.plmn.mcc || "N/A";
  const mnc = data?.["site-info"]?.plmn.mnc || "N/A";

  return (
    <div>
      <Row>
        <Col size={8}>
          <Row>
            <h2 className="h2-heading--1 font-regular">
              <span style={{ color: "grey" }}>Network Slice:</span>
              <span style={{ fontWeight: "bold", marginLeft: "5px" }}>
                {params.name}
              </span>
            </h2>
          </Row>
          <Chip lead="MCC" value={mcc} />
          <Chip lead="MNC" value={mnc} />
          {!data?.["site-device-group"] && (
            <DeviceGroupEmptyState
              onDeviceGroupCreatedInEmptyState={fetchNetworkSlice}
            />
          )}
          <MainTable sortable />
        </Col>
      </Row>
    </div>
  );
}
