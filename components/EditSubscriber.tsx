"use client";
import { Modal, Form, Input, Button } from "@canonical/react-components";
import React, { ReactNode, useState, ChangeEvent } from "react";
import { WEBUI_ENDPOINT } from "@/config/sdcoreConfig";
import { useSubscriber } from "@/hooks/useSubscriber";

type Props = {
  imsi: string;
  currentSubscribers: string[];
  refreshHandler: () => void;
};

export default function EditSubscriber(props: Props): ReactNode {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [imsi, setImsi] = useState<string>("");
  const [opc, setOpc] = useState<string>("");
  const [key, setKey] = useState<string>("");
  const [sequenceNumber, setSequenceNumber] = useState<string>("");
  const closeHandler = () => setModalOpen(false);
  const { handleSubscriber } = useSubscriber(
    WEBUI_ENDPOINT,
    props.imsi,
    opc,
    key,
    sequenceNumber,
    props.currentSubscribers
  );

  const handleOpcChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOpc(value);
  };

  const handleKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setKey(value);
  };

  const handleSequenceNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSequenceNumber(value);
  };

  const handleSave = async () => {
    closeHandler();
    await handleSubscriber();
    props.refreshHandler();
  };
  return (
    <>
      <Button
        className="u-no-margin--bottom"
        onClick={() => setModalOpen(true)}
        small={true}
      >
        Edit
      </Button>
      {modalOpen && (
        <Modal
          close={closeHandler}
          title="Edit Subscriber"
          buttonRow={
            <>
              <Button onClick={closeHandler} className="u-no-margin--bottom">
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
              value={props.imsi}
              stacked
              disabled
            />
            <Input
              type="text"
              id="opc"
              label="OPC"
              onChange={handleOpcChange}
              stacked
            />
            <Input
              type="text"
              id="key"
              label="Key"
              onChange={handleKeyChange}
              stacked
            />
            <Input
              type="text"
              id="sequence-number"
              label="Sequence Number"
              onChange={handleSequenceNumberChange}
              stacked
            />
          </Form>
        </Modal>
      )}
    </>
  );
}
