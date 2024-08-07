<template>
  <v-dialog persistent max-width="600px">
    <v-card>
      <v-toolbar color="white" elevation="0" class="pa-3">
        <v-toolbar-title class="text--subtitle"> Editar item </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon @click="onCloseModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-form ref="form">
          <template v-for="(item, index) in dataTypes" :key="index">
            <!-- Campo de Texto -->
            <v-text-field
              v-if="item.type === 'text'"
              :label="item.label"
              :name="item.name"
              v-model="itemValues[item.name]"
              :readonly="readonly"
              variant="outlined"
              :disabled="item.disabled || readonly"
              :rules="item.required ? [(v) => !!v || 'Campo obrigatório'] : []"
            ></v-text-field>

            <!-- Campo Numérico -->
            <v-text-field
              v-else-if="item.type === 'number'"
              type="number"
              :label="item.label"
              variant="outlined"
              :name="item.name"
              v-model.number="itemValues[item.name]"
              :readonly="readonly"
              :disabled="item.disabled || readonly"
              :min="item.min"
              :max="item.max"
              :step="item.step"
            ></v-text-field>

            <!-- Campo de Data -->
            <v-menu
              v-else-if="item.type === 'date'"
              ref="menu"
              v-model="dateMenus[item.name]"
              :close-on-content-click="false"
              v-model:return-value="itemValues[item.name]"
              transition="scale-transition"
              offset-y
              full-width
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="itemValues[item.name]"
                  :class="{ 'flex-grow-1': !compact }"
                  :label="item.label"
                  :readonly="true"
                  variant="outlined"
                  v-bind="props"
                ></v-text-field>
              </template>
              <v-card>
                <v-date-picker v-model="itemValues[item.name]"></v-date-picker>
                <v-row class="ma-0 justify-end pa-2">
                  <v-btn
                    color="primary"
                    @click="dateMenus[item.name] = false"
                    class="ml-2"
                    >OK</v-btn
                  >
                </v-row>
              </v-card>
            </v-menu>

            <!-- Campo de Seleção -->
            <v-select
              v-else-if="item.type === 'select'"
              :items="item.options"
              item-title="label"
              item-value="value"
              v-model="itemValues[item.name]"
              :label="item.label"
              variant="outlined"
              :readonly="readonly"
              :disabled="item.disabled || readonly"
            ></v-select>

            <!-- Checkbox -->
            <v-checkbox
              v-else-if="item.type === 'checkbox'"
              :label="item.label"
              v-model="itemValues[item.name]"
              :readonly="readonly"
              variant="outlined"
              :disabled="item.disabled || readonly"
            ></v-checkbox>

            <!-- Grupo de Radio Buttons -->
            <v-radio-group
              v-else-if="item.type === 'radio'"
              v-model="itemValues[item.name]"
              :label="item.label"
              variant="outlined"
              :readonly="readonly"
              :disabled="item.disabled || readonly"
            >
              <v-radio
                v-for="option in item.options"
                :key="option.value"
                variant="outlined"
                :label="option.label"
                :value="option.value"
              ></v-radio>
            </v-radio-group>

            <!-- Range Slider -->
            <v-slider
              v-else-if="item.type === 'range'"
              v-model="itemValues[item.name]"
              :label="item.label"
              :min="item.min"
              variant="outlined"
              :max="item.max"
              :step="item.step"
              :readonly="readonly"
              :disabled="item.disabled || readonly"
              thumb-label="always"
            ></v-slider>
          </template>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn v-if="canDelete" color="red darken-1" text @click="onDeleteItem"
          >Deletar</v-btn
        >
        <v-btn v-if="!readonly" color="blue darken-1" text @click="submitForm"
          >Salvar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
/*
data = [
  {
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
  }
]
*/
export default {
  name: 'EditModal',
  props: {
    itemData: {
      type: Object,
      required: true,
    },
    dataTypes: {
      type: Array,
      required: true,
    },
    onSubmitData: {
      type: Function,
      required: true,
    },
    compact: {
      type: Boolean,
      default: false,
    },
    onDeleteItem: {
      type: Function,
      required: true,
    },
    onCloseModal: {
      type: Function,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    canDelete: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      menu: false,
      dateMenus: {},
      itemValues: {},
      arrayItems: [],
    }
  },
  mounted() {
    for (const key of Object.keys(this.itemData)) {
      this.itemValues[key] = this.itemData[key]
    }

    for (const item of this.dataTypes) {
      if (item.type === 'date') {
        this.dateMenus[item.name] = false
        this.itemValues[item.name] = new Date(item.value)
      } else {
        this.itemValues[item.name] = this.itemData[item.name]
      }
    }
  },
  methods: {
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
    submitForm() {
      this.$refs.form.validate().then((success) => {
        if (success) {
          this.onSubmitData(this.itemValues)
        }
      })
    },
  },
}
</script>
<style></style>
