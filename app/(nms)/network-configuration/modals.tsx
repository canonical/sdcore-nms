import { Button, Form, Input, ConfirmationButton, Modal, Notification, Select } from "@canonical/react-components"
import { useAuth } from "@/utils/auth"
import { useFormik } from "formik";
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { WebconsoleApiError, OperationError}  from "@/utils/errors";

import * as Yup from "yup";
import { apiGetAllNetworkSlices, createNetworkSlice, editNetworkSlice, deleteNetworkSlice } from "@/utils/networkSliceOperations";

import { GnbItem, NetworkSlice, UpfItem } from "@/components/types";
import { getUpfList } from "@/utils/getUpfList";
import { getGnbList } from "@/utils/getGnbList";


const ErrorNotification = ({ error }: { error: string | null; }) => {
  return error ? (
      <Notification severity="negative" title="Error">
        {error}
      </Notification>
  ) : null;
};

interface NetworkSliceFormValues {
  name: string;
  mcc: string;
  mnc: string;
  upf: UpfItem;
  gnbList: GnbItem[];
}

const NetworkSliceSchema = Yup.object().shape({
    name: Yup.string()
      .min(1)
      .max(20, "Name must not exceed 20 characters")
      .matches(/^[a-zA-Z0-9-_]+$/, {
        message: "Only alphanumeric characters, dashes and underscores.",
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
  const [networkSliceError, setNetworkSliceError] = useState<string | null>(null);
  const queryClient = useQueryClient()

  const formik = useFormik<NetworkSliceFormValues>({
    initialValues,
    validationSchema: NetworkSliceSchema,
    onSubmit: async (values) => {
      try {
        await onSubmit({...values,});
        closeFn();
        setTimeout(async () => { // Wait 100 ms before invalidating due to a race condition
          await queryClient.invalidateQueries({ queryKey: ['network-slices'] });
        }, 100);
      } catch (error) {
        if (error instanceof WebconsoleApiError && error.status === 401) {
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
    queryKey: ['network-slice', auth.user?.authToken],
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

  const upfQuery = useQuery<UpfItem[], Error>({
    queryKey: ['upfs'],
    queryFn: () => getUpfList(auth.user!.authToken),
    enabled: auth.user ? true : false
  });

  const gnbsQuery = useQuery<GnbItem[], Error>({
    queryKey: ['gnbs'],
    queryFn: () => getGnbList(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
  })

  const upfItems = upfQuery.data  || [];
  const gnbItems = gnbsQuery.data || [];

  if (upfQuery.isError) {
    setUpfApiError("Failed to retrieve UPFs.");
  }
  else if (!upfQuery.isLoading && upfItems.length === 0) {
    setUpfApiError("No UPF available. Please register at least one UPF.");
  }

  if (gnbsQuery.isError) {
    setGnbApiError("Failed to retrieve gNodeBs.");
  }
  else if (!gnbsQuery.isLoading && gnbItems.length === 0) {
    setGnbApiError("No gNodeB available. Please register at least one gNodeB.");
  }

  const handleUpfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const upf = upfItems.find((item: UpfItem) => e.target.value === `${item.hostname}:${item.port}`);
    void formik.setFieldValue("upf", upf);
  };

  const handleGnbChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gnb = gnbItems.find((item: GnbItem) => e.target.value === `${item.name}:${item.tac}`);
    void formik.setFieldValue("gnbList", [...formik.values.gnbList, gnb]);
  };

  const getGnbListValueAsString = () => {
    return (formik.values.gnbList.map((item) => {
      return `${item.name}:${item.tac}`
    }));
  };

  const getUpfValueAsString = () => {
    return formik.values.upf.hostname ? `${formik.values.upf.hostname}:${formik.values.upf.port}` : "";
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
          disabled={ isEdit } // Workaround for https://github.com/omec-project/webconsole/issues/200
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
          disabled={ isEdit } // Workaround for https://github.com/omec-project/webconsole/issues/200
          {...formik.getFieldProps("mnc")}
          error={formik.touched.mnc ? formik.errors.mnc : null}
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
          required
          stacked
          multiple
          value={ getGnbListValueAsString() }
          onChange={ handleGnbChange }
          options={[
            {
              label: "Select...",
              disabled: true,
              value: "",
            },
            ...gnbItems.map((gnb) => ({
              label: `${gnb.name} (tac:${gnb.tac})`,
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
      upf: values.upf,
      gnbList: values.gnbList,
      token: auth.user ? auth.user.authToken : ""
    });
  };

  const initialValues: NetworkSliceFormValues = {
    name: "",
    mcc: "",
    mnc: "",
    upf: {} as UpfItem,
    gnbList: [],
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
        upf: values.upf,
        gnbList: values.gnbList,
        token: auth.user ? auth.user.authToken : ""
      });
  };
  const getUpfFromNetworkSlice = () => {
    if (networkSlice) {
      return {
        hostname: networkSlice["site-info"]?.["upf"]?.["upf-name"] || "",
        port: networkSlice["site-info"]?.["upf"]?.["upf-port"] || "",
      };
    } else {
      return {} as UpfItem;
    }
  }

  const initialValues: NetworkSliceFormValues = {
    name: networkSlice?.["slice-name"] || "",
    mcc: networkSlice?.["site-info"]?.["plmn"]?.mcc || "",
    mnc: networkSlice?.["site-info"]?.["plmn"]?.mnc || "",
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
    await deleteNetworkSlice(name, auth.user ? auth.user.authToken : "");

    setTimeout(async () => { // Wait 100 ms before invalidating due to a race condition
      await queryClient.invalidateQueries({ queryKey: ['network-slices'] });
    }, 100);
  };

  if (deviceGroups && deviceGroups.length > 0) {
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
              {deviceGroups.join(", ")}.
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
            This will permanently delete the netowork slice <b>{networkSliceName}</b>.
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
