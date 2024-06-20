import { Subscriber } from "@/app/(network)/subscribers/page";
import { handleGetSubscriber, handleGetSubscribers } from "@/utils/handleSubscriber";

export const getSubscribers = async () => {
  try {
    const response = await handleGetSubscribers();
    if (!response.ok) {
      throw new Error(
        `Failed to fetch subscribers. Status: ${response.status}`,
      );
    }

    const subscriberNames = await response.json();

    const allSubscribers = await Promise.all(
      subscriberNames.map(async (subscriber: Subscriber) =>
        await getSubscriber(subscriber.ueId),
      ),
    );

    return allSubscribers.filter((item) => item !== undefined);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getSubscriber = async (imsi: string) => {
  try {
    const response = await handleGetSubscriber(imsi);
    if (!response.ok)
      throw new Error(
        `Failed to fetch subscriber. Status: ${response.status}`,
      );
    const subscriber = await response.json();
    return subscriber;
  } catch (error) {
    console.error(error);
  }
};
