"use client";
import React, { useState } from "react";
import NetworkSliceModal from "@/components/NetworkSliceModal";
import { Button, Row, Col, Strip } from "@canonical/react-components";

export default function NetworkSliceEmptyState() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <div>
      <table aria-label="Vanilla framework no content empty state">
        <caption>
          <Strip>
            <Row>
              <Col size={8} medium={4} small={3} className="u-align--left">
                <p className="p-heading--4">No network slice available</p>
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

      {isModalVisible && <NetworkSliceModal toggleModal={toggleModal} />}
    </div>
  );
}
