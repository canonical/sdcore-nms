"use client";
import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Button,
  Card,
  ConfirmationModal,
} from "@canonical/react-components";
import { deleteNetworkSlice } from "@/utils/deleteNetworkSlice";
import { getNetworkSlices } from "@/utils/getNetworkSlices";
import NetworkSliceModal from "@/components/NetworkSliceModal";
import NetworkSliceEmptyState from "@/components/NetworkSliceEmptyState";
import { NetworkSlice } from "@/components/types";
import { NetworkSliceTable } from "@/components/NetworkSliceTable";

export default function NetworkConfiguration() {
  const [loading, setLoading] = useState(true);
  const [networkSlices, setNetworkSlices] = useState<NetworkSlice[]>([]);
  const [isNetworkSliceModalVisible, setIsNetworkSliceModalVisible] =
    useState(false);
  const [isDeleteNetworkSliceModalOpen, setIsDeleteNetworkSliceModalOpen] =
    useState(false);
  const [selectedSliceName, setSelectedSliceName] = useState<string | null>(
    null,
  );

  const fetchDataAndUpdateState = async () => {
    const slices = await getNetworkSlices();
    setNetworkSlices(slices);
    setLoading(false);
  };

  useEffect(() => {
    fetchDataAndUpdateState();
  }, []);

  const toggleNetworkSliceModal = () =>
    setIsNetworkSliceModalVisible((prev) => !prev);

  const openDeleteConfirmationModal = (sliceName: string) => {
    setSelectedSliceName(sliceName);
    setIsDeleteNetworkSliceModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedSliceName) {
      await deleteNetworkSlice(selectedSliceName);
      setSelectedSliceName(null);
      setIsDeleteNetworkSliceModalOpen(false);
      fetchDataAndUpdateState();
    }
  };

  const closeDeleteModal = () => setIsDeleteNetworkSliceModalOpen(false);

  if (loading) return <div>Loading...</div>;

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
          {isDeleteNetworkSliceModalOpen && (
            <ConfirmationModal
              title="Confirm delete"
              confirmButtonLabel="Delete"
              onConfirm={handleConfirmDelete}
              close={closeDeleteModal}
            >
              <p>
                {`This will permanently delete the network slice "${selectedSliceName}".`}
                <br />
                You cannot undo this action.
              </p>
            </ConfirmationModal>
          )}
          <h2>Network Slices</h2>
          <div className="u-align--right">
            <Button appearance="positive" onClick={toggleNetworkSliceModal}>
              Create
            </Button>
          </div>
          {networkSlices.map((slice) => (
            <Card key={slice.SliceName} title={slice.SliceName}>
              <NetworkSliceTable sliceName={slice.SliceName} />
              <hr />
              <div className="u-align--right">
                <Button
                  appearance="negative"
                  onClick={() => openDeleteConfirmationModal(slice.SliceName)}
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
