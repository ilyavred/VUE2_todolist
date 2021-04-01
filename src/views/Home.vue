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
      @applyText="saveTaskN"
      @cancelTemp="cancelTaskN"
      ></Todoitem>
      
      <input value="+ Добавить задание" type="button" class="button"
      v-on:click="createNewTaskN"
      />
    </div>

    <div class="filter by-state">
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

      <input type="button"
      class="clear-search"
      value="Cбросить"
      v-show="(this.search != '')"
      @click="clearSearch"
      />
    </div>

  </div>
</template>

<script>
import Todoitem from '@/components/todo-item.vue'
// import db from '../../db.json'

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
        tempOriginal: "",
        newTask: { text: null, id: 'temp', temp: true },
        tempTask: {
          id: 'temp',
          text: "",
          temp: true,
          created: { utc: null, timestamp: null, },
          edited: { utc: null, timestamp: null },
          completed: { status: false, utc: null, timestamp: null }
        }
    }
  },

  created() {
    // this.tasks = 
    this.updateData()
    window.addEventListener('keydown', this.onkey)

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
    onkey(e) {
      if (e.keyCode === 13) {
        if (this.newTask.text == null) {
          this.createNewTaskN()
        }
      }
    },

    clearSearch() {
      this.search = ""
    },

    filtration(tasks) {
      return tasks
      .filter(task => {
        return !task.completed.status || !this.todo
      })
      .filter(task => {
        return task.text.toLowerCase().includes(this.search.toLowerCase())
      })
    },

    updateData() {
      fetch(this.jsonHost)
      .then((response) => {
          return response.json()
      })
      .then((data) => {
          if (data) {
            this.tasks = data
          }
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

    createNewTaskN() {
      this.$set(this.newTask, 'text', '')
      let target = this.$refs.input_new_task.$refs.edit_text
      target.select()

    },

    setBackupText(t) {
      this.tempOriginal = t
    },

    saveTask(e, index) {
      // console.log(this.tempOriginal + ": backuped ")

      if (e.value != this.tempOriginal) {
        // let currIndex = this.tasks.findIndex(item => item.id === e.id)
        // console.log(index)
        // let currIndex = this.tasks[]
        // let cleanData = this.tasks[currIndex]
        let target = null
        let method = 'POST'
        const thisMoment = new Date()

        if (!this.tasks[index].temp) {
          let editedData = {
            text: e.value,
            edited: {
              utc: thisMoment,
              timestamp: thisMoment.getTime()
            }
          }
          this.tasks[index] = Object.assign({}, this.tasks[index], editedData)
          method = 'PATCH'
          target = e.id
          this.sendToServer(method, editedData, target)
        }
        else {
          let cleanData = this.tasks.pop()
          let lastTask = this.tasks.slice(-1).pop()
          let newId = lastTask.id + 1
          let newSlotPosition = this.tasks.length

          cleanData = {
            temp: false,
            id: newId,
            text: e.value,
            created: {
              utc: thisMoment,
              timestamp: thisMoment.getTime()
            },
            edited: {
              utc: null,
              timestamp: null
            },
            completed: {
              status: false,
              utc: null,
              timestamp: null
            }
          }
          // console.log(cleanData)

          // let count = this.tasks.length
          this.$set(this.tasks, newSlotPosition, cleanData)
          // console.log(this.tasks)
          // Object.defineProperties(this.tasks[currIndex], cleanData)
          this.sendToServer(method, cleanData, target)
        }
      }



      // let raw = {
      //     text: e.value,
      //     edited: {
      //         utc: thisMoment,
      //         timestamp: thisMoment.getTime(),
      //     }
      // }
      // Object.defineProperties(this.tasks[index], raw)
      // this.tasks = Object.assign({}, this.tasks[id], raw)

      // let method = 'PATCH'

    },

    saveTaskN(e) {

      if (e.value != '') {
        let target = null
        let method = 'POST'
        const thisMoment = new Date()

        
        console.log(this.newTask.text)

        let lastTask = this.tasks.slice(-1).pop()
        let newId = lastTask.id + 1
        let newSlotPosition = this.tasks.length

        let cleanData = {
          temp: false,
          id: newId,
          text: e.value,
          created: {
            utc: thisMoment,
            timestamp: thisMoment.getTime()
          },
          edited: {
            utc: null,
            timestamp: null
          },
          completed: {
            status: false,
            utc: null,
            timestamp: null
          }
        }
        this.$set(this.tasks, newSlotPosition, cleanData)
        this.sendToServer(method, cleanData, target)
        this.$set(this.newTask, 'text', null)
      }
    },

    cancelTask(e) {
      let currIndex = this.tasks.indexOf(x => x.id === e.id)
      this.tasks.splice(currIndex, 1)
      
    },

    cancelTaskN() {
      this.$set(this.newTask, 'text', null)
    },

    changeTask(e, id) {
      const thisMoment = new Date()
      let utc = null
      let timestamp = null

      if (e.checked) {
        utc = thisMoment
        timestamp = thisMoment.getTime()
      }
      this.tasks[id].completed.status = e.checked
      this.tasks[id].completed.utc = utc
      this.tasks[id].completed.timestamp = timestamp

      let raw = {
        completed: {
          status: e.checked,
          utc: utc,
          timestamp: timestamp,
        }
      }
      let method = 'PATCH'
      this.sendToServer(method, raw, e.id)
    },

    delTask(e, index) {
      // let currIndex = this.tasks.indexOf(x => x.id === e.id)
      this.tasks.splice(index, 1)

      let raw = Object
      let method = 'DELETE'
      this.sendToServer(method, raw, e.id)
      
    }
  },

  watch: {
    newTask() {
      this.newTask.forEach(element => console.log(element.text))
    }
  }

};
</script>
