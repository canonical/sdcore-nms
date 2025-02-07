import { UserEntry } from "@/components/types"
import { useAuth } from "@/utils/auth"
import { changePassword, deleteUser, postUser } from "@/utils/accountQueries"
import { passwordIsValid } from "@/utils/utils"
import { Button, Form, Input, Modal, Notification, PasswordToggle } from "@canonical/react-components"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChangeEvent, useState } from "react"
import { DeviceGroup } from "@/components/types";
import { createDeviceGroup } from "@/utils/createDeviceGroup";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Select,
  ActionButton,
} from "@canonical/react-components";

type createNewDeviceGroupModalProps = {
    closeFn: () => void
}

interface DeviceGroupValues {
    name: string;
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
  Qos5qi: Yup.string()
      .oneOf(["1", "2", "9"], "5QI must be either 1, 2, or 9")
      .required("5QI is required"),
  QosArp: Yup.number()
      .min(1)
      .max(15)
      .required("ARP is required"),
});


export function CreateUserModal({ closeFn }: createNewDeviceGroupModalProps) {
  const auth = useAuth()
  const [apiError, setApiError] = useState<string | null>(null);
  const queryClient = useQueryClient()
  const mutation = useMutation({
      mutationFn: postUser,
      onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setErrorText("")
      closeFn()
      },
      onError: (e: Error) => {
      setErrorText(e.message)
      }
  })
  const [username, setUsername] = useState<string>("")
  const [password1, setPassword1] = useState<string>("")
  const [password2, setPassword2] = useState<string>("")
  const passwordsMatch = password1 === password2
  const password1Error = password1 && !passwordIsValid(password1) ? "Password is not valid" : ""
  const password2Error = password2 && !passwordsMatch ? "Passwords do not match" : ""

  const [errorText, setErrorText] = useState<string>("")
  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => { setUsername(event.target.value) }
  const handlePassword1Change = (event: ChangeEvent<HTMLInputElement>) => { setPassword1(event.target.value) }
  const handlePassword2Change = (event: ChangeEvent<HTMLInputElement>) => { setPassword2(event.target.value) }
    

  const formik = useFormik<DeviceGroupValues>({
    initialValues: {
      name: "",
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
            networkSliceName: "test1",
            token: auth.user ? auth.user.authToken : ""
          });
        closeFn()
      }
        //onDeviceGroupAction(); // invalidate queries
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
      title="Create device group"
      close={closeFn}
      buttonRow={
        <>
        <Button
          appearance="positive"
          //className="u-no-margin--bottom mt-8"
          onClick={formik.submitForm} //re make
          disabled={!(formik.isValid && formik.dirty)} //re make
          //loading={formik.isSubmitting}
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
        <Input
          id="ue-ip-pool"
          label="Subscriber IP Pool"
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
          <legend>Maximum Bitrate (Mbps)</legend>
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
              //value={formik.values.Qos5qi}
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
              //value={formik.values.QosArp}
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