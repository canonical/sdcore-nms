"use client";
import React, { useState } from "react";
import DeviceGroupModal from "@/components/DeviceGroupModal";
import { Button, Row, Col, Strip } from "@canonical/react-components";

interface DeviceGroupEmptyStateProps {
  onDeviceGroupCreatedInEmptyState: () => void;
}

export default function DeviceGroupEmptyState({
  onDeviceGroupCreatedInEmptyState,
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
      <table aria-label="Vanilla framework no content empty state">
        <caption>
          <Strip>
            <Row>
              <Col size={8} medium={4} small={3} className="u-align--left">
                <p className="p-heading--4">No device group available</p>
                <Button
                  appearance="positive"
                  className="mt-8"
                  onClick={toggleModal}
                >
                  Create
                </Button>
              </Col>
            </Row>
          </Strip>
        </caption>
      </table>

      {isModalVisible && (
        <DeviceGroupModal
          toggleModal={toggleModal}
          onDeviceGroupCreated={handleDeviceGroupCreated}
        />
      )}
    </div>
  );
}
