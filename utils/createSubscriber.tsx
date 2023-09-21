interface CreateSubscriberArgs {
  imsi: string;
  plmnId: string;
  opc: string;
  key: string;
  sequenceNumber: string;
  deviceGroupName: string;
}

export const createSubscriber = async ({
  imsi,
  plmnId,
  opc,
  key,
  sequenceNumber,
  deviceGroupName,
}: CreateSubscriberArgs) => {
  const subscriberData = {
    UeId: imsi,
    plmnId: plmnId,
    opc: opc,
    key: key,
    sequenceNumber: sequenceNumber,
  };

  try {
    const response = await fetch(`/api/subscriber/imsi-${imsi}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriberData),
    });

    if (!response.ok) {
      throw new Error(
        `Error creating subscriber. Error code: ${response.status}`,
      );
    }

    const existingDeviceGroupResponse = await fetch(
      `/api/device-group/${deviceGroupName}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const existingDeviceGroupData = await existingDeviceGroupResponse.json();

    if (!existingDeviceGroupData["imsis"]) {
      existingDeviceGroupData["imsis"] = [];
    }

    existingDeviceGroupData["imsis"].push(imsi);

    const updateDeviceGroupResponse = await fetch(
      `/api/device-group/${deviceGroupName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(existingDeviceGroupData),
      },
    );

    if (!updateDeviceGroupResponse.ok) {
      throw new Error(
        `Error updating device group. Error code: ${updateDeviceGroupResponse.status}`,
      );
    }

    return response.json();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create the subscriber.");
  }
};
