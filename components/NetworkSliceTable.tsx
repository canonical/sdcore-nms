"use client";

import React from "react";

import { MainTable } from "@canonical/react-components";
import { NetworkSlice } from "@/components/types";

type NetworkSliceTableProps = {
  slice: NetworkSlice;
};

export const NetworkSliceTable: React.FC<NetworkSliceTableProps> = ({
  slice,
}) => {
  return (
    <>
      <MainTable
        expanding
        headers={[
          {
            content: "Key",
          },
          {
            content: "Value",
            className: "u-align--right",
          },
        ]}
        rows={[
          {
            columns: [
              { content: "MCC" },
              {
                content: slice["site-info"]?.plmn.mcc || "",
                className: "u-align--right",
              },
            ],
            key: `mcc-${slice["slice-name"]}`,
          },
          {
            columns: [
              { content: "MNC" },
              {
                content: slice["site-info"]?.plmn.mnc || "",
                className: "u-align--right",
              },
            ],
            key: `mnc-${slice["slice-name"]}`,
          },
          {
            columns: [
              { content: "UPF" },
              {
                content: (() => {
                  const upfName = slice["site-info"]?.upf?.["upf-name"] ?? "";
                  const upfPort = slice["site-info"]?.upf?.["upf-port"] ?? "";
                  if (upfName === "" && upfPort === "") {
                    return "";
                  }
                  return `${upfName}:${upfPort}`;
                })(),
                className: "u-align--right",
              },
            ],
            key: `upf-${slice["slice-name"]}`,
          },
          {
            columns: [
              { content: "gNodeBs" },
              {
                content:
                  slice?.["site-info"]?.gNodeBs?.length.toString() || "0",
                className: "u-align--right",
              },
            ],
            key: `gNodeBs-${slice["slice-name"]}`,
          },
        ]}
      />
    </>
  );
};
