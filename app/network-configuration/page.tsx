"use client";
import React, { useState, useEffect } from "react";
import NetworkConfigurationEmptyState from "@/components/NetworkConfigurationEmptyState";
import { checkNetworkConfigured } from "@/utils/checkNetworkConfigured";
import { Row, Col, Button, MainTable } from "@canonical/react-components";
import NetworkConfigurationModal from "@/components/NetworkConfigurationModal";

export type NetworkSlice = {
  mcc: string;
  mnc: string;
};

export default function NetworkConfiguration() {
  const [loading, setLoading] = useState(true);
  const [isNetworkConfigured, setIsNetworkConfigured] = useState(false);
  const [networkSlice, setNetworkSlice] = useState<NetworkSlice | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  useEffect(() => {
    const init = async () => {
      const configured = await checkNetworkConfigured();
      setIsNetworkConfigured(configured);
      setLoading(false);

      if (configured) {
        await fetchNetworkSlice();
      }
    };

    init();
  }, []);

  const fetchNetworkSlice = async () => {
    try {
      const response = await fetch(`/api/getNetworkSlice`);
      if (!response.ok) {
        throw new Error("Failed to fetch network slice");
      }
      const data = await response.json();

      const mcc = data["site-info"]["plmn"]["mcc"];
      const mnc = data["site-info"]["plmn"]["mnc"];

      setNetworkSlice({ mcc, mnc });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isNetworkConfigured) {
    return <NetworkConfigurationEmptyState />;
  }

  return (
    <div>
      <Row>
        <Col size={8}>
          <h2 className="h2-heading--1 font-regular">Network Configuration</h2>
          <div className="u-align--right">
            <Button onClick={toggleModal}> Edit </Button>
          </div>

          {networkSlice && (
            <MainTable
              rows={[
                {
                  columns: [
                    {
                      content: "MCC",
                      role: "rowheader",
                    },
                    {
                      content: networkSlice.mcc || "N/A",
                      className: "u-align--right",
                    },
                  ],
                },
                {
                  columns: [
                    {
                      content: "MNC",
                      role: "rowheader",
                    },
                    {
                      content: networkSlice.mnc || "N/A",
                      className: "u-align--right",
                    },
                  ],
                },
              ]}
              sortable
            />
          )}
        </Col>
      </Row>

      {isModalVisible && (
        <NetworkConfigurationModal toggleModal={toggleModal} />
      )}
    </div>
  );
}
