# Org Command Center

A local dashboard for running an AI organization built from the eight open source [AI Employees](https://github.com/markfulton/ai-employees) on Claude Code.

It shows the team roster, each employee's weekly workload, today's routine timeline, morning briefs, schedules and run logs, and starts any employee's install in Claude with one click.

## Requirements

- macOS (the Hire button opens Terminal)
- Node 18 or newer
- [Claude Code](https://claude.com/claude-code), signed in

## Run

```sh
./setup.sh                # hires the eight employees into ./org
node server.mjs           # http://localhost:4747
```

Until an employee is hired, its brief and run log show the kit's sample output. Click **Hire & start** to open Claude in that employee's folder and run its install. It asks for your business website, schedules its own routines, and drafts work for your approval. Nothing is sent or spent without your click.

`org/` is git-ignored: once employees are hired it holds your strategy, CRM and briefs.

The server listens on 127.0.0.1 only and has no dependencies.

## License

MIT. The AI Employees kits are MIT, copyright Mark Fulton.
