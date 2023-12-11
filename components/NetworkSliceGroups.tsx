"use client";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

import React from "react";
import { Col, ConfirmationButton, MainTable, Row, } from "@canonical/react-components";
import { getAllDeviceGroups } from "@/utils/getDeviceGroup";
import { deleteDeviceGroup } from "@/utils/deleteDeviceGroup";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NetworkSlice } from "@/components/types";
import Loader from "@/components/Loader";

type NetworkSliceTableProps = {
  slice: NetworkSlice;
  isExpanded: boolean;
};

export const NetworkSliceGroups: React.FC<NetworkSliceTableProps> = ({
  slice, isExpanded
}) => {
  const queryClient = useQueryClient();
  const { data: deviceGroupContent = [], isLoading } = useQuery({
    queryKey: [queryKeys.allDeviceGroups, slice.SliceName, slice["site-device-group"]?.join(",")],
    queryFn: () => getAllDeviceGroups(slice),
    enabled: isExpanded,
  });

  const handleConfirmDelete = async (name: string, networkSliceName: string) => {
    await deleteDeviceGroup({
      name,
      networkSliceName,
    });
    await queryClient.invalidateQueries({ queryKey: [queryKeys.networkSlices] });
  };

  if (isLoading) {
    return <Loader text="Loading..." />;
  }

  if (!deviceGroupContent || deviceGroupContent.length === 0) {
    return <span className="u-text--muted">No device groups found.</span>;
  }

  const getDeleteButton = (deviceGroupName: string, deviceGroupSubscribers: string[], sliceName: string) =>
  {
    if (deviceGroupSubscribers &&
        deviceGroupSubscribers.length > 0)
    {
      return (
        <div className="u-align--right">
          <ConfirmationButton
            appearance="base"
            className="u-no-margin--bottom is-small"
            title="Delete device group"
            confirmationModalProps={{
              title: "Delete warning",
              confirmButtonLabel: "Aceptar",
              onConfirm: () => {},
              children: (
                <p>
                  Device group <b>{deviceGroupName}</b> cannot be deleted.
                  <br />
                  Please remove the following subscribers first:
                  <br />
                  {deviceGroupSubscribers.join(", ")}.
                </p>
              ),
            }}
          >
            <DeleteOutlinedIcon
              fontSize="small"
              style={{ color: "#666" }}
            />
          </ConfirmationButton>
        </div>
      )
    }
    else {
      return (
        <div className="u-align--right">
          <ConfirmationButton
            appearance="base"
            className="u-no-margin--bottom is-small"
            shiftClickEnabled
            showShiftClickHint
            title="Delete device group"
            confirmationModalProps={{
              title: "Confirm Delete",
              confirmButtonLabel: "Delete",
              onConfirm: () => handleConfirmDelete(deviceGroupName, sliceName),
              children: (
                <p>
                  This will permanently delete the device group <b>{deviceGroupName}</b>.
                  <br />
                  You cannot undo this action.
                </p>
              ),
            }}
          >
            <DeleteOutlinedIcon
              fontSize="small"
              style={{ color: "#666" }}
            />
          </ConfirmationButton>
        </div>
      )
    }

  }

  return deviceGroupContent.map((deviceGroup) => (
      <Row key={deviceGroup["group-name"]}>
        <Col size={8}>
          <MainTable
            headers={[
              {
                content: deviceGroup?.["group-name"] || "N/A",
              },
              {
                content: getDeleteButton(deviceGroup?.["group-name"], deviceGroup?.["imsis"] , slice.SliceName),
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
    ));
};
