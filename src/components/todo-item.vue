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
// import db from '../../db.json'

export default {
    model: {
        prop: 'checked',
        event: 'change'
    },
    props: {
        // task: {
        //     type: Object,
        //     default: () => {
        //         return {
        //             id: 0,
        //             text: "default task",
        //             temp: false,
        //             created: {
        //                 utc: "2021-03-21T13:58:22.808Z",
        //                 timestamp: 1616335102808
        //             },
        //             edited: {
        //                 utc: null,
        //                 timestamp: null
        //             },
        //             completed: {
        //                 status: false,
        //                 utc: null,
        //                 timestamp: null
        //             }
        //         }
        //     }
        // },
        task: Object,
        checked: Boolean,

    },

    data: () => {
        return {
            edition: ''
        }
    },

    created() {},

    computed: {
    },

    methods: {
        goEdit() {
            let target = this.$refs.edit_text
            // console.log(target.value + ': goEdit(e)')
            if (this.edition == '') {
                this.$emit('getBackup', target.value)
            }
            this.changeEdit()
            // this.$root.editedStyle = { 
            //     display: 'none'
            // }
            // target.focus()
            target.select()
            // console.log(this.temp)
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
        
    }
};
</script>

<style  lang="sass">
@import '../assets/styles/todo_item.sass'
// @import '../assets/styles/checkbox.sass'
</style>