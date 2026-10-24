# TaskStream

![taskstream-app](https://github.com/lakshyajit165/taskstream/actions/workflows/taskstream-app.yml/badge.svg?branch=master)
![taskstream-service](https://github.com/lakshyajit165/taskstream/actions/workflows/taskstream-service.yml/badge.svg?branch=master)

The app workflow builds the React production assets. The service workflow runs the Spring Boot test suite. Both run for pull requests and pushes to `main` or `master` when either `client/` or `service/` changes. After a push to `main` or `master`, the Docker publish workflow checks that both workflows passed for the same commit before pushing the app and service images to Docker Hub. It tags each image with `sha-<commit>` and `latest`.

Add the `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` repository secrets in GitHub Actions. The token should have permission to push to the `taskstream-app` and `taskstream-service` repositories in that Docker Hub account.

The existing [docker-compose.yml](docker-compose.yml) remains the local, build-from-source setup. For a production-style deployment using the latest published app and service images and a version-pinned PostgreSQL image, provide `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `JWT_SECRET`, `AWS_REGION`, `SENDER_EMAIL`, `SENDER_EMAIL_PASSWORD`, `CLIENT_DOMAIN`, and `SERVER_DOMAIN` in your environment or an ignored `.env` file. Compose always pulls the latest app and service images when starting them:

```sh
docker compose -f docker-compose.prod.yml up -d
```

The production Compose file uses the `prod` Spring profile and requires a stable `JWT_SECRET`. For AWS access, provide the server with an IAM role or another supported AWS credentials provider. Put the services behind a load balancer or reverse proxy for public HTTPS.
