import { handleGetNetworkSlice, handlePostNetworkSlice } from "@/utils/handleNetworkSlice";

interface GnbItem {
    name: string;
    tac: number;
  }
  
  interface EditNetworkSliceArgs {
    name: string;
    mcc: string;
    mnc: string;
    upfName: string;
    upfPort: string;
    gnbList: GnbItem[];
  }
  
  export const editNetworkSlice = async ({
    name,
    mcc,
    mnc,
    upfName,
    upfPort,
    gnbList,
  }: EditNetworkSliceArgs) => {
  
    try {
      const getSliceResponse = await handleGetNetworkSlice(name);
  
      if (!getSliceResponse.ok) {
        const result = await getSliceResponse.json();
        if (result.error) {
          throw new Error(result.error);
        }
        throw new Error("Error editing Network Slice " + name);
      }

      var sliceData = await getSliceResponse.json();
      sliceData["site-info"]["plmn"].mcc = mcc
      sliceData["site-info"]["plmn"].mnc = mnc
      sliceData["site-info"]["gNodeBs"] = gnbList
      sliceData["site-info"]["upf"]["upf-name"] = upfName
      sliceData["site-info"]["upf"]["upf-port"] = upfPort
  
      const postSliceResponse = await handlePostNetworkSlice(name, sliceData);
  
      if (!postSliceResponse.ok) {
        const result = await postSliceResponse.json();
        if (result.error) {
          throw new Error(result.error);
        }
        debugger;
        throw new Error(
          `Error editing network. Error code: ${postSliceResponse.status}`,
        );
      }
  
      return postSliceResponse.json();
    } catch (error: unknown) {
      console.error(error);
      const details =
        error instanceof Error
          ? error.message
          : "Failed to configure the network.";
      throw new Error(details);
    }
  };
  