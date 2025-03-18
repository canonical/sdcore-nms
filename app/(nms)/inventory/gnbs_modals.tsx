import { Button, Form, Input, Modal } from "@canonical/react-components"
import { editGnb } from "@/utils/gnbOperations";
import { GnbItem } from "@/components/types";
import { useAuth } from "@/utils/auth";
import { queryKeys } from "@/utils/queryKeys";
import { useQueryClient } from "@tanstack/react-query"
import { useFormik } from "formik";
import { useState } from "react"
import { is401UnauthorizedError}  from "@/utils/errors";

import * as Yup from "yup";
import ErrorNotification from "@/components/ErrorNotification";


interface GnbFormValues {
    name: string;
    tac: number;
}

const GnbSchema = Yup.object().shape({
    name: Yup.string()
    .min(1)
    .max(32, "Name must not exceed 32 characters")
    .matches(/^[a-zA-Z][a-zA-Z0-9-_]+$/, {
    message: (
        <>
        Name must start with a letter. <br />
        Only alphanumeric characters, dashes, and underscores.
        </>
    ),
    })
    .required("Name is required."),
    tac: Yup.number()
        .typeError('Value should be between 1 and 16,777,215.')
        .min(1, "Value must be greater than or equal to 1.")
        .max(16777215, "Value must be less than or equal to 16,777,215.")
        .required("Value should be between 1 and 16,777,215."),
});

interface GnbModalProps {
    title: string;
    initialValues: GnbFormValues;
    onSubmit: (values: any) => void;
    closeFn: () => void
}

export const GnbModal: React.FC<GnbModalProps> = ({
    title,
    initialValues,
    onSubmit,
    closeFn,
  }) => {
    const auth = useAuth()
    const [apiError, setApiError] = useState<string | null>(null);
    const queryClient = useQueryClient()
  
    const formik = useFormik<GnbFormValues>({
      initialValues,
      validationSchema: GnbSchema,
      onSubmit: async (values) => {
        try {
          onSubmit({ ...values, });
          closeFn();
          setTimeout(async () => { // Wait 100 ms before invalidating due to a race condition
            await queryClient.invalidateQueries({ queryKey: [queryKeys.gnbs] });
          }, 100);
        } catch (error) {
          if (is401UnauthorizedError(error)) {
              auth.logout();
          } else {
            setApiError("An unexpected error occurred.");
          }
        }
      },
    });

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
        <Form>
          <Input
            id="name"
            label="Name"
            type="text"
            required
            stacked
            disabled
            placeholder="default-gnb"
            {...formik.getFieldProps("name")}
            error={formik.touched.name ? formik.errors.name : null}
          />
          <Input
            id="tac"
            label="TAC"
            help="Tracking Area Code"
            type="number"
            required
            stacked
            min={1}
            max={16777215}
            placeholder="1"
            {...formik.getFieldProps("tac")}
            error={formik.touched.tac ? formik.errors.tac : null}
          />
        </Form>
      </Modal>
    );
  };
  
  type editGnbModalProps = {
    gnb: GnbItem
    closeFn: () => void
  }
  
  export function EditGnbModal({ gnb, closeFn }: editGnbModalProps) {
    const auth = useAuth()
    const handleSubmit = async (values: GnbFormValues) => {
      await editGnb({
          name: values.name,
          tac: values.tac,
          token: auth.user ? auth.user.authToken : ""
        });
    };
  
    const initialValues: GnbFormValues = {
      name: gnb?.["name"] || "",
      tac: gnb?.["tac"],
    };
  
    return (
      <>
        <GnbModal
          title={"Edit gNB: " + `${gnb["name"]}`}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          closeFn={closeFn}
        />
      </>
    );
  }