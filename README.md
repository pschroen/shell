# Headless framework shell scripts

Created and maintained by the open-source community. If you've created a *Shell* you find useful feel free to open a pull request if you'd like to contribute.


## `wiki`

Create a new *List* with a *Shell* of `wiki` and add the following to your *Ghost* or *Shell* config.

```json
...
    "wiki": {
        "search": "https://en.wikipedia.org"
    }
...
```


## `audio`

The `audio` *Shell* requires the `stream` *API* script in your *API* *List*. The following config is for an install in your home directory, with a `Music` directory.

```json
...
    "audio": {
        "path": "../Music"
    }
...
```

You can also play Internet radio, for Shoutcast streams append a semicolon (`;`) to the URL and add the following to your *Ghost* config `list` memories.

```json
...
    "memory": {
        "list": {
            "proton radio": {
                "src": "http://protonradio.com:7000/;",
                "type": "audio/mpeg"
            }
        }
    }
...
```


## Resources

* [The Headless Wiki](https://github.com/pschroen/headless/wiki)
* [Headless](https://headless.io/)
* [Documentation](https://headless.io/docs/)
* [Twitter](https://twitter.com/HeadlessIO)
