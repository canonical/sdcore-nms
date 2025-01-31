"use client";
import React, { useMemo, useState} from "react";
import {
  ActionButton,
  Form,
  Input,
  Modal,
  Notification,
  Select,
} from "@canonical/react-components";
import { NetworkSlice } from "@/components/types";
import { createSubscriber } from "@/utils/createSubscriber";
import { editSubscriber } from "@/utils/editSubscriber";
import { useQueryClient } from "@tanstack/react-query";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useAuth } from "@/utils/auth";
import {handleRefresh} from "@/utils/refreshQueries";

interface SubscriberValues {
  imsi: string;
  opc: string;
  key: string;
  sequenceNumber: string;
  selectedSlice: string;
  deviceGroup: string;
}

type Props = {
  toggleModal: () => void,
  subscriber?: any,
  slices: NetworkSlice[],
  deviceGroups: any[],
  onSubmit?: (newSubscriber: any) => Promise<void>
};

const SubscriberModal = ({ toggleModal, subscriber, slices, deviceGroups, onSubmit }: Props) => {
  const queryClient = useQueryClient();
  const auth = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const rawIMSI = subscriber?.ueId?.split("-")[1] || "";
  const token = auth.user?.authToken || "";

  const oldDeviceGroup = deviceGroups.find(
    (deviceGroup) => deviceGroup["imsis"]?.includes(rawIMSI)
  );
  const oldDeviceGroupName: string = oldDeviceGroup ? oldDeviceGroup["group-name"] : "";

  const oldNetworkSlice = slices.find(
    (slice) => slice["site-device-group"]?.includes(oldDeviceGroupName)
  );
  const oldNetworkSliceName: string = oldNetworkSlice ? oldNetworkSlice["slice-name"] : "";

  const SubscriberSchema = Yup.object().shape({
    imsi: Yup.string()
      .min(14, "IMSI must be at least 14 digits")
      .max(15, "IMSI must be at most 15 digits")
      .matches(/^[0-9]+$/, "Only numbers are allowed.")
      .required("IMSI is required"),
    opc: Yup.string()
      .length(32, "OPC must be 32 hexadecimal characters")
      .matches(/^[A-Fa-f0-9]+$/, "Use valid hexadecimal characters.")
      .required("OPC is required"),
    key: Yup.string()
      .length(32, "Key must be 32 hexadecimal characters" )
      .matches(/^[A-Fa-f0-9]+$/, "Use valid hexadecimal characters.")
      .required("Key is required"),
    sequenceNumber: Yup.string().required("Sequence number is required"),
    deviceGroup: Yup.string().required("Device Group selection is required"),
  });

  const modalTitle = subscriber && rawIMSI ? `Edit Subscriber: ${rawIMSI}` : "Create Subscriber";
  const buttonText = subscriber ? "Save Changes" : "Create";

  const formik = useFormik<SubscriberValues>({
    initialValues: {
      imsi: rawIMSI || "",
      opc: subscriber?.["AuthenticationSubscription"]?.["opc"]?.["opcValue"] ?? "",
      key: subscriber?.["AuthenticationSubscription"]?.["permanentKey"]?.["permanentKeyValue"] ?? "",
      sequenceNumber: subscriber?.["AuthenticationSubscription"]?.["sequenceNumber"] ?? "",
      selectedSlice: oldNetworkSliceName,
      deviceGroup: oldDeviceGroupName,
    },
    validationSchema: SubscriberSchema,
    onSubmit: async (values) => {
      try {
        if (subscriber) {
          await editSubscriber({
            imsi: values.imsi,
            opc: values.opc,
            key: values.key,
            sequenceNumber: values.sequenceNumber,
            oldDeviceGroupName: oldDeviceGroupName,
            newDeviceGroupName: values.deviceGroup,
            token: token,
          });
        } else {
          await createSubscriber({
            imsi: values.imsi,
            opc: values.opc,
            key: values.key,
            sequenceNumber: values.sequenceNumber,
            deviceGroupName: values.deviceGroup,
            token: token,
          });
        }
        await handleRefresh(queryClient, auth.user?.authToken ?? "");
        toggleModal();
        // InvalidateQueries does not work for the first subscriber creation.
        // Hence, window is reloaded.
        window.location.reload();
      } catch (error) {
        console.error(error);
        setApiError(
          (error as Error).message || "An unexpected error occurred.",
        );
      }
    },
  });

  const handleSliceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSliceName = e.target.value;
    const selectedSlice = slices.find((slice) => slice["slice-name"] === selectedSliceName);
    const deviceGroupOptions = selectedSlice?.["site-device-group"] || [];

    formik.setValues({
      ...formik.values,
      selectedSlice: selectedSliceName,
      deviceGroup: deviceGroupOptions.length > 1 ? "" : deviceGroupOptions[0] || "",
    });
  };

  const handleDeviceGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formik.setFieldValue("deviceGroup", e.target.value);
  };

  const deviceGroupOptions = useMemo(() => {
    const selectedSlice = slices.find((slice) => slice["slice-name"] === formik.values.selectedSlice);
    return selectedSlice?.["site-device-group"] || [];
  }, [formik.values.selectedSlice, slices]);

  return (
    <Modal
      close={toggleModal}
      title={modalTitle}
      buttonRow={
        <>
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={formik.submitForm}
            disabled={!(formik.isValid && formik.dirty)}
            loading={formik.isSubmitting}
          >
            {buttonText}
          </ActionButton>
        </>
      }
    >
      {apiError && (
        <Notification severity="negative" title="Error">
          {apiError}
        </Notification>
      )}
      <Form stacked>
        <Input
          type="text"
          placeholder="208930100007487"
          id="imsi"
          label="IMSI"
          stacked
          required
          disabled={subscriber ? true : false}
          {...formik.getFieldProps("imsi")}
          error={formik.touched.imsi ? formik.errors.imsi : null}
        />
        <Input
          type="text"
          id="opc"
          placeholder="981d464c7c52eb6e5036234984ad0bcf"
          label="OPC"
          help="Operator code"
          stacked
          required
          {...formik.getFieldProps("opc")}
          error={formik.touched.opc ? formik.errors.opc : null}
        />
        <Input
          type="text"
          id="key"
          placeholder="5122250214c33e723a5dd523fc145fc0"
          label="Key"
          help="Permanent subscription key"
          stacked
          required
          {...formik.getFieldProps("key")}
          error={formik.touched.key ? formik.errors.key : null}
        />
        <Input
          type="text"
          id="sequence-number"
          placeholder="16f3b3f70fc2"
          label="Sequence Number"
          stacked
          required
          {...formik.getFieldProps("sequenceNumber")}
          error={
            formik.touched.sequenceNumber ? formik.errors.sequenceNumber : null
          }
        />
        <Select
          id="network-slice"
          label="Network Slice"
          stacked
          required
          value={formik.values.selectedSlice}
          onChange={handleSliceChange}
          error={
            formik.touched.selectedSlice ? formik.errors.selectedSlice : null
          }
          options={[
            { disabled: true, label: "Select an option", value: "" },
            ...slices.map((slice) => ({
              label: slice["slice-name"],
              value: slice["slice-name"],
            })),
          ]}
        />
        <Select
          id="device-group"
          label="Device Group"
          stacked
          required
          value={formik.values.deviceGroup}
          onChange={handleDeviceGroupChange}
          error={formik.touched.deviceGroup ? formik.errors.deviceGroup : null}
          options={[
            { disabled: true, label: "Select an option", value: "" },
            ...deviceGroupOptions.map((group) => ({
              label: group,
              value: group,
            })),
          ]}
        />
      </Form>
    </Modal>
  );
};

export default SubscriberModal;
