"use client";
import { useState, useEffect } from "react";
import {
  Button,
  Badge,
  MainTable,
  Row,
  Col,
} from "@canonical/react-components";
import DeleteSubscriberButton from "@/components/DeleteSubscriberButton";
import CreateSubscriberModal from "@/components/CreateSubscriberModal";

export type Subscriber = {
  plmnID: string;
  ueId: string;
};
export type Subscribers = Subscriber[];

export default function Subscribers() {
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isCreateSubscriberModalVisible, setIsCreateSubscriberModalVisible] =
    useState(false);
  const toggleCreateSubscriberModal = () =>
    setIsCreateSubscriberModalVisible((prev) => !prev);

  const currentImsis: string[] = subscribers.map((subscriber: Subscriber) => {
    return subscriber.ueId.split("-")[1];
  });

  useEffect(() => {
    const init = async () => {
      setLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [refresh]);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch(`/api/subscriber`, {
        method: "GET",
      });
      if (!response.ok)
        throw new Error(
          `Failed to fetch subscribers. Status: ${response.status}`,
        );
      setSubscribers(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const tableContent = subscribers.map((subscriber: Subscriber) => {
    const rawIMSI = subscriber.ueId.split("-")[1];
    return {
      key: rawIMSI,
      columns: [
        { content: rawIMSI },
        {
          content: (
            <>
              <DeleteSubscriberButton
                imsi={rawIMSI}
                currentSubscribers={currentImsis}
                refreshHandler={handleRefresh}
              />
            </>
          ),
        },
      ],
    };
  });

  return (
    <Row>
      <Col size={6}>
        <h2 className="h2-heading--1 font-regular">Subscribers</h2>
        <div className="u-align--right">
          <Button
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={toggleCreateSubscriberModal}
          >
            Create
          </Button>
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
              className: "u-align--right",
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
      {isCreateSubscriberModalVisible && (
        <CreateSubscriberModal toggleModal={toggleCreateSubscriberModal} />
      )}
    </Row>
  );
}
