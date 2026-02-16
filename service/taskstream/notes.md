### Command to spin up a postgres docker container with volume mapping and database creation

```
docker run \
  --name taskstreamdb \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=taskstream_db \
  -p 5432:5432 \
  -v pg_data:/var/lib/postgresql/data \
  -d postgres:16.4
```

### Important

This only runs when the data directory is empty.

If your volume already exists → DB won’t be created again.

To recreate:

```
docker volume rm pg_data
```

### Steps to restore data from sql dump into a new docker container

1. Start a new container
```
docker run --name newdb \
-e POSTGRES_PASSWORD=postgres123 \
-p 5433:5432 \
-d postgres:16.4
```

2. Create database
```
docker exec newdb psql -U postgres -c "CREATE DATABASE taskstream_db;"
```

3. Restore SQL dump
```
docker exec -i newdb \
psql -U postgres -d taskstream_db \
< backup.sql
```