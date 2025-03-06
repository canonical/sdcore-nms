import { apiGetAllDeviceGroupNames } from "@/utils/deviceGroupOperations";
import { Button, Form, Input, ConfirmationButton, Modal, Select } from "@canonical/react-components"
import { createSubscriber, deleteSubscriber, editSubscriber } from "@/utils/subscriberOperations";
import { getNetworkSlices } from "@/utils/networkSliceOperations";
import { NetworkSlice, SubscriberAuthData } from "@/components/types";
import { queryKeys } from "@/utils/queryKeys";
import { useAuth } from "@/utils/auth"
import { useFormik } from "formik";
import { useQueryClient } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { OperationError, is401UnauthorizedError}  from "@/utils/errors";

import ErrorNotification from "@/components/ErrorNotification";
import * as Yup from "yup";
import { generateUniqueImsi } from "@/utils/sim_configuration/generateImsi";
import { generateKey } from "crypto";
import { generateOpc, generateRandomKey } from "@/utils/sim_configuration/generateOpc";
import { generateSqn } from "@/utils/sim_configuration/generateSqn";


interface SubscriberFormValues {
  rawImsi: string;
  opc: string;
  key: string;
  sequenceNumber: string;
  selectedSlice: string;
  deviceGroup: string;
}

const SubscriberSchema = Yup.object().shape({
  rawImsi: Yup.string()
    .min(14, "IMSI must be at least 14 digits.")
    .max(15, "IMSI must be at most 15 digits.")
    .matches(/^[0-9]+$/, "Only numbers are allowed.")
    .required("IMSI is required."),
  opc: Yup.string()
    .length(32, "OPC must be 32 hexadecimal characters.")
    .matches(/^[A-Fa-f0-9]+$/, "Use valid hexadecimal characters.")
    .required("OPC is required."),
  key: Yup.string()
    .length(32, "Key must be 32 hexadecimal characters." )
    .matches(/^[A-Fa-f0-9]+$/, "Use valid hexadecimal characters.")
    .required("Key is required."),
  sequenceNumber: Yup.string().required("Sequence number is required."),
  selectedSlice: Yup.string().required("Network slice selection is required."),
  deviceGroup: Yup.string().required("Device group selection is required."),
});

interface SubscriberModalProps {
  title: string;
  initialValues: SubscriberFormValues;
  isEdit?: boolean;
  onSubmit: (values: any) => void;
  closeFn: () => void
}

const SubscriberModal: React.FC<SubscriberModalProps> = ({
  title,
  initialValues,
  isEdit = false,
  onSubmit,
  closeFn,
}) => {
  const auth = useAuth()
  const [apiError, setApiError] = useState<string | null>(null);
  const [imsiError, setImsiError] = useState<string | null>(null);
  const [networkSliceError, setNetworkSliceError] = useState<string | null>(null);
  const [deviceGroupError, setDeviceGroupError] = useState<string | null>(null);
  const [mcc, setMcc] = useState<string>("");
  const [mnc, setMnc] = useState<string>("");
  const queryClient = useQueryClient()

  const formik = useFormik<SubscriberFormValues>({
    initialValues,
    validationSchema: SubscriberSchema,
    onSubmit: async (values) => {
      try {
        await onSubmit({...values,});
        closeFn();
        setTimeout(async () => { // Wait 100 ms before invalidating due to a race condition
          await queryClient.invalidateQueries({ queryKey: [queryKeys.deviceGroups] });
          await queryClient.invalidateQueries({ queryKey: [queryKeys.subscribers] });
        }, 100);
      } catch (error) {
        if (is401UnauthorizedError(error)) {
            auth.logout();
        } else if (error instanceof OperationError) {
          setApiError(error.message);
        } else {
          setApiError("An unexpected error occurred.");
        }
      }
    },
  });

  const networkSlicesQuery = useQuery<NetworkSlice[], Error>({
    queryKey: [queryKeys.networkSlices, auth.user?.authToken],
    queryFn: () => getNetworkSlices(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
  })
  const networkSliceItems = (networkSlicesQuery.data as NetworkSlice[]) || [];

  if (networkSlicesQuery.isError) {
    setNetworkSliceError("Failed to retrieve network slices.");
  }
  if (!networkSliceError && !networkSlicesQuery.isLoading && networkSliceItems.length === 0) {
    setNetworkSliceError("No network slice available. Please create a network slice.");
  }

  const deviceGroupQuery = useQuery<string[], Error>({
    queryKey: [queryKeys.deviceGroupNames, auth.user?.authToken],
    queryFn: () => apiGetAllDeviceGroupNames(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
  })

  const deviceGroupNames = (deviceGroupQuery.data as string[]) || [] as string[];
  if (deviceGroupQuery.isError) {
    setDeviceGroupError("Failed to retrieve device groups.");
  }
  if (!deviceGroupError && !deviceGroupQuery.isLoading && deviceGroupNames.length === 0) {
    setDeviceGroupError("No device group available. Please create a device group.");
  }

  const getFilteredDeviceGroups = (sliceName: string) => {
    const selectedSlice = networkSliceItems.find((slice) => slice["slice-name"] === sliceName);
    return (selectedSlice?.["site-device-group"] || []).filter((group) => deviceGroupNames.includes(group));
  };
  
  const handleSliceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSliceName = e.target.value;
    console.error(networkSliceItems);
    const filteredDeviceGroupOptions = getFilteredDeviceGroups(selectedSliceName);    
    const selectedSlice = networkSliceItems.find(slice => slice["slice-name"] === selectedSliceName);
  
    setMcc(selectedSlice?.["site-info"].plmn?.mcc || "");
    setMnc(selectedSlice?.["site-info"].plmn?.mnc || "");
    console.error(selectedSlice);
    //setImsiError(null);

    formik.setValues({
      ...formik.values,
      selectedSlice: selectedSliceName,
      deviceGroup: filteredDeviceGroupOptions.length > 1 ? "" : filteredDeviceGroupOptions[0] || "",
    });

    //console.error(formik.values.rawImsi);
    //console.error(`${mcc}${mnc}`);
    //console.error(formik.values.rawImsi.startsWith(`${mcc}${mnc}`));

    //if (formik.values.rawImsi !== "" && !formik.values.rawImsi.startsWith(`${mcc}${mnc}`)) {
    //  console.error("do not match");
    //  setImsiError("IMSI do not match the Network Slice.")
    //}
    
  };
  
  useEffect(() => {
    if (formik.values.rawImsi !== "" && !formik.values.rawImsi.startsWith(`${mcc}${mnc}`)) {
      setImsiError("IMSI does not match the Network Slice (MCC and MNC).");
    }
    else {
      setImsiError(null);
    }
  }, [mcc, mnc, formik.values.rawImsi]); 

  const deviceGroupOptions = useMemo(() => getFilteredDeviceGroups(formik.values.selectedSlice), [
    formik.values.selectedSlice,
  ]);

  
  const handleGenerateValues = async () => {
    if (!mcc || !mnc) {
      setImsiError("Please select a network slice first.");
      return;
    }
    const imsi = await generateUniqueImsi(mcc, mnc);

    const opc = await generateOpc('00112233445566778899AABBCCDDEEFF', '8899AABBCCDDEEFF0011223344556677');
    const key = generateRandomKey();
    const sqn = generateSqn();
    formik.setValues({
      ...formik.values,
      rawImsi: imsi,
      opc: opc,
      key: key,
      sequenceNumber: sqn,
    });
    //setImsiError(null);
  };

  return (
    <Modal
      title={title}
      close={closeFn}
      buttonRow={
        <>
        <Button
          appearance="positive"
          onClick={formik.submitForm}
          disabled={!(formik.isValid && formik.dirty && !imsiError)}
          loading={formik.isSubmitting}
        >
          Submit
        </Button>
        <Button onClick={closeFn}>Cancel</Button>
        </>
      }>
      {apiError && <ErrorNotification error={apiError} />}
      {networkSliceError && <ErrorNotification error={networkSliceError} />}
      {deviceGroupError && <ErrorNotification error={deviceGroupError} />}
      <Form>
        <Select
          id="network-slice"
          label="Network Slice"
          required
          stacked
          value={formik.values.selectedSlice}
          onChange={handleSliceChange}
          error={
            formik.touched.selectedSlice ? formik.errors.selectedSlice : null
          }
          options={[
            { disabled: true, label: "Select an option", value: "" },
            ...networkSliceItems
              .filter((slice) => slice["slice-name"]) // Ensure only valid entries are included
              .map((slice) => ({
                label: slice["slice-name"],
                value: slice["slice-name"],
              })),
          ]}
        />
        <Select
          id="device-group"
          label="Device Group"
          required
          stacked
          value={formik.values.deviceGroup}
          onChange={(event) => formik.setFieldValue("deviceGroup", (event.target.value))}
          error={formik.touched.deviceGroup ? formik.errors.deviceGroup : null}
          options={[
            { disabled: true, label: "Select an option", value: "" },
            ...(deviceGroupOptions?.length
              ? deviceGroupOptions.map((deviceGroupName) => ({
                  label: deviceGroupName,
                  value: deviceGroupName,
                }))
              : [])
          ]}
        />
        <fieldset><legend>Authentication</legend>
          {!isEdit && 
            <div className="p-form__group p-form-validation row">
              <Button appearance="positive" type="button" onClick={handleGenerateValues} >
                Generate
              </Button>
            </div>}
          <Input
            id="imsi"
            label="IMSI"
            type="text"
            required
            stacked
            disabled={isEdit}
            placeholder="208930100007487"
            {...formik.getFieldProps("rawImsi")}
            error={formik.touched.rawImsi && formik.errors.rawImsi ? formik.errors.rawImsi : imsiError }
          />
          <Input
            id="opc"
            label="OPC"
            type="text"
            required
            stacked
            disabled={isEdit}
            placeholder="981d464c7c52eb6e5036234984ad0bcf"
            help="Operator code"
            {...formik.getFieldProps("opc")}
            error={formik.touched.opc ? formik.errors.opc : null}
          />
          <Input
            id="key"
            label="Key"
            type="text"
            required
            stacked
            disabled={isEdit}
            placeholder="5122250214c33e723a5dd523fc145fc0"
            help="Permanent subscription key"
            {...formik.getFieldProps("key")}
            error={formik.touched.key ? formik.errors.key : null}
          />
          <Input
            id="sequence-number"
            label="Sequence Number"
            type="text"
            required
            stacked
            disabled={isEdit}
            placeholder="16f3b3f70fc2"
            {...formik.getFieldProps("sequenceNumber")}
            error={
              formik.touched.sequenceNumber ? formik.errors.sequenceNumber : null
            }
          />
        </fieldset>
      </Form>
    </Modal>
  )
};

type createNewSubscriberModalProps = {
  closeFn: () => void
}

export function CreateSubscriberModal({ closeFn }: createNewSubscriberModalProps) {
  const auth = useAuth()
  const handleSubmit = async (values: SubscriberFormValues) => {
    const subscriberAuthData: SubscriberAuthData = {  
      rawImsi: values.rawImsi,
      opc: values.opc,
      key: values.key,
      sequenceNumber: values.sequenceNumber
    }
    await createSubscriber({
      subscriberData: subscriberAuthData,
      deviceGroupName: values.deviceGroup,
      token: auth.user ? auth.user.authToken : "",
    });
  };

  const initialValues: SubscriberFormValues = {
    rawImsi: "",
    opc: "",
    key: "",
    sequenceNumber: "",
    selectedSlice: "",
    deviceGroup: "",
  };

  return (
    <>
      <SubscriberModal
        title="Create subscriber"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        closeFn={closeFn}
      />
    </>
  );
};

type editSubscriberModalProps = {
  subscriber: SubscriberAuthData;
  previousNetworkSlice: string;
  previousDeviceGroup: string;
  token: string;
  closeFn: () => void;
}

export function EditSubscriberModal({ subscriber, previousNetworkSlice, previousDeviceGroup, token, closeFn }: editSubscriberModalProps) {
  const handleSubmit = async (values: SubscriberFormValues) => {
    const subscriberAuthData: SubscriberAuthData = {  
      rawImsi: values.rawImsi,
      opc: values.opc,
      key: values.key,
      sequenceNumber: values.sequenceNumber
    }
    await editSubscriber({
      subscriberData: subscriberAuthData,
      previousDeviceGroup: previousDeviceGroup,
      newDeviceGroupName: values.deviceGroup,
      token: token,
    });
  };

  const initialValues: SubscriberFormValues = {
    rawImsi: subscriber.rawImsi,
    opc: subscriber.opc,
    key: subscriber.key,
    sequenceNumber: subscriber.sequenceNumber,
    selectedSlice: previousNetworkSlice,
    deviceGroup: previousDeviceGroup,
  };

  return (
    <>
      <SubscriberModal
        title={"Edit subscriber: " + `${subscriber.rawImsi}`}
        initialValues={initialValues}
        isEdit={true}
        onSubmit={handleSubmit}
        closeFn={closeFn}
      />
    </>
  );
}

type deleteSubscriberButtonProps = {
  rawImsi: string;
}

export const DeleteSubscriberButton: React.FC<deleteSubscriberButtonProps> = ({rawImsi}) => {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const handleConfirmDelete = async (rawImsi: string) => {
    try {
      await deleteSubscriber(rawImsi, auth.user ? auth.user.authToken : "");
    } catch (error) {
      if (is401UnauthorizedError(error)) { auth.logout(); }
    }
    setTimeout(async () => { // Wait 100 ms before invalidating due to a race condition
      await queryClient.invalidateQueries({ queryKey: [queryKeys.deviceGroups] });
      await queryClient.invalidateQueries({ queryKey: [queryKeys.subscribers] });
    }, 100);
  };

  return (
    <ConfirmationButton
      appearance="negative"
      className="u-no-margin--bottom"
      shiftClickEnabled
      showShiftClickHint
      title="Delete subscriber"
      confirmationModalProps={{
        title: `Delete subscriber ${rawImsi}`,
        confirmButtonLabel: "Delete",
        onConfirm: () => handleConfirmDelete(rawImsi),
        children: (
          <p>
            This will permanently delete the subscriber <b>{rawImsi}</b>.
            <br />
            You cannot undo this action.
          </p>
        ),
      }}
    >
      Delete
    </ConfirmationButton>
  )
}
