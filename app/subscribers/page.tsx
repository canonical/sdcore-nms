"use client";

import React, { useState } from "react";
import {
  Button,
  MainTable,
  ConfirmationButton,
} from "@canonical/react-components";
import CreateSubscriberModal from "@/components/CreateSubscriberModal";
import { getSubscribers } from "@/utils/getSubscribers";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import { deleteSubscriber } from "@/utils/deleteSubscriber";
import Loader from "@/components/Loader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/utils/queryKeys";
import PageHeader from "@/components/PageHeader";
import PageContent from "@/components/PageContent";

export type Subscriber = {
  plmnID: string;
  ueId: string;
};

const Subscribers = () => {
  const queryClient = useQueryClient();
  const [isModalVisible, setModalVisible] = useState(false);

  const { data: subscribers = [], isLoading: loading } = useQuery({
    queryKey: [queryKeys.subscribers],
    queryFn: getSubscribers,
  });

  const handleRefresh = async () => {
    void queryClient.invalidateQueries({ queryKey: [queryKeys.subscribers] });
  };

  const handleConfirmDelete = async (subscriber: string) => {
    await deleteSubscriber(subscriber);
    void handleRefresh();
  };

  const toggleModal = () => setModalVisible((prev) => !prev);

  const tableContent = subscribers.map(({ ueId }) => {
    const rawIMSI = ueId.split("-")[1];
    return {
      key: rawIMSI,
      columns: [
        { content: rawIMSI },
        {
          content: (
            <div className="u-align--right">
              <ConfirmationButton
                appearance="negative"
                className="u-no-margin--bottom"
                shiftClickEnabled
                showShiftClickHint
                confirmationModalProps={{
                  title: "Confirm Delete",
                  confirmButtonLabel: "Delete",
                  onConfirm: () => handleConfirmDelete(rawIMSI),
                  children: (
                    <p>
                      This will permanently delete the subscriber <b>{rawIMSI}</b><br/>
                      This action cannot be undone.
                    </p>
                  ),
                }}
              >
                Delete
              </ConfirmationButton>
            </div>
          ),
        },
      ],
    };
  });

  if (loading) {
    return <Loader text="Loading..." />;
  }

  return (
    <>
      <PageHeader title={`Subscribers (${subscribers.length})`}>
        <Button hasIcon appearance="base" onClick={handleRefresh} title="refresh subscriber list">
          <SyncOutlinedIcon style={{ color: "#666" }} />
        </Button>
        <Button appearance="positive" onClick={toggleModal}>
          Create
        </Button>
      </PageHeader>
      <PageContent>
        <MainTable
          defaultSort='"abcd"'
          defaultSortDirection="ascending"
          headers={[
            { content: "IMSI" },
            { content: "Actions", className: "u-align--right" },
          ]}
          rows={tableContent}
        />
      </PageContent>
      {isModalVisible && <CreateSubscriberModal toggleModal={toggleModal} />}
    </>
  );
};
export default Subscribers;

