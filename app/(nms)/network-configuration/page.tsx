"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  ConfirmationButton,
} from "@canonical/react-components";
import { deleteNetworkSlice } from "@/utils/deleteNetworkSlice";
import { getNetworkSlices } from "@/utils/getNetworkSlices";
import NetworkSliceModal from "@/components/NetworkSliceModal";
import NetworkSliceEmptyState from "@/components/NetworkSliceEmptyState";
import { NetworkSliceTable } from "@/components/NetworkSliceTable";
import Loader from "@/components/Loader";
import { queryKeys } from "@/utils/queryKeys";
import PageHeader from "@/components/PageHeader";
import PageContent from "@/components/PageContent";
import { NetworkSlice } from "@/components/types";
import { useAuth } from "@/utils/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPostNetworkSlice } from "@/utils/callNetworkSliceApi";

const NetworkConfiguration = () => {
  const queryClient = useQueryClient();
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [networkSlice, setNetworkSlice] = useState<NetworkSlice | undefined>(undefined);
  const [refresh, setRefresh] = useState(false); // State to track refresh (optional if using mutation directly)
  const auth = useAuth()

  // Fetching Network Slices using useQuery
  const { data: networkSlices = [], isLoading: loading, status: networkSlicesQueryStatus, error: networkSlicesQueryError } = useQuery({
    queryKey: [queryKeys.networkSlices, auth.user?.authToken],
    queryFn: () => getNetworkSlices(auth.user ? auth.user.authToken : ""),
    enabled: !!auth.user, // Only enable if the user is authenticated
    retry: (failureCount, error): boolean => {
      if (error.message.includes("401")) {
        return false
      }
      return true
    }
  });

  // Mutation hook to add a new Network Slice
  const addNetworkSlice = async (newSlice: NetworkSlice): Promise<Response> => {
      return await apiPostNetworkSlice(newSlice["slice-name"], newSlice, auth.user?.authToken || "");
  };

  const addNetworkSliceMutation = useMutation<unknown, Error, NetworkSlice>({
      mutationFn: addNetworkSlice,
      onSuccess: () => {
          // Invalidate and refetch the network slices query
          queryClient.invalidateQueries({ queryKey: [queryKeys.networkSlices] });

          // Optionally trigger refresh via state (if more actions depend on it)
          setRefresh(true);
      },
      onError: (error) => {
          console.error("Error adding network slice:", error);
      },
  });

  // Trigger UI refresh when refresh flag is set
  useEffect(() => {
      if (refresh) {
          setRefresh(false); // Reset refresh state
          setCreateModalVisible(false); // Close modal after adding network slice
      }
  }, [refresh]);

  const handleAddNetworkSlice = (newSlice: NetworkSlice) => {
      addNetworkSliceMutation.mutate(newSlice);
  };

  const toggleCreateNetworkSliceModal = () =>
    setCreateModalVisible((prev) => !prev);

  const toggleEditNetworkSliceModal = () =>
    setEditModalVisible((prev) => !prev);

  const handleConfirmDelete = async (sliceName: string) => {
    await deleteNetworkSlice(sliceName, auth.user ? auth.user.authToken : "");
    void queryClient.invalidateQueries({ queryKey: [queryKeys.networkSlices] });
  };

  const handleEditButton = (networkSlice: NetworkSlice) => {
    setNetworkSlice(networkSlice);
    toggleEditNetworkSliceModal();
  }

  const getEditButton = (networkSlice: NetworkSlice) => {
    return <Button
      appearance=""
      onClick={() => { handleEditButton(networkSlice) }}
      className="u-no-margin--bottom">
      Edit
    </Button>
  }

  const getDeleteButton = (sliceName: string, deviceGroups: string[] | undefined) => {
    if (deviceGroups &&
      deviceGroups.length > 0) {
      return <ConfirmationButton
        appearance="negative"
        className="u-no-margin--bottom"
        confirmationModalProps={{
          title: "Warning",
          confirmButtonLabel: "Delete",
          buttonRow: (null),
          onConfirm: () => { },
          children: (
            <p>
              Network slice <b>{sliceName}</b> cannot be deleted.<br />
              Please remove the following device groups first:
              <br />
              {deviceGroups.join(", ")}.
            </p>
          ),
        }} >
        Delete
      </ConfirmationButton>
    }
    return <ConfirmationButton
      appearance="negative"
      className="u-no-margin--bottom"
      shiftClickEnabled
      showShiftClickHint
      confirmationModalProps={{
        title: "Confirm Delete",
        confirmButtonLabel: "Delete",
        onConfirm: () => handleConfirmDelete(sliceName),
        children: (
          <p>
            This will permanently delete the network slice <b>{sliceName}</b><br />
            This action cannot be undone.
          </p>
        ),
      }} >
      Delete
    </ConfirmationButton>
  }

  if (loading) {
    return <Loader text="Loading..." />;
  }

  if (networkSlicesQueryStatus == "error") {
      if (networkSlicesQueryError.message.includes("401")) {
          auth.logout()
      }
      return <p>{networkSlicesQueryError.message}</p>
  }

  return (
    <>
      {networkSlices.length > 0 && (
        <PageHeader title={`Network slices (${networkSlices.length})`}>
          <Button appearance="positive" onClick={toggleCreateNetworkSliceModal}>
            Create
          </Button>
        </PageHeader>
      )}
      <PageContent>
        {networkSlices.length === 0 && <NetworkSliceEmptyState />}
        {networkSlices.length > 0 && (
          <>
            {networkSlices.map((slice) => (
              <Card key={slice["slice-name"]}>
                <h2 className="p-heading--5">{slice["slice-name"]}</h2>
                <NetworkSliceTable slice={slice} />
                <hr />
                <div className="u-align--right">
                  {getEditButton(slice)}
                  {getDeleteButton(slice["slice-name"], slice["site-device-group"])}
                </div>
              </Card>
            ))}
          </>
        )}
      </PageContent>
      {isCreateModalVisible && (
        <NetworkSliceModal
          toggleModal={toggleCreateNetworkSliceModal}
          onSave={handleAddNetworkSlice} // Pass the mutation handler to modal for saving new slice
        />
      )}
      {isEditModalVisible && (
        <NetworkSliceModal
          networkSlice={networkSlice}
          toggleModal={toggleEditNetworkSliceModal}
        />
      )}
    </>
  );
};
export default NetworkConfiguration;
