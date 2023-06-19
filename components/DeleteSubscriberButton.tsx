"use client";
import { Button } from "@canonical/react-components";
import { WEBUI_ENDPOINT } from "@/sdcoreConfig";
import { useState } from "react";

type Props = {
  imsi: string;
};

export default function DeleteSubscriberButton(props: Props) {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteSubscriber = async () => {
    console.log("Delete Subscriber button clicked");
    setDeleting(true);

    try {
      const response = await fetch(
        `${WEBUI_ENDPOINT}/api/subscriber/imsi-${props.imsi}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete subscriber");
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      onClick={handleDeleteSubscriber}
      appearance="negative"
      className="u-no-margin--bottom"
      key={props.imsi}
      small={true}
      disabled={deleting}
    >
      {deleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
