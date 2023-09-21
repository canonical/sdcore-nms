"use client";
import React, { useState, useEffect } from "react";
import { Row, Col, Button, Card } from "@canonical/react-components";
import { deleteNetworkSlice } from "@/utils/deleteNetworkSlice";
import { getNetworkSlices } from "@/utils/getNetworkSlices";
import NetworkSliceModal from "@/components/NetworkSliceModal";
import NetworkSliceEmptyState from "@/components/NetworkSliceEmptyState";
import { NetworkSlice } from "@/components/types";
import { NetworkSliceTable } from "@/components/NetworkSliceTable";

export default function NetworkConfiguration() {
  const [loading, setLoading] = useState(true);
  const [isNetworkSliceModalVisible, setisNetworkSliceModalVisible] =
    useState(false);
  const [networkSlices, setNetworkSlices] = useState<NetworkSlice[]>([]);

  const toggleNetworkSliceModal = () => {
    setisNetworkSliceModalVisible(!isNetworkSliceModalVisible);
  };

  const fetchDataAndUpdateState = async () => {
    const slices: NetworkSlice[] = await getNetworkSlices();
    setNetworkSlices(slices);
    setLoading(false);
  };

  useEffect(() => {
    fetchDataAndUpdateState();
  }, []);

  const handleDeleteNetworkSlice = async (sliceName: string) => {
    await deleteNetworkSlice(sliceName);
    fetchDataAndUpdateState();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!networkSlices.length) {
    return (
      <NetworkSliceEmptyState
        onSliceCreatedInEmptyState={fetchDataAndUpdateState}
      />
    );
  }

  return (
    <div>
      <Row>
        <Col size={6}>
          <h2>Network Slices</h2>
          <div className="u-align--right">
            <Button appearance={"positive"} onClick={toggleNetworkSliceModal}>
              Create
            </Button>
          </div>
          {networkSlices.map((slice) => (
            <Card key={slice.SliceName} title={slice.SliceName}>
              {<NetworkSliceTable sliceName={slice.SliceName} />}
              <hr />
              <div className="u-align--right">
                <Button
                  appearance={"negative"}
                  onClick={() => handleDeleteNetworkSlice(slice.SliceName)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </Col>
      </Row>
      {isNetworkSliceModalVisible && (
        <NetworkSliceModal
          toggleModal={toggleNetworkSliceModal}
          onSliceCreated={fetchDataAndUpdateState}
        />
      )}
    </div>
  );
}
