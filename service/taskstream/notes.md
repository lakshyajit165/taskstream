### Command to create a database in docker
```
docker exec -it taskstreamdb psql -U postgres -d postgres -c "CREATE DATABASE taskstream_db;"
```
assuming a docker container `taskstreamdb` is already running

