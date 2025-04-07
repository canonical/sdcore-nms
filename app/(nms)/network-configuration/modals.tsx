import { apiGetAllDeviceGroupNames } from "@/utils/deviceGroupOperations";
import { Button, Form, Input, ConfirmationButton, Modal, Select } from "@canonical/react-components"
import { createNetworkSlice, editNetworkSlice, deleteNetworkSlice } from "@/utils/networkSliceOperations";
import { getGnbList } from "@/utils/gnbOperations";
import { getUpfList } from "@/utils/upfOperations";
import { GnbItem, NetworkSlice, UpfItem } from "@/components/types";
import { queryKeys } from "@/utils/queryKeys";
import { useAuth } from "@/utils/auth"
import { useFormik } from "formik";
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { OperationError, is401UnauthorizedError}  from "@/utils/errors";

import * as Yup from "yup";
import ErrorNotification from "@/components/ErrorNotification";


interface NetworkSliceFormValues {
  name: string;
  mcc: string;
  mnc: string;
  sst: string;
  upf: UpfItem;
  gnbList: GnbItem[];
}

const NetworkSliceSchema = Yup.object().shape({
    name: Yup.string()
      .min(1)
      .max(20, "Name must not exceed 20 characters")
      .matches(/^[a-zA-Z][a-zA-Z0-9-_]+$/, {
        message: (
          <>
            Name must start with a letter. <br />
            Only alphanumeric characters, dashes, and underscores.
          </>
        ),
        })
      .required("Name is required."),
    mcc: Yup.string()
      .matches(/^\d{3}$/, "MCC must be 3 digits.")
      .length(3)
      .required("MCC is required."),
    mnc: Yup.string()
      .matches(/^\d{2,3}$/, "MNC must be 2 or 3 digits.")
      .min(2)
      .max(3)
      .required("MNC is required."),
    sst: Yup.string()
      .required("SST is required."),
    upf: Yup.object()
      .shape({ hostname: Yup.string().required("A UPF hostname is required.") })
      .shape({ port: Yup.string().required("A UPF port is required.") })
      .required("Selecting a UPF is required."),
    gnbList: Yup.array()
      .required("Selecting at least 1 gNodeB is required.")
      .of(
          Yup.object().shape({
            name: Yup.string().required("gNodeB name is required."),
            tac: Yup.string().required("gNodeB TAC is required."),
          })
      )
      .min(1)
  });

interface NetworkSliceModalProps {
  title: string;
  initialValues: NetworkSliceFormValues;
  isEdit?: boolean;
  onSubmit: (values: any) => void;
  closeFn: () => void
}

export const NetworkSliceModal: React.FC<NetworkSliceModalProps> = ({
  title,
  initialValues,
  isEdit = false,
  onSubmit,
  closeFn,
}) => {
  const auth = useAuth()
  const [apiError, setApiError] = useState<string | null>(null);
  const [gnbApiError, setGnbApiError] = useState<string | null>(null);
  const [upfApiError, setUpfApiError] = useState<string | null>(null);
  const queryClient = useQueryClient()

  const formik = useFormik<NetworkSliceFormValues>({
    initialValues,
    validationSchema: NetworkSliceSchema,
    onSubmit: async (values) => {
      try {
        await onSubmit({...values,});
        closeFn();
        setTimeout(async () => { // Wait 100 ms before invalidating due to a race condition
          await queryClient.invalidateQueries({ queryKey: [queryKeys.networkSlices] });
          await queryClient.invalidateQueries({ queryKey: [queryKeys.networkSliceNames] });
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

  const upfQuery = useQuery<UpfItem[], Error>({
    queryKey: [queryKeys.upfs, auth.user?.authToken],
    queryFn: () => getUpfList(auth.user!.authToken),
    enabled: auth.user ? true : false
  });

  const gnbsQuery = useQuery<GnbItem[], Error>({
    queryKey: [queryKeys.gnbs, auth.user?.authToken],
    queryFn: () => getGnbList(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
  })

  const upfItems = upfQuery.data || [] as UpfItem[];
  const gnbItems = gnbsQuery.data || [] as GnbItem[];

  if (upfQuery.isError) {
    setUpfApiError("Failed to retrieve UPFs.");
  }
  if (!upfQuery.isLoading && upfItems.length === 0 && !upfApiError) {
    setUpfApiError("No UPF available. Please register at least one UPF.");
  }

  if (gnbsQuery.isError) {
    setGnbApiError("Failed to retrieve gNodeBs.");
  }
  if (!gnbsQuery.isLoading && gnbItems.length === 0 && !gnbApiError) {
    setGnbApiError("No gNodeB available. Please register at least one gNodeB.");
  }

  const handleUpfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const upf = upfItems.find((item: UpfItem) => e.target.value === `${item.hostname}:${item.port}`);
    void formik.setFieldValue("upf", upf);
  };

  const getUpfValueAsString = () => {
    return formik.values.upf?.hostname ? `${formik.values.upf.hostname}:${formik.values.upf.port}` : "";
  };

  const handleGnbChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValues = Array.from(e.target.selectedOptions, (option) => option.value);
    const selectedGnbItems = selectedValues.map((value) => {
      const [name, tac] = value.split(":");
      return { name, tac: Number(tac) };
    });
    formik.setFieldValue("gnbList", selectedGnbItems);
  };

  return (
    <Modal
      title={ title }
      close={ closeFn }
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
      }
    >
      {apiError && <ErrorNotification error={apiError} />}
      {upfApiError && <ErrorNotification error={upfApiError} />}
      {gnbApiError && <ErrorNotification error={gnbApiError} />}
      <Form>
        <Input
          id="name"
          label="Name"
          type="text"
          required
          stacked
          disabled={ isEdit }
          placeholder="default"
          {...formik.getFieldProps("name")}
          error={formik.touched.name ? formik.errors.name : null}
        />
        <Input
          id="mcc"
          label="MCC"
          help="Mobile Country Code"
          type="text"
          required
          stacked
          placeholder="001"
          disabled={ isEdit }
          {...formik.getFieldProps("mcc")}
          error={formik.touched.mcc ? formik.errors.mcc : null}
        />
        <Input
          id="mnc"
          label="MNC"
          help="Mobile Network Code (2 or 3 digits)"
          type="text"
          required
          stacked
          placeholder="01"
          disabled={ isEdit }
          {...formik.getFieldProps("mnc")}
          error={formik.touched.mnc ? formik.errors.mnc : null}
        />
        <Select
          id="sst"
          label="SST"
          required
          stacked
          disabled={true}
          onChange={(event) => formik.setFieldValue("sst", event.target.value)}
          value={formik.values.sst}
          options={[
            {
              label: "Select an option",
              disabled: true,
              value: "",
            },
            {
              label: "1: eMBB",
              value: "1",
            },
          ]}
        />
                <Select
          id="upf"
          label="UPF"
          required
          stacked
          value={ getUpfValueAsString() }
          onChange={ handleUpfChange }
          options={[
            {
              label: "Select an option",
              disabled: true,
              value: "",
            },
            ...upfItems.map((upf) => ({
              label: `${upf.hostname}:${upf.port}`,
              value: `${upf.hostname}:${upf.port}`,
            })),
          ]}
        />
        <Select
          id="gnbList"
          label="gNodeBs"
          help="If gNB does not appear in the list, please check that a TAC is associated to it"
          required
          stacked
          multiple
          value={ formik.values.gnbList.map((gnb) => `${gnb.name}:${gnb.tac}`) }
          onChange={ handleGnbChange }
          options={[
            {
              label: "Select...",
              disabled: true,
              value: "",
            },
            ...gnbItems.filter( gnb => gnb.tac ).map((gnb) => ({
              label: `${gnb.name} (TAC: ${gnb.tac})`,
              value: `${gnb.name}:${gnb.tac}`,
            })),
          ]}
        />
      </Form>
    </Modal>
  );
};


type createNewNetworkSliceModalProps = {
  closeFn: () => void
}

export function CreateNetworkSliceModal({ closeFn }: createNewNetworkSliceModalProps) {
  const auth = useAuth()
  const handleSubmit = async (values: NetworkSliceFormValues) => {
    await createNetworkSlice({
      name: values.name,
      mcc: values.mcc.toString(),
      mnc: values.mnc.toString(),
      sst: values.sst,
      upf: values.upf,
      gnbList: values.gnbList,
      token: auth.user ? auth.user.authToken : ""
    });
  };

  const initialValues: NetworkSliceFormValues = {
    name: "",
    mcc: "",
    mnc: "",
    sst: "1",
    upf: {} as UpfItem,
    gnbList: [] as GnbItem[],
  };

  return (
    <>
      <NetworkSliceModal
        title="Create network slice"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        closeFn={closeFn}
      />
    </>
  );
};

type editNetworkSliceModalProps = {
  networkSlice: NetworkSlice
  closeFn: () => void
}

export function EditNetworkSliceModal({ networkSlice, closeFn }: editNetworkSliceModalProps) {
  const auth = useAuth()
  const handleSubmit = async (values: NetworkSliceFormValues) => {
    await editNetworkSlice({
        name: values.name,
        mcc: values.mcc.toString(),
        mnc: values.mnc.toString(),
        sst: values.sst,
        upf: values.upf,
        gnbList: values.gnbList,
        token: auth.user ? auth.user.authToken : ""
      });
  };
  const getUpfFromNetworkSlice = () => {
    return {
      hostname: networkSlice["site-info"]?.["upf"]?.["upf-name"] || "",
      port: networkSlice["site-info"]?.["upf"]?.["upf-port"] || "",
    };
  }

  const initialValues: NetworkSliceFormValues = {
    name: networkSlice?.["slice-name"] || "",
    mcc: networkSlice?.["site-info"]?.["plmn"]?.mcc || "",
    mnc: networkSlice?.["site-info"]?.["plmn"]?.mnc || "",
    sst: networkSlice["slice-id"]?.sst || "1",
    upf: getUpfFromNetworkSlice(),
    gnbList: networkSlice?.["site-info"]?.gNodeBs || [],
  };

  return (
    <>
      <NetworkSliceModal
        title={"Edit network slice: " + `${networkSlice["slice-name"]}`}
        initialValues={initialValues}
        isEdit={true}
        onSubmit={handleSubmit}
        closeFn={closeFn}
      />
    </>
  );
}

type deleteNetworkSliceModalProps = {
  networkSliceName: string
  deviceGroups: string[]
}

export const DeleteNetworkSliceButton: React.FC<deleteNetworkSliceModalProps> = ({
  networkSliceName,
  deviceGroups,
}) => {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const handleConfirmDelete = async (name: string) => {
    try {
      await deleteNetworkSlice(name, auth.user ? auth.user.authToken : "");
    } catch (error) {
      if (is401UnauthorizedError(error)) { auth.logout(); }
    }
    setTimeout(async () => { // Wait 100 ms before invalidating due to a race condition
      await queryClient.invalidateQueries({ queryKey: [queryKeys.networkSlices] });
      await queryClient.invalidateQueries({ queryKey: [queryKeys.networkSliceNames] });
    }, 100);
  };

  const deviceGroupQuery = useQuery<string[], Error>({
    queryKey: [queryKeys.deviceGroupNames, auth.user?.authToken],
    queryFn: () => apiGetAllDeviceGroupNames(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
  })

  if (deviceGroupQuery.status == "error" && is401UnauthorizedError(deviceGroupQuery.error)) {
    auth.logout();
  }

  const existingDeviceGroups = deviceGroupQuery.data || [];
  const filteredDeviceGroups = () => {
    const deviceSet = new Set(existingDeviceGroups);
    return deviceGroups.filter(deviceGroup => deviceSet.has(deviceGroup));
  }

  if (deviceGroups && filteredDeviceGroups().length > 0) {
    return (
      <ConfirmationButton
        appearance="negative"
        className="u-no-margin--bottom"
        title="Delete network slice"
        confirmationModalProps={{
          title: "Warning",
          confirmButtonLabel: "Delete",
          buttonRow: (null),
          onConfirm: () => { },
          children: (
            <p>
              Network slice <b>{networkSliceName}</b> cannot be deleted.
              <br />
              Please remove the following device groups first:
              <br />
              {filteredDeviceGroups().join(", ")}.
            </p>
          ),
        }}
      >
        Delete
      </ConfirmationButton>
    )
  }
  return (
    <ConfirmationButton
      appearance="negative"
      className="u-no-margin--bottom"
      shiftClickEnabled
      showShiftClickHint
      title="Delete network slice"
      confirmationModalProps={{
        title: `Delete network slice ${networkSliceName}`,
        confirmButtonLabel: "Delete",
        onConfirm: () => handleConfirmDelete(networkSliceName),
        children: (
          <p>
            This will permanently delete the network slice <b>{networkSliceName}</b>.
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
