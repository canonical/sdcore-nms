# Contributing


## Development

To make contributions to this project, make sure you have [`Nodejs 18`](https://nodejs.org/) installed.

1. Clone the NSM and the Webui repositories:

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

3. Update the config file on `./example/webuicfg.yaml` with the DB information:

   ```shell
  mongodb:
    name: <common_db_name>
    url: <common_db_url>
    authKeysDbName: <auth_db_name>
    authUrl: <auth_db_name>
    webuiDbName: <webui_db_name>
    webuiDbUrl: <webui_db_name>
   ```

4. Run the project

   ```shell
   make NMS_REPO_PATH=<path/to/the/NMS> WEBUI_REPO_PATH=<path/to/the/Webui>
   ```

Open [http://localhost:5000](http://localhost:5000) with your browser to view the changes.

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
npm run build
```

This command will automatically create the `./out` directory with the NMS static files.

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
