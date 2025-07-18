import { apiGetAllNetworkSlices } from "@/utils/networkSliceOperations"
import { Button, Form, Icon, Input, ConfirmationButton, Modal, Select } from "@canonical/react-components"
import { createDeviceGroup, editDeviceGroup, deleteDeviceGroup } from "@/utils/deviceGroupOperations";
import { DeviceGroup } from "@/components/types";
import { filterSubscribers } from "@/utils/subscriberOperations";
import { OperationError, is401UnauthorizedError}  from "@/utils/errors";
import { queryKeys } from "@/utils/queryKeys";
import { useAuth } from "@/utils/auth"
import { useFormik } from "formik";
import { useQueryClient } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import ErrorNotification from "@/components/ErrorNotification";
import isCidr from "is-cidr";
import ipRegex from "ip-regex";
import * as Yup from "yup";


interface DeviceGroupFormValues {
  name: string;
  networkSlice: string;
  dnn: string;
  ueIpPool: string;
  dns: string;
  mtu: number;
  MBRDownstreamMbps: number | null;
  MBRUpstreamMbps: number | null;
  qos5qi: number;
  qosArp: number;
}

const validateIp = (ip: string): boolean => ipRegex({ exact: true }).test(ip);
const validateCidr = (cidr: string): boolean => isCidr(cidr) !== 0;
const valid5QIValues = [1, 2, 9];

const DeviceGroupSchema = Yup.object().shape({
  name: Yup.string()
      .min(1)
      .max(20, "Name should not exceed 20 characters.")
      .matches(/^[a-zA-Z][a-zA-Z0-9-_]+$/, {
      message: (
        <>
          Name must start with a letter. <br />
          Only alphanumeric characters, dashes, and underscores.
        </>
      ),
      })
      .required("Name is required."),
  networkSlice: Yup.string()
      .min(1)
      .required("Network slice is required."),
  dnn: Yup.string()
      .min(1)
      .max(255, "DNN should not exceed 255 characters.")
      .matches(/^[a-zA-Z][a-zA-Z0-9-_]+$/, {
      message: (
        <>
          DNN must start with a letter. <br />
          Only alphanumeric characters, dashes, and underscores.
        </>
      ),
      })
      .required("DNN is required"),
  ueIpPool: Yup.string()
      .required("IP pool is required")
      .test("is-cidr", "Invalid IP address pool.", (value) => value ? validateCidr(value) : false),
  dns: Yup.string()
      .required("IP is required")
      .test("is-ip", "Invalid IP Address.", (value) => value ? validateIp(value) : false),
  mtu: Yup.number()
      .min(1200, "MTU must be greater than or equal to 1,200.")
      .max(65535, "MTU must be less than or equal to 65,535.")
      .required("MTU must be between 1,200 and 65,535."),
  MBRDownstreamMbps: Yup.number()
      .min(0, "Value must be greater than or equal to 0.")
      .max(1000000, "Value must be less than or equal to 1,000,000.")
      .required("Value must be between 0 and 1,000,000."),
  MBRUpstreamMbps: Yup.number()
      .min(0, "Value must be greater than or equal to 0.")
      .max(1000000, "Value must be less than or equal to 1,000,000.")
      .required("Value must be between 0 and 1,000,000."),
  qos5qi: Yup.number()
      .oneOf(valid5QIValues, "5QI must be either 1, 2, or 9.")
      .required("5QI is required."),
  qosArp: Yup.number()
      .min(1)
      .max(15)
      .required("ARP is required."),
});

interface DeviceGroupModalProps {
  title: string;
  initialValues: DeviceGroupFormValues;
  isEdit?: boolean;
  numberOfSubscribers: number;
  onSubmit: (values: any) => void;
  closeFn: () => void
}

export const DeviceGroupModal: React.FC<DeviceGroupModalProps> = ({
  title,
  initialValues,
  isEdit = false,
  numberOfSubscribers,
  onSubmit,
  closeFn,
}) => {
  const auth = useAuth()
  const [apiError, setApiError] = useState<string | null>(null);
  const [networkSliceError, setNetworkSliceError] = useState<string | null>(null);
  const queryClient = useQueryClient()

  const formik = useFormik<DeviceGroupFormValues>({
    initialValues,
    validationSchema: DeviceGroupSchema,
    onSubmit: async (values) => {
      try {
        await onSubmit({...values,});
        closeFn();
        setTimeout(async () => { // Wait 100 ms before invalidating due to a race condition
          await queryClient.invalidateQueries({ queryKey: [queryKeys.networkSlices] });
          await queryClient.invalidateQueries({ queryKey: [queryKeys.deviceGroupNames] });
          await queryClient.invalidateQueries({ queryKey: [queryKeys.deviceGroups] });
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

  const networkSlicesQuery = useQuery<string[], Error>({
    queryKey: [queryKeys.networkSliceNames, auth.user?.authToken],
    queryFn: () => apiGetAllNetworkSlices(auth.user?.authToken ?? ""),
    enabled: !isEdit && auth.user ? true : false,
  })
  const networkSliceItems = (networkSlicesQuery.data as string[]) || [];
  if (networkSlicesQuery.isError) {
    setNetworkSliceError("Failed to retrieve network slices.");
  }
  if (!isEdit && !networkSlicesQuery.isLoading && networkSliceItems.length === 0 && !networkSliceError) {
    setNetworkSliceError("No network slice available. Please create a network slice.");
  }

  return (
      <Modal
      title={title}
      close={closeFn}
      buttonRow={
        <>
        <Button
          appearance="positive"
          onClick={formik.submitForm}
          disabled={!(formik.isValid && formik.dirty)}
          loading={formik.isSubmitting}
        >
          Submit
        </Button>
        <Button onClick={closeFn}>Cancel</Button>
        </>
      }>
      {apiError && <ErrorNotification error={apiError} />}
      {networkSliceError && <ErrorNotification error={networkSliceError} />}
      <Form>
        <Input
          id="name"
          label="Name"
          type="text"
          required
          stacked
          disabled={isEdit}
          placeholder="default"
          {...formik.getFieldProps("name")}
          error={formik.touched.name ? formik.errors.name : null}
        />
        <Select
          id="network-slice"
          label="Network Slice"
          required
          stacked
          disabled={isEdit}
          value={formik.values.networkSlice}
          onChange={(event) => formik.setFieldValue("networkSlice", (event.target.value))
          }
          options={[
            {
              label: "Select an option",
              disabled: true,
              value: ""
            },
              ...networkSliceItems.map((networkSliceName) => ({
                label: networkSliceName,
                value: networkSliceName,
            })),
          ]}
        />
        <Input
          id="dnn"
          label="DNN"
          type="text"
          required
          stacked
          disabled={isEdit && numberOfSubscribers > 0}
          placeholder="internet"
          {...formik.getFieldProps("dnn")}
          error={formik.touched.dnn ? formik.errors.dnn : null}
        />
        <Input
          id="ue-ip-pool"
          label="Subscriber IP pool"
          type="text"
          required
          stacked
          placeholder="172.250.1.0/16"
          {...formik.getFieldProps("ueIpPool")}
          error={formik.touched.ueIpPool ? formik.errors.ueIpPool : null}
        />
        <Input
          id="dns"
          label="DNS"
          type="text"
          required
          stacked
          defaultValue="8.8.8.8"
          placeholder="8.8.8.8"
          {...formik.getFieldProps("dns")}
          error={formik.touched.dns ? formik.errors.dns : null}
        />
        <Input
          id="mtu"
          label="MTU (bytes)"
          type="number"
          required
          stacked
          min={1200}
          max={65535}
          defaultValue={1456}
          {...formik.getFieldProps("mtu")}
          error={formik.touched.mtu ? formik.errors.mtu : null}
        />
        <fieldset>
          <legend>Maximum bitrate (Mbps)</legend>
          <Input
            id="mbr-downstream"
            label="Downstream"
            type="number"
            required
            stacked
            min={0}
            max={1000000}
            placeholder="20"
            {...formik.getFieldProps("MBRDownstreamMbps")}
            error={
              formik.touched.MBRDownstreamMbps
                ? formik.errors.MBRDownstreamMbps
                : null
            }
          />
          <Input
            id="mbr-upstream"
            label="Upstream"
            type="number"
            required
            stacked
            min={0}
            max={1000000}
            placeholder="5"
            {...formik.getFieldProps("MBRUpstreamMbps")}
            error={
              formik.touched.MBRUpstreamMbps
                ? formik.errors.MBRUpstreamMbps
                : null
            }
          />
        </fieldset>
        <fieldset>
          <legend>QoS</legend>
          <Select
              id="5qi"
              label="5QI"
              required
              stacked
              defaultValue=""
              help="5G Quality of Service Identifier"
              onChange={(event) => formik.setFieldValue("qos5qi", Number(event.target.value))}
              value={formik.values.qos5qi}
              options={[
                {
                  disabled: true,
                  label: "Select an option",
                  value: 0,
                },
                {
                  disabled: false,
                  label: "1: GBR - Conversational Voice",
                  value: 1,
                },
                {
                  disabled: false,
                  label: "2: GBR - Conversational Video",
                  value: 2,
                },
                {
                  disabled: false,
                  label: "9: Non-GBR",
                  value: 9,
                },
              ]}
          />
          <Select
              id="arp"
              label="ARP"
              required
              stacked
              defaultValue={6}
              help="Allocation and Retention Priority"
              onChange={(event) => formik.setFieldValue("qosArp", Number(event.target.value))}
              value={formik.values.qosArp}
              options={[
                {
                  disabled: true,
                  label: "Select an option",
                  value: 0,
                },
                ...Array.from({ length: 15 }, (_, i) => ({
                  label: (i + 1).toString(),
                  value: (i + 1),
                })),
              ]}
          />
        </fieldset>
      </Form>
    </Modal>
  )
};

type createNewDeviceGroupModalProps = {
  closeFn: () => void
}

export function CreateDeviceGroupModal({ closeFn }: createNewDeviceGroupModalProps) {
  const auth = useAuth()
  const handleSubmit = async (values: DeviceGroupFormValues) => {
    const MBRUpstreamBps = Number(values.MBRUpstreamMbps) * 1_000_000;
    const MBRDownstreamBps = Number(values.MBRDownstreamMbps) * 1_000_000;
    await createDeviceGroup({
      name: values.name,
      dnn: values.dnn,
      ueIpPool: values.ueIpPool,
      dns: values.dns,
      mtu: values.mtu,
      MBRUpstreamBps: MBRUpstreamBps,
      MBRDownstreamBps: MBRDownstreamBps,
      networkSliceName: values.networkSlice,
      qos5qi: values.qos5qi,
      qosArp: values.qosArp,
      token: auth.user ? auth.user.authToken : ""
    });
  };

  const initialValues: DeviceGroupFormValues = {
    name: "",
    networkSlice: "",
    dnn: "",
    ueIpPool: "",
    dns: "8.8.8.8",
    mtu: 1456,
    MBRDownstreamMbps: null,
    MBRUpstreamMbps: null,
    qos5qi: 1,
    qosArp: 6,
  };

  return (
    <>
      <DeviceGroupModal
        title="Create device group"
        initialValues={initialValues}
        numberOfSubscribers={0}
        onSubmit={handleSubmit}
        closeFn={closeFn}
      />
    </>
  );
};

type editDeviceGroupActionModalProps = {
  deviceGroup: DeviceGroup
  closeFn: () => void
}

export function EditDeviceGroupModal({ deviceGroup, closeFn }: editDeviceGroupActionModalProps) {
  const auth = useAuth()
  const handleSubmit = async (values: DeviceGroupFormValues) => {
    const MBRUpstreamBps = Number(values.MBRUpstreamMbps) * 1_000_000;
    const MBRDownstreamBps = Number(values.MBRDownstreamMbps) * 1_000_000;
    await editDeviceGroup({
      name: values.name,
      dnn: values.dnn,
      ueIpPool: values.ueIpPool,
      dns: values.dns,
      mtu: values.mtu,
      MBRUpstreamBps: MBRUpstreamBps,
      MBRDownstreamBps: MBRDownstreamBps,
      qos5qi: values.qos5qi,
      qosArp: values.qosArp,
      token: auth.user ? auth.user.authToken : ""
    });
  };
  const qos5qiValue = deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["traffic-class"]?.qci;
  const initialQos5qi = valid5QIValues.includes(qos5qiValue) ? qos5qiValue : 0;
  const arpValue = deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["traffic-class"]?.arp;
  const initialQosArp = arpValue >= 1 && arpValue <= 15 ? arpValue : 0;

  const initialValues: DeviceGroupFormValues = {
    name: deviceGroup["group-name"] || "",
    networkSlice:deviceGroup["network-slice"] || "",
    dnn: deviceGroup["ip-domain-expanded"]?.["dnn"] || "",
    ueIpPool: deviceGroup["ip-domain-expanded"]?.["ue-ip-pool"] || "",
    dns: deviceGroup["ip-domain-expanded"]?.["dns-primary"] || "8.8.8.8",
    mtu: deviceGroup["ip-domain-expanded"]?.["mtu"] || 1456,
    MBRDownstreamMbps: deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["dnn-mbr-downlink"] / 1_000_000 || null,
    MBRUpstreamMbps: deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["dnn-mbr-uplink"] / 1_000_000 || null,
    qos5qi: initialQos5qi,
    qosArp: initialQosArp,
  };

  return (
    <>
      <DeviceGroupModal
        title={"Edit device group: " + `${deviceGroup["group-name"]}`}
        initialValues={initialValues}
        isEdit={true}
        numberOfSubscribers={deviceGroup.imsis.length}
        onSubmit={handleSubmit}
        closeFn={closeFn}
      />
    </>
  );
}

type deleteDeviceGroupActionModalProps = {
  deviceGroupName: string
  subscribers: string[]
}

export const DeleteDeviceGroupButton: React.FC<deleteDeviceGroupActionModalProps> = ({
  deviceGroupName,
  subscribers,
}) => {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const handleConfirmDelete = async (name: string) => {
    try {
      await deleteDeviceGroup(name, auth.user ? auth.user.authToken : "");
    } catch (error) {
      if (is401UnauthorizedError(error)) { auth.logout(); }
    }
    setTimeout(async () => { // Wait 100 ms before invalidating due to a race condition
      await queryClient.invalidateQueries({ queryKey: [queryKeys.networkSlices] });
      await queryClient.invalidateQueries({ queryKey: [queryKeys.deviceGroupNames] });
      await queryClient.invalidateQueries({ queryKey: [queryKeys.deviceGroups] });
      await queryClient.invalidateQueries({ queryKey: [queryKeys.filteredSubscribers] });
    }, 100);
  };

  const subscriberQuery= useQuery({
    queryKey: [queryKeys.filteredSubscribers, subscribers, auth.user?.authToken],
    queryFn: () =>  filterSubscribers(subscribers, auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
  });

  if (subscriberQuery.status == "error" && is401UnauthorizedError(subscriberQuery.error)) {
    auth.logout();
  }
  const filteredSubscribers = subscriberQuery.data || [];

  if (subscribers && filteredSubscribers.length > 0) {
    return (
      <ConfirmationButton
        appearance="base"
        className="is-dense has-icon u-no-margin--bottom"
        onHoverText="Delete device group"
        title="Delete device group"
        confirmationModalProps={{
          title: "Warning",
          confirmButtonLabel: "Delete",
          buttonRow: (null),
          onConfirm: () => { },
          children: (
            <p>
              Device group <b>{deviceGroupName}</b> cannot be deleted.
              <br />
              Please remove the following subscribers first:
              <br />
              {filteredSubscribers.join(", ")}.
            </p>
          ),
        }}
      >
        <Icon name="delete" />
      </ConfirmationButton>
    )
  }
  return (
    <ConfirmationButton
      appearance="base"
      className="is-dense has-icon u-no-margin--bottom"
      onHoverText="Delete device group"
      shiftClickEnabled
      showShiftClickHint
      title="Delete device group"
      confirmationModalProps={{
        title: `Delete device group: ${deviceGroupName}`,
        confirmButtonLabel: "Delete",
        onConfirm: () => handleConfirmDelete(deviceGroupName),
        children: (
          <p>
            This will permanently delete the device group <b>{deviceGroupName}</b>.
            <br />
            You cannot undo this action.
          </p>
        ),
      }}
    >
      <Icon name="delete" />
    </ConfirmationButton>
  )
}
