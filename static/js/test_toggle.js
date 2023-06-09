const trivyIntegration = {
    delimiters: ['[[', ']]'],
    props: ['instance_name', 'section', 'selected_integration', 'is_selected', 'integration_data'],
    emits: ['set_data', 'clear_data'],
    data() {
        return this.initialState()
    },
    watch: {
        selected_integration(newState, oldState) {
            console.debug('watching selected_integration: ', oldState, '->', newState, this.integration_data)
            this.set_data(this.integration_data?.settings, false)
        }
    },
    methods: {
        body_data() {
            const {
                config,
                is_default,
                selected_integration: id,
                save_intermediates_to,
                timeout,
                skip_update,
                show_without_fix,
                show_with_temp_id,
                show_without_description,
                trivy_options,
            } = this
            return {
                config,
                is_default,
                id,
                save_intermediates_to,
                timeout,
                skip_update,
                show_without_fix,
                show_with_temp_id,
                show_without_description,
                trivy_options,
            }
        },

        get_data() {
            if (this.is_selected) {
                return this.body_data()
            }
        },
        set_data(data, emit = true) {
            Object.assign(this.$data, data)
            emit&& this.$emit('set_data', data)
        },
        clear_data() {
            Object.assign(this.$data, this.initialState())
            this.$emit('clear_data')
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
                alertCreateTest.add(e, 'danger-overlay')
            }
        },

        initialState: () => ({
            // toggle: false,
            config: {},
            error: {},
            timeout: "1h",
            save_intermediates_to: '/data/intermediates/sast',
            skip_update: true,
            show_without_fix: false,
            show_with_temp_id: false,
            show_without_description: true,
            trivy_options: "--no-progress",
        })
    },
    template: `
        <div class="mt-3">
            <div class="row">
                <div class="col">
                    <h7>Advanced Settings</h7>
                    <p>
                        <h13>Integration default settings can be overridden here</h13>
                    </p>
                </div>
            </div>
            <div class="form-group">
                <form autocomplete="off">
                    <div class="form-group">
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
                </form>
            </div>
        </div>
    `
}


register_component('scanner-trivy', trivyIntegration)

