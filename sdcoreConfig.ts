// SD-Core Webui configuration file.

// The endpoint for the SD-Core Webui API service.
export const WEBUI_ENDPOINT: string = "http://3.90.228.4:8543";

export const STATIC_SUSBCRIBER_DATA = {
  // The PLMN ID of the subscriber. This is a unique identifier for the Public Land Mobile Network (PLMN).
  plmnID: "20893",
};

export const STATIC_DEVICE_GROUP_DATA = {
  "site-info": "demo",
  "ip-domain-name": "pool1",
  "ip-domain-expanded": {
    dnn: "internet",
    "ue-ip-pool": "172.250.1.0/16",
    "dns-primary": "8.8.8.8",
    mtu: 1460,
    "ue-dnn-qos": {
      "dnn-mbr-uplink": 20000000,
      "dnn-mbr-downlink": 200000000,
      "traffic-class": {
        name: "platinum",
        arp: 6,
        pdb: 300,
        pelr: 6,
        qci: 8,
      },
    },
  },
};
