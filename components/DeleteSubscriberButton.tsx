import { Button } from "@canonical/react-components";

type Props = {
  imsi: string;
};

export default function DeleteSubscriberButton(props: Props) {
  const handleDeleteSubscriber = () => {
    alert("Delete subscriber with IMSI: " + props.imsi);
  };
  return (
    <Button
      onClick={handleDeleteSubscriber}
      appearance="negative"
      className={"u-no-margin--bottom"}
      key={props.imsi}
    >
      Delete
    </Button>
  );
}
