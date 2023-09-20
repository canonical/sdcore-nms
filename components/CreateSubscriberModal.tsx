"use client";
import { ChangeEvent, useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
} from "@canonical/react-components";
import { createSubscriber } from "@/utils/createSubscriber";
import { getNetworkSlices } from "@/utils/getNetworkSlices";

type Props = {
  toggleModal: () => void;
};

export default function CreateSubscriberModal({ toggleModal }: Props) {
  const [imsi, setImsi] = useState<string>("");
  const [opc, setOpc] = useState<string>("");
  const [key, setKey] = useState<string>("");
  const [sequenceNumber, setSequenceNumber] = useState<string>("");
  const [slices, setSlices] = useState<any[]>([]);
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);

  const [deviceGroup, setDeviceGroup] = useState<string[]>([]);

  const [IMSIValidationError, setIMSIValidationError] = useState<string | null>(
    null,
  );
  const [OPCValidationError, setOPCValidationError] = useState<string | null>(
    null,
  );
  const [KeyValidationError, setKeyValidationError] = useState<string | null>(
    null,
  );

  const isCreateDisabled =
    !imsi ||
    !opc ||
    !key ||
    !sequenceNumber ||
    !selectedSlice ||
    deviceGroup.length === 0 ||
    IMSIValidationError !== null ||
    OPCValidationError !== null ||
    KeyValidationError !== null;

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

  const handleNetworkSliceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedSlice(selected);

    const matchedSlice = slices.find((slice) => slice.SliceName === selected);
    if (matchedSlice) {
      setDeviceGroup(matchedSlice["site-device-group"]);
    } else {
      setDeviceGroup([]);
    }
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

    await createSubscriber({
      imsi: imsi,
      plmnId: "20893",
      opc: opc,
      key: key,
      sequenceNumber: sequenceNumber,
    });
    toggleModal();
  };

  useEffect(() => {
    const fetchSlices = async () => {
      try {
        const slices = await getNetworkSlices();
        setSlices(slices);
      } catch (error) {
        console.error("Failed to fetch network slices:", error);
      }
    };

    fetchSlices();
  }, []);

  return (
    <Modal
      close={toggleModal}
      title="Add New Subscriber"
      buttonRow={
        <>
          <Button
            onClick={handleSave}
            appearance="positive"
            disabled={isCreateDisabled}
            className="u-no-margin--bottom"
          >
            Create
          </Button>
        </>
      }
    >
      <Form stacked>
        <Input
          type="text"
          placeholder="208930100007487"
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
          placeholder="981d464c7c52eb6e5036234984ad0bcf"
          label="OPC"
          onChange={handleOpcChange}
          stacked
          error={OPCValidationError}
          required={true}
        />
        <Input
          type="text"
          id="key"
          placeholder="5122250214c33e723a5dd523fc145fc0"
          label="Key"
          onChange={handleKeyChange}
          stacked
          error={KeyValidationError}
          required={true}
        />
        <Input
          type="text"
          id="sequence-number"
          placeholder="16f3b3f70fc2"
          label="Sequence Number"
          onChange={handleSequenceNumberChange}
          stacked
          required={true}
        />
        <Select
          id="network-slice"
          defaultValue=""
          label="Network Slice"
          stacked
          required={true}
          onChange={handleNetworkSliceChange}
          options={slices.map((slice) => ({
            label: slice.SliceName,
            value: slice.SliceName,
          }))}
        />
        <Select
          id="device-group"
          defaultValue=""
          label="Device Group"
          stacked
          required={true}
          options={deviceGroup.map((group) => ({
            label: group,
            value: group,
          }))}
        />
      </Form>
    </Modal>
  );
}
