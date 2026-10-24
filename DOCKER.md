# Running TaskStream with Docker Compose

TaskStream runs as three containers: the React client, Spring Boot API, and PostgreSQL database. The client is served by Nginx, which proxies `/api` requests to the API container. PostgreSQL data is persisted in a named Docker volume.

## Start

1. Copy `.env.example` to `.env` and set a private PostgreSQL password. Add the SMTP credentials if password-reset emails are needed. Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` if S3 uploads are needed.
2. Start the services from the repository root:

   ```sh
   docker compose up --build
   ```

3. Open the client at <http://localhost:5173>. The API is also published at <http://localhost:8000> for OAuth provider callbacks.

The API waits for PostgreSQL's health check before starting. Flyway applies the database migrations on startup. Use `docker compose down` to stop the services; the database volume remains. `docker compose down -v` also deletes that volume and all stored database data.

The Spring Boot image uses a Maven build stage and an Eclipse Temurin JRE runtime stage. Spring Boot's extracted dependency and application layers are copied separately, and the runtime runs as a non-root user. The client image builds static assets with Node and serves them from Nginx.

For a separately hosted frontend, set `VITE_API_BASE_URL` at client image build time to the public API origin. For a non-local deployment, set `CLIENT_DOMAIN` and `SERVER_DOMAIN` to the externally reachable frontend and API URLs.

## AWS deployment notes

The Compose PostgreSQL service is for local development. In ECS, omit that database container and set the API task's `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` to the RDS endpoint/database and credentials. For example, the URL shape is `jdbc:postgresql://<rds-endpoint>:5432/<database>?sslmode=require`. The `prod` Spring profile requires all three settings, so it won't silently fall back to local Postgres credentials. Keep RDS private and allow connections only from the API service's security group.

For a single public domain, configure an HTTPS listener on the Application Load Balancer: route `/api/*` to the API target group and the default route to the client target group. Keep `VITE_API_BASE_URL` empty so the browser uses same-origin `/api` requests. Set both `CLIENT_DOMAIN` and `SERVER_DOMAIN` to the public origin, such as `https://app.example.com`. Point the GitHub OAuth callback URL at `https://app.example.com/api/v1/auth/oauth2/github/callback`. Request an ACM certificate for the domain and point its DNS record at the load balancer. With this arrangement, TLS and domain routing happen at the load balancer; the client Nginx config can remain unchanged.

Set `SPRING_PROFILES_ACTIVE=prod` in the API task definition. Inject `JWT_SECRET`, `SENDER_EMAIL`, and `SENDER_EMAIL_PASSWORD` from Secrets Manager. Generate `JWT_SECRET` once with `openssl rand -base64 32` and use the same value for every API task so tokens remain valid across restarts and replicas. The production profile enables secure OAuth cookies and fails startup if `JWT_SECRET` is missing. Give the API ECS task a least-privilege IAM task role for the S3 bucket and set `AWS_REGION` and `AWS_S3_BUCKET`; do not place long-lived AWS access keys in the task definition.

The repository contains the application container configuration, not AWS resources. ECR repositories, ECS services/task definitions, the load balancer, VPC/security groups, RDS instance, ACM certificate, DNS records, Secrets Manager entries, and IAM roles still need to be provisioned in AWS (manually or through infrastructure as code).
