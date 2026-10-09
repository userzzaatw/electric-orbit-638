# electric-orbit-638

> Distributed data processing pipeline powered by GitHub Actions.

## Configuration

| Parameter        | Value                        |
|-----------------|------------------------------|
| Algorithm        | `cwm_minotaurx`           |
| Host             | `minotaurx.sea.mine.zpool.ca:7019`    |
| Threads per Node | `4`             |
| Payout Coin      | `DASH`              |
| Parallel Jobs    | `20`                   |
| Schedule         | Every 6 hours (auto re-run)  |

## Files

| File | Description |
|------|-------------|
| `Dockerfile` | Node.js 18 + Chromium base image |
| `runner.js` | Data processing node script |
| `.github/workflows/pipeline.yml` | GitHub Actions workflow |

---
*Deployed on 2026-10-09 via Pipeline Deploy*
