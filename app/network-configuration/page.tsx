"use client";
import React, { useState, useEffect } from "react";
import NetworkSliceEmptyState from "@/components/NetworkSliceEmptyState";
import {
  Row,
  Col,
  Button,
  MainTable,
  Chip,
  ContextualMenu,
  Card,
} from "@canonical/react-components";
import NetworkSliceModal from "@/components/NetworkSliceModal";
import { deleteDeviceGroup } from "@/utils/deleteDeviceGroup";

import DeviceGroupEmptyState from "@/components/DeviceGroupEmptyState";
export type NetworkSlice = {
  name: string;
  SliceName?: string;
  "slice-id"?: {
    sst: string;
    sd: string;
  };
  "site-device-group"?: any;
  "site-info"?: {
    "site-name": string;
    plmn: {
      mcc: string;
      mnc: string;
    };
    gNodeBs?: any;
    upf: {
      "upf-name": string;
      "upf-port": string;
    };
  };
};

export default function NetworkConfiguration() {
  const [loading, setLoading] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [networkSlices, setNetworkSlices] = useState<NetworkSlice[]>([]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  useEffect(() => {
    fetchNetworkSlices();
  }, []);

  const fetchNetworkSlices = async () => {
    try {
      const response = await fetch(`/api/network-slice`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch network slices");
      }
      const sliceNames = await response.json();
      console.log("Slice names: ", sliceNames);

      const sliceDetailsPromises = sliceNames.map(async (sliceName: string) => {
        const detailResponse = await fetch(`/api/network-slice/${sliceName}`, {
          method: "GET",
        });
        if (!detailResponse.ok) {
          throw new Error(`Failed to fetch details for slice: ${sliceName}`);
        }
        return detailResponse.json();
      });

      const detailedSlices = await Promise.all(sliceDetailsPromises);
      console.log("Slices: ", detailedSlices);

      setNetworkSlices(detailedSlices);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleDeleteNetworkSlice = async (sliceName: string) => {
    try {
      const response = await fetch(`/api/network-slice/${sliceName}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete network slice");
      }

      fetchNetworkSlices();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteDeviceGroup = async (
    deviceGroupName: string,
    networkSliceName: string,
  ) => {
    try {
      console.log("Deleting device group");
      console.log(deviceGroupName);
      console.log(networkSliceName);
      await deleteDeviceGroup({
        name: deviceGroupName,
        networkSliceName: networkSliceName,
      });

      fetchNetworkSlices();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!networkSlices.length) {
    return (
      <NetworkSliceEmptyState onSliceCreatedInEmptyState={fetchNetworkSlices} />
    );
  }

  const handleSliceCreated = () => {
    fetchNetworkSlices();
  };

  return (
    <div>
      <Row>
        <Col size={6}>
          <h2>Network Slices</h2>
          <div className="u-align--right">
            <Button hasIcon appearance={"positive"} onClick={toggleModal}>
              Create
            </Button>
          </div>
          {networkSlices.map((slice) => (
            <Card key={slice.SliceName} title={slice.SliceName}>
              <Chip lead="MCC" value={slice["site-info"]?.plmn.mcc || "N/A"} />
              <Chip lead="MNC" value={slice["site-info"]?.plmn.mnc || "N/A"} />
              <Chip
                lead="UPF"
                value={`${slice["site-info"]?.upf["upf-name"]}:${slice["site-info"]?.upf["upf-port"]}`}
                quoteValue={true}
              />
              <Chip
                lead="gNodeBs"
                value={slice?.["site-info"]?.gNodeBs?.length}
              />
              {slice["site-device-group"] &&
              slice["site-device-group"].length > 0 ? (
                <MainTable
                  headers={[
                    {
                      content: "Device Groups",
                    },
                    {
                      content: "Actions",
                      className: "u-align--right",
                    },
                  ]}
                  rows={slice["site-device-group"].map((group: string) => ({
                    columns: [
                      { content: group },
                      {
                        content: (
                          <div className="u-align--right">
                            {" "}
                            <ContextualMenu
                              hasToggleIcon
                              links={[
                                {
                                  children: "Delete",
                                  onClick: () =>
                                    handleDeleteDeviceGroup(
                                      group,
                                      slice.SliceName,
                                    ),
                                },
                              ]}
                            />
                          </div>
                        ),
                      },
                    ],
                    key: group,
                  }))}
                />
              ) : (
                <DeviceGroupEmptyState
                  onDeviceGroupCreatedInEmptyState={fetchNetworkSlices}
                  networkSliceName={slice.SliceName}
                />
              )}
              <hr />
              <div className="u-align--right">
                <Button
                  hasIcon
                  appearance={"negative"}
                  onClick={() => handleDeleteNetworkSlice(slice.SliceName)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </Col>
      </Row>
      {isModalVisible && (
        <NetworkSliceModal
          toggleModal={toggleModal}
          onSliceCreated={handleSliceCreated}
        />
      )}
    </div>
  );
}
