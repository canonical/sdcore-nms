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
  imsiPrefix: string;
  msin: string;
  opc: string;
  key: string;
  sequenceNumber: string;
  selectedSlice: string;
  deviceGroup: string;
}

const SubscriberSchema = Yup.object().shape({
  imsiPrefix: Yup.string()
    .min(5, "IMSI prefix must contain at least 5 digits.")
    .max(6, "IMSI prefix must contain at most 6 digits.")
    .matches(/^[0-9]+$/, "Only numbers are allowed.")
    .required("IMSI is required."),
    msin: Yup.string()
    .length(10, "IMSI complement must contain 10 digits." )
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
  const [mcc, setMcc] = useState<string>(initialValues.imsiPrefix.substring(0, 3));
  const [mnc, setMnc] = useState<string>(initialValues.imsiPrefix.substring(3));
  const [selectedSlice, selectSlice] = useState<NetworkSlice | null>(null);
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

  const getDGList = () => {
    selectedSlice?.["site-device-group"] || [].filter((group) => deviceGroupNames.includes(group))
  }

  const getEditFilteredNetworkSlices = (mcc: string, mnc: string) => {
    const selectedSlices = networkSliceItems.filter(
      (slice) =>
        slice["site-info"]?.plmn?.mcc === mcc &&
        slice["site-info"]?.plmn?.mnc === mnc
    );
    return selectedSlices;
  };

  const handleSliceChangeCreate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSliceName = e.target.value;
    console.error(networkSliceItems);
    const filteredDeviceGroupOptions = getFilteredDeviceGroups(selectedSliceName);    
    const selectedSlice = networkSliceItems.find(slice => slice["slice-name"] === selectedSliceName);
  
    setMcc(selectedSlice?.["site-info"].plmn?.mcc || "");
    setMnc(selectedSlice?.["site-info"].plmn?.mnc || "");
    selectSlice(selectedSlice ? selectedSlice : null)
    const localMcc = selectedSlice?.["site-info"].plmn?.mcc || "";
    const localMnc = selectedSlice?.["site-info"].plmn?.mnc || "";

    formik.setValues({
      ...formik.values,
      selectedSlice: selectedSliceName,
      deviceGroup: filteredDeviceGroupOptions.length > 1 ? "" : filteredDeviceGroupOptions[0] || "",
      imsiPrefix: `${localMcc}${localMnc}`
    });
  };

  const handleSliceChangeEdit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSliceName = e.target.value;
    const filteredDeviceGroupOptions = getFilteredDeviceGroups(selectedSliceName);
    const selectedSlice = networkSliceItems.find(slice => slice["slice-name"] === selectedSliceName);
    selectSlice(selectedSlice ? selectedSlice : null)
    formik.setValues({
      ...formik.values,
      selectedSlice: selectedSliceName,
      deviceGroup: filteredDeviceGroupOptions.length > 1 ? "" : filteredDeviceGroupOptions[0] || "",
    });    
  };

  const handleSliceChange = isEdit ? handleSliceChangeEdit: handleSliceChangeCreate;

  useEffect(() => {
    if (formik.values.imsiPrefix !== "" && formik.values.imsiPrefix !== `${mcc}${mnc}`) {
      setImsiError("IMSI does not match the Network Slice (MCC and MNC).");
    }
    else {
      setImsiError(null);
    }
  }, [mcc, mnc, formik.values.imsiPrefix]); 

  const deviceGroupOptions = useMemo(() => getFilteredDeviceGroups(formik.values.selectedSlice), [
    formik.values.selectedSlice,
  ]);


  const handleGenerateImsi = async () => {
    if (!mcc || !mnc) {
      setImsiError("Please select a network slice first.");
      return;
    }
    const imsi = await generateUniqueImsi(mcc, mnc);

    formik.setValues({
      ...formik.values,
      msin: imsi.slice(-10),
    });
    //setImsiError(null);
  };

  const handleGenerateValues = async () => {
    const opc = await generateOpc('00112233445566778899AABBCCDDEEFF', '8899AABBCCDDEEFF0011223344556677');
    const key = generateRandomKey();
    const sqn = generateSqn();
    formik.setValues({
      ...formik.values,
      opc: opc,
      key: key,
      sequenceNumber: sqn,
    });
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
            ...(isEdit
              ? getEditFilteredNetworkSlices(mcc, mnc)
              : networkSliceItems
            )
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
            ...(deviceGroupNames?.length
              ? deviceGroupNames
                .filter((group) =>
                (selectedSlice?.["site-device-group"] || [initialValues.deviceGroup]).includes(group))
                .map((deviceGroupName) => ({
                  label: deviceGroupName,
                  value: deviceGroupName,
                }))
              : [])
          ]}
        />
        <fieldset><legend></legend>
          {!isEdit && 
          <div className="p-form__group p-form-validation row">
            <Button appearance="positive" type="button" onClick={handleGenerateImsi} >
              Generate
            </Button>
          </div>}
          <Form inline>
            <Input
              id="imsi-prefix"
              label="IMSI"
              type="text"
              required
              stacked
              disabled={true}
              {...formik.getFieldProps("imsiPrefix")}
              error={formik.touched.imsiPrefix && formik.errors.imsiPrefix ? formik.errors.imsiPrefix : imsiError }
              />
            <Input
              id="msin"
              type="text"
              required
              stacked
              disabled={isEdit}
              placeholder="0100007487"
              {...formik.getFieldProps("msin")}
              error={formik.touched.msin && formik.errors.msin ? formik.errors.msin : null }
              />
            </Form>
        </fieldset>
        <fieldset><legend>Authentication</legend>
          {!isEdit && 
            <div className="p-form__group p-form-validation row">
              <Button appearance="positive" type="button" onClick={handleGenerateValues} >
                Generate
              </Button>
            </div>}
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
      rawImsi: values.imsiPrefix + values.msin,
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
    imsiPrefix: "",
    msin: "",
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
      rawImsi: values.imsiPrefix + values.msin,
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
    imsiPrefix: subscriber.rawImsi.slice(0, -10),
    msin: subscriber.rawImsi.slice(-10),
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
