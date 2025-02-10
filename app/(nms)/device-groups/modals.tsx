import { UserEntry } from "@/components/types"
import { useAuth } from "@/utils/auth"
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { changePassword, deleteUser, postUser } from "@/utils/accountQueries"
import { passwordIsValid } from "@/utils/utils"
import { Button, Form, Input, ConfirmationButton, Modal, Notification, PasswordToggle } from "@canonical/react-components"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChangeEvent, useState } from "react"
import { DeviceGroup } from "@/components/types";
import { createDeviceGroup } from "@/utils/createDeviceGroup";
import { getNetworkSliceNames } from "@/utils/getNetworkSlices"
import * as Yup from "yup";
import { useRouter } from "next/navigation"
import { useFormik } from "formik";
import { useQuery } from "@tanstack/react-query"
import Loader from "@/components/Loader"
import { editDeviceGroup } from "@/utils/editDeviceGroup";
import { deleteDeviceGroup } from "@/utils/deleteDeviceGroup";
import {
  Select,
  ActionButton,
} from "@canonical/react-components";

type createNewDeviceGroupModalProps = {
    closeFn: () => void
}

interface DeviceGroupValues {
    name: string;
    networkSlice: string;
    ueIpPool: string;
    dns: string;
    mtu: number;
    MBRDownstreamMbps: number | null;
    MBRUpstreamMbps: number | null;
    Qos5qi: string;
    QosArp: number
}

const regexIp =
  /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;

const regexpCIDR =
  /^((25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\/([1-9]|[1-2][0-9]|3[0-2])$/;


const DeviceGroupSchema = Yup.object().shape({
  name: Yup.string()
      .min(1)
      .max(20, "Name should not exceed 20 characters.")
      .matches(/^[a-zA-Z0-9-_]+$/, {
      message: "Only alphanumeric characters, dashes and underscores.",
      })
      .required("Name is required."),
  networkSlice: Yup.string()
      .min(1)
      .required("Network slice is required."),
  ueIpPool: Yup.string()
      .required("IP is required")
      .matches(regexpCIDR, "Invalid IP Address Pool."),
  dns: Yup.string()
      .required("IP is required")
      .matches(regexIp, "Invalid IP Address."),
  mtu: Yup.number().min(1200).max(65535).required("Invalid MTU."),
  MBRDownstreamMbps: Yup.number()
      .min(0)
      .max(1000000)
      .required("Value should be between 0 and 1,000,000."),
  MBRUpstreamMbps: Yup.number()
      .min(0)
      .max(1000000)
      .required("Value should be between 0 and 1,000,000."),
  //Qos5qi: Yup.string()
  //    .oneOf(["1", "2", "9"], "5QI must be either 1, 2, or 9")
  //    .required("5QI is required"),
  //QosArp: Yup.number()
  //    .min(1)
  //    .max(15)
  //    .required("ARP is required"),
});


export function CreateDeviceGroupModal({ closeFn }: createNewDeviceGroupModalProps) {
  const auth = useAuth()
  const [apiError, setApiError] = useState<string | null>(null);
  const queryClient = useQueryClient()

  const formik = useFormik<DeviceGroupValues>({
    initialValues: {
      name: "",
      networkSlice: "",
      ueIpPool: "",
      dns: "8.8.8.8",
      mtu: 1456,
      MBRDownstreamMbps: null,
      MBRUpstreamMbps: null,
      Qos5qi: "",
      QosArp: 0,
    },
    validationSchema: DeviceGroupSchema,
    onSubmit: async (values) => {
      const MBRUpstreamBps = Number(values.MBRUpstreamMbps) * 1000000;
      const MBRDownstreamBps = Number(values.MBRDownstreamMbps) * 1000000;
      try {
        await createDeviceGroup({
            name: values.name,
            ueIpPool: values.ueIpPool,
            dns: values.dns,
            mtu: values.mtu,
            MBRUpstreamBps: MBRUpstreamBps,
            MBRDownstreamBps: MBRDownstreamBps,
            networkSliceName: values.networkSlice,
            token: auth.user ? auth.user.authToken : ""
          });
        closeFn()
        await queryClient.invalidateQueries({ queryKey: ['device-groups'] })
        await queryClient.invalidateQueries({ queryKey: ['network-slices'] })
      }
      catch (error) {
        console.error(error);
        setApiError(
          (error as Error).message || "An unexpected error occurred.",
        );
      }
    },
  });

  const router = useRouter()
  const query = useQuery<string[], Error>({
    queryKey: ['network-slice', auth.user?.authToken],
    queryFn: () => getNetworkSliceNames(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
    retry: (failureCount, error): boolean => {
      if (error.message.includes("401") || error.message.includes("403")) {
        return false
      }
      return true
    },
  })
  if (query.status == "pending") { return <Loader text="loading..." /> }
  if (query.status == "error") {
    if (query.error.message.includes("401")) {
      auth.logout()
    }
    if (query.error.message.includes("403")) {
      router.push("/")
    }
    return <p>{query.error.message}</p>
  }

  const networkSliceItems = (query.data as string[]) || [];


  const handleNetworkSliceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    void formik.setFieldValue("networkSlice", event.target.value);
  };
    
  const handle5QIChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      void formik.setFieldValue("5qi", event.target.value);
  };
  const handleARPChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    void formik.setFieldValue("arp", event.target.value);
  };

  const getNetworkSliceValueAsString = () => {
    return formik.values.networkSlice ? formik.values.networkSlice : "";
  };

                   
  return (
      <Modal
      title="Create device group"
      close={closeFn}
      buttonRow={
        <>
        <Button
          appearance="positive"
          //className="u-no-margin--bottom mt-8"
          onClick={formik.submitForm}
          disabled={!(formik.isValid && formik.dirty)}
          loading={formik.isSubmitting}
        >
          Submit
        </Button>
        <Button onClick={closeFn}>Cancel</Button>
        </>
      }>
      {apiError && (
        <Notification severity="negative" title="Error">
          {apiError}
        </Notification>
      )}
      <Form>
        <Input
          id="name"
          label="Name"
          type="text"
          required
          stacked
          placeholder="default"
          {...formik.getFieldProps("name")}
          error={formik.touched.name ? formik.errors.name : null}
        />
        <Select
          id="network-slice"
          label="Network slice"
          required
          stacked
          value={getNetworkSliceValueAsString()}
          onChange={handleNetworkSliceChange}
          options={[
            {
              disabled: true,
              label: "Select an option",
              value: "",
            },
            ...networkSliceItems.map((networkSliceName) => ({
              label: networkSliceName,
              value: networkSliceName,
            })),
          ]}
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
          label="MTU"
          type="number"
          required
          stacked
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
          <legend>QOS</legend>
          <Select
              id="5qi"
              label="5QI"
              required
              stacked
              defaultValue=""
              onChange={handle5QIChange}
              options={[
                {
                  disabled: true,
                  label: "Select an option",
                  value: "",
                },
                {
                  disabled: false,
                  label: "1: GBR - Conversational Voice",
                  value: "1",
                },
                {
                  disabled: false,
                  label: "2: GBR - Conversational Video",
                  value: "2",
                },
                {
                  disabled: false,
                  label: "9: Non-GBR",
                  value: "9",
                },
              ]}
          />
          <Select
              id="arp"
              label="ARP"
              required
              stacked
              defaultValue={6}
              onChange={handleARPChange}
              options={[
                {
                  disabled: true,
                  label: "Select an option",
                  value: "",
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
}

type editDeviceGroupActionModalProps = {
  deviceGroup: DeviceGroup
  networkSliceName: string
  closeFn: () => void
}

export function EditDeviceGroupModal({ deviceGroup, networkSliceName, closeFn }: editDeviceGroupActionModalProps) {
  const auth = useAuth()
  const [apiError, setApiError] = useState<string | null>(null);
  const queryClient = useQueryClient()

  const formik = useFormik<DeviceGroupValues>({
    initialValues: {
      name: deviceGroup["group-name"] || "",
      networkSlice: networkSliceName,
      ueIpPool: deviceGroup["ip-domain-expanded"]?.["ue-ip-pool"] || "",
      dns: deviceGroup["ip-domain-expanded"]?.["dns-primary"] || "8.8.8.8",
      mtu: deviceGroup["ip-domain-expanded"]?.["mtu"] || 1456,
      MBRDownstreamMbps: deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["dnn-mbr-downlink"] / 1_000_000 || null,
      MBRUpstreamMbps: deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["dnn-mbr-uplink"] / 1_000_000 || null,
      Qos5qi: "",
      QosArp: 0,
    },
    validationSchema: DeviceGroupSchema,
    onSubmit: async (values) => {
      const MBRUpstreamBps = Number(values.MBRUpstreamMbps) * 1000000;
      const MBRDownstreamBps = Number(values.MBRDownstreamMbps) * 1000000;
      try {
        await editDeviceGroup({
            name: values.name,
            ueIpPool: values.ueIpPool,
            dns: values.dns,
            mtu: values.mtu,
            MBRUpstreamBps: MBRUpstreamBps,
            MBRDownstreamBps: MBRDownstreamBps,
            token: auth.user ? auth.user.authToken : ""
          });
        closeFn()
        await queryClient.invalidateQueries({ queryKey: ['device-groups'] })
      }
      catch (error) {
        console.error(error);
        setApiError(
          (error as Error).message || "An unexpected error occurred.",
        );
      }
    },
  });

  const handle5QIChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      void formik.setFieldValue("5qi", event.target.value);
  };
  const handleARPChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    void formik.setFieldValue("arp", event.target.value);
  };
   
  return (
      <Modal
      title={"Edit device group: " + `${deviceGroup["group-name"]}`}
      close={closeFn}
      buttonRow={
        <>
        <Button
          appearance="positive"
          //className="u-no-margin--bottom mt-8"
          onClick={formik.submitForm}
          disabled={!(formik.isValid && formik.dirty)}
          loading={formik.isSubmitting}
        >
          Submit
        </Button>
        <Button onClick={closeFn}>Cancel</Button>
        </>
      }>
      {apiError && (
        <Notification severity="negative" title="Error">
          {apiError}
        </Notification>
      )}
      <Form>
        <Input
          id="name"
          label="Name"
          type="text"
          required
          stacked
          disabled
          placeholder="default"
          {...formik.getFieldProps("name")}
          error={formik.touched.name ? formik.errors.name : null}
        />
        <Input
          id="network-slice"
          label="Network slice"
          type="text"
          required
          stacked
          disabled
          {...formik.getFieldProps("networkSlice")}
          error={formik.touched.networkSlice ? formik.errors.networkSlice : null}
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
          label="MTU"
          type="number"
          required
          stacked
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
          <legend>QOS</legend>
          <Select
              id="5qi"
              label="5QI"
              required
              stacked
              defaultValue=""
              onChange={handle5QIChange}
              options={[
                {
                  disabled: true,
                  label: "Select an option",
                  value: "",
                },
                {
                  disabled: false,
                  label: "1: GBR - Conversational Voice",
                  value: "1",
                },
                {
                  disabled: false,
                  label: "2: GBR - Conversational Video",
                  value: "2",
                },
                {
                  disabled: false,
                  label: "9: Non-GBR",
                  value: "9",
                },
              ]}
          />
          <Select
              id="arp"
              label="ARP"
              required
              stacked
              defaultValue={6}
              onChange={handleARPChange}
              options={[
                {
                  disabled: true,
                  label: "Select an option",
                  value: "",
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
}


type deviceGroupDeleteActionModalProps = {
  deviceGroupName: string
  networkSliceName: string
  subscribers: string[]
  //closeFn: () => void
}
export function DeleteDeviceGroupButton({ deviceGroupName, networkSliceName, subscribers }: deviceGroupDeleteActionModalProps) {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const handleConfirmDelete = async (name: string, networkSliceName: string) => {
    await deleteDeviceGroup({
      name,
      networkSliceName,
      token: auth.user ? auth.user.authToken : ""
    });
    await queryClient.invalidateQueries({ queryKey: ['device-groups'] });
    await queryClient.invalidateQueries({ queryKey: ['network-slices'] });
  };

  const deleteIcon = <DeleteOutlinedIcon
      className="device-group-action-button"
  />
  if (subscribers && subscribers.length > 0) {
    return (
      <ConfirmationButton
        appearance="base"
        className="u-no-margin--bottom is-small"
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
              {subscribers.join(", ")}.
            </p>
          ),
        }}
      >
        {deleteIcon}
      </ConfirmationButton>
    )
  }
  return (
    <ConfirmationButton
      appearance="base"
      className="u-no-margin--bottom is-small"
      shiftClickEnabled
      showShiftClickHint
      title="Delete device group"
      confirmationModalProps={{
        title: `Delete device group ${deviceGroupName}`,
        confirmButtonLabel: "Delete",
        onConfirm: () => handleConfirmDelete(deviceGroupName, networkSliceName),
        children: (
          <p>
            This will permanently delete the device group <b>{deviceGroupName}</b>.
            <br />
            You cannot undo this action.
          </p>
        ),
      }}
    >
      {deleteIcon}
    </ConfirmationButton>
  )
}