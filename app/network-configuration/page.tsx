"use client";
import React, { useState, useEffect } from "react";
import NetworkSliceEmptyState from "@/components/NetworkSliceEmptyState";
import { checkNetworkSliceExists } from "@/utils/checkNetworkSliceExists";
import { Row, Col, Button, MainTable } from "@canonical/react-components";
import NetworkSliceModal from "@/components/NetworkSliceModal";

export type NetworkSlice = {
  mcc: string;
  mnc: string;
  name: string;
  upf: {
    hostname: string;
    port: string;
  };
  gNodeBs: GnbItem[];
};

interface GnbItem {
  name: string;
  tac: string;
}

export default function NetworkConfiguration() {
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [networkSlices, setNetworkSlices] = useState<NetworkSlice[]>([]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  useEffect(() => {
    fetchNetworkSlices();
  }, []);

  const fetchNetworkSlices = async () => {
    try {
      const response = await fetch(`/api/network-slice`);
      if (!response.ok) {
        throw new Error("Failed to fetch network slices");
      }
      const data = await response.json();

      const slices: NetworkSlice[] = data.map((slice: any) => ({
        mcc: slice["site-info"]["plmn"]["mcc"],
        mnc: slice["site-info"]["plmn"]["mnc"],
        name: slice.name,
        upf: {
          hostname: slice.upf.hostname,
          port: slice.upf.port,
        },
        gNodeBs: slice.gNodeBs || [],
      }));

      setNetworkSlices(slices);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleView = (slice: NetworkSlice) => {};

  const handleEdit = (slice: NetworkSlice) => {};

  const handleDelete = (slice: NetworkSlice) => {};

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!networkSlices.length) {
    return <NetworkSliceEmptyState />;
  }

  return (
    <div>
      <Row>
        <Col size={8}>
          <h2 className="h2-heading--1 font-regular">Network Slices</h2>
          <div className="u-align--right">
            <Button onClick={toggleModal} appearance="positive">
              Create
            </Button>
          </div>
          <MainTable
            rows={networkSlices.map((slice) => ({
              columns: [
                { content: "Name", role: "rowheader" },
                { content: slice.name || "N/A", className: "u-align--right" },
                { content: "MCC", role: "rowheader" },
                { content: slice.mcc || "N/A", className: "u-align--right" },
                { content: "MNC", role: "rowheader" },
                { content: slice.mnc || "N/A", className: "u-align--right" },
                { content: "UPF", role: "rowheader" },
                {
                  content: `${slice.upf.hostname}:${slice.upf.port}` || "N/A",
                  className: "u-align--right",
                },
                { content: "gNodeB's", role: "rowheader" },
                {
                  content:
                    slice.gNodeBs.map((gnb) => gnb.name).join(", ") || "N/A",
                  className: "u-align--right",
                },
                {
                  content: (
                    <div className="u-flex u-justify-between">
                      <Button small onClick={() => handleView(slice)}>
                        View
                      </Button>
                      <Button small onClick={() => handleEdit(slice)}>
                        Edit
                      </Button>
                      <Button
                        small
                        negative
                        onClick={() => handleDelete(slice)}
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ],
            }))}
            sortable
          />
        </Col>
      </Row>
      {isModalVisible && <NetworkSliceModal toggleModal={toggleModal} />}
    </div>
  );
}
