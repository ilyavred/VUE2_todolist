# todolist

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Working with Json-server
```
# default request url in todolist.vue
data() {
    return {
        jsonHost: "http://localhost:3000/tasks",
        # ...
```
### Run local json-server
```
# Source data base location: ./db.json
json-server --watch db.json
```
