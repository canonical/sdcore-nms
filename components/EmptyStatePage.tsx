import { FC, ReactNode } from "react";
import PageHeader from "@/components/PageHeader";
import PageContent from "@/components/PageContent";
import { EmptyState } from "@canonical/react-components"

interface Props {
  title: string;
  image?: string;
  message?: string;
  actionButton: ReactNode;
}

const EmptyStatePage: FC<Props> = ({ title, image = "", message = "", actionButton }) => {
  return (
    <>
      <PageHeader title={""}>
        <br />
      </PageHeader>
      <PageContent>
        <EmptyState image={image} title={title}>
          <br />
          <p>{message}</p>
          <>
          {actionButton}
          </>
        </EmptyState>
      </PageContent>
    </>
  );
};

export default EmptyStatePage;