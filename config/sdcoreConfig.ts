const WEBUI_ENDPOINT: string = "http://localhost:8543";

const STATIC_SUSBCRIBER_DATA = {
  plmnID: "20893",
};

const STATIC_DEVICE_GROUP_DATA = {
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

const NETWORK_SLICE_NAME: string = "default";

const STATIC_NETWORK_SLICE_DATA = {
  "slice-id": {
    sst: 1,
    sd: "010203",
  },
  "site-device-group": ["cows"],
  "site-info": {
    "site-name": "demo",
    gNodeBs: [
      {
        name: "demo-gnb1",
        tac: "1",
      },
    ],
    upf: {
      "upf-name": "upf",
      "upf-port": "8805",
    },
  },
};

export {
  WEBUI_ENDPOINT,
  STATIC_SUSBCRIBER_DATA,
  STATIC_DEVICE_GROUP_DATA,
  STATIC_NETWORK_SLICE_DATA,
  NETWORK_SLICE_NAME,
};
