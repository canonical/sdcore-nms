"use client";
import { Button } from "@canonical/react-components";
import { WEBUI_ENDPOINT, STATIC_DEVICE_GROUP_DATA } from "@/sdcoreConfig";
import { useState } from "react";

type Props = {
  currentSubscribers: string[];
  imsi: string;
  refreshHandler: () => void;
};

export default function DeleteSubscriberButton(props: Props) {
  const [deleting, setDeleting] = useState<boolean>(false);

  const getFilteredSubscribers = (
    imsiList: string[],
    imsiToRemove: string
  ): string[] => {
    return imsiList.filter((imsi) => imsi !== imsiToRemove);
  };

  const handleDeleteSubscriber = async () => {
    setDeleting(true);

    const deleteSubscriber = async () => {
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
      }
    };

    const removeSubcriberFromDeviceGroup = async () => {
      try {
        const response = await fetch(
          `${WEBUI_ENDPOINT}/config/v1/device-group/cows`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imsis: [
                ...getFilteredSubscribers(props.currentSubscribers, props.imsi),
              ],
              ...STATIC_DEVICE_GROUP_DATA,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to add subscriber to device group. Error code : ${response.status}`
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    await deleteSubscriber();
    await removeSubcriberFromDeviceGroup();
    setDeleting(false);
    props.refreshHandler();
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
