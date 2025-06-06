import { FC, ReactNode } from "react";
import PageHeader from "@/components/PageHeader";
import PageContent from "@/components/PageContent";
import { Button, EmptyState } from "@canonical/react-components"

interface Props {
  title: string;
  image?: string;
  message?: ReactNode;
  onClick: () => void;
  buttonText: string;
}

const EmptyStatePage: FC<Props> = ({ title, image = "", message = "", onClick, buttonText }) => {
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
            <Button appearance="positive" onClick={onClick}>{buttonText}</Button>
          </>
        </EmptyState>
      </PageContent>
    </>
  );
};

export default EmptyStatePage;
