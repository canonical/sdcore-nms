"use client";
import { Modal } from "@canonical/react-components";
import React, { ReactNode, useState } from "react";

import { Form, Input, Select, Button } from "@canonical/react-components";

export default function CreateNSWizard(): ReactNode {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const wizardSteps = ["Slice information", "Device configuration", "Step3"];

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };
  const handleSave = () => {
    setCurrentStep(0);
    closeHandler();
  };

  const handleCancel = () => {
    setCurrentStep(0);
    closeHandler();
  };

  const closeHandler = () => setModalOpen(false);
  return (
    <>
      <Button appearance="positive" onClick={() => setModalOpen(true)}>
        Create Network Slice
      </Button>
      {modalOpen && (
        <Modal
          className={"modal--large"}
          close={closeHandler}
          title="New Network Slice"
          buttonRow={
            <>
              <Button
                className="u-no-margin--bottom"
                appearance="negative"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              {wizardSteps[currentStep] !== wizardSteps[2] && (
                <Button className="u-no-margin--bottom" onClick={handleNext}>
                  Next {">"}
                </Button>
              )}
              {wizardSteps[currentStep] == wizardSteps[2] && (
                <Button
                  className="u-no-margin--bottom"
                  appearance="positive"
                  onClick={handleSave}
                >
                  Save
                </Button>
              )}
            </>
          }
        >
          <div className="w-[50rem]">
            {wizardSteps[currentStep] == wizardSteps[0] && (
              <Form stacked>
                <h3 className="h3-heading--3">1. Slice information</h3>
                <Input type="text" id="imsi" label="IMSI" stacked />
                <Input type="text" id="plmn id" label="PLMN ID" stacked />
                <Input
                  type="text"
                  id="network-slice-stacked3"
                  label="Network Slice"
                  stacked
                />
                <Input type="number" id="slice-id" label="Slice ID" stacked />
                <Input type="text" id="sst" label="SST" stacked />
                <Input type="text" id="sd" label="SD" stacked />
                <Input type="text" id="site-info" label="Site Info" stacked />
                <Input type="text" id="site-name" label="Site name" stacked />
                <Input type="text" id="plmn" label="PLMN" stacked />
                <Input type="number" id="mcc" label="MCC" stacked />
                <Input type="number" id="mnc" label="MNC" stacked />
                <Input type="number" id="gnodebs" label="gNodeB(s)" stacked />
                <Input type="text" id="gnb-name" label="gnodeB Name" stacked />
                <Input type="number" id="tac" label="TAC" stacked />
                <Input type="text" id="upf" label="UPF" stacked />
                <Input type="text" id="upf-name" label="UPF Name" stacked />
                <Input type="number" id="upf-port" label="UPF Port" stacked />
              </Form>
            )}
            {wizardSteps[currentStep] == wizardSteps[1] && (
              <Form stacked>
                <h3 className="h2-heading--2">2. Device configuration</h3>
                <Input type="text" id="imsi" label="IMSI" stacked />
                <Input type="text" id="plmn id" label="PLMN ID" stacked />
                <Input
                  type="text"
                  id="network-slice-stacked3"
                  label="Network Slice"
                  stacked
                />
                <Input
                  type="text"
                  id="ip-domain-name"
                  label="IP Domain Name"
                  stacked
                />
                <Input type="number" id="dnn" label="DNN" stacked />
                <Input type="text" id="ue-up-pool" label="UE IP Pool" stacked />
                <Input
                  type="text"
                  id="dns-server"
                  label="DNS Server"
                  placeholder="8.8.8.8"
                  stacked
                />
                <Input
                  type="number"
                  id="mtu"
                  label="MTU"
                  placeholder="1460"
                  stacked
                />
                <Input type="text" id="ue-dnn-qos" label="UE DNN QOS" stacked />
                <Input type="number" id="mbr" label="MBR" stacked />
                <Input type="text" id="uplink" label="Uplink" stacked />
                <Input type="text" id="downlink" label="Downlink" stacked />
                <h3 className="p-heading--3 py-4">Traffic Class</h3>
                <Input type="text" id="name" label="Name" stacked />
                <Input
                  type="number"
                  id="arp"
                  label="ARP"
                  placeholder="6"
                  stacked
                />
                <Input
                  type="number"
                  id="pdb"
                  label="PDB"
                  placeholder="300"
                  stacked
                />
                <Input
                  type="number"
                  id="pelr"
                  label="PELR"
                  placeholder="6"
                  stacked
                />
                <Input
                  type="number"
                  id="qci"
                  label="QCI"
                  placeholder="8"
                  stacked
                />
              </Form>
            )}
            {wizardSteps[currentStep] == wizardSteps[2] && (
              <Form stacked>
                <h3 className="h3-heading--3">3. Subscribers</h3>
                <Select
                  name="exampleSelectMulti"
                  id="exampleSelectMulti2"
                  options={[
                    {
                      value: "Select",
                      label: "Select...",
                    },
                    {
                      value: "1",
                      label: "123456789",
                    },
                    {
                      value: "2",
                      label: "453453989",
                    },
                    {
                      value: "3",
                      label: "739853989",
                    },
                    {
                      value: "4",
                      label: "124566789",
                    },
                  ]}
                  label="Selected subscribers"
                  multiple
                />
              </Form>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
