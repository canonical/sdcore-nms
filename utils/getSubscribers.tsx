
import { Subscriber } from "@/components/types";
import { apiGetSubscriber, apiGetAllSubscribers } from "@/utils/callSubscriberApi";
import { WebconsoleApiError } from "@/utils/errors";

export const getSubscribers = async (token: string) => {
  try {
    var subscriberNames = await apiGetAllSubscribers(token);

    const allSubscribers = await Promise.all(
      subscriberNames.map(async (subscriber: Subscriber) =>
        await getSubscriber(subscriber.ueId, token),
      ),
    );
    return allSubscribers.filter((item) => item !== undefined);

  } catch (error) {
    console.error(`Error retrieving subscribers: ${error}`);
    throw error;
  }
};

const getSubscriber = async (imsi: string, token: string) => {
  try {
    const numericPart = imsi.split("-")[1];
    const response = await apiGetSubscriber(numericPart, token);
    const subscriber = await response.json();
    if (!response.ok) {
      throw new WebconsoleApiError(response.status, subscriber.error);
    }
    return subscriber;
  } catch (error) {
    console.error(`Error retrieving subscriber ${imsi}: ${error}`);
    throw error;
  }
};
