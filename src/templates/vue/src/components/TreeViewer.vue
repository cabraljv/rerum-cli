<template>
  <v-card>
    <div
      v-for="item in rows"
      :key="item.id"
      @mouseleave="mouseEnterSubChild(null)"
    >
      <div class="outside-item">
        <v-row class="ma-0">
          <span class="text-subtitle-1">
            {{ item[nameLabelKey] }}
          </span>
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-delete"
            v-if="options.canDelete && openItem === item.id"
            @click="onDeleteItem(item)"
            color="error"
            variant="text"
            size="x-small"
          >
          </v-btn>
          <v-btn
            v-if="openItem !== item.id"
            density="compact"
            @click="openItem = item.id"
            icon="mdi-chevron-down"
            variant="text"
          ></v-btn>
          <v-btn
            v-else
            density="compact"
            @click="openItem = null"
            icon="mdi-chevron-up"
            variant="text"
          ></v-btn>
        </v-row>
      </div>
      <v-divider></v-divider>
      <div class="inner-container" v-if="openItem === item.id">
        <div
          class="inner-item"
          v-for="child in item[addableAttributeKey]"
          :key="child.value"
          @mouseenter="mouseEnterSubChild(child.value)"
        >
          <v-row class="ma-0">
            <span class="text-body-2">
              {{ child.label }}
            </span>
            <v-spacer></v-spacer>
            <v-btn
              density="compact"
              icon="mdi-delete"
              v-if="options.canCreate && subItemHover === child.value"
              color="error"
              size="x-small"
              @click="onDeleteChildItem(item, child.value)"
              variant="text"
            >
            </v-btn>
          </v-row>
        </div>
        <div v-if="options.canEdit && isAdding !== item.id">
          <v-row class="ma-0 pa-0 justify-center">
            <v-btn variant="plain" block @click="isAdding = item.id">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-row>
        </div>
        <div v-else-if="options.canEdit" class="px-3 pl-8 pt-5">
          <v-row>
            <v-autocomplete
              label="Autocomplete"
              density="compact"
              :items="autoCompleteValues"
              v-model="item.selectedItem"
              :disabled="loadings.addItem"
              item-title="label"
              item-value="value"
            ></v-autocomplete>
            <v-btn
              variant="plain"
              @click="onCreateChildItem(item, item.selectedItem)"
              :loading="loadings.addItem"
              :disabled="loadings.addItem"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-row>
        </div>
        <v-divider></v-divider>
      </div>
    </div>
    <div v-if="inlineCreationOpen" class="pa-3">
      <span class="text-h6">Adicionar novo item</span>
      <template v-for="item in dataTypes" :key="item.name">
        <v-text-field
          v-if="item.type === 'text'"
          :label="item.label"
          :name="item.name"
          density="compact"
          v-model="creationData[item.name]"
          variant="outlined"
          class="mt-3"
          :rules="item.required ? [(v) => !!v || 'Campo obrigatório'] : []"
        ></v-text-field>
      </template>

      <v-row class="ma-0 justify-end">
        <v-btn
          @click="inlineCreationOpen = false"
          class="mr-3"
          color="error"
          variant="plain"
          >Cancelar</v-btn
        >
        <v-btn @click="onClickCreateNewItem()" color="primary">Adicionar</v-btn>
      </v-row>
    </div>
    <div v-else-if="options.canCreate">
      <v-row class="ma-0 justify-center">
        <v-btn
          @click="onClickAddNewItem"
          variant="text"
          class="px-12"
          color="primary"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-row>
    </div>
  </v-card>
</template>
<script>
export default {
  name: 'TreeViewer',
  props: {
    rows: {
      type: Array,
      required: true,
    },
    onAddNewItem: {
      type: Function,
      required: false,
    },
    onDeleteItem: {
      type: Function,
      required: false,
    },
    onCreateNewItem: {
      type: Function,
      required: true,
    },
    onEditChildItem: {
      type: Function,
      required: false,
    },
    options: {
      type: Object,
      required: false,
    },
    dataTypes: {
      type: Array,
      required: false,
    },
  },
  data() {
    return {
      openItem: null,
      isAdding: null,
      loadings: {
        addItem: false,
        createItem: false,
      },
      subItemHover: null,
      inlineCreationOpen: false,
      creationData: {},
    }
  },
  computed: {
    nameLabelKey() {
      return this.dataTypes.find((type) => type.showAsName)?.name
    },
    addableAttributeKey() {
      return this.dataTypes.find((type) => type.treeViewerAddable)?.name
    },
    autoCompleteValues() {
      if (!this.openItem) return []
      const currentItem = this.rows.find((item) => item.id === this.openItem)
      const allPossibleValues = this.dataTypes.find(
        (type) => type.name === this.addableAttributeKey,
      ).possibleValues

      const usedValues = currentItem[this.addableAttributeKey].map(
        (value) => value.value,
      )

      return allPossibleValues.filter(
        (value) => !usedValues.includes(value.value),
      )
    },
  },
  methods: {
    async onCreateChildItem(item, childId) {
      this.loadings.addItem = true
      const childType = this.dataTypes.find(
        (type) => type.name === this.addableAttributeKey,
      )
      const addedValue = childType.possibleValues.find(
        (value) => value.value === childId,
      )
      item[this.addableAttributeKey].push(addedValue)
      await this.onEditChildItem(item)
      item.selectedItem = null
      this.loadings.addItem = false
    },
    onClickAddNewItem() {
      if (this.options.creationMode === 'inline') {
        this.inlineCreationOpen = true
      }
    },
    mouseEnterSubChild(childId) {
      this.subItemHover = childId
    },
    async onDeleteChildItem(item, childId) {
      this.loadings.addItem = true
      item[this.addableAttributeKey] = item[this.addableAttributeKey].filter(
        (child) => child.value !== childId,
      )
      await this.onEditChildItem(item)
      this.loadings.addItem = false
    },
    async onClickCreateNewItem() {
      this.loadings.createItem = true
      await this.onCreateNewItem(this.creationData)
      this.loadings.createItem = false
      this.inlineCreationOpen = false
      this.creationData = {}
    },
  },
}
</script>
<style scoped>
.outside-item {
  padding: 10px;
  padding-left: 20px;
}

.inner-item {
  padding: 10px;
  padding-left: 40px;
}

.inner-container {
  background: #f5f5f5;
}
</style>
