# ShaderShare

ShaderShare is a platform for sharing and discovering shaders, built with [Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Go](https://go.dev). Multipass shaders can be composed and edited in real-time, browsed by category, and shared with a unique URL. I built this app to replicate much of [ShaderToy's](https://www.shadertoy.com/) functionality with the goal of improving performance while adding additional features. Vim-bindings in the editor was the initial motivation, which quickly led to a rapid attempt to shake off my web-dev rust after strictly graphics programming in C++ for 8 months.

## Running locally TODO

### Prerequisites TODO

## Tech Stack

### Backend

- [Go](https://go.dev)
- [Gin](https://github.com/gin-gonic/gin) - routing
- [Postgres](https://www.postgresql.org/) - db
- [Sqlc](https://github.com/sqlc-dev/sqlc) - code gen from sql queries
- [Docker](https://www.docker.com/) - containerization
- [Docker Compose](https://docs.docker.com/compose/) - dev container orchestration
- [Minio](https://min.io/) - dev object storage
- [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/) - object storage

### Frontend

- [Nextjs](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [CodeMirror](https://codemirror.net/) - text editor
- [React-Query](https://react-query.tanstack.com/) - data fetching
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
