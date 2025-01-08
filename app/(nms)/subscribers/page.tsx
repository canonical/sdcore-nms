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

const addSubscriber = async (newSubscriber: Subscriber, token: string | undefined) => {
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
  const [newSubscriberAdded, setNewSubscriberAdded] = useState(false);
  const [subscriber, setSubscriber] = useState<any | undefined>(undefined);
  const auth = useAuth()

  const { data: subscribers = [], isLoading: isSubscribersLoading, status: subscribersQueryStatus, error: subscribersQueryError } = useQuery({
    queryKey: [queryKeys.subscribers, auth.user?.authToken],
    queryFn: () => getSubscribers(auth.user ? auth.user.authToken : ""),
    enabled: !!auth.user,
    retry: (failureCount, error): boolean => {
      const errorMessage = error?.message || "";
      return !errorMessage.includes("401");
    }
  });

  // Mutation to add a subscriber
  const mutation = useMutation({
    mutationFn: (newSubscriber: Subscriber) => addSubscriber(newSubscriber, auth.user?.authToken),
    onSuccess: () => {
      // On successful addition, invalidate the query to refresh
      handleRefresh()
      setCreateModalVisible(false); // Closes model
    },
  });

  // Effect to handle state changes
  useEffect(() => {
    if (newSubscriberAdded) {
      queryClient.invalidateQueries({ queryKey: [queryKeys.subscribers] });
      setNewSubscriberAdded(false);
    }
  }, [newSubscriberAdded, queryClient, queryKeys.subscribers]);

  const handleCreateSubscriber = async (newSubscriber: Subscriber) => {
    try {
      await mutation.mutateAsync(newSubscriber); // Trigger mutation
      setCreateModalVisible(false); // Close the modal
    } catch (error) {
      console.error("Error adding subscriber:", error); // Handle error
    }
  };

  const editSubscriber = async (updatedSubscriber: Subscriber, token: string | undefined) => {
    const response = await fetch(`/api/subscribers/${updatedSubscriber.ueId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedSubscriber),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || "Failed to edit subscriber");
    }

    return response.json();
  };

  const editMutation = useMutation({
    mutationFn: (updatedSubscriber: Subscriber) =>
        editSubscriber(updatedSubscriber, auth.user?.authToken), // Perform edit request
    onSuccess: () => {
      handleRefresh();
      setEditModalVisible(false); // Close the modal after success
    },
    onError: (error) => {
      console.error("Error editing subscriber:", error);
    },
  });

  const handleEditSubscriber = async (updatedSubscriber: Subscriber) => {
    try {
      await editMutation.mutateAsync(updatedSubscriber);
      // Close the edit modal
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error editing subscriber:", error);
    }
  };

  const { data: deviceGroups = [], isLoading: isDeviceGroupsLoading } = useQuery({
    queryKey: [queryKeys.deviceGroups, auth.user?.authToken],
    queryFn: () => getDeviceGroups(auth.user ? auth.user.authToken : ""),
    enabled: !!auth.user,
  });

  const { data: slices = [], isLoading: isSlicesLoading } = useQuery({
    queryKey: [queryKeys.networkSlices, auth.user?.authToken],
    queryFn: () => getNetworkSlices(auth.user ? auth.user.authToken : ""),
    enabled: !!auth.user,
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
        <SubscriberModal toggleModal={toggleEditModal}
                         subscriber={subscriber}
                         slices={slices}
                         deviceGroups={deviceGroups}
                         onSubmit={handleEditSubscriber}
        />}
    </>
  );
};
export default Subscribers;