"use client";
import { useState, useEffect } from "react";
import {
  Button,
  Badge,
  MainTable,
  Row,
  Col,
} from "@canonical/react-components";
import { SlRefresh } from "react-icons/sl";
import EditSubscriber from "@/components/EditSubscriber";
import DeleteSubscriberButton from "@/components/DeleteSubscriberButton";
import CreateSubscriberModal from "@/components/CreateSubscriberModal";
import { checkNetworkConfigured } from "@/utils/checkNetworkConfigured";
import NetworkConfigurationEmptyState from "@/components/NetworkConfigurationEmptyState";

export type Subscriber = {
  plmnID: string;
  ueId: string;
};
export type Subscribers = Subscriber[];

export default function Subscribers() {
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isNetworkConfigured, setIsNetworkConfigured] = useState(false);
  const [isCreateSubscriberModalVisible, setIsCreateSubscriberModalVisible] =
    useState(false);
  const toggleCreateSubscriberModal = () =>
    setIsCreateSubscriberModalVisible((prev) => !prev);

  const currentImsis: string[] = subscribers.map((subscriber: Subscriber) => {
    return subscriber.ueId.split("-")[1];
  });

  useEffect(() => {
    const init = async () => {
      const configured = await checkNetworkConfigured();
      setIsNetworkConfigured(configured);
      setLoading(false);

      if (configured) {
        await fetchSubscribers();
      }
    };

    init();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch(`/api/getSubscribers`);
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

  if (!isNetworkConfigured) return <NetworkConfigurationEmptyState />;

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
              />
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
      <Col size={8}>
        <h2 className="h2-heading--1 font-regular">Subscribers</h2>
        <div className="u-align--right">
          <Button
            hasIcon={true}
            disabled={!isNetworkConfigured}
            className="u-no-margin--bottom"
            onClick={handleRefresh}
          >
            <SlRefresh size={20} />
          </Button>
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
        <CreateSubscriberModal
          toggleModal={toggleCreateSubscriberModal}
          currentSubscribers={currentImsis}
        />
      )}
    </Row>
  );
}
