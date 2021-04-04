<template>
  <div class="todolist">
    <Todoitem
    v-for="(task, index) in filtration(tasks)"
    v-model="task.completed.status"
    :task="task"
    :key="task.id"
    :index="index"
    @getBackup="setBackupText($event)"
    @change="changeTask($event, index)"
    @deleteTask="delTask($event, index)"
    @applyText="saveTask($event, index)"
    @cancelTemp="cancelTask"
    ></Todoitem>

    <div class="creation" :class="{ 'on-create' : this.newTask.text != null }">
      
      <Todoitem
      ref="input_new_task"
      v-model="this.newTask.temp"
      :task="this.newTask"
      @applyText="pullNewTask"
      @cancelTemp="cancelInitTask"
      ></Todoitem>
      
      <input value="+ Добавить задание" type="button" class="button"
      v-on:click="initNewTask"
      />
    </div>

    <div class="filter">
      <input type='checkbox'
      id="todo"
      class='check__filter  show-todo'
      v-model="todo"
      />

      <label class="filter__label" for="todo">Только невыполненные ({{ todoCount }})</label>
      
      <input type="search"
      class="filter__search"
      v-model="search"
      placeholder="Поиск таска"
      />

      <!-- <input type="button"
      class="clear-search"
      value="Cбросить"
      v-show="(this.search != '')"
      @click="clearSearch"
      /> -->

      <span class="total">
        Всего заданий:{{ tasksCount }} / Выполнены:{{ completedCount }}
      </span>
    </div>

  </div>
</template>

<script>
import Todoitem from '@/components/todo-item.vue'

export default {
  name: 'tasks',
  components: {
    Todoitem
  },
  data() {
    return {
      jsonHost: "http://localhost:3000/tasks",
      tasks: null,
      todo: false,
      search: "",
      updateInterval: 60000,
      tempOriginal: "",
      newTask: { text: null, id: 'temp', temp: true },
      tempTask: {
        id: 'temp',
        text: "",
        temp: true,
        created: { utc: null, timestamp: null, },
        edited: { utc: null, timestamp: null },
        completed: { status: false, utc: null, timestamp: null }
      },
    }
  },

  created() {
    this.updateData()
    setInterval(() => {this.updateData()}, this.updateInterval)
    window.addEventListener('keydown', this.onkey)
    this.filtratedTasks = this.filtration()
  },

  watch: {
    search() {
      this.filtratedTasks = this.filtration()
    }
  },

  computed: {
    tasksCount() {
      return this.tasks.filter(task => {
        return !task.temp
      }).length
    },

    completedCount() {
      return this.tasks.filter(task => {
        return task.completed.status
      }).length
    },

    todoCount() {
      return this.tasks.filter(task => {
        return !task.completed.status
      }).length
    },
  },

  methods: {
    async updateData() {
      try {
        const response = await fetch(this.jsonHost)
        // .then((response) => {
        //     return response.json()
        // })
        const data = await response.json()
  
        this.tasks = data
        await this.$nextTick()
      }
      catch (e) {
        console.log(e)
      }
    },

    onkey(e) {
      if (e.keyCode === 13) {
        if (this.newTask.text == null) {
          this.initNewTask()
        }
      }
    },

    filtration(t) {
      return t
      .filter(task => {
        return !task.completed.status || !this.todo
      })
      .filter(task => {
        return task.text.toLowerCase().includes(this.search.toLowerCase())
      })
    },

    sendToServer(method, raw, target=null) {
      
      let host = this.jsonHost
      if (target != null) {
        host = host + '/' + target
      }

      let myHeaders = new Headers()
      myHeaders.append("Content-Type", "application/json")

      let requestOptions = {
        method: method,
        redirect: 'follow'
      }
      if (!(['DELETE', 'GET'].includes(method))) {
        requestOptions.body = JSON.stringify(raw)
        requestOptions.headers = myHeaders
      }

      fetch(host, requestOptions)
        .then(response => response.text())
        .catch(error => console.log('error', error))

    },

    initNewTask() {
      this.search = ''
      this.todo = false
      this.$set(this.newTask, 'text', '')
      let target = this.$refs.input_new_task.$refs.edit_text
      target.select()
    },

    setBackupText(t) {
      this.tempOriginal = t
    },

    saveTask(e, index) {
      if (e.value != this.tempOriginal && !this.tasks[index].temp) {
        if (e.value != '') {
          let target = e.id
          let method = 'PATCH'
          const thisMoment = new Date() 
          let editedData = {
            text: e.value,
            edited: {
              utc: thisMoment,
              timestamp: thisMoment.getTime()
            }
          }
          this.tasks[index] = Object.assign({}, this.tasks[index], editedData)
          this.sendToServer(method, editedData, target)
        } 
        else {    
          this.delTask(e, index)
        }
      }
    },

    pullNewTask(e) {

      if (e.value != '') {
        let target = null
        let method = 'POST'
        const thisMoment = new Date()

        console.log(this.newTask.text)

        let lastTask = this.tasks.slice(-1).pop()
        let newId = lastTask.id + 1
        let newSlotPosition = this.tasks.length

        let cleanData = this.tempTask
        cleanData.temp = false,
        cleanData.id = newId,
        cleanData.text = e.value,
        cleanData.created.utc = thisMoment
        cleanData.created.timestamp = thisMoment.getTime()

        this.$set(this.tasks, newSlotPosition, cleanData)
        this.sendToServer(method, cleanData, target)
        this.$set(this.newTask, 'text', null)
      }
    },

    cancelTask(e) {
      let currIndex = this.tasks.indexOf(x => x.id === e.id)
      this.tasks.splice(currIndex, 1)
      
    },

    cancelInitTask() {
      this.$set(this.newTask, 'text', null)
    },

    changeTask(e, index) {
      let utc = null
      let timestamp = null
      if (e.checked) {
        const thisMoment = new Date()
        utc = thisMoment
        timestamp = thisMoment.getTime()
      }
      let editedData = {
        completed: {
          status: e.checked,
          utc: utc,
          timestamp: timestamp,
        }
      }
      this.tasks[index] = Object.assign({}, this.tasks[index], editedData)
      let method = 'PATCH'
      this.sendToServer(method, editedData, e.id)
    },

    delTask(e, index) {
      this.tasks.splice(index, 1)

      let raw = Object
      let method = 'DELETE'
      this.sendToServer(method, raw, e.id)
    }
  },


};
</script>
<style lang="sass">
@import '../assets/styles/todolist.sass'
</style>
