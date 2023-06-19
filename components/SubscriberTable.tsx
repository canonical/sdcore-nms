"use client";
import { useState, useEffect } from "react";
import EditSubscriber from "@/components/EditSubscriber";
import DeleteSubscriberButton from "@/components/DeleteSubscriberButton";
import CreateSubscriber from "@/components/CreateSubscriberButton";

import {
  Notification,
  Button,
  Badge,
  Spinner,
} from "@canonical/react-components";

import { SlRefresh } from "react-icons/sl";

import { WEBUI_ENDPOINT } from "@/sdcoreConfig";

// {"plmnID":"20893","ueId":"imsi-208930100007487"}
export type Subscriber = {
  plmnID: string;
  ueId: string;
};

// [{"plmnID":"20893","ueId":"imsi-208930100007487"}]
export type Subscribers = Subscriber[];

export default function SubscriberTable() {
  const [subscribers, setSubscribers] = useState<Subscribers>([]);
  const [loading, setLoading] = useState(false);
  const [createEnabled, setCreateEnabled] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const currentImsis: string[] = subscribers.map((subscriber: Subscriber) => {
    return subscriber.ueId.split("-")[1];
  });

  useEffect(() => {
    const fetchSubscribers = async () => {
      setLoading(true);

      const headers = {
        "Content-Type": "application/json",
      };

      try {
        const response = await fetch(`${WEBUI_ENDPOINT}/api/subscriber`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch subscribers");
        }

        const data = await response.json();
        setSubscribers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setCreateEnabled(false);
      }
    };

    fetchSubscribers();
  }, [refresh]);

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  const tableContent = subscribers.map((subscriber: Subscriber) => {
    const rawIMSI = subscriber.ueId.split("-")[1];
    return (
      <tr key={rawIMSI} className="overflow-x-scroll">
        <td>{rawIMSI}</td>
        <td>
          <EditSubscriber
            imsi={rawIMSI}
            currentSubscribers={currentImsis}
            refreshHandler={handleRefresh}
            key={rawIMSI}
          />
          <DeleteSubscriberButton
            imsi={String(rawIMSI)}
            key={rawIMSI + "delete-button"}
          />
        </td>
      </tr>
    );
  });

  return (
    <div className="ml-8 flex flex-col">
      <Notification severity="caution" title="Warning">
        Configure your network in the{" "}
        <span className="italic">Network Configuration</span> tab before adding
        subscribers.
      </Notification>
      <div className="flex flex-row items-end justify-start">
        <h1 className="h1-heading--1 font-regular">Subscribers</h1>
        <div className="ml-[10rem] mr-4">
          <Button
            hasIcon={true}
            disabled={createEnabled}
            className="u-no-margin--bottom"
            onClick={handleRefresh}
          >
            <SlRefresh size={20} />
          </Button>
        </div>
        <CreateSubscriber
          text="Create"
          currentSubscribers={currentImsis}
          disabled={createEnabled}
          refreshHandler={handleRefresh}
        />
      </div>
      <div className="mt-8 w-[50rem]">
        {loading ? (
          <Spinner text="Loading subscribers..." />
        ) : (
          <table aria-label="Example of formatting in the table">
            <thead>
              <tr>
                <th>IMSI</th>
                <th className="u-align--left">Actions</th>
              </tr>
            </thead>
            <tbody>{tableContent}</tbody>
          </table>
        )}
        {loading ? null : (
          <>
            <span className="font-light">Total subscribers</span>{" "}
            <Badge
              badgeType="UNDEFINED_LARGE_NUMBER"
              value={subscribers.length}
            />
          </>
        )}
      </div>
    </div>
  );
}
