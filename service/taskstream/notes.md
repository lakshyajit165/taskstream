### Command to spin up a postgres docker container with volume mapping

```
docker run --name taskstreamdb -e POSTGRES_PASSWORD=postgres123 -p 5432:5432 -v pg_data:/var/lib/postgresql/data -d postgres:latest
```

### Command to create a database in docker
```
docker exec -it taskstreamdb psql -U postgres -d postgres -c "CREATE DATABASE taskstream_db;"
```
assuming a docker container `taskstreamdb` is already running

