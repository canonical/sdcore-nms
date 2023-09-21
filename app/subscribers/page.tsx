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
import { getSubscribers } from "@/utils/getSubscribers";
import { SlRefresh } from "react-icons/sl";
import deleteSubscriber from "@/utils/deleteSubscriber";
export type Subscriber = {
  plmnID: string;
  ueId: string;
};

export default function Subscribers() {
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isCreateSubscriberModalVisible, setIsCreateSubscriberModalVisible] =
    useState(false);

  const toggleCreateSubscriberModal = () =>
    setIsCreateSubscriberModalVisible((prev) => !prev);

  const handleRefresh = async () => {
    const fetchedSubscribers: Subscriber[] = await getSubscribers();
    setSubscribers(fetchedSubscribers);
  };

  useEffect(() => {
    handleRefresh();
    setLoading(false);
  }, []);

  const tableContent = subscribers.map(({ ueId }) => {
    const rawIMSI = ueId.split("-")[1];
    return {
      key: rawIMSI,
      columns: [
        { content: rawIMSI },
        {
          content: (
            <div className="u-align--right">
              <DeleteSubscriberButton
                imsi={rawIMSI}
                currentSubscribers={subscribers.map(
                  (s) => s.ueId.split("-")[1],
                )}
                refreshHandler={handleRefresh}
              />
            </div>
          ),
        },
      ],
    };
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Row>
      <Col size={6}>
        <h2 className="h2-heading--1 font-regular">Subscribers</h2>
        <div className="u-align--right">
          <Button hasIcon appearance="base" onClick={handleRefresh}>
            <SlRefresh size={20} />
          </Button>
          <Button appearance="positive" onClick={toggleCreateSubscriberModal}>
            Create
          </Button>
        </div>
        <MainTable
          defaultSort='"abcd"'
          defaultSortDirection="ascending"
          headers={[
            { content: "IMSI" },
            { content: "Actions", className: "u-align--right" },
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
        <CreateSubscriberModal
          toggleModal={toggleCreateSubscriberModal}
          onSubscriberCreated={handleRefresh}
        />
      )}
    </Row>
  );
}
