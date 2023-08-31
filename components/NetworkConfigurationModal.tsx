import React, { useState } from "react";
import { Input, Button, Notification, Modal } from "@canonical/react-components";

interface NetworkConfigurationModalProps {
  toggleModal: () => void;
}

export default function NetworkConfigurationModal({
  toggleModal,
}: NetworkConfigurationModalProps) {
  const [mcc, setMcc] = useState<string>("");
  const [mnc, setMnc] = useState<string>("");
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSave = async () => {
    const plmnData = { mcc, mnc };

    if (mcc.length !== 3) {
      setMCCValidationError("MCC must be exactly 3 digits.");
      return;
    }

    if (mnc.length < 2 || mnc.length > 3) {
      setMNCValidationError("MNC must be 2 or 3 digits.");
      return;
    }

    try {
      const response = await fetch("/api/createNetworkSlice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(plmnData),
      });

      if (!response.ok) {
        throw new Error(
          `Error creating network. Error code: ${response.status}`,
        );
      }

      toggleModal();
    } catch (error) {
      console.error(error);
      setApiError("Failed to configure the network.");
    }
  };


  const handleMccChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMcc(e.target.value);

    setMCCValidationError(null);
  };

  const handleMncChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMnc(e.target.value);

    setMNCValidationError(null);
  };

  const [MCCValidationError, setMCCValidationError] = useState<string | null>(
    null,
  );
  const [MNCValidationError, setMNCValidationError] = useState<string | null>(
    null,
  );

  return (
    <div className="p-modal" id="modal">
      <section
        className="p-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <header className="p-modal__header">
          <h2 className="p-modal__title" id="modal-title">
            Configure Network
          </h2>
          <button
            className="p-modal__close"
            aria-label="Close active modal"
            aria-controls="modal"
            onClick={toggleModal}
          >
            Close
          </button>
        </header>

        {apiError && (
          <Notification severity="negative" title="Error">
            {apiError}
          </Notification>
        )}

        <div>
          <Input
            type="number"
            id="mcc"
            label="MCC"
            placeholder="001"
            onChange={handleMccChange}
            stacked
            error={MCCValidationError}
          />
          <Input
            type="number"
            id="mnc"
            label="MNC"
            placeholder="01"
            onChange={handleMncChange}
            stacked
            error={MNCValidationError}
          />
        </div>

        <footer className="p-modal__footer">
          <button
            className="u-no-margin--bottom"
            aria-controls="modal"
            onClick={toggleModal}
          >
            Cancel
          </button>
          <Button appearance="positive" className="mt-8" onClick={handleSave}>
            Save
          </Button>
        </footer>
      </section>
    </div>
  );
}
