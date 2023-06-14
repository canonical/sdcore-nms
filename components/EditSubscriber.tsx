"use client";
import { Modal, Form, Input, Button } from "@canonical/react-components";
import React, { ReactNode, useState } from "react";

type Props = { imsi: string };

export default function EditSubscriber(props: Props): ReactNode {
  const [modalOpen, setModalOpen] = useState(false);
  const closeHandler = () => setModalOpen(false);
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
                onClick={closeHandler}
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
