import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Notification,
  Modal,
  Form,
  Select,
} from "@canonical/react-components";

interface NetworkSliceModalProps {
  toggleModal: () => void;
  onSliceCreated: () => void;
}

interface UpfItem {
  hostname: string;
  port: string;
}

interface GnbItem {
  name: string;
  tac: string;
}

export default function NetworkSliceModal({
  toggleModal,
  onSliceCreated,
}: NetworkSliceModalProps) {
  const [mcc, setMcc] = useState<string>("");
  const [mnc, setMnc] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [upfList, setUpfList] = useState<UpfItem[]>([]);
  const [gnbList, setGnbList] = useState<GnbItem[]>([]);

  const [MCCValidationError, setMCCValidationError] = useState<string | null>(
    null,
  );
  const [MNCValidationError, setMNCValidationError] = useState<string | null>(
    null,
  );
  const [NameValidationError, setNameValidationError] = useState<string | null>(
    null,
  );
  const [selectedUpf, setSelectedUpf] = useState<{
    hostname: string;
    port: string;
  } | null>(null);
  const [selectedGnbs, setSelectedGnbs] = useState<number[]>([]);

  const isCreateDisabled =
    !mcc ||
    !mnc ||
    !name ||
    !selectedUpf ||
    selectedGnbs.length === 0 ||
    MCCValidationError !== null ||
    MNCValidationError !== null ||
    NameValidationError !== null;

  useEffect(() => {
    const fetchUpfList = async () => {
      try {
        const response = await fetch("/api/upf", {
          method: "GET",
        });
        const data = await response.json();
        setUpfList(data);
      } catch (error) {
        console.error("Error fetching UPF list:", error);
      }
    };

    fetchUpfList();
  }, []);

  useEffect(() => {
    const fetchGnbList = async () => {
      try {
        const response = await fetch("/api/gnb", {
          method: "GET",
        });
        const data = await response.json();
        setGnbList(data);
      } catch (error) {
        console.error("Error fetching GNB list:", error);
      }
    };

    fetchGnbList();
  }, []);

  const handleCreate = async () => {
    const sliceData = {
      mcc,
      mnc,
      upfHostname: selectedUpf?.hostname,
      upfPort: selectedUpf?.port,
    };

    try {
      const response = await fetch(`/api/network-slice/${name}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sliceData),
      });

      if (!response.ok) {
        throw new Error(
          `Error creating network. Error code: ${response.status}`,
        );
      }
      onSliceCreated();
      toggleModal();
    } catch (error) {
      console.error(error);
      setApiError("Failed to configure the network.");
    }
  };

  const handleMccChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMcc(value);

    if (value.length !== 3) {
      setMCCValidationError("MCC must be exactly 3 digits.");
      return;
    }

    setMCCValidationError(null);
  };

  const handleMncChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMnc(value);

    if (value.length < 2 || value.length > 3) {
      setMNCValidationError("MNC must be 2 or 3 digits.");
      return;
    }

    setMNCValidationError(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setName(value);

    if (value.length > 20) {
      setNameValidationError("Name should not exceed 20 characters.");
    } else {
      setNameValidationError(null);
    }
  };

  const handleUpfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = e.target.selectedIndex - 1;

    if (selectedIndex < 0 || selectedIndex >= upfList.length) {
      setSelectedUpf(null);
      return;
    }

    setSelectedUpf(upfList[selectedIndex]);
  };

  const handleGnbChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((option) =>
      parseInt(option.value),
    );
    setSelectedGnbs(selectedOptions);
  };

  return (
    <Modal
      title="Create Network Slice"
      close={toggleModal}
      buttonRow={
        <Button
          appearance="positive"
          className="mt-8"
          onClick={handleCreate}
          disabled={isCreateDisabled}
        >
          Create
        </Button>
      }
    >
      {apiError && (
        <Notification severity="negative" title="Error">
          {apiError}
        </Notification>
      )}
      <Form>
        <Input
          type="text"
          id="name"
          label="Name"
          placeholder="default"
          onChange={handleNameChange}
          stacked
          error={NameValidationError}
        />
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
        <Select
          defaultValue=""
          id="upf"
          label="UPF"
          stacked
          onChange={handleUpfChange}
          options={[
            {
              disabled: true,
              label: "Select an option",
              value: "",
            },
            ...upfList.map((upf, index) => ({
              label: `${upf.hostname}:${upf.port}`,
              value: index.toString(),
            })),
          ]}
        />
        <Select
          id="gnb"
          stacked
          options={[
            {
              value: "",
              disabled: true,
              label: "Select...",
            },
            ...gnbList.map((gnb, index) => ({
              label: `${gnb.name} (tac:${gnb.tac})`,
              value: index.toString(),
            })),
          ]}
          label="gNodeB's"
          onChange={handleGnbChange}
          multiple
        />
      </Form>
    </Modal>
  );
}
