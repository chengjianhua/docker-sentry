# About this Repo

This is the Git repo of the official Docker image for [sentry](https://registry.hub.docker.com/_/sentry/). See the
Hub page for the full readme on how to use the Docker image and for information
regarding contributing and issues.

The full readme is generated over in [docker-library/docs](https://github.com/docker-library/docs),
specificially in [docker-library/docs/sentry](https://github.com/docker-library/docs/tree/master/sentry).

## 维护

这是对 https://github.com/getsentry/docker-sentry 的定制版本. 为了去除本地环境的影响, 目前 sentry 的镜像是在 GitLab CI 中构建的.
并且只能通过 [手动创建 Pipeline][run-pipeline-manually] 的方式来构建 sentry 的镜像.

默认构建的时候使用的是 https://github.com/getsentry/docker-sentry master 分支上的最新提交所对应的版本.
如果需要指定提交版本的话, 可以在 [手动创建 Pipeline][run-pipeline-manually] 的时候在表单中填入 `SENTRY_BUILD` 变量, 并填写期望构建的提交 hash (完整 hash, 40 位) 设定为该变量的值.

[run-pipeline-manually]: https://git.llsapp.com/help/ci/pipelines.md#manually-executing-pipelines
