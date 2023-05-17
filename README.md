# MJML docker microservice / server

[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=draytechnologies_mjml-server&metric=ncloc&token=ad35c31c0d1291c4c0be372df94b6b7f4daa7577)](https://sonarcloud.io/summary/new_code?id=draytechnologies_mjml-server)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=draytechnologies_mjml-server&metric=coverage&token=ad35c31c0d1291c4c0be372df94b6b7f4daa7577)](https://sonarcloud.io/summary/new_code?id=draytechnologies_mjml-server)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=draytechnologies_mjml-server&metric=duplicated_lines_density&token=ad35c31c0d1291c4c0be372df94b6b7f4daa7577)](https://sonarcloud.io/summary/new_code?id=draytechnologies_mjml-server)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/draytechnologies/mjml-server/tree/main.svg?style=shield&circle-token=5ab0c3d18bca57fddb92c020e7cfb94f7264ee75)](https://dl.circleci.com/status-badge/redirect/gh/draytechnologies/mjml-server/tree/main)

[![CircleCI](https://dl.circleci.com/insights-snapshot/gh/draytechnologies/mjml-server/main/main/badge.svg?window=30d&circle-token=5ab0c3d18bca57fddb92c020e7cfb94f7264ee75)](https://app.circleci.com/insights/github/draytechnologies/mjml-server/workflows/main/overview?branch=main&reporting-window=last-30-days&insights-snapshot=true)

![CI Releases](https://img.shields.io/badge/RELEASES-ENABLED-success?style=flat)

Our default release pipeline is enabled for this repository. Merge to deploy to stage; Release/tag to deploy to production.

## Description

Standalone mjml server, listening on port 8080/tcp.

Due to various challenges this image sports the following features:

- Clean and fast shutdowns on docker.
- Simple CORS capabilities.
- Small footprint (at least in a npm way).
- Supports healthchecks.

# Table of contents

- [Overview](#overview)
- [Defaults](#defaults)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
  - [Kubernetes](#kubernetes)

## Overview

This image spools up a simple mjml server instance, listening to port 8080/tcp per default.

Due to GDPR / DSGVO reasons I required the mjml instance to be under my own control, as the processing personal information is processed in mail content generation.

Starting the image is as easy as running a test instance through docker

```sh
docker-compose up
cd test
curl --data "@raw.mjml" http://localhost:8080
```

## Defaults

The production defaults, without any override, default to:

```sh
CORS=""
MAX_REQUEST_BODY="2048kb"
MJML_KEEP_COMMENTS="false"
MJML_VALIDATION_LEVEL="soft"
MJML_BEAUTIFY="false"
HEALTHCHECK="true"
CHARSET="utf8"
DEFAULT_RESPONSE_CONTENT_TYPE="text/html; charset=utf-8"
```

## Development

For development environments I would suggest to switch it to

```sh
CORS="*"
MJML_KEEP_COMMENTS="true"
MJML_VALIDATION_LEVEL="strict"
MJML_BEAUTIFY="false"
HEALTHCHECK="false"
```

This will escalate any issues you have with invalid mjml code to the docker log (`stdout` or `docker-compose logs`).

## Troubleshooting

Make sure you pass along a plain Content-Type header and pass the mjml as raw body.

Catch errors by looking at the HTTP response code.

### Kubernetes

As the default Dockerfile specific `HEALTHCHECK` directive is not supported by kubernetes, you might need to specify your own probes:

```
spec:
  containers:
  - name: ...
    livenessProbe:
      exec:
        command:
        - curl - 'http://localhost:8080/health/liveness'
      initialDelaySeconds: 30
      periodSeconds: 30
    readinessProbe:
      exec:
        command:
        - curl - 'http://localhost:8080/health/readiness'
      initialDelaySeconds: 25
```
