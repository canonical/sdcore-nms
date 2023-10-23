"use client";
import React, { useState } from "react";
import {
  Button,
  Card,
  ConfirmationButton,
} from "@canonical/react-components";
import { deleteNetworkSlice } from "@/utils/deleteNetworkSlice";
import { getNetworkSlices } from "@/utils/getNetworkSlices";
import CreateNetworkSliceModal from "@/components/CreateNetworkSliceModal";
import NetworkSliceEmptyState from "@/components/NetworkSliceEmptyState";
import { NetworkSliceTable } from "@/components/NetworkSliceTable";
import Loader from "@/components/Loader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/utils/queryKeys";
import PageHeader from "@/components/PageHeader";
import PageContent from "@/components/PageContent";

const NetworkConfiguration = () => {
  const queryClient = useQueryClient();
  const [isModalVisible, setModalVisible] = useState(false);

  const { data: networkSlices = [], isLoading: loading } = useQuery({
    queryKey: [queryKeys.networkSlices],
    queryFn: getNetworkSlices,
  });

  const toggleCreateNetworkSliceModal = () =>
    setModalVisible((prev) => !prev);

  const handleConfirmDelete = async (sliceName: string) => {
    await deleteNetworkSlice(sliceName);
    void queryClient.invalidateQueries({ queryKey: [queryKeys.networkSlices] });
  };

  if (loading) {
    return <Loader text="Loading..." />;
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
                <Card key={slice.SliceName}>
                  <h2 className="p-heading--5">{slice.SliceName}</h2>
                  <NetworkSliceTable slice={slice} />
                  <hr />
                  <div className="u-align--right">
                    <ConfirmationButton
                      appearance="negative"
                      className="u-no-margin--bottom"
                      shiftClickEnabled
                      showShiftClickHint
                      confirmationModalProps={{
                        title: "Confirm Delete",
                        confirmButtonLabel: "Delete",
                        onConfirm: () => handleConfirmDelete(slice.SliceName),
                        children: (
                          <p>
                            This will permanently delete the network slice <b>{slice.SliceName}</b><br/>
                            This action cannot be undone.
                          </p>
                        ),
                    }} >
                      Delete
                    </ConfirmationButton>
                  </div>
                </Card>
              ))}
            </>
          )}
      </PageContent>
      {isModalVisible && (
        <CreateNetworkSliceModal
          toggleModal={toggleCreateNetworkSliceModal}
        />
      )}
    </>
  );
};
export default NetworkConfiguration;
