"use client";
import React, { useCallback, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  ActionButton,
} from "@canonical/react-components";
import { createSubscriber } from "@/utils/createSubscriber";
import { getNetworkSlices } from "@/utils/getNetworkSlices";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/utils/queryKeys";
import * as Yup from "yup";
import { useFormik } from "formik";

interface SubscriberValues {
  imsi: string;
  opc: string;
  key: string;
  sequenceNumber: string;
  selectedSlice: string;
  deviceGroup: string;
}

type Props = {
  toggleModal: () => void;
};

const CreateSubscriberModal = ({ toggleModal }: Props) => {
  const queryClient = useQueryClient();

  const SubscriberSchema = Yup.object().shape({
    imsi: Yup.string()
      .min(14)
      .max(15)
      .matches(/^[0-9]+$/, { message: "Only numbers are allowed." })
      .required("IMSI must be 14 or 15 digits"),
    opc: Yup.string()
      .length(32)
      .matches(/^[A-Za-z0-9]+$/, {
        message: "Only alphanumeric characters are allowed.",
      })
      .required("OPC must be a 32 character hexadecimal"),
    key: Yup.string()
      .length(32)
      .matches(/^[A-Za-z0-9]+$/, {
        message: "Only alphanumeric characters are allowed.",
      })
      .required("Key must be a 32 character hexadecimal"),
    sequenceNumber: Yup.string().required("Sequence number is required"),
    deviceGroup: Yup.string().required(""),
  });

  const formik = useFormik<SubscriberValues>({
    initialValues: {
      imsi: "",
      opc: "",
      key: "",
      sequenceNumber: "",
      selectedSlice: "",
      deviceGroup: "",
    },
    validationSchema: SubscriberSchema,
    onSubmit: async (values) => {
      await createSubscriber({
        imsi: values.imsi,
        opc: values.opc,
        key: values.key,
        sequenceNumber: values.sequenceNumber,
        deviceGroupName: values.deviceGroup,
      });
      void queryClient.invalidateQueries({ queryKey: [queryKeys.subscribers] });
      toggleModal();
    },
  });

  const { data: slices = [] } = useQuery({
    queryKey: [queryKeys.networkSlices],
    queryFn: getNetworkSlices,
  });

  const selectedSlice = slices.find(
    (slice) => slice.SliceName === formik.values.selectedSlice,
  );

  const setDeviceGroup = useCallback(
    (deviceGroup: string) => {
      if (formik.values.deviceGroup !== deviceGroup) {
        formik.setFieldValue("deviceGroup", deviceGroup);
      }
    },
    [formik],
  );

  useEffect(() => {
    if (
      selectedSlice &&
      selectedSlice["site-device-group"] &&
      selectedSlice["site-device-group"].length === 1
    ) {
      setDeviceGroup(selectedSlice["site-device-group"][0]);
    }
  }, [slices, selectedSlice, setDeviceGroup]);

  const setSelectedSlice = useCallback(
    (newSlice: string) => {
      if (formik.values.selectedSlice !== newSlice) {
        formik.setFieldValue("selectedSlice", newSlice);
      }
    },
    [formik],
  );

  useEffect(() => {
    if (!selectedSlice && slices.length > 0) {
      setSelectedSlice(slices[0].SliceName);
    }
  }, [slices, selectedSlice, setSelectedSlice]);

  const deviceGroupOptions =
    selectedSlice && selectedSlice["site-device-group"]
      ? selectedSlice["site-device-group"]
      : [];

  return (
    <Modal
      close={toggleModal}
      title="Add New Subscriber"
      buttonRow={
        <>
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={formik.submitForm}
            disabled={!(formik.isValid && formik.dirty)}
            loading={formik.isSubmitting}
          >
            Create
          </ActionButton>
        </>
      }
    >
      <Form stacked>
        <Input
          type="text"
          placeholder="208930100007487"
          id="imsi"
          label="IMSI"
          stacked
          required
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
          {...formik.getFieldProps("selectedSlice")}
          error={
            formik.touched.selectedSlice ? formik.errors.selectedSlice : null
          }
          options={[
            {
              disabled: true,
              label: "Select an option",
              value: "",
            },
            ...slices.map((slice) => ({
              label: slice.SliceName,
              value: slice.SliceName,
            })),
          ]}
        />
        <Select
          id="device-group"
          label="Device Group"
          stacked
          required
          {...formik.getFieldProps("deviceGroup")}
          error={formik.touched.deviceGroup ? formik.errors.deviceGroup : null}
          options={[
            {
              disabled: true,
              label: "Select an option",
              value: "",
            },
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

export default CreateSubscriberModal;
