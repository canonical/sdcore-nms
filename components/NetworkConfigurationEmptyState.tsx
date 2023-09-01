"use client";
import React, { useState } from "react";
import NetworkConfigurationModal from "@/components/NetworkConfigurationModal";
import { Button } from "@canonical/react-components";

export default function NetworkConfigurationEmptyState() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <div>
      <table aria-label="Vanilla framework no content empty state">
        <caption>
          <div className="p-strip">
            <div className="row">
              <div className="u-align--left col-8 col-medium-4 col-small-3">
                <p className="p-heading--4 u-no-margin--bottom">
                  Network configuration not available
                </p>
                <p>Configure the 5G network</p>
                <Button
                  appearance="positive"
                  className="mt-8"
                  onClick={toggleModal}
                >
                  Configure
                </Button>
              </div>
            </div>
          </div>
        </caption>
      </table>

      {isModalVisible && (
        <NetworkConfigurationModal toggleModal={toggleModal} />
      )}
    </div>
  );
}
