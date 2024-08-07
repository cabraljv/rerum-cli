<template>
  <div
    :class="{
      container: true,
      'parent-container': !isChildTable,
      'ma-2': !isChildTable,
    }"
  >
    <v-table
      :class="{
        'child-table': isChildTable,
      }"
      :style="`${
        isChildTable
          ? ''
          : 'border-bottom: 1px solid #ddd; border-bottom-left-radius: 0; border-bottom-right-radius: 0;'
      } `"
      cellspacing="0"
      v-for="row in rows"
      :key="row.id"
    >
      <tbody>
        <tr v-for="key in Object.keys(row)" :key="`${key}-${row[key]}`">
          <td class="label">{{ keysToName[key] }}</td>
          <td v-if="!isItemAObject(key)">{{ row[key] }}</td>

          <td
            class="object-td pa-0"
            v-else-if="openItem === `${row.id}-${key}`"
          >
            <tree-data-table
              :rows="[row[key]]"
              :dataTypes="getObjectData(key).attributes"
              :compact="compact"
              :pagesCount="pagesCount"
              :currentPage="currentPage"
              :onChangePage="onChangePage"
              :flat="flat"
              :loading="loading"
              isChildTable
              :onClickRow="onClickRow"
            ></tree-data-table>
          </td>
          <td v-else>
            <span>
              {{ row[getObjectData(key).mainKey] }}
            </span>
            <v-btn
              class="ml-3"
              density="compact"
              variant="plain"
              size="small"
              @click="openItem = `${row.id}-${key}`"
              icon="mdi-chevron-down"
            >
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>
<script>
export default {
  name: 'TreeDataTable',
  props: {
    rows: {
      type: Array,
      required: true,
    },
    dataTypes: {
      type: Array,
      required: true,
    },
    compact: {
      type: Boolean,
      default: false,
    },
    isChildTable: {
      type: Boolean,
      default: false,
    },
    pagesCount: {
      type: Number,
      default: 1,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    onChangePage: {
      type: Function,
      required: true,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    onClickRow: {
      type: Function,
      default: () => {},
    },
  },
  created() {},
  computed: {
    keysToName() {
      const names = this.dataTypes.reduce((acc, item) => {
        acc[item.name] = item.label

        return acc
      }, {})

      return names
    },
  },
  data() {
    return {
      openItem: null,
    }
  },
  methods: {
    isItemAObject(key) {
      const item = this.dataTypes.find((item) => item.name === key)

      return item && item.type === 'object'
    },
    getObjectData(key) {
      const item = this.dataTypes.find((item) => item.name === key)

      return item
    },
  },
}
</script>
<style scoped>
.parent-container {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.child-table {
  border: 0;
  border-left: 1px solid #ddd;
}

.object-td {
  padding: 0;
  margin: 0;
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.label {
  font-weight: bold;
  background-color: #f5f5f5;
  padding: 7px 12px;
  width: 150px;
}
</style>
