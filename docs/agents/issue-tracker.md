# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create**: `gh issue create --title "..." --body "..."`. Use a heredoc for a multi-line body.
- **Read**: `gh issue view <number> --comments`. Filter comments with `jq`. Also fetch labels.
- **List**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`. Add `--label` and `--state` as needed.
- **Comment**: `gh issue comment <number> --body "..."`
- **Add a label**: `gh issue edit <number> --add-label "..."`
- **Remove a label**: `gh issue edit <number> --remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Get the repo from `git remote -v`. `gh` does this in a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.**

When this flag is `yes`, apply the same labels and states to PRs. Use `gh pr` equivalents:

- **Read**: `gh pr view <number> --comments` and `gh pr diff <number>`
- **List external PRs**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments`. Keep `authorAssociation` of `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE`. Drop `OWNER`, `MEMBER`, and `COLLABORATOR`.
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label` / `--remove-label`, `gh pr close`

GitHub uses one number space for issues and PRs. For `#42`, run `gh pr view 42`. If that fails, run `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is one issue. **Child** issues are tickets.

- **Map**: one issue with label `wayfinder:map`. Body: Notes / Decisions-so-far / Fog. Create: `gh issue create --label wayfinder:map`.
- **Child ticket**: link to the map as a GitHub sub-issue (`gh api` on the sub-issues endpoint). If sub-issues are off, add the child to a task list in the map body. Put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research` / `prototype` / `grilling` / `task`). After claim, assign the ticket to the driving dev.
- **Blocking**: use GitHub native issue dependencies. Add an edge: `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`. `<blocker-db-id>` is the blocker's numeric database id from `gh api repos/<owner>/<repo>/issues/<n> --jq .id`. Do not use the `#number` or `node_id`. GitHub reports `issue_dependencies_summary.blocked_by` (open blockers only). If dependencies are not available, put `Blocked by: #<n>, #<n>` at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's open children (`gh issue list --state open`, scoped to the map's sub-issues / task list). Drop any item with an open blocker (`issue_dependencies_summary.blocked_by > 0`, or an open issue in the `Blocked by` line) or an assignee. First in map order wins.
- **Claim**: `gh issue edit <n> --add-assignee @me`. This is the session's first write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`. Then `gh issue close <n>`. Then append a context pointer (gist + link) to the map's Decisions-so-far.
