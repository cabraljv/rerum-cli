<template>
  <v-card
    :flat="flat"
    :variant="!flat ? 'outlined' : ''"
    :class="{
      'pa-3': !compact,
      'pa-2': compact,
      'ma-3': !compact,
      'ma-2': compact,
    }"
  >
    <span class="text-h5 pa-3 font-weight-regular">Filtros</span>
    <template v-if="showPresetFilters">
      <v-row class="ma-0 align-center mt-6 mb-n2">
        <v-autocomplete
          label="Preset"
          density="compact"
          variant="outlined"
          item-title="label"
          item-value="value"
          v-model="preset"
          class="px-2"
          auto-select-first
          @update:search="onSearchPreset"
          :items="showingPresets"
        ></v-autocomplete>
        <v-btn
          @click="onSaveCustomPresetEvent"
          :disabled="canSavePreset"
          variant="tonal"
          class="mt-n5"
          color="primary"
          icon="mdi-content-save"
          size="x-small"
        ></v-btn>
      </v-row>
      <v-row class="align-center ma-0 px-3">
        <div class="flex-wrap flex-grow-1">
          <v-divider></v-divider>
        </div>
        <v-btn compact variant="plain" icon @click="closed = !closed"
          ><v-icon v-if="closed">mdi-chevron-down</v-icon>
          <v-icon v-else>mdi-chevron-up</v-icon>
        </v-btn>
      </v-row>
    </template>

    <v-col
      :class="{
        closed: closed,
        'pa-0': true,
      }"
    >
      <v-form @submit.prevent="onSubmitDataFormatter">
        <div class="d-flex flex-wrap">
          <template v-for="(item, index) in formattedDataTypes" :key="index">
            <div
              class="d-flex flex-wrap flex-grow-1 ma-2 filter-item"
              v-if="item.canFilter"
            >
              <v-text-field
                variant="outlined"
                :density="compact ? 'compact' : ''"
                :class="{ 'flex-grow-1': !compact }"
                v-if="item.type === 'text'"
                :label="item.label"
                :name="item.name"
                v-model="item.value"
                :required="item.required"
                :disabled="item.disabled"
                :readonly="item.readonly"
                :placeholder="item.placeholder"
                :rules="[(v) => !!v || item.patternErrorMessage]"
              ></v-text-field>
              <v-menu
                v-else-if="item.type === 'date'"
                ref="menu"
                v-model="item.menu"
                :close-on-content-click="false"
                v-model:return-value="item.value"
                transition="scale-transition"
                offset-y
                full-width
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="item.formattedValue"
                    :density="compact ? 'compact' : ''"
                    :class="{ 'flex-grow-1': !compact }"
                    :label="item.label"
                    :readonly="true"
                    variant="outlined"
                    v-bind="props"
                  ></v-text-field>
                </template>
                <v-card>
                  <v-date-picker
                    v-model="item.value"
                    multiple
                    @input="item.menu = false"
                    @update:modelValue="formatDate(item.value, item.name)"
                  ></v-date-picker>
                  <v-row class="ma-0 justify-end pa-2">
                    <v-btn
                      variant="text"
                      @click="
                        (item.value = []),
                          (item.formattedValue = ''),
                          (item.menu = false)
                      "
                      >Limpar</v-btn
                    >
                    <v-btn
                      color="primary"
                      @click="item.menu = false"
                      class="ml-2"
                      >OK</v-btn
                    >
                  </v-row>
                </v-card>
              </v-menu>

              <v-select
                variant="outlined"
                :density="compact ? 'compact' : ''"
                :class="{ 'flex-grow-1': !compact }"
                v-else-if="item.type === 'select'"
                item-title="label"
                item-value="value"
                :items="formatSelectOptions(item.options)"
                :label="item.label"
                :name="item.name"
                v-model="item.value"
                :required="item.required"
                :disabled="item.disabled"
                :readonly="item.readonly"
                :multiple="item.multiple"
              ></v-select>

              <v-checkbox
                variant="outlined"
                :density="compact ? 'compact' : ''"
                :class="{ 'flex-grow-1': !compact }"
                v-else-if="item.type === 'checkbox'"
                :label="item.label"
                :name="item.name"
                v-model="item.value"
                :required="item.required"
                :disabled="item.disabled"
                :readonly="item.readonly"
              ></v-checkbox>

              <v-radio-group
                variant="outlined"
                v-else-if="item.type === 'radio'"
                :label="item.label"
                :name="item.name"
                v-model="item.value"
                :required="item.required"
                :disabled="item.disabled"
                :readonly="item.readonly"
              >
                <v-radio
                  v-for="(option, optIndex) in item.options"
                  :key="optIndex"
                  :label="option.label"
                  :value="option.value"
                ></v-radio>
              </v-radio-group>

              <v-range-slider
                variant="outlined"
                :density="compact ? 'compact' : ''"
                v-else-if="item.type === 'number'"
                :label="item.label"
                :name="item.name"
                v-model="item.value"
                :min="item.min"
                :max="item.max"
                :step="item.step"
                thumb-label
                :required="item.required"
                :disabled="item.disabled"
                :readonly="item.readonly"
              ></v-range-slider>
            </div>
          </template>
        </div>
        <v-row class="ma-0 mr-3 mb-3" justify="end">
          <v-btn color="primary" type="submit">Filtrar</v-btn>
        </v-row>
      </v-form>
    </v-col>
  </v-card>
</template>

<script>
import { addDays, differenceInDays, format } from 'date-fns'
/*
data = {
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'range',
  label: 'string',
  name: 'string',
  value: 'string' | 'number' | 'boolean',
  options: [
    {
      label: 'string',
      value: 'string' | 'number' | 'boolean',
    }
  ],
  min: 'number',
  max: 'number',
  step: 'number',
  required: 'boolean',
  disabled: 'boolean',
  readonly: 'boolean',
  multiple: 'boolean',
  pattern: 'string',
  patternErrorMessage: 'string',
  placeholder: 'string',
}
*/
export default {
  name: 'DataFilter',
  props: {
    dataTypes: {
      type: Array,
      required: true,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    showPresetFilters: {
      type: Boolean,
      default: true,
    },
    onSubmitData: {
      type: Function,
      required: true,
    },
    onSaveCustomPreset: {
      type: Function,
      default: () => [],
    },
    filterPresets: {
      type: Array,
      default: () => [],
    },
    compact: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formattedDataTypes: this.dataTypes.map((item) => {
        if (item.type === 'date') {
          return { ...item, menu: false }
        }
        return item
      }),
      menu: false,
      closed: false,
      presets: [],
      showingPresets: [],
      preset: 'Personalizado',
    }
  },
  watch: {
    preset: {
      handler: 'onPresetChange',
      deep: true,
    },
  },
  created() {
    this.presets = [
      {
        label: 'Personalizado',
        value: 'Personalizado',
      },
      ...this.filterPresets,
    ]
    this.showingPresets = [...this.presets]
  },
  computed: {
    canSavePreset() {
      if (
        typeof this.preset === 'string' &&
        this.preset.length > 0 &&
        this.preset !== 'Personalizado'
      ) {
        const hasData = Object.values(this.formattedFilter).find(
          (v) => v !== null && v !== undefined,
        )

        return !hasData
      }
      const exists = this.presets.find((item) => item.label === this.preset)
      if (exists) {
        return true
      }
      return false
    },
    formattedFilter() {
      const data = {}
      this.formattedDataTypes.forEach((item) => {
        if (item.type === 'number' && item.value && item.value.length === 2) {
          data[item.name] = {
            min: Number(item.value[0]),
            max: Number(item.value[1]),
          }
          return
        }
        if (item.type === 'date' && item.value) {
          if (item.value.length > 1) {
            data[item.name] = [item.value.shift(), item.value.pop()]
            return
          }
          data[item.name] = [item.value[0], item.value[0]]
          return
        }
        data[item.name] = item.value
      })
      return data
    },
  },
  methods: {
    onPresetChange() {
      for (const item in this.preset) {
        const dataType = this.formattedDataTypes.find((dt) => dt.name === item)
        if (dataType) {
          dataType.value = this.preset[item]
        }
      }
    },
    formatSelectOptions(options) {
      return options.map((option) => {
        if (typeof option === 'string') {
          return {
            label: option,
            value: option,
          }
        }
        return option
      })
    },
    onSubmitDataFormatter() {
      this.onSubmitData(this.formattedFilter)
    },
    onSearchPreset(text) {
      this.showingPresets = [...this.presets]
      if (!text) {
        return
      }
      const exists = this.presets.find((item) => item.label === text)
      if (!exists) {
        this.showingPresets.push({
          label: text,
          value: text,
        })
      }
    },
    onSaveCustomPresetEvent() {
      this.onSaveCustomPreset({ name: this.preset, data: this.formattedFilter })
    },
    formatDate(dates, name) {
      if (dates.length > 1) {
        const firstDate = new Date(Math.min(...dates.map((d) => d.getTime())))
        const lastDate = new Date(Math.max(...dates.map((d) => d.getTime())))
        const selectedDates = []

        const differenceInDates = differenceInDays(lastDate, firstDate)

        for (let i = 0; i <= differenceInDates; i++) {
          selectedDates.push(addDays(firstDate, i))
        }
        this.formattedDataTypes = this.formattedDataTypes.map((item) => {
          if (item.name === name) {
            return {
              ...item,
              value: selectedDates,
              formattedValue: `${format(firstDate, 'dd-MM-yyyy')} - ${format(
                lastDate,
                'dd-MM-yyyy',
              )}`,
            }
          }
          return item
        })
        return
      }
      this.formattedDataTypes = this.formattedDataTypes.map((item) => {
        if (item.name === name) {
          return {
            ...item,
            formattedValue: `${format(dates[0], 'dd-MM-yyyy')}`,
          }
        }
        return item
      })
    },
  },
}
</script>

<style scoped>
.filter-item {
  max-width: 450px;
  min-width: 200px;
}
.closed {
  display: none;
}
</style>
