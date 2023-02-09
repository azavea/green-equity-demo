# Green Equity Demo

This project will demo a couple data visualizations of how and where Infrastructure Bill money is being spent.

### Requirements

- Docker version of 20.10.17 or higher.
- Docker Compose V2 (included in [Docker Desktop](https://www.docker.com/products/docker-desktop/) or via the [compose plugin](https://docs.docker.com/compose/install/)).

### Getting Started

```sh
./scripts/bootstrap
./scripts/update
```

A pre-commit hook that lints staged files is included. It can be installed with:

```sh
python3 -m pip install pre-commit
pre-commit install
```

If there are lint failures, they are reported and the commit is aborted.
Formatting fixes will be applied automatically. Once any other needed fixes are made,
simply reattempt the commit.

The hook can always be ignored with `git commit --no-verify`.

#### Development

Rebuild Docker images and run application.

```sh
./scripts/update
./scripts/server
```

### Ports

| Service                   | Port                            |
| ------------------------- | ------------------------------- |
| Webpack Dev Server        | [`8765`](http://localhost:8765) |
| Gunicorn for Django app   | [`8008`](http://localhost:8008) |

### Testing

```sh
./scripts/test
```

### Scripts

| Name           | Description                                                   |
| -------------- | ------------------------------------------------------------- |
| `bootstrap`    | Setup environment file                                        |
| `citasks`      | Run tasks before building images in CI                        |
| `clean`        | Free disk space by cleaning up dangling Docker images         |
| `console`      | Run interactive shell inside application container            |
| `lint`         | Lint source code                                              |
| `manage`       | Run Django management commands                                |
| `server`       | Run Docker Compose services                                   |
| `test`         | Run unit tests                                                |
| `update`       | Build Docker images                                           |
| `yarn`         | Run yarn commands on the app container                        |

### Adding new JS/TS Packages

To add a new package to the project:

```sh
./scripts/yarn add package-name
```

### Upgrading JS/TS dependencies

The update script uses a `--frozen-lockfile` flag so when packages need an upgrade:

```sh
# Manually change the package.json to upgrade the version and run:

./scripts/yarn install
```

### Use Typescript file watching

Watch for TypeScript changes and list all errors
```sh
./scripts/yarn tsc --watch
```