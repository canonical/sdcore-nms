# Contributing

NMS is the frontend code for SD-Core's [`Webconsole`](https://github.com/omec-project/webconsole/).
It is based on the [`Next.js`](https://nextjs.org/) React framework.  In order to produce the final
binary that will be used to serve the frontend for SD-Core, we statically export the project in this repository, embed it in the `Webconsole` application, and build the project together. The final webserver
binary is the output of `Webconsole`'s build command.

Since we only rely on the static export, this means that running the common `npm run dev` script may produce unusual behaviour that doesn't exist in a deployed build. It also means that the project does not use any of Nextjs's server based features which can be found [here](https://nextjs.org/docs/app/building-your-application/deploying/static-exports#unsupported-features).

## Development

We use a makefile to build and deploy the project. It has targets that will help with development. You can read more about what the makefile does in the [`Build`](#build) section below.

### `make webconsole`

This target will produce the webconsole binary with the static export of NMS embedded as its frontend.

`go` and `nodejs` must be installed to use this option.

### `make rock`

This target will produce a `sdcore-nms.rock` OCI image file, which will have the webconsole binary as a service. It will use the master branch of webconsole by default.
If you want to use a specific tag for the webconsole repository, you must switch to the branch/tag in ./build/webconsole-src

`rockcraft` must be installed to use this option.

### `make deploy`

This target will create an LXC VM called `nms`, install docker, deploy the `NMS` and `MongoDB` OCI image, create a valid config file for `NMS`, and start the program.
After the process is done, from your host machine you can run `lxc list`, and use the IP address to connect to both MongoDB and NMS. The port for NMS is `:5000` and the port for MongoDB is `:27017`.

`make rock` must have successfully completed and `lxd` must be installed to use this option.

### `make hotswap`

This target will take the webconsole binary, place it in the `nms` container inside the LXC VM, and restart the pebble service. This is useful for quickly updating the locally deployed NMS program.

`make deploy` must have successfully completed to use this option.

### `make logs`

This target will print the last 20 log entries that was produced by the rock, which is the combination of
pebble and webconsole logs.

`make deploy` must have successfully completed to use this option.

### `make clean`

This target will delete the rock, the binary, and destroy the VM.

## Testing

This project uses [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for linting and code formatting.

💡 We recommend using the [Prettier extension for VSCode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) for easy on-save code formatting.

To run lint check:

```shell
npm run lint
```

## Enabling copy to clipboard

Since most browsers expose the Clipboard API only for secure contexts (HTTPS, for instance), it is required to enable it manually.

### Google Chrome

To enable Clipboard API for HTTP in Google Chrome, open the `chrome://flags` page, enable the `unsafely-treat-insecure-origin-as-secure`
experimental feature and add the NMS endpoint in the whitelisted domains.

## Build

There are 2 targets for building: the `webconsole` binary and the `sdcore-nms.rock` OCI image. The artifacts
for them are stored in the `/artifacts` folder. Any files used in the build process are stored in the `/build` folder.

### Webconsole binary

`go` and `nodejs` are required to build webconsole.

The `make webconsole` target is responsible for producing the binary that serves the NMS frontend. Once run, it will:

1. Clone the `omec-project/webconsole` repository into `build/webconsole-src`
2. Install the frontend dependencies by running `npm install`
3. Generate the static frontend files by running `npm run build`
4. Move the frontend files into `build/webconsole-src/ui/frontend_files`
5. Build the webconsole binary by running `go build --tags ui -o webconsole ./server.go`

The binary will need to be run with a config file. An example is available in the `examples/config` folder.

### OCI image

`rockcraft` is required to create the OCI image.

The rock can be built with `rockcraft pack`. This process will use the local NMS and a predefined tag of webconsole repository to create an OCI image. The webconsole branch/tag is defined in the `rockcraft.yaml` file.

The `make rock` target modifies this build process by directly using the `build/webconsole-src` directory. This allows you to use a local version of webconsole in the OCI image instead of having to pull from the specified tag in `rockcraft.yaml`. This is useful if you want to test changes to the backend rather than the frontend. The process is:

1. Modify the `rockcraft.yaml` to use `build/webconsole-src`
2. Run `rockcraft pack`
3. Restore the original `rockcraft.yaml`

## Deploy

The binary requires a config file and an available MongoDB deployment to operate. By default, the path for the config file is `./config/webuicfg.yaml` from the directory of the binary. The OCI image does not come with a config file preconfigured, but the repository contains an example at `examples/config/webuicfg.yaml`.

`make deploy` takes care of quickly getting a running program. It will:

1. Create a VM in LXD called `nms`
2. Install docker and skopeo in the VM
3. Load the `sdcore-nms.rock` OCI image and pull the `mongodb:noble` image into the local registry.
4. Run both images in docker
5. Load the example config located in `examples/config/webuicfg.yaml` into the `nms` docker image, and restart the program.
