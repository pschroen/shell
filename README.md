# Headless framework shell scripts

Created and maintained by the open-source community. If you've created a *Shell* you find useful feel free to open a pull request if you'd like to contribute.


## Installation

Until *Shell* installation is automated you'll need to pull them into your `shell` directory manually.

```sh
cd <install directory>/shell
git init
git remote add origin https://github.com/pschroen/shell.git
git config core.sparsecheckout true
echo wiki/ >> .git/info/sparse-checkout
git pull origin stable
```

Return to your login page, create a new *List* with a *Shell* of `wiki` and add the following to your *Ghost* or *Shell* config.

```json
...
    "wiki": {
        "search": "https://en.wikipedia.org"
    }
...
```


## Resources

* [The Headless Wiki](https://github.com/pschroen/headless/wiki)
* [Headless](https://headless.io/)
* [Documentation](https://headless.io/docs/)
* [Twitter](https://twitter.com/HeadlessIO)
