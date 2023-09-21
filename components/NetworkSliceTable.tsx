"use client";

import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Button,
  MainTable,
  Icon,
  ICONS,
} from "@canonical/react-components";
import { NetworkSlice } from "@/components/types";
import { getDeviceGroup } from "@/utils/getDeviceGroup";
import { deleteDeviceGroup } from "@/utils/deleteDeviceGroup";
import { getNetworkSlice } from "@/utils/getNetworkSlice";
import DeviceGroupModal from "@/components/DeviceGroupModal";

type NetworkSliceTableProps = {
  sliceName: string;
};

export const NetworkSliceTable: React.FC<NetworkSliceTableProps> = ({
  sliceName,
}) => {
  const [slice, setSlice] = useState<NetworkSlice | null>(null);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [deviceGroupContent, setDeviceGroupContent] = useState<any[] | null>(
    null,
  );
  const [isDeviceGroupModalVisible, setIsDeviceGroupModalVisible] =
    useState(false);
  const toggleDeviceGroupModal = () => {
    setIsDeviceGroupModalVisible(!isDeviceGroupModalVisible);
  };

  useEffect(() => {
    const fetchNetworkSlice = async () => {
      const fetchedSlice = await getNetworkSlice(sliceName);
      setSlice(fetchedSlice);
    };

    fetchNetworkSlice();
  }, [sliceName]);

  useEffect(() => {
    if (expandedRow && slice && slice["site-device-group"]) {
      handleViewDeviceGroups(slice["site-device-group"]);
    }
  }, [expandedRow, slice]);

  const handleViewDeviceGroups = async (deviceGroupNames: string[]) => {
    const groupContents = await Promise.all(
      deviceGroupNames.map((name) => getDeviceGroup(name)),
    );
    setDeviceGroupContent(groupContents);
  };

  const handleToggleRow = (slice: NetworkSlice) => {
    const sliceKey = `device-groups-${slice.SliceName}`;
    setExpandedRow(expandedRow === sliceKey ? null : sliceKey);
  };

  const handleDeleteDeviceGroup = async (
    deviceGroupName: string,
    networkSliceName: string,
  ) => {
    await deleteDeviceGroup({ name: deviceGroupName, networkSliceName });

    const updatedSlice = await getNetworkSlice(sliceName);
    setSlice(updatedSlice);

    if (updatedSlice["site-device-group"]) {
      const updatedDeviceGroups = await Promise.all(
        updatedSlice["site-device-group"].map((name: string) =>
          getDeviceGroup(name),
        ),
      );
      setDeviceGroupContent(updatedDeviceGroups);

      if (updatedDeviceGroups.length === 0) {
        setExpandedRow(null);
      }
    }
  };

  const handleCreateDeviceGroup = async () => {
    toggleDeviceGroupModal();
  };

  const handleDeviceGroupCreated = async () => {
    const networkSlice = await getNetworkSlice(sliceName);
    setSlice(networkSlice);
    const DeviceGroups = await Promise.all(
      networkSlice["site-device-group"].map((name: string) =>
        getDeviceGroup(name),
      ),
    );
    setDeviceGroupContent(DeviceGroups);
  };

  if (!slice) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isDeviceGroupModalVisible && slice?.SliceName && (
        <DeviceGroupModal
          toggleModal={toggleDeviceGroupModal}
          onDeviceGroupCreated={handleDeviceGroupCreated}
          networkSliceName={slice.SliceName}
        />
      )}
      <MainTable
        expanding
        headers={[
          {
            content: "",
          },
          {
            content: "",
          },
        ]}
        rows={[
          {
            columns: [
              { content: "MCC" },
              {
                content: slice["site-info"]?.plmn.mcc || "N/A",
                className: "u-align--right",
              },
            ],
            key: `mcc-${slice.SliceName}`,
          },
          {
            columns: [
              { content: "MNC" },
              {
                content: slice["site-info"]?.plmn.mnc || "N/A",
                className: "u-align--right",
              },
            ],
            key: `mnc-${slice.SliceName}`,
          },
          {
            columns: [
              { content: "UPF" },
              {
                content: `${slice["site-info"]?.upf?.["upf-name"] || "N/A"}:${
                  slice["site-info"]?.upf?.["upf-port"] || "N/A"
                }`,

                className: "u-align--right",
              },
            ],
            key: `upf-${slice.SliceName}`,
          },
          {
            columns: [
              { content: "gNodeBs" },
              {
                content:
                  slice?.["site-info"]?.gNodeBs?.length.toString() || "N/A",
                className: "u-align--right",
              },
            ],
            key: `gNodeBs-${slice.SliceName}`,
          },
          {
            columns: [
              { content: "Device Groups" },
              {
                content: (
                  <div className="u-align--right">
                    <Button
                      className="u-toggle"
                      small
                      hasIcon
                      appearance={"base"}
                      onClick={() => {
                        handleCreateDeviceGroup();
                      }}
                    >
                      <Icon name={ICONS.plus} />
                    </Button>
                    <Button
                      small
                      hasIcon
                      disabled={
                        !slice["site-device-group"] ||
                        slice["site-device-group"].length === 0
                      }
                      appearance={"base"}
                      onClick={() => handleToggleRow(slice)}
                    >
                      <Icon name={ICONS.chevronDown} />
                    </Button>
                  </div>
                ),
              },
            ],
            expandedContent:
              deviceGroupContent && deviceGroupContent.length > 0
                ? deviceGroupContent.map((deviceGroup, index: number) => (
                    <Row key={`deviceGroupRow-${index}`}>
                      <Col size={8}>
                        <MainTable
                          headers={[
                            {
                              content: deviceGroup?.DeviceGroupName || "N/A",
                            },
                            {
                              content: (
                                <div className="u-align--right">
                                  <Button
                                    appearance={"base"}
                                    small
                                    onClick={() =>
                                      handleDeleteDeviceGroup(
                                        deviceGroup.DeviceGroupName,
                                        slice.SliceName,
                                      )
                                    }
                                  >
                                    <Icon name={ICONS.delete} />
                                  </Button>
                                </div>
                              ),
                              className: "u-align--right",
                            },
                          ]}
                          rows={[
                            {
                              columns: [
                                { content: "Subscriber IP Pool" },
                                {
                                  content:
                                    deviceGroup?.["ip-domain-expanded"]?.[
                                      "ue-ip-pool"
                                    ] || "N/A",

                                  className: "u-align--right",
                                },
                              ],
                            },
                            {
                              columns: [
                                { content: "DNS" },
                                {
                                  content:
                                    deviceGroup?.["ip-domain-expanded"]?.[
                                      "dns-primary"
                                    ] || "N/A",

                                  className: "u-align--right",
                                },
                              ],
                            },
                            {
                              columns: [
                                { content: "MTU" },
                                {
                                  content:
                                    deviceGroup?.["ip-domain-expanded"]?.[
                                      "mtu"
                                    ] || "N/A",

                                  className: "u-align--right",
                                },
                              ],
                            },
                            {
                              columns: [
                                {
                                  content: "Maximum Bitrate - Downstream",
                                },
                                {
                                  content: deviceGroup?.[
                                    "ip-domain-expanded"
                                  ]?.["ue-dnn-qos"]?.["dnn-mbr-downlink"]
                                    ? `${
                                        deviceGroup?.["ip-domain-expanded"]?.[
                                          "ue-dnn-qos"
                                        ]?.["dnn-mbr-downlink"] / 1_000_000
                                      } Mbps`
                                    : "N/A",
                                  className: "u-align--right",
                                },
                              ],
                            },
                            {
                              columns: [
                                {
                                  content: "Maximum Bitrate - Upstream",
                                },
                                {
                                  content: deviceGroup?.[
                                    "ip-domain-expanded"
                                  ]?.["ue-dnn-qos"]?.["dnn-mbr-uplink"]
                                    ? `${
                                        deviceGroup?.["ip-domain-expanded"]?.[
                                          "ue-dnn-qos"
                                        ]?.["dnn-mbr-uplink"] / 1_000_000
                                      } Mbps`
                                    : "N/A",
                                  className: "u-align--right",
                                },
                              ],
                            },
                          ]}
                        />
                      </Col>
                    </Row>
                  ))
                : null,
            expanded: expandedRow === `device-groups-${slice.SliceName}`,
            key: `device-groups-${slice.SliceName}`,
          },
        ]}
      />
    </>
  );
};
