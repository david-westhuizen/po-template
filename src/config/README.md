# `config` — static app configuration

Non-secret, compile-time config and constants (feature flags, static option
lists, notification config). Secrets and per-environment values go in `.env`
(read via `import.meta.env`), never here.
