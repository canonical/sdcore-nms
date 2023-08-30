"use client";
import { useState, useEffect } from "react";
import EditSubscriber from "@/components/EditSubscriber";
import DeleteSubscriberButton from "@/components/DeleteSubscriberButton";
import CreateSubscriberButton from "@/components/CreateSubscriberButton";

import {
  Notification,
  Button,
  Badge,
  MainTable,
  Row,
  Col,
} from "@canonical/react-components";

import { SlRefresh } from "react-icons/sl";

export type Subscriber = {
  plmnID: string;
  ueId: string;
};

export type Subscribers = Subscriber[];

export default function SubscriberTable() {
  const [subscribers, setSubscribers] = useState<Subscribers>([]);
  const [createEnabled, setCreateEnabled] = useState<boolean>(true);
  const [refresh, setRefresh] = useState<boolean>(false);

  const currentImsis: string[] = subscribers.map((subscriber: Subscriber) => {
    return subscriber.ueId.split("-")[1];
  });

  useEffect(() => {
    const fetchSubscribers = async () => {
    
      try {
        const response = await fetch(`/api/getSubscribers`);
    
        if (!response.ok) {
          throw new Error("Failed to fetch subscribers");
        }
        const data = await response.json();
        setSubscribers(data);
      } catch (error) {
        console.error(error);
      } finally {
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
    return {
      key: rawIMSI,
      columns: [
        { content: rawIMSI },
        {
          content: (
            <>
              <EditSubscriber
                imsi={rawIMSI}
                currentSubscribers={currentImsis}
                refreshHandler={handleRefresh}
                key={rawIMSI}
              />
              <DeleteSubscriberButton
                currentSubscribers={currentImsis}
                imsi={String(rawIMSI)}
                refreshHandler={handleRefresh}
                key={rawIMSI + "delete-button"}
              />
            </>
          ),
        },
      ],
    };
  });

  return (
    <Row>
      <Col size={8}>
      <Notification severity="caution" title="Warning">
        Configure your network in the{" "}
        <span className="italic">Network Configuration</span> tab before adding
        subscribers.
      </Notification>
          <h2 className="h2-heading--1 font-regular">Subscribers</h2>
          <div className="u-align--right">
          <Button
            hasIcon={true}
            disabled={createEnabled}
            className="u-no-margin--bottom"
            onClick={handleRefresh}
          >
            <SlRefresh size={20} />
          </Button>
          <CreateSubscriberButton
          text="Create"
          currentSubscribers={currentImsis}
          disabled={createEnabled}
        />
          </div>
          <MainTable
            defaultSort='"abcd"'
            defaultSortDirection="ascending"
            headers={[
              {
                content: "IMSI",
              },
              {
                content: "Actions",
              },
            ]}
            rows={tableContent}
          />
          <Button className="p-chip">
            total
            <Badge
              badgeType="UNDEFINED_LARGE_NUMBER"
              value={subscribers.length}
            />
          </Button>
      </Col>
    </Row>
)
}
