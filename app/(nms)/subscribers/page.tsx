"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  MainTable,
  ConfirmationButton,
} from "@canonical/react-components";
import SubscriberModal from "@/components/SubscriberModal";
import { getSubscribers } from "@/utils/getSubscribers";
import { getDeviceGroups } from "@/utils/getDeviceGroup";
import { getNetworkSlices } from "@/utils/getNetworkSlices";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import { deleteSubscriber } from "@/utils/deleteSubscriber";
import Loader from "@/components/Loader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/utils/queryKeys";
import PageHeader from "@/components/PageHeader";
import PageContent from "@/components/PageContent";
import { useAuth } from "@/utils/auth";

export type Subscriber = {
  plmnID: string;
  ueId: string;
};

const addSubscriber = async (newSubscriber: void, token: string | undefined) => {
  const response = await fetch("/api/subscribers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(newSubscriber),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
        errorBody.message || "Failed to add subscriber"
    );
  }
  return response.json();
};

const Subscribers = () => {
  const queryClient = useQueryClient();
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [newSubscriberAdded, setNewSubscriberAdded] = useState(false); // Tracks if updates are needed
  const [subscriber, setSubscriber] = useState<any | undefined>(undefined);
  const auth = useAuth()

  const { data: subscribers = [], isLoading: isSubscribersLoading, status: subscribersQueryStatus, error: subscribersQueryError } = useQuery({
    queryKey: [queryKeys.subscribers, auth.user?.authToken],
    queryFn: () => getSubscribers(auth.user ? auth.user.authToken : ""),
    enabled: auth.user ? true : false,
    retry: (failureCount, error): boolean => {
      if (error.message.includes("401")) {
        return false
      }
      return true
    }
  });

  // Mutation to add a subscriber
  const mutation = useMutation({
    mutationFn: (newSubscriber) => addSubscriber(newSubscriber, auth.user?.authToken),
    onSuccess: () => {
      // On successful addition, invalidate the query to refresh
      queryClient.invalidateQueries({ queryKey: [queryKeys.subscribers] });
      setNewSubscriberAdded(true); // Indicate that new data is added
    },
  });

  // Effect to handle state changes
  useEffect(() => {
    if (newSubscriberAdded) {
      queryClient.invalidateQueries({ queryKey: [queryKeys.subscribers] });
      setNewSubscriberAdded(false);
    }
  }, [newSubscriberAdded, queryClient]); // `queryClient` is now included in the dependency array.

  const handleCreateSubscriber = async (newSubscriber: void) => {
    try {
      await mutation.mutateAsync(newSubscriber); // Trigger mutation
      setCreateModalVisible(false); // Close the modal
    } catch (error) {
      console.error("Error adding subscriber:", error); // Handle error
    }
  };

  const { data: deviceGroups = [], isLoading: isDeviceGroupsLoading } = useQuery({
    queryKey: [queryKeys.deviceGroups, auth.user?.authToken],
    queryFn: () => getDeviceGroups(auth.user ? auth.user.authToken : ""),
    enabled: auth.user ? true : false,
  });

  const { data: slices = [], isLoading: isSlicesLoading } = useQuery({
    queryKey: [queryKeys.networkSlices, auth.user?.authToken],
    queryFn: () => getNetworkSlices(auth.user ? auth.user.authToken : ""),
    enabled: auth.user ? true : false,
  });

  if (subscribersQueryStatus == "error") {
    if (subscribersQueryError.message.includes("401")) {
      auth.logout()
    }
    return <p>{subscribersQueryError.message}</p>
  }

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: [queryKeys.subscribers] });
    await queryClient.invalidateQueries({ queryKey: [queryKeys.deviceGroups] });
    await queryClient.invalidateQueries({ queryKey: [queryKeys.networkSlices] });
  };

  const handleConfirmDelete = async (subscriber: string) => {
    await deleteSubscriber(subscriber, auth.user ? auth.user.authToken : "");
    await handleRefresh();
  };

  const toggleCreateModal = () => setCreateModalVisible((prev) => !prev);
  const toggleEditModal = () => setEditModalVisible((prev) => !prev);

  const handleEditButton = (subscriber: any) => {
    setSubscriber(subscriber);
    toggleEditModal();
  }

  const getEditButton = (subscriber: any) => {
    return <Button
      appearance=""
      className="u-no-margin--bottom"
      shiftClickEnabled
      showShiftClickHint
      onClick={() => { handleEditButton(subscriber) }}
    >
      Edit
    </Button>
  }

  const getDeleteButton = (imsi: string) => {
    return <ConfirmationButton
      appearance="negative"
      className="u-no-margin--bottom"
      shiftClickEnabled
      showShiftClickHint
      confirmationModalProps={{
        title: "Confirm Delete",
        confirmButtonLabel: "Delete",
        onConfirm: () => handleConfirmDelete(imsi),
        children: (
          <p>
            This will permanently delete the subscriber{" "}
            <b>{imsi}</b>
            <br />
            This action cannot be undone.
          </p>
        ),
      }}
    >
      Delete
    </ConfirmationButton>
  }

  const tableContent = subscribers.map((subscriber) => {
    const rawIMSI = subscriber.ueId.split("-")[1];
    return {
      key: rawIMSI,
      columns: [
        { content: rawIMSI },
        {
          content: (
            <div className="u-align--right">
              {getEditButton(subscriber)}
              {getDeleteButton(rawIMSI)}
            </div>
          ),
        },
      ],
    };
  });

  if (isSubscribersLoading || isDeviceGroupsLoading || isSlicesLoading) {
    return <Loader text="Loading..." />;
  }

  return (
    <>
      <PageHeader title={`Subscribers (${subscribers.length})`}>
        <Button
          hasIcon
          appearance="base"
          onClick={handleRefresh}
          title="refresh subscriber list"
        >
          <SyncOutlinedIcon style={{ color: "#666" }} />
        </Button>
        <Button appearance="positive" onClick={toggleCreateModal}>
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
      {isCreateModalVisible && (
          <SubscriberModal
              toggleModal={toggleCreateModal}
              onSubmit={(newSubscriber: any) => handleCreateSubscriber(newSubscriber)}
              slices={slices}
              deviceGroups={deviceGroups}
          />)
      }
      {isEditModalVisible &&
        <SubscriberModal toggleModal={toggleEditModal} subscriber={subscriber} slices={slices} deviceGroups={deviceGroups} />}
    </>
  );
};
export default Subscribers;