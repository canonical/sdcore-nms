import { GnbItem, NetworkSlice, UpfItem } from "@/components/types";
import { OperationError, WebconsoleApiError } from "@/utils/errors";


function isValidNetworkSliceName(name: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(name);
}

export const apiGetAllNetworkSlices = async (token: string): Promise<string[]> => {
  try {
    const response = await fetch(`/config/v1/network-slice`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });
    const respData = await response.json();
    if (!response.ok) {
      throw new WebconsoleApiError(response.status, respData.error);
    }
    return respData;
  } catch (error) {
    console.error(`Error retrieving network slices: ${error}`);
    throw error;
  }
};

export async function apiGetNetworkSlice (name: string, token: string): Promise<Response> {
  if (!isValidNetworkSliceName(name)) {
    throw new OperationError(`Error getting network slice: Invalid name provided ${name}.`);
  }
  try {
    return await fetch(`/config/v1/network-slice/${name}`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(`Error retrieving network slice ${name}: ${error}`);
    throw error;
  }
};

export async function apiPostNetworkSlice (name: string, sliceData: any, token: string): Promise<void>{
  if (!isValidNetworkSliceName(name)) {
    throw new OperationError(`Error updating network slice: Invalid name provided ${name}.`);
  }
  try {
    const response = await fetch(`/config/v1/network-slice/${name}`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sliceData),
    });
    const respData = await response.json();
    if (!response.ok) {
      throw new WebconsoleApiError(response.status, respData.error);
    }
  } catch (error) {
    console.error(`Error in POST network slice ${name}: ${error}`);
    throw error;
  }
};

interface CreateNetworkSliceArgs {
  name: string;
  mcc: string;
  mnc: string;
  sst: string;
  upf : UpfItem;
  gnbList: GnbItem[];
  token: string;
}

export async function createNetworkSlice({
  name,
  mcc,
  mnc,
  sst,
  upf,
  gnbList,
  token
}: CreateNetworkSliceArgs): Promise<void> {
  const sliceData = {
    "slice-id": {
      sst: sst,
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
        "upf-name": upf.hostname,
        "upf-port": upf.port,
      },
    },
  };

  try {
    const getNetworkSliceResponse = await apiGetNetworkSlice(name, token)
    if (getNetworkSliceResponse.ok) {
      throw new OperationError("Network slice already exists.");
    }

    if (getNetworkSliceResponse.status !== 404) {
      const networkSliceData = await getNetworkSliceResponse.json();
      throw new WebconsoleApiError(getNetworkSliceResponse.status, networkSliceData.error);
    }
    await apiPostNetworkSlice(name, sliceData, token);
  } catch (error: unknown) {
    console.error(`Failed to create network slice ${name} : ${error}`);
    throw error;
  }
};


interface EditNetworkSliceArgs {
  name: string;
  mcc: string;
  mnc: string;
  sst: string;
  upf: UpfItem;
  gnbList: GnbItem[];
  token: string
}

export async function editNetworkSlice({
  name,
  mcc,
  mnc,
  sst,
  upf,
  gnbList,
  token
}: EditNetworkSliceArgs): Promise<void>{

  try {
    const getSliceResponse = await apiGetNetworkSlice(name, token);
    const sliceData = await getSliceResponse.json();
    if (!getSliceResponse.ok) {
      throw new WebconsoleApiError(getSliceResponse.status, sliceData.error);
    }
    const sliceUpdate = {
      "slice-id": {
        sst: sst,
        sd: "102030",
      },
      "site-device-group": sliceData["site-device-group"],
      "site-info": {
        "site-name": "demo",
        plmn: {
          mcc,
          mnc,
        },
        gNodeBs: gnbList,
        upf: {
          "upf-name": upf.hostname,
          "upf-port": upf.port,
        },
      },
    };
  await apiPostNetworkSlice(name, sliceUpdate, token);
  } catch (error: unknown) {
    console.error(`Failed to edit network slice ${name} : ${error}`);
    throw error;
  }
};

export async function getNetworkSlices (token: string): Promise<NetworkSlice[]> {
  try {
    const sliceNames = await apiGetAllNetworkSlices(token);
    const sliceDetailsPromises = sliceNames.map(async (sliceName: string) => {
      const detailResponse = await apiGetNetworkSlice(sliceName, token);
      const networkSliceData = await detailResponse.json();
      if (!detailResponse.ok) {
        throw new WebconsoleApiError(detailResponse.status, networkSliceData.error);
      }
      return networkSliceData;
    });
    return await Promise.all(sliceDetailsPromises);
  } catch (error) {
    console.error(`Failed to get network slices: ${error}`);
    throw error;
  }
};

export async function deleteNetworkSlice(name: string, token: string): Promise<void> {
  if (!isValidNetworkSliceName(name)) {
    throw new OperationError(`Error deleting network slice: Invalid name provided ${name}.`);
  }
  try {
    const response = await fetch(`/config/v1/network-slice/${name}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const respData = await response.json();
      throw new WebconsoleApiError(response.status, respData.error);
    }
  } catch (error) {
    console.error(`Error deleting network slice ${name} ${error}`);
    throw error;
  }
};
