## `stencila/convert` : Stencila converters

![Experimental](https://img.shields.io/badge/stability-experimental-orange.svg)
[![Docs](https://img.shields.io/badge/docs-latest-blue.svg)](https://stencila.github.io/convert)
[![NPM](http://img.shields.io/npm/v/stencila-convert.svg?style=flat)](https://www.npmjs.com/package/stencila-convert)
[![Build status](https://travis-ci.org/stencila/convert.svg?branch=master)](https://travis-ci.org/stencila/convert)
[![Build status](https://ci.appveyor.com/api/projects/status/f1hx694pxm0fyqni?svg=true)](https://ci.appveyor.com/project/nokome/convert)
[![Code coverage](https://codecov.io/gh/stencila/convert/branch/master/graph/badge.svg)](https://codecov.io/gh/stencila/convert)
[![Dependency status](https://david-dm.org/stencila/convert.svg)](https://david-dm.org/stencila/convert)
[![Community](https://img.shields.io/badge/join-community-green.svg)](https://community.stenci.la)
[![Chat](https://badges.gitter.im/stencila/stencila.svg)](https://gitter.im/stencila/stencila)


### Install

```bash
npm install stencila-convert -g
```

Many of the `Document` converters rely on a recent version of Pandoc. This package will use an existing installation of Pandoc if it is new enough. If not, it will automatically download the required Pandoc version to the Stencila directory in your home folder. See [`pandoc.json`](src/helpers/pandoc.json) for the necessary Pandoc version and download URLs. At times it may be necessary to use our custom Pandoc build available at https://github.com/stencila/pandoc/releases.


### Use

```bash
stencila-convert document.md document.jats.xml
```

When these converters are better developed and tested, the plan is to integrate this package into:

- the [Stencila CLI (command line tool)](https://github.com/stencila/cli) as a sub-command e.g. `stencila convert document.md document.jats.xml`

- the [Stencila Desktop](https://github.com/stencila/desktop) as a menu item e.g. `Save as... > Jupyter Notebook`

API documentation is available at https://stencila.github.io/convert.


### Status

The following table lists the status of converters that have been developed, are in development, or are being considered for development. We'll be developing converters based on demand from users. So if you'd like to see a converter for your favorite format, +1 the relevant issue, or create an issue if there isn't one yet. Or, send us a pull request!

Format          | Import                                                           | Export
--------------- | :--------------------------------------------------------------: | :--------------------------------------------------------------:
**Documents**   |                                                                  |
Markdown        |![alpha](https://img.shields.io/badge/status-alpha-red.svg)       |![alpha](https://img.shields.io/badge/status-alpha-red.svg)
RMarkdown       |![alpha](https://img.shields.io/badge/status-alpha-red.svg)       |
Latex           |![alpha](https://img.shields.io/badge/status-alpha-red.svg)       |![alpha](https://img.shields.io/badge/status-alpha-red.svg)
Jupyter Notebook|![alpha](https://img.shields.io/badge/status-alpha-red.svg)       |
HTML            |![alpha](https://img.shields.io/badge/status-alpha-red.svg)       |![alpha](https://img.shields.io/badge/status-alpha-red.svg)
PDF             |-                                                                 |![alpha](https://img.shields.io/badge/status-alpha-red.svg)                                                               |
CSV             |![alpha](https://img.shields.io/badge/status-alpha-red.svg)       |![alpha](https://img.shields.io/badge/status-alpha-red.svg)
CSVY            |                                                                  |
Tabular Data Package |                                                             |
Excel `.xlsx`   |![alpha](https://img.shields.io/badge/status-alpha-red.svg)       |![alpha](https://img.shields.io/badge/status-alpha-red.svg)
Open Document Spreadsheet `.ods`|![alpha](https://img.shields.io/badge/status-alpha-red.svg)|![alpha](https://img.shields.io/badge/status-alpha-red.svg)


### Develop

Clone the repo and install a development environment:

```bash
git clone https://github.com/stencila/convert.git
cd convert
npm install
```

Run the test suite:

```bash
npm test # or make test
```

Or, run a single test file:

```bash
node tests/convert.test.js
```

To get coverage statistics:

```bash
npm run cover # or make cover
```

Or, manually test conversion using the bin script on test cases:

```bash
./bin/stencila-convert.js tests/fixtures/paragraphs.md temp.pdf
```

You can create a new test case for a particular format by converting an existing tests case for another format. For example, to create a nested lists test case for JATS, you could use the existing test case for Markdown:

```bash
./bin/stencila-convert.js tests/fixtures/list_nested.md tests/fixtures/list_nested.jats.xml
```

There's also a `Makefile` if you prefer to run tasks that way e.g.

```bash
make lint cover check
```

You can also test using the Docker image for a self-contained, host-independent test environment:

```bash
docker build --tag stencila/convert .
docker run stencila/convert
```
