"use client";
import { ChangeEvent, useState } from "react";
import { Button, Modal, Form, Input } from "@canonical/react-components";

import { useSubscriber } from "@/hooks/useSubscriber";

type Props = {
  currentSubscribers: string[];
  toggleModal: () => void;
};

export default function CreateSubscriberModal({ toggleModal, currentSubscribers }: Props) {
  const [imsi, setImsi] = useState<string>("");
  const [opc, setOpc] = useState<string>("");
  const [key, setKey] = useState<string>("");
  const [sequenceNumber, setSequenceNumber] = useState<string>("");

  const { handleSubscriber } = useSubscriber(
    imsi,
    opc,
    key,
    sequenceNumber,
    currentSubscribers
  );

  const [IMSIValidationError, setIMSIValidationError] = useState<string | null>(null);
  const [OPCValidationError, setOPCValidationError] = useState<string | null>(null);
  const [KeyValidationError, setKeyValidationError] = useState<string | null>(null);

  const handleImsiChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setImsi(value);
    setIMSIValidationError(null);
  };

  const handleOpcChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOpc(value);
    setOPCValidationError(null);
  };

  const handleKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setKey(value);
    setKeyValidationError(null);
  };

  const handleSequenceNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSequenceNumber(value);
  };

  const handleSave = async () => {
    if (imsi.length < 14 || imsi.length > 15) {
      setIMSIValidationError("IMSI must be 14 or 15 digits.");
      return;
    }

    if (opc.length !== 32) {
      setOPCValidationError("OPC must be a 32 character hexadecimal.");
      return;
    }

    if (key.length !== 32) {
      setKeyValidationError("Key must be a 32 character hexadecimal.");
      return;
    }

    await handleSubscriber();
    toggleModal();
  };

  return (
    <Modal
      close={toggleModal}
      title="Add New Subscriber"
      buttonRow={
        <>
          <Button onClick={toggleModal} className="u-no-margin--bottom">
            Close
          </Button>
          <Button
            onClick={handleSave}
            appearance="positive"
            className="u-no-margin--bottom"
          >
            Save
          </Button>
        </>
      }
    >
      <Form stacked>
        <Input
          type="text"
          id="imsi"
          label="IMSI"
          onChange={handleImsiChange}
          stacked
          error={IMSIValidationError}
          required={true}
        />
        <Input
          type="text"
          id="opc"
          label="OPC"
          onChange={handleOpcChange}
          stacked
          error={OPCValidationError}
          required={true}
        />
        <Input
          type="text"
          id="key"
          label="Key"
          onChange={handleKeyChange}
          stacked
          error={KeyValidationError}
          required={true}
        />
        <Input
          type="text"
          id="sequence-number"
          label="Sequence Number"
          onChange={handleSequenceNumberChange}
          stacked
          required={true}
        />
      </Form>
    </Modal>
  );
}
