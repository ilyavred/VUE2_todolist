let mix = require('laravel-mix');

mix.js('src/app.js', 'dist/js/')
   .sass('src/assets/styles/todo_item.sass', 'dist/css/')
   .vue();