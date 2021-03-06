import Vue from 'vue'
import VueRouter from 'vue-router'
import Todolist from '../views/todolist.vue'
import Todoitem from '../components/todo-item.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Todo List',
    component: Todolist
  },
  {
    path: '/todo',
    name: 'Todo list',
    component: Todoitem
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: function () {
    //   return import(/* webpackChunkName: "about" */ '../components/todo-item.vue')}
  }
]

const router = new VueRouter({
  routes
})

export default router
