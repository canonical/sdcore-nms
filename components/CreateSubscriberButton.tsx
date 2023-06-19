"use client";
import { ChangeEvent, useState } from "react";
import { Button, Modal, Form, Input } from "@canonical/react-components";
import { WEBUI_ENDPOINT } from "@/sdcoreConfig";

import { useSubscriber } from "@/hooks/useSubscriber";

type Props = {
  text: string;
  currentSubscribers: string[];
  disabled: boolean;
  refreshHandler: () => void;
};

export default function CreateSubscriber(props: Props) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [imsi, setImsi] = useState<string>("");
  const [opc, setOpc] = useState<string>("");
  const [key, setKey] = useState<string>("");
  const [sequenceNumber, setSequenceNumber] = useState<string>("");
  const { handleSubscriber } = useSubscriber(
    WEBUI_ENDPOINT,
    imsi,
    opc,
    key,
    sequenceNumber,
    props.currentSubscribers
  );

  const closeHandler = () => setModalOpen(false);

  const handleImsiChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setImsi(value);
  };

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
    await handleSubscriber();
    closeHandler();
    props.refreshHandler();
  };

  return (
    <>
      <Button
        appearance="positive"
        className="u-no-margin--bottom"
        onClick={() => setModalOpen(true)}
        disabled={props.disabled}
      >
        {props.text}
      </Button>
      {modalOpen && (
        <Modal
          close={closeHandler}
          title="Add New Subscriber"
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
              onChange={handleImsiChange}
              stacked
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
