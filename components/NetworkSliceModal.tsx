import React, { useState } from "react";
import {
  Input,
  Notification,
  Modal,
  Form,
  Select,
  ActionButton,
} from "@canonical/react-components";
import { NetworkSlice } from "@/components/types";
import { createNetworkSlice } from "@/utils/createNetworkSlice";
import { editNetworkSlice } from "@/utils/editNetworkSlice";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/utils/queryKeys";
import { getUpfList, UpfItem } from "@/utils/getUpfList";
import { getGnbList, GnbItem } from "@/utils/getGnbList";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/utils/auth";

interface NetworkSliceValues {
  mcc: string;
  mnc: string;
  name: string;
  upf: UpfItem;
  gnbList: GnbItem[];
}

interface NetworkSliceModalProps {
  networkSlice?: NetworkSlice,
  toggleModal: () => void,
  onSave?: (newSlice: NetworkSlice) => void
}

const NetworkSliceModal = ({ networkSlice, toggleModal, onSave }: NetworkSliceModalProps) => {
  const auth = useAuth()
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);
  const [gnbApiError, setGnbApiError] = useState<string | null>(null);
  const [upfApiError, setUpfApiError] = useState<string | null>(null);

  const NetworkSliceSchema = Yup.object().shape({
    name: Yup.string()
      .min(1)
      .max(20, "Name should not exceed 20 characters")
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
      .shape({ hostname: Yup.string().required("Please select a UPF.") })
      .shape({ port: Yup.string().required("Please select a UPF.") })
      .required("Selecting a UPF is required."),
    gnbList: Yup.array()
        .of(
            Yup.object().shape({
              name: Yup.string().required("gNodeB name is required."),
              tac: Yup.string().required("gNodeB TAC is required."),
            })
        )
        .min(1, "Selecting at least 1 gNodeB is required."),
  });

  const modalTitle = () => {
      return networkSlice?.["slice-name"] ? ("Edit Network Slice: " + networkSlice?.["slice-name"]) : "Create Network Slice"
  }

  const buttonText = () => {
    return networkSlice ? "Save Changes" : "Create"
  }

  const getUpfFromNetworkSlice = () => {
    if (networkSlice) {
      return {
        hostname: networkSlice["site-info"]?.["upf"]?.["upf-name"] ?? "",
        port: networkSlice["site-info"]?.["upf"]?.["upf-port"] ?? "",
      };
    } else {
      return {} as UpfItem;
    }
  }

  const formik = useFormik<NetworkSliceValues>({
    initialValues: {
      mcc: networkSlice?.["site-info"]["plmn"].mcc || "",
      mnc: networkSlice?.["site-info"]["plmn"].mnc || "",
      name: networkSlice?.["slice-name"] || "",
      upf: getUpfFromNetworkSlice(),
      gnbList: networkSlice?.["site-info"].gNodeBs || [],
    },
    validationSchema: NetworkSliceSchema,
    onSubmit: async (values) => {
      try {
        if (upfItems.length === 0) {
          setUpfApiError("No available UPF. Please add at least one UPF.");
          return;
        }
        if (gnbItems.length === 0) {
          setGnbApiError("No available GNB. Please add at least one GNB.");
          return;
        }
        if (networkSlice) {
          await editNetworkSlice({
            name: values.name,
            mcc: values.mcc.toString(),
            mnc: values.mnc.toString(),
            upfName: values.upf.hostname,
            upfPort: values.upf.port,
            gnbList: values.gnbList,
            token: auth.user ? auth.user.authToken : ""
          });
        } else {
          await createNetworkSlice({
            name: values.name,
            mcc: values.mcc.toString(),
            mnc: values.mnc.toString(),
            upfName: values.upf.hostname,
            upfPort: values.upf.port,
            gnbList: values.gnbList,
            token: auth.user ? auth.user.authToken : ""
          });
        }
        await queryClient.invalidateQueries({
          queryKey: [queryKeys.networkSlices, auth.user?.authToken ?? ""], refetchActive: true,
        });
        // Invalidate queries does not work in the first slice creation.
        // Hence, window is reloaded.
        window.location.reload();
        toggleModal();
      } catch (error) {
        console.error(error);
        setApiError(
          (error as Error).message || "An unexpected error occurred.",
        );
      }
    },
  });

  const upfQuery = useQuery({
    queryKey: [queryKeys.upfList, auth.user?.authToken],
    queryFn: () => getUpfList(auth.user!.authToken),
    enabled: auth.user ? true : false
  });

  const gnbQuery = useQuery({
    queryKey: [queryKeys.gnbList, auth.user?.authToken],
    queryFn: () => getGnbList(auth.user!.authToken),
    enabled: auth.user ? true : false
  });

  const upfItems = (upfQuery.data as UpfItem[]) || [];
  const gnbItems = (gnbQuery.data as GnbItem[]) || [];

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

  const ErrorNotification = ({
    error,
  }: {
    error: string | null;
  }) => {
    return error ? (
        <Notification severity="negative" title="Error">
          {error}
        </Notification>
    ) : null;
  };

  if (upfQuery.isLoading || gnbQuery.isLoading) {
    return (
        <Notification severity="information" title="Loading...">
          Fetching data...
        </Notification>
    );
  }

  if (upfQuery.isError) {
    return (
        <Notification severity="negative" title="Error">
          Failed to retrieve the list of UPFs from the server.
        </Notification>
    );
  }

  if (gnbQuery.isError) {
    return (
        <Notification severity="negative" title="Error">
          Failed to retrieve the list of gNodeBs from the server.
        </Notification>
    );
  }

  return (
    <Modal
      title={modalTitle()}
      close={toggleModal}
      buttonRow={
        <ActionButton
          appearance="positive"
          className="u-no-margin--bottom mt-8"
          onClick={formik.submitForm}
          disabled={!(formik.isValid && formik.dirty)}
          loading={formik.isSubmitting}
        >
          {buttonText()}
        </ActionButton>
      }
    >
      {apiError && <ErrorNotification error={apiError} />}
      {upfApiError && <ErrorNotification error={upfApiError} />}
      {gnbApiError && <ErrorNotification error={gnbApiError} />}
      <Form>
        <Input
          type="text"
          id="name"
          label="Name"
          placeholder="default"
          stacked
          required
          disabled={networkSlice ? true : false}
          {...formik.getFieldProps("name")}
          error={formik.touched.name ? formik.errors.name : null}
        />
        <Input
          type="text"
          id="mcc"
          label="MCC"
          help="Mobile Country Code"
          placeholder="001"
          stacked
          required
          disabled={networkSlice ? true : false} // Workaround for https://github.com/omec-project/webconsole/issues/200
          {...formik.getFieldProps("mcc")}
          error={formik.touched.mcc ? formik.errors.mcc : null}
        />
        <Input
          type="text"
          id="mnc"
          label="MNC"
          help="Mobile Network Code (2 or 3 digits)"
          placeholder="01"
          stacked
          required
          disabled={networkSlice ? true : false} // Workaround for https://github.com/omec-project/webconsole/issues/200
          {...formik.getFieldProps("mnc")}
          error={formik.touched.mnc ? formik.errors.mnc : null}
        />
        <Select
          id="upf"
          label="UPF"
          stacked
          required
          value={getUpfValueAsString()}
          onChange={handleUpfChange}
          options={[
            {
              disabled: true,
              label: "Select an option",
              value: "",
            },
            ...upfItems.map((upf) => ({
              label: `${upf.hostname}:${upf.port}`,
              value: `${upf.hostname}:${upf.port}`,
            })),
          ]}
        />
        <Select
          id="gnb"
          stacked
          required
          value={getGnbListValueAsString()}
          options={[
            {
              value: "",
              disabled: true,
              label: "Select...",
            },
            ...gnbItems.map((gnb) => ({
              label: `${gnb.name} (tac:${gnb.tac})`,
              value: `${gnb.name}:${gnb.tac}`,
            })),
          ]}
          label="gNodeBs"
          onChange={handleGnbChange}
          multiple
        />
      </Form>
    </Modal>
  );
};

export default NetworkSliceModal;
