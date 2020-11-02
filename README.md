# Insomnia Multiprovider Gist Sync

> This is a fork of [gist-sync](https://github.com/joaostroher/insomnia-plugin-gist-sync) aimed to support storing gists on a self-hosted gitlab instance, and some other providers

This is a plugin for [Insomnia](https://insomnia.rest) that allows users sync workspaces with gist of GitHub and a self-hosted gitlab.

## Installation

Install the `insomnia-plugin-sync-gist-multiprovider` plugin from Preferences > Plugins.

## Configure

### 1. Create a personal access token.

[On your github account](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) with `gist` scope/permission.

Or [in your Gitlab account](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#creating-a-personal-access-token) with the `api` scope.

### 2. Go to Insomnia, click on Insomnia Main Menu, and click on "Gist Sync - Configure":

![Plugin Screenshot](/screenshot.jpg)

Paste the corresponding configuration

**For a github account**

```json
{
  "provider": "github",
  "token": "PERSONAL_ACCES_TOKEN",
  "gistID": ""
}
```

**For a self-managed gitlab account, in a project level**
```json
{
  "provider": "gitlab",
  "token":  "PERSONAL_ACCES_TOKEN",
  "gistID": "",
  "baseURL": "http://your.gitlab.ip",
  "projectID": "1",
  "visibility": "private"
}
```
**For a self-managed gitlab account, in a user level**
```json
{
  "provider": "gitlab",
  "token": "PERSONAL_ACCES_TOKEN",
  "gistID": "",
  "baseURL": "http://your.gitlab.ip",
  "visibility": "private"
}
```

#### Configuration options

| Setting | Required | Description |
| ------- | -------- | ----------- |
| provider | true | Provider to store the gists. available values: `github`, `gitlab` |
| token | true | Personal acces token of your provider. **NEVER SHARE IT** |
| gistID | false | Gist ID where your data is stored. If not present, a new one will be automatically created |
| timeout | false | Request timeout in miliseconds. Default `3000` |
| baseURL | false | Gitlab only. URL of the gitlab instance you want to use. Default `https://gitlab.com` |
| projectID | false | Gitlab only. If you want to save the snippet in a project level, set it to the project ID. Default `null` (Defaults to user level) |
| visibility | false | Visibility of the snippet. Options `private`, `public`, `internal`. Default `private` |

> Note: Most of the parameters aren't strictly validated.

## Usage

- Click on "Gist Sync - Send" to send your workspaces to Gist.
- Click on "Gist Sync - Receive" to get your workspaces from Gist.

## TODO

List of things todo.

- [X] Add gitlab user-level provider (fix current provider)
- [X] Add github provider
- [X] Change the logo
- [ ] Change config options from json to a form (like joaostroher did)
- [ ] Add an option to sync only some workspaces. Issue #3
- [ ] CI/CD (Test and publish on merge request to release)
- [ ] Add atlassian provider (?)
- [ ] Tests
- [ ] Linting
- [ ] Redesign the logo
- [ ] Fix Sync strategies edge cases (if any)


> Note on how conflict resolving is being made. Currently, when you press the *receive* button, it will get the remote, compare both remote and local for changes and store the newest modifications into a combination of both, this can lead to confusing edge cases. If you are really interested on preserving integrity working with a team, please [support insomnia](https://insomnia.rest/pricing/) with a team membership.
>
> *Possible edge case*: Being unable to delete items because of how conflicts are resolved

---

**Support me**

Do you have any bucks in your wallet that you don't really need? Great!

You should consider donating to a charity or something more relevant.

If you really want to support me instead, here is a way to do it.

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/X8X315KOS)

> Naming variables is hard
