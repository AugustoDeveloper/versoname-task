# Versoname Task
It's a Azure DevOPS Task to get a release version number from commits on repositories.

## Requirements
- Docker
- Node
- Typescrypt

## Getting Started

First of all, it's necessary build a image to attach and start debug code. For this, type the code below:
```bash
docker build . -t versoname-node
```
After this, create a container from this image and attach as code below:
```bash
$ docker run -it --rm -v $(PWD):/project versoname-node /bin/bash
```
Now, change to folder `project` and execute the initialization script:
```bash
$ cd /project
$ sh toosl/init.sh # Grant the file to execute the script: chmod 777 tools/init.sh
```
Just need executes the initialization one time, after that, you can execute the code:
```bash
$ sh toosl/exec.sh # Grant the file to execute the script: chmod 777 tools/exec.sh
```