# ShaderShare

[ShaderShare](https://shader-share.com) is a platform for sharing and discovering shaders, built with [Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Go](https://go.dev). Multi-pass shaders can be composed and edited in real-time, browsed by category, and shared with a unique URL. I built this app to replicate much of [ShaderToy's](https://www.shadertoy.com/) functionality with the goal of improving performance while adding additional features. Vim-bindings in the editor was the initial motivation, which quickly led to a rapid attempt to shake off my web-dev rust after strictly graphics programming in C++ for 8 months.

Here's the first shader on the site!

<iframe title="Shadershare Player" allowfullscreen="" allow="clipboard-write; web-share" width="640" height="360" style="border: none" src="https://www.shader-share.com/embed/shader/d16b208f-5e47-4855-987a-fed51782c86a"></iframe>

## Features

- Create and edit multi-pass shaders using textures from CORS enabled sources like Imgur or the texture output of the previous frame.
- Browse shaders by title and/or tags with Autoplay
- Share shaders with an iFrame to embed on other websites
- Access Control: private/public access to individual shaders
- Create shader playlists to logically group shaders
- Import shaders from Shadertoy. (video, audio, 3D textures, cubemaps not supported yet)
- Edit with vim bindings...

## Running locally

### Prerequisites

- Go (versions earlier than 1.23.5 haven't been tested)
- Docker CLI
- NPM

### Frontend

- Copy the env_template in ./frontend to .env.local in ./frontend

```bash
cd frontend
npm run dev
```

### Backend

- Copy the env_template in ./backend to .env in ./backend and fill out at least one OAuth provider to authenticate
- Run the Makefile or docker compose to run migrations and start the server, DB, and S3 store

```bash
cd backend
make migrate up
make up # or make upi for foreground
```

## Tech Stack

##### Backend

- [Go](https://go.dev)
- [Gin](https://github.com/gin-gonic/gin) - routing
- [Postgres](https://www.postgresql.org/) - db
- [Sqlc](https://github.com/sqlc-dev/sqlc) - code gen from sql queries
- [Docker](https://www.docker.com/) - containerization
- [Docker Compose](https://docs.docker.com/compose/) - dev container orchestration
- [Minio](https://min.io/) - dev object storage
- [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/) - object storage

##### Frontend

- [Nextjs](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [CodeMirror](https://codemirror.net/) - text editor
- [React-Query](https://react-query.tanstack.com/) - data fetching
- [Shadcn/ui](https://ui.shadcn.com/) - UI components

## TODO

- 3D texture and cubemap support
- WebGPU/WGSL support (and compute!)
- Social media features: likes, follow users, shader views
- Code completion in editor (may need to switch to Monaco editor)
- Local client to run shaders and CLI to upload shaders to edit with local text editor
- Full Shadertoy compatibility: audio, 3D textures, cubemaps
