<div align="center">
  <img src="./onf-icon.svg" alt="ONF Icon" width="200" height="200">
</div>
<br/>
<div align="center">
  <h1>SD-Core GUI</h1>
</div>

:warning: **Proof of Concept**

Graphical User Interface (GUI) for operating the core (creating subscribers, network slices, device groups).

## Usage

### Local development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 🪨 Rock Container Image

1. Install rockcraft

```bash
sudo snap install rockcraft --channel=latest/edge --classic
```

2. Build the image

```bash
rockcraft pack
```

3. Install `skopeo`

```bash
sudo snap install skopeo --edge --devmode
```

4. Import the image to Docker

```bash
sudo skopeo --insecure-policy copy oci-archive:./sdcore-gui_0.1_amd64.rock docker-daemon:sdcore-gui-rock:latest
```

5. Run the image

```bash
docker run -p 3000:3000 sdcore-gui-rock:latest
```
