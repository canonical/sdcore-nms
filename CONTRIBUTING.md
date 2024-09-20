# Contributing

The NMS consists of both a backend and a frontend component. You need to set up and run both to contribute effectively to the project.

## Getting Started

Ensure you have [`Nodejs 18`](https://nodejs.org/), Go installed, and access to a MongoDB instance.

1. Clone the NMS and the Webui repositories:

   ```shell
   git clone git@github.com:canonical/sdcore-nms.git
   ```

   ```shell
   git clone git@github.com:omec-project/webconsole.git
   ```

2. Navigate to the NMS project directory:

   ```shell
   cd sdcore-nms
   ```

## Development Setup

Create a webui configuration file. You can use `./example/webuicfg.yaml` as an example (DB information needs to be updated):

   ```yaml
   mongodb:
      name: <common_db_name>
      url: <mongodb://localhost:27017/common_db_name>
      authKeysDbName: <auth_db_name>
      authUrl: <mongodb://localhost:27017/auth_db_name>
   ```

## Running the Project

Run the project:

   ```shell
   make WEBUI_REPO_PATH=<path/to/the/Webui> CONFIG_FILE_PATH=<path/to/config/file>
   ```

Both `WEBUI_REPO_PATH` and `CONFIG_FILE_PATH` are optional parameters:
- `WEBUI_REPO_PATH`: Absolute path to the Webui repository. If not provided, the default value` ./../webconsole` will be used.
- `CONFIG_FILE_PATH`: Absolute path to the Webui configuration file. If not provided, the default value `./example/webuicfg.yaml` will be used.

You can omit these variables if the default paths are correct for your environment.

Once the project is running, open [http://localhost:5000](http://localhost:5000) in your browser to view the changes.

You will need to run this command after every modification to the NMS code. Changes will not be automatically reflected in your web browser.

## Testing

This project uses [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for linting and code formatting.

💡 We recommend using the [Prettier extension for VSCode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) for easy on-save code formatting.

To run lint check:

```shell
npm run lint
```

## Build

To build the project:

```shell
make build-nms
```

This command will automatically create an `./out` directory with the NMS static files.

## Container image

Pack the rock

```bash
sudo snap install rockcraft --edge --classic
rockcraft pack -v
```

Move the rock to Docker's registry

```bash
sudo rockcraft.skopeo --insecure-policy copy oci-archive:sdcore-nms_<version>_amd64.rock docker-daemon:sdcore-nms:<version>
```

Run the NMS

```bash
docker run -p 3000:3000 sdcore-nms:<version>
```

You will have the NMS available in `http://localhost:3000`.
