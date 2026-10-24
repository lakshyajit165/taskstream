# TaskStream

![taskstream-app](https://github.com/lakshyajit165/taskstream/actions/workflows/taskstream-app.yml/badge.svg?branch=master)
![taskstream-service](https://github.com/lakshyajit165/taskstream/actions/workflows/taskstream-service.yml/badge.svg?branch=master)

The app workflow builds the React production assets. The service workflow runs the Spring Boot test suite. Each workflow runs for pull requests and pushes to `main` or `master` when its component directory changes; if both directories change, both workflows run.
