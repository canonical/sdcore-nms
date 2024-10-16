import { Subscriber } from "@/app/(nms)/subscribers/page";
import { apiGetSubscriber, apiGetAllSubscribers } from "@/utils/callSubscriberApi";

export const getSubscribers = async (token: string) => {
  try {
    const response = await apiGetAllSubscribers(token);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch subscribers. Status: ${response.status}`,
      );
    }

    var subscriberNames = await response.json();
    if (!Array.isArray(subscriberNames) || subscriberNames.length === 0) {
      subscriberNames = [];
    }

    const allSubscribers = await Promise.all(
      subscriberNames.map(async (subscriber: Subscriber) =>
        await getSubscriber(subscriber.ueId, token),
      ),
    );

    return allSubscribers.filter((item) => item !== undefined);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getSubscriber = async (imsi: string, token: string) => {
  try {
    const numericPart = imsi.split("-")[1];
    const response = await apiGetSubscriber(numericPart, token);
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
