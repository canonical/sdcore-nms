"use client";
import React, { useState } from "react";
import DeviceGroupModal from "@/components/DeviceGroupModal";
import { Button, Row, Col, Strip } from "@canonical/react-components";

interface DeviceGroupEmptyStateProps {
  onDeviceGroupCreatedInEmptyState: () => void;
  networkSliceName: string;
}

export default function DeviceGroupEmptyState({
  onDeviceGroupCreatedInEmptyState,
  networkSliceName,
}: DeviceGroupEmptyStateProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleDeviceGroupCreated = () => {
    onDeviceGroupCreatedInEmptyState();
  };

  return (
    <div>
      <table>
        <caption>
          <Row>
            <Col size={8} className="u-align--left">
              <p className="p-heading--4">No device group available</p>
              <Button
                appearance="positive"
                className="mt-8"
                onClick={toggleModal}
              >
                Create Device Group
              </Button>
            </Col>
          </Row>
        </caption>
      </table>

      {isModalVisible && (
        <DeviceGroupModal
          toggleModal={toggleModal}
          onDeviceGroupCreated={handleDeviceGroupCreated}
          networkSliceName={networkSliceName}
        />
      )}
    </div>
  );
}
