messenger-web
-------------

This is the web based version of [messenger-ios](https://github.com/cupcake/messenger-ios).

## Configuration

ENV                       | Required | Description
------------------------- | -------- | -----------
`CONTACTS_URL`            | Required | URL pointing to an instance of the [Contacts Service](https://github.com/cupcake/contacts-service) (loaded inside an iframe). Note that `frame-src` and `frame-ancestors` CSP headers need to be set appropriately.
`SIGIL_API_ROOT`          | Optional | URL that, upon appending `encodeURIComponent(String str)` to, points to a uniquely generated image for `str`. See [github.com/cupcake/sigil](https://github.com/cupcake/sigil) for details.

See [boiler-web](https://github.com/cupcake/boiler-web) for additional configuration.
