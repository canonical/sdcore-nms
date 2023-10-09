"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Badge,
  MainTable,
  Row,
  Col,
  ConfirmationModal,
} from "@canonical/react-components";
import CreateSubscriberModal from "@/components/CreateSubscriberModal";
import { getSubscribers } from "@/utils/getSubscribers";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import { deleteSubscriber } from "@/utils/deleteSubscriber";

export type Subscriber = {
  plmnID: string;
  ueId: string;
};

export default function Subscribers() {
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isCreateSubscriberModalVisible, setIsCreateSubscriberModalVisible] =
    useState(false);
  const [isDeleteSubscriberModalOpen, setIsDeleteSubscriberModalOpen] =
    useState(false);
  const toggleCreateSubscriberModal = () =>
    setIsCreateSubscriberModalVisible((prev) => !prev);
  const [selectedSubscriber, setSelectedSubscriber] = useState<string | null>(
    null,
  );

  const handleRefresh = async () => {
    const fetchedSubscribers: Subscriber[] = await getSubscribers();
    setSubscribers(fetchedSubscribers);
  };

  const openDeleteConfirmationModal = (subscriber: string) => {
    setSelectedSubscriber(subscriber);
    setIsDeleteSubscriberModalOpen(true);
  };

  const closeDeleteSubscriberModal = () =>
    setIsDeleteSubscriberModalOpen(false);

  const handleConfirmDelete = async () => {
    if (!selectedSubscriber) {
      return;
    }
    await deleteSubscriber(selectedSubscriber);
    handleRefresh();
    setIsDeleteSubscriberModalOpen(false);
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
              <Button
                onClick={() => openDeleteConfirmationModal(rawIMSI)}
                appearance="negative"
                small
              >
                Delete
              </Button>
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
            <SyncOutlinedIcon style={{ color: "#666" }} />
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
      {isDeleteSubscriberModalOpen && (
        <ConfirmationModal
          title="Confirm delete"
          confirmButtonLabel="Delete"
          onConfirm={handleConfirmDelete}
          close={closeDeleteSubscriberModal}
        >
          <p>
            {`This will permanently delete the subscriber "${selectedSubscriber}".`}
            <br />
            You cannot undo this action.
          </p>
        </ConfirmationModal>
      )}
    </Row>
  );
}
