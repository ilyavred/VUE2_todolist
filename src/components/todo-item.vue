<template>
    <div
    class="task-item"
    :id="task.id"
    :class="[edition, { 'newTask' : task.temp }]"
    >
        <div
        :class="setClass(task)"
        class="content"
        >
            <div class='checkbox' v-show="(task.id != 'temp')">
                <input
                type='checkbox'
                class='base-check task-check'
                v-bind:checked="checked"
                :id="task.id"
                @change="$emit('change', $event.target)"
                />
            </div>
            <div class='text-container'
            @click="goEdit">

                <input
                type='text'
                class='edit-task'
                v-model="task.text"
                :id="task.id"
                ref="edit_text"
                @blur="applyEdit($event.target)"
                v-on:keyup.enter="applyEdit($event.target)"
                v-on:keyup.esc="$emit('cancelTemp', $event.target)"
                />

                <p
                class='task-text'
                ref="completed_text"
                >
                {{ task.text }}
                </p>
                
            </div>
            <div class="metadata" v-if="task.id != 'temp'">
                <span class="time created" v-show="!checked">
                    создан {{ created }}
                </span>

                <span class="time edited" v-show="(task.edited.timestamp != null) && !checked">
                    изменен {{ edited }}
                </span>

                <span class="time completed" v-show="checked">
                    выполнен {{ completed }}
                </span>
            </div>
            <div class="context-actions">
                <!-- <button class="context_button cancel"
                v-if="(task.id == 'temp')"
                id="temp"
                @click="$emit('cancelTemp', $event.target)"
                >Отмена</button> -->

                <button class="context_button delete"
                v-if="(task.id != 'temp')"
                :id="task.id"
                @click="$emit('deleteTask', $event.target)"
                >Удалить</button>
            </div>

        </div>
    </div>
</template>

<script>

export default {
    model: {
        prop: 'checked',
        event: 'change'
    },
    props: {

        task: Object,
        checked: Boolean,

    },

    data: () => {
        return {
            edition: '',
            timeNow: new Date(),
            interval: 60000,
            // edited: null,
            // created: null,
            // completed: null
        }
    },

    mounted() {
        // updateDates() {
        //     setInterval
        // },

        setInterval(() => {
            this.timeNow = new Date()
        }, this.interval)
    },
    
    watch: {

    },

    // filters: {

    // },

    computed: {

        edited() {
            return this.formatter(this.task.edited.timestamp, this.timeNow)
        },
        created() {
            return this.formatter(this.task.created.timestamp, this.timeNow)
        },
        completed() {
            return this.formatter(this.task.completed.timestamp, this.timeNow)
        },

    },

    methods: {

        goEdit() {
            let target = this.$refs.edit_text

            if (this.edition == '') {
                this.$emit('getBackup', target.value)
            }
            this.changeEdit()

            target.select()
        },

        changeEdit() {
            this.edition = 'edit_now'
        },

        applyEdit(e) {
            this.edition = ''
            this.$emit('applyText', e)
        },

        setClass(t) {
            if (t.temp) {
                return ''
            }
            else {
                if (t.completed.status) {
                    return "completed"
                }
                else return "todo"
            }
        },

        formatter(value, now) {
            let date = new Date(value)
            let diff = now - date // разница в миллисекундах


            if (diff < 1000) { // меньше 1 секунды
                return 'только что'
            }

            let sec = Math.floor(diff / 1000) // преобразовать разницу в секунды
            if (sec < 60) {
                return sec + ' сек. назад'
            }

            let min = Math.floor(diff / 60000) // преобразовать разницу в минуты
            if (min < 60) {
                return min + ' мин. назад'
            }

            let hour = Math.floor(diff / 3600000) // преобразовать разницу в часы
            if (hour < 24) {
                // console.log(hour + ' ч. назад')
                return hour + ' ч. назад'
            }

            let day = Math.floor(diff / 86400000) // преобразовать разницу в дни
            if (day < 24) {
                // console.log(day + ' дн. назад')
                return day + ' дн. назад'
            }

            // отформатировать дату
            // добавить ведущие нули к единственной цифре дню/месяцу/часам/минутам
            let d = date
            d = [
                '0' + d.getDate(),
                '0' + (d.getMonth() + 1),
                '' + d.getFullYear(),
                '0' + d.getHours(),
                '0' + d.getMinutes()
            ].map(component => component.slice(-2)) // взять последние 2 цифры из каждой компоненты

            // соединить компоненты в дату
            return d.slice(0, 3).join('.') + ' ' + d.slice(3).join(':')
        },

    }
};
</script>

<style  lang="sass">
@import '../assets/styles/todo_item.sass'
</style>