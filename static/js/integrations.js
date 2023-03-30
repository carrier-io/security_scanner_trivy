const trivyIntegration = {
    delimiters: ['[[', ']]'],
    components: {
        SecretFieldInput: SecretFieldInput
    },
    props: ['instance_name', 'display_name', 'default_template', 'logo_src', 'section_name'],
    emits: ['update'],
    template: `<div :id="modal_id"
        class="modal modal-small fixed-left fade shadow-sm" tabindex="-1" role="dialog"
    >
        <ModalDialog
            v-model:description="description"
            v-model:is_default="is_default"
            @update="update"
            @create="create"
            :display_name="display_name"
            :id="id"
            :is_fetching="is_fetching"
            :is_default="is_default"
        >
        <template #body>
            <div class="form-group">
                <div class="form-group">
                <form autocomplete="off">
                    <h9>Scan Options</h9>
                    <div class="row p-2 pl-4">
                        <div class="col">
                            <label class="custom-checkbox align-items-center mr-3">
                                <input type="checkbox" v-model="skip_update">
                                <h9 class="ml-1">
                                    Skip updates
                                </h9>
                            </label>
                        </div>
                        <div class="col">
                            <label class="custom-checkbox align-items-center mr-3">
                                <input type="checkbox" v-model="show_without_fix">
                                <h9 class="ml-1">
                                    Show Without Fix
                                </h9>
                            </label>
                        </div>
                    </div>

                    <div class="row p-2 pl-4">
                        <div class="col">
                            <label class="custom-checkbox align-items-center mr-3">
                                <input type="checkbox" v-model="show_with_temp_id">
                                <h9 class="ml-1">
                                    Show With Temp Id
                                </h9>
                            </label>
                        </div>
                        <div class="col">
                            <label class="custom-checkbox align-items-center mr-3">
                                <input type="checkbox" v-model="show_without_description">
                                <h9 class="ml-1">
                                    Show Without Description
                                </h9>
                            </label>
                        </div>
                    </div>
                </form>
                </div>

                <h9>Save intermediates to</h9>
                <p>
                    <h13>Optional</h13>
                </p>
                <input type="text" class="form-control form-control-alternative"
                       placeholder=""
                       v-model="save_intermediates_to"
                       :class="{ 'is-invalid': error.save_intermediates_to }">
                <div class="invalid-feedback">[[ error.save_intermediates_to ]]</div>

                <h9>Additional options for Trivy</h9>
                <p>
                    <h13>Optional</h13>
                </p>
                <input type="text" class="form-control form-control-alternative"
                       placeholder=""
                       v-model="timeout"
                       :class="{ 'is-invalid': error.scan_opts }">
                <div class="invalid-feedback">[[ error.scan_opts ]]</div>
        
                <h9>Trivy Options</h9>
                <p>
                    <h13>Optional</h13>
                </p>
                <input type="text" class="form-control form-control-alternative"
                       placeholder=""
                       v-model="trivy_options"
                       :class="{ 'is-invalid': error.scan_path }">
                <div class="invalid-feedback">[[ error.scan_path ]]</div>
            </div>
        </template>
        <template #footer>
            <test-connection-button
                    :apiPath="api_base + 'check_settings'"
                    :error="error.check_connection"
                    :body_data="body_data"
                    v-model:is_fetching="is_fetching"
                    @handleError="handleError"
            >
            </test-connection-button>
        </template>
    </ModalDialog>
</div>
    `,
    data() {
        return this.initialState()
    },
    mounted() {
        this.modal.on('hidden.bs.modal', e => {
            this.clear()
        })
    },
    computed: {
        apiPath() {
            return this.api_base + 'integration/'
        },
        project_id() {
            return getSelectedProjectId()
        },
        body_data() {
            const {
                description,
                is_default,
                project_id,

                save_intermediates_to,
                timeout,
                skip_update,
                show_without_fix,
                show_with_temp_id,
                show_without_description,
                trivy_options,

                status,
            } = this
            return {
                description,
                is_default,
                project_id,

                save_intermediates_to,
                timeout,
                skip_update,
                show_without_fix,
                show_with_temp_id,
                show_without_description,
                trivy_options,
                status,
            }
        },
        modal() {
            return $(this.$el)
        },
        modal_id() {
            return `${this.instance_name}_integration`
        }
    },
    methods: {

        clear() {
            Object.assign(this.$data, {
                ...this.$data,
                ...this.initialState(),
            })
        },
        load(stateData) {
            Object.assign(this.$data, {
                ...this.$data,
                ...stateData
            })
        },
        handleEdit(data) {
            console.debug('trivy editIntegration', data)
            const {description, is_default, id, settings} = data
            this.load({...settings, description, is_default, id})
            this.modal.modal('show')
        },
        handleDelete(id) {
            this.load({id})
            this.delete()
        },
        create() {
            this.is_fetching = true
            fetch(this.apiPath + this.pluginName, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    this.modal.modal('hide')
                     this.$emit('update', {...this.$data, section_name: this.section_name})
                } else {
                    this.handleError(response)
                }
            })
        },
        handleError(response) {
            try {
                response.json().then(
                    errorData => {
                        errorData.forEach(item => {
                            console.debug('trivy item error', item)
                            this.error = {[item.loc[0]]: item.msg}
                        })
                    }
                )
            } catch (e) {
                alertMain.add(e, 'danger-overlay')
            }
        },
        update() {
            this.is_fetching = true
            fetch(this.apiPath + this.id, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    this.modal.modal('hide')
                     this.$emit('update', {...this.$data, section_name: this.section_name})
                } else {
                    this.handleError(response)
                }
            })
        },
        delete() {
            this.is_fetching = true
            fetch(this.apiPath + this.id, {
                method: 'DELETE',
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    delete this.$data['id']
                    this.$emit('update', {...this.$data, section_name: this.section_name})
                } else {
                    this.handleError(response)
                    alertMain.add(`Deletion error. <button class="btn btn-primary" @click="modal.modal('show')">Open modal<button>`)
                }
            })
        },
        initialState: () => ({
            description: '',
            is_default: false,
            is_fetching: false,
            error: {},
            test_connection_status: 0,
            id: null,
            
            timeout: "1h",
            save_intermediates_to: '/data/intermediates/sast',
            skip_update: true,
            show_without_fix: false,
            show_with_temp_id: false,
            show_without_description: true,
            trivy_options: "--no-progress",

            pluginName: 'security_scanner_trivy',
            api_base: '/api/v1/integrations/',
            status: integration_status.success,
        }),
    }
}

register_component('trivyIntegration', trivyIntegration)
