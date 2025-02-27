"use client";

import React, { useState } from "react";
import {
  Button,
  MainTable,
  ConfirmationButton,
} from "@canonical/react-components";
import SubscriberModal from "@/components/SubscriberModal";
import { apiDeleteSubscriber } from "@/utils/callSubscriberApi";
import { getSubscribers } from "@/utils/getSubscribers";
import { getDeviceGroups } from "@/utils/deviceGroupOperations";
import { getNetworkSlices } from "@/utils/networkSliceOperations";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import Loader from "@/components/Loader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/utils/queryKeys";
import PageHeader from "@/components/PageHeader";
import PageContent from "@/components/PageContent";
import { useAuth } from "@/utils/auth";
import {handleRefresh} from "@/utils/refreshQueries";
import { Subscriber } from "@/components/types";
import { is401UnauthorizedError } from "@/utils/errors";
import ErrorNotification from "@/components/ErrorNotification";


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
  const [subscriber, setSubscriber] = useState<Subscriber | undefined>(undefined);
  const auth = useAuth()

  const { data: subscribers = [], isLoading: isSubscribersLoading, status: subscribersQueryStatus, error: subscribersQueryError } = useQuery({
    queryKey: [queryKeys.subscribers, auth.user?.authToken],
    queryFn: () => getSubscribers(auth.user?.authToken || ""),
    enabled: Boolean(auth.user),
  });

  // Mutation to add a subscriber
  const addSubscriberMutation = useMutation({
    mutationFn: (newSubscriber: Subscriber) => addSubscriber(newSubscriber, auth.user?.authToken || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.subscribers, auth.user?.authToken ?? ""],
        refetchActive: true,
      });
      // Close model
      setCreateModalVisible(false);
    },
  });

  const handleCreateSubscriber = async (newSubscriber: Subscriber) => {
    try {
      await addSubscriberMutation.mutateAsync(newSubscriber);
    } catch (error) {
      console.error("Error adding subscriber:", error);
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

  const editSubscriberMutation = useMutation({
    mutationFn: (updatedSubscriber: Subscriber) =>
      editSubscriber(updatedSubscriber, auth.user?.authToken || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.subscribers, auth.user?.authToken ?? ""],
        refetchActive: true,
      });
      // Close model
      setEditModalVisible(false);
    },
    onError: (error) => {
      console.error("Error editing subscriber:", error);
    },
  });

  const deleteSubscriberWithImsi = async (subscriberImsi: string) => {
     await apiDeleteSubscriber(subscriberImsi, auth.user?.authToken || "");
  };

  const deleteSubscriberMutation = useMutation({
    mutationFn: async (subscriberImsi: string) => {
      await deleteSubscriberWithImsi(subscriberImsi);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.subscribers, auth.user?.authToken ?? ""],
        refetchActive: true,
      });
      // Invalidate queries does not work in the first attempt
      // Hence, window is reloaded.
      window.location.reload();
    },
    onError: (error) => {
      if (is401UnauthorizedError(error)) { auth.logout(); }
    },
  });

  const handleEditSubscriber = async (updatedSubscriber: Subscriber) => {
    try {
      editSubscriberMutation.mutate(updatedSubscriber);
    } catch (error) {
      console.error("Error editing subscriber:", error);
    }
  };

  const handleConfirmDelete = async (subscriberImsi: string) => {
    try {
      deleteSubscriberMutation.mutate(subscriberImsi);
    } catch (error) {
      console.error("Error deleting subscriber:", error);
    }
  }

  const { data: deviceGroups = [], isLoading: isDeviceGroupsLoading } = useQuery({
    queryKey: [queryKeys.deviceGroups, auth.user?.authToken],
    queryFn: () => getDeviceGroups(auth.user?.authToken || ""),
    enabled: Boolean(auth.user),
  });

  const { data: slices = [], isLoading: isSlicesLoading } = useQuery({
    queryKey: [queryKeys.networkSlices, auth.user?.authToken],
    queryFn: () => getNetworkSlices(auth.user?.authToken || ""),
    enabled: Boolean(auth.user),
  });

  if (subscribersQueryStatus == "error") {
    if (is401UnauthorizedError(subscribersQueryError)) {
      auth.logout()
    }
    return (<><ErrorNotification error={"Failed to retrieve subscribers."} /></>);
  }

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
    return <Loader/>;
  }

  return (
    <>
      <PageHeader title={`Subscribers (${subscribers.length})`}>
        <Button
          hasIcon
          appearance="base"
          onClick={() => handleRefresh(queryClient, auth.user?.authToken)}
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
                         onSubmit={(updatedSubscriber: any) => handleEditSubscriber(updatedSubscriber)}
        />}
    </>
  );
};
export default Subscribers;
