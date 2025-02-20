import { apiGetNetworkSlice, apiPostNetworkSlice } from "@/utils/callNetworkSliceApi";

interface GnbItem {
  name: string;
  tac: number;
}

interface CreateNetworkSliceArgs {
  name: string;
  mcc: string;
  mnc: string;
  upfName: string;
  upfPort: string;
  gnbList: GnbItem[];
  token: string;
}

export const createNetworkSlice = async ({
  name,
  mcc,
  mnc,
  upfName,
  upfPort,
  gnbList,
  token
}: CreateNetworkSliceArgs) => {
  const sliceData = {
    "slice-id": {
      sst: "1",
      sd: "102030",
    },
    "site-device-group": [],
    "site-info": {
      "site-name": "demo",
      plmn: {
        mcc,
        mnc,
      },
      gNodeBs: gnbList,
      upf: {
        "upf-name": upfName,
        "upf-port": upfPort,
      },
    },
  };

  try {
    const getNetworkSliceResponse = await apiGetNetworkSlice(name, token)
    if (getNetworkSliceResponse.ok) {
      throw new Error("Network slice already exists");
    }

    const updateNetworkSliceResponse = await apiPostNetworkSlice(name, sliceData, token);
    if (!updateNetworkSliceResponse.ok) {
      const networkSliceData = await updateNetworkSliceResponse.json();
      if (networkSliceData.error) {
        throw new Error(networkSliceData.error);
      }
      debugger;
      throw new Error(
        `Error creating network slice. Error code: ${updateNetworkSliceResponse.status}`,
      );
    }

    return updateNetworkSliceResponse.json();
  } catch (error: unknown) {
    console.error(error);
    const details =
      error instanceof Error
        ? error.message
        : "Failed to configure the network.";
    throw new Error(details);
  }
};
