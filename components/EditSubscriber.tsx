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
            <Input type="text" id="imsi" label="IMSI" stacked />
            <Input type="text" id="plmn-id" label="PLMN ID" stacked />
            <Input
              type="text"
              id="network-slice"
              label="Network Slice"
              stacked
            />
            <Input type="number" id="slice-id" label="Slice ID" stacked />
            <Input type="text" id="standard" label="Standard" stacked />
            <Input type="text" id="dnn" label="DNN" stacked />
            <Input type="text" id="mbr" label="MBR" stacked />
            <Input type="text" id="uplink" label="Uplink" stacked />
            <Input type="text" id="downlink" label="Downlink" stacked />
            <Input type="text" id="qos" label="QOS" stacked />
            <Input type="number" id="qci" label="QCI" stacked />
            <Input type="number" id="arp" label="ARP" stacked />
          </Form>
        </Modal>
      )}
    </>
  );
}
