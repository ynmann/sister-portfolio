# Madina Bekassyl — Interior Design Portfolio

A minimal, production-grade Go web server serving a single-page portfolio for interior designer **Madina Bekassyl**.

## Tech stack

- **Go 1.22+** — standard library only, no external dependencies
- **html/template** — server-side template rendering
- **net/http** — HTTP server with sensible timeouts
- Static assets served from `./static/`

## Quick start

### 1. Copy assets

Raw source files (logos, photos, project renders) live in `tmp/`. Run the setup target to copy them into `static/` with clean, ASCII-safe names:

```sh
make setup
```

### 2. Run in development mode

```sh
make dev          # go run — template changes take effect on restart
PORT=3000 make dev
```

### 3. Build and run binary

```sh
make build        # produces bin/server
make run          # build + start on :8080
PORT=3000 make run
```

### 4. Clean

```sh
make clean        # removes bin/
```

## Project structure

```
.
├── cmd/
│   └── server/
│       └── main.go          # entry point: HTTP server, graceful shutdown
├── static/
│   └── images/
│       ├── logo/            # logo-black.png, logo-white.png, signature*.gif
│       ├── photos/          # portrait.jpg, portrait-2.jpg
│       └── projects/        # belle-view/, kazybek/, arena-park/, …
├── templates/
│   └── index.html           # single-page landing (HTML + CSS + JS, inline)
├── tmp/                     # raw source assets (not committed)
├── go.mod
├── Makefile
└── README.md
```

## Configuration

| Environment variable | Default | Description           |
|---------------------|---------|-----------------------|
| `PORT`              | `8080`  | TCP port to listen on |

## Server behaviour

- Timeouts: read 15 s, write 30 s, idle 60 s
- Graceful shutdown on `SIGINT` / `SIGTERM`
- 404 for every path except `/` and `/static/*`
- Template is parsed once at startup; restart to pick up changes

## Deployment

Any Linux host with Go installed:

```sh
GOOS=linux GOARCH=amd64 go build -o bin/server ./cmd/server
scp bin/server static/ templates/ user@host:/opt/portfolio/
PORT=80 ./server
```

Or behind a reverse proxy (nginx, Caddy) with `PORT=8080`.

---

Portfolio of [Madina Bekassyl](https://instagram.com/madinabks.interiors) — interior designer, Almaty, Kazakhstan.
