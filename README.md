# umi

## Set up

Install dev deps after git clone the repo.

```bash
$ yarn
```

Bootstrap every package with yarn. (Need to execute when new package is included)

```bash
$ yarn bootstrap
```

Build umi with father-build

```bash
$ yarn build
```

Debug Examples with Chrome(chrome://inspect)

```bash
$ cd examples/func-test
$ node --inspect-brk=9229 ../../packages/umi/bin/umi.js dev
```
