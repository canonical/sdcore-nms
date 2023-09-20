interface CreateSubscriberArgs {
  imsi: string;
  plmnId: string;
  opc: string;
  key: string;
  sequenceNumber: string;
}

export const createSubscriber = async ({
  imsi,
  plmnId,
  opc,
  key,
  sequenceNumber,
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

    return response.json();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create the subscriber.");
  }
};
