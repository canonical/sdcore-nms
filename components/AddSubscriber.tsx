"use client";
import { ReactNode, useState } from "react";

import { Button, Modal, Form, Input } from "@canonical/react-components";

export default function AddSubscriber(): ReactNode {
  const [modalOpen, setModalOpen] = useState(false);
  const closeHandler = () => setModalOpen(false);
  const handleSave = () => {
    closeHandler();
  };
  return (
    <>
      <Button
        className="p-button--positive u-no-margin--bottom"
        onClick={() => setModalOpen(true)}
      >
        Add New Subscriber
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
            <Input type="number" id="plmn-id" label="PLMN ID" stacked />
            <Input type="text" id="opc" label="OPC" stacked />
            <Input type="text" id="key" label="Key" stacked />
            <Input
              type="number"
              id="sequence-number"
              label="Sequence Number"
              stacked
            />
          </Form>
        </Modal>
      )}
    </>
  );
}
