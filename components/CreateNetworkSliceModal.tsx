import React, { useEffect, useState } from "react";
import {
  Input,
  Notification,
  Modal,
  Form,
  Select, ActionButton,
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

const CreateNetworkSliceModal = ({
  toggleModal,
}: NetworkSliceModalProps) => {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);
  const [upfApiError, setUpfApiError] = useState<string | null>(null);
  const [gnbApiError, setGnbApiError] = useState<string | null>(null);

  const NetworkSliceSchema = Yup.object().shape({
    name: Yup.string().min(1).max(20, "Name should not exceed 20 characters")
      .matches(/^[a-zA-Z0-9-_]+$/, { message: 'Only alphanumeric characters, dashes and underscores.'})
      .required("Name is required."),
    mcc: Yup.string().length(3).required("MCC must be exactly 3 digits"),
    mnc: Yup.string().min(2).max(3).required("MNC must be 2 or 3 digits"),
    upf: Yup.object().shape({hostname: Yup.string().required("Please select a UPF")}).required("Please select a UPF."),
    gnbList: Yup.array().min(1).required("Please select at least one gNodeB."),
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
        await queryClient.invalidateQueries({ queryKey: [queryKeys.networkSlices] });
        toggleModal();
      } catch (error) {
        console.error(error);
        setApiError((error as Error).message || "An unexpected error occurred.");
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
    const upf = upfList.find((item) => e.target.value === `${item.hostname}:${item.port}`);
    void formik.setFieldValue("upf", upf);
  }

  const handleGnbChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const items = gnbList.filter((item) => selectedOptions.some((option) => option.value === `${item.name}:${item.tac}`));
    void formik.setFieldValue("gnbList", items);
  };

  return (
    <Modal
      title="Create Network Slice"
      close={toggleModal}
      buttonRow={
        <ActionButton
          appearance="positive"
          className="mt-8 u-no-margin--bottom"
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
          type="number"
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
          type="number"
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
