import React, { useEffect, useState } from "react";
import {
  Input,
  Notification,
  Modal,
  Form,
  Select,
  ActionButton,
} from "@canonical/react-components";
import { createNetworkSlice } from "@/utils/createNetworkSlice";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/utils/queryKeys";
import { getUpfList, UpfItem } from "@/utils/getUpfList";
import { getGnbList, GnbItem } from "@/utils/getGnbList";
import { useFormik } from "formik";
import * as Yup from "yup";

interface NetworkSliceValues {
  mcc: string;
  mnc: string;
  name: string;
  upf: UpfItem;
  gnbList: GnbItem[];
}

interface NetworkSliceModalProps {
  toggleModal: () => void;
}

const CreateNetworkSliceModal = ({ toggleModal }: NetworkSliceModalProps) => {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);
  const [upfApiError, setUpfApiError] = useState<string | null>(null);
  const [gnbApiError, setGnbApiError] = useState<string | null>(null);

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
      .required("Selecting a UPF is required."),
    gnbList: Yup.array()
      .min(1)
      .required("Selecting at least 1 gNodeB is required."),
  });

  const formik = useFormik<NetworkSliceValues>({
    initialValues: {
      mcc: "",
      mnc: "",
      name: "",
      upf: {} as UpfItem,
      gnbList: [],
    },
    validationSchema: NetworkSliceSchema,
    onSubmit: async (values) => {
      try {
        await createNetworkSlice({
          name: values.name,
          mcc: values.mcc.toString(),
          mnc: values.mnc.toString(),
          upfName: values.upf.hostname,
          upfPort: values.upf.port,
          gnbList: values.gnbList,
        });
        await queryClient.invalidateQueries({
          queryKey: [queryKeys.networkSlices],
        });
        toggleModal();
      } catch (error) {
        console.error(error);
        setApiError(
          (error as Error).message ||
            "An unexpected error occurred. Please try again.",
        );
      }
    },
  });

  const { data: upfList = [], isLoading: isUpfLoading } = useQuery({
    queryKey: [queryKeys.upfList],
    queryFn: getUpfList,
  });

  useEffect(() => {
    const checkUpfList = async () => {
      if (!isUpfLoading && upfList.length === 0) {
        setUpfApiError("Failed to retrieve the list of UPFs from the server.");
      }
    };
    checkUpfList();
  }, [isUpfLoading, upfList]);

  const { data: gnbList = [], isLoading: isGnbLoading } = useQuery({
    queryKey: [queryKeys.gnbList],
    queryFn: getGnbList,
  });

  useEffect(() => {
    const checkGnbList = async () => {
      if (!isGnbLoading && gnbList.length === 0) {
        setGnbApiError("Failed to retrieve the list of GNBs from the server.");
      }
    };
    checkGnbList();
  }, [isGnbLoading, gnbList]);

  const handleUpfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const upf = upfList.find(
      (item) => e.target.value === `${item.hostname}:${item.port}`,
    );
    void formik.setFieldValue("upf", upf);
  };

  const handleGnbChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const items = gnbList.filter((item) =>
      selectedOptions.some(
        (option) => option.value === `${item.name}:${item.tac}`,
      ),
    );
    void formik.setFieldValue("gnbList", items);
  };

  return (
    <Modal
      title="Create Network Slice"
      close={toggleModal}
      buttonRow={
        <ActionButton
          appearance="positive"
          className="u-no-margin--bottom mt-8"
          onClick={formik.submitForm}
          disabled={!(formik.isValid && formik.dirty)}
          loading={formik.isSubmitting}
        >
          Create
        </ActionButton>
      }
    >
      {apiError && (
        <Notification severity="negative" title="Error">
          {apiError}
        </Notification>
      )}
      {upfApiError && (
        <Notification severity="negative" title="Error">
          {upfApiError}
        </Notification>
      )}
      {gnbApiError && (
        <Notification severity="negative" title="Error">
          {gnbApiError}
        </Notification>
      )}
      <Form>
        <Input
          type="text"
          id="name"
          label="Name"
          placeholder="default"
          stacked
          required
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
          {...formik.getFieldProps("mnc")}
          error={formik.touched.mnc ? formik.errors.mnc : null}
        />
        <Select
          defaultValue=""
          id="upf"
          label="UPF"
          stacked
          required
          onChange={handleUpfChange}
          options={[
            {
              disabled: true,
              label: "Select an option",
              value: "",
            },
            ...upfList.map((upf) => ({
              label: `${upf.hostname}:${upf.port}`,
              value: `${upf.hostname}:${upf.port}`,
            })),
          ]}
        />
        <Select
          id="gnb"
          stacked
          required
          options={[
            {
              value: "",
              disabled: true,
              label: "Select...",
            },
            ...gnbList.map((gnb) => ({
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

export default CreateNetworkSliceModal;
