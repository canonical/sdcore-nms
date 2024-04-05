interface EditSubscriberArgs {
    imsi: string;
    opc: string;
    key: string;
    sequenceNumber: string;
    oldDeviceGroupName: string;
    newDeviceGroupName: string;
}

export const editSubscriber = async ({
    imsi,
    opc,
    key,
    sequenceNumber,
    oldDeviceGroupName,
    newDeviceGroupName,
}: EditSubscriberArgs) => {
    const subscriberData = {
        UeId: imsi,
        opc: opc,
        key: key,
        sequenceNumber: sequenceNumber,
    };

    try {
        //console.error(subscriberData);
        updateSubscriber(subscriberData);
        console.error(oldDeviceGroupName)
        console.error(newDeviceGroupName)
        if (oldDeviceGroupName != newDeviceGroupName) {
            var oldDeviceGroupData = await getDeviceGroupData(oldDeviceGroupName);
            oldDeviceGroupData["imsis"].pop(imsi);
            updateDeviceGroupData(oldDeviceGroupName, oldDeviceGroupData);

            var newDeviceGroupData = await getDeviceGroupData(newDeviceGroupName);
            newDeviceGroupData["imsis"].push(imsi);
            updateDeviceGroupData(newDeviceGroupName, newDeviceGroupData);
        }
    } catch (error) {
        console.error(error);
        const details =
            error instanceof Error
                ? error.message
                : `Failed to edit subscriber .`;
        throw new Error(details);
    }
};

const updateSubscriber = async (subscriberData: any) => {
  try {

    const checkResponse = await fetch(`/api/subscriber/imsi-${subscriberData.UeId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    
    // Workaround for https://github.com/omec-project/webconsole/issues/109
    const existingSubscriberData = await checkResponse.json();
    if (!checkResponse.ok || !existingSubscriberData["AuthenticationSubscription"]["authenticationMethod"]) {
        throw new Error("Subscriber does not exist.");
    }
    console.error(existingSubscriberData)
    const response = await fetch(`/api/subscriber/imsi-${subscriberData.UeId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(subscriberData),
    });
    
    if (!response.ok) {
        throw new Error(
            `Error editing subscriber. Error code: ${response.status}`,
        );
    }
    console.error(response)
  } catch (error) {
      console.error(error);
  }
}

const getDeviceGroupData = async (deviceGroupName: string) => {
  try {

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
    return existingDeviceGroupData;
  } catch (error) {
    console.error(error);
  }
  }

const updateDeviceGroupData = async (deviceGroupName:string, deviceGroupData: any) => {
    try {
       
    const updateDeviceGroupResponse = await fetch(
        `/api/device-group/${deviceGroupName}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(deviceGroupData),
        },
    );
    
    if (!updateDeviceGroupResponse.ok) {
        throw new Error(
            `Error updating device group. Error code: ${updateDeviceGroupResponse.status}`,
        );
    }
 } catch (error) {
    console.error(error);
}
}

