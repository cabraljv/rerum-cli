<template>
  <v-card
    :flat="flat"
    style="height: 650px"
    :variant="!flat ? 'outlined' : ''"
    :class="{
      'pa-3': !compact,
      'pa-2': compact,
      'ma-3': !compact,
      'ma-2': compact,
    }"
  >
    <div v-if="loading">
      <v-row class="mt-12">
        <v-col cols="12" class="text-center mt-12">
          <v-progress-circular
            indeterminate
            color="primary"
            :size="72"
          ></v-progress-circular>
        </v-col>
      </v-row>
    </div>
    <v-data-table
      :headers="columns"
      :items="rows"
      v-else
      :disable-pagination="true"
      :dense="compact"
    >
      <template v-slot:item="{ item }">
        <tr @click="onClickRow(item)">
          <template v-for="{ key } in columns" :key="key">
            <td v-if="typeof item[key] === 'boolean'">
              <v-checkbox :input-value="item[key]" readonly></v-checkbox>
            </td>
            <td v-else-if="getItemTypeByKey(key).type === 'select'">
              {{ getSelectLabel(key, item[key]) }}
            </td>
            <td v-else-if="getItemTypeByKey(key).type === 'date'">
              {{ formatDate(item[key]) }}
            </td>
            <td v-else>
              <span>
                {{
                  getItemTypeByKey(key).format
                    ? getItemTypeByKey(key).format(item[key])
                    : defaultTextFmt(item[key])
                }}
              </span>
            </td>
          </template>
        </tr>
      </template>
      <template v-slot:bottom>
        <v-pagination
          :length="pagesCount"
          v-model="page"
          :total-visible="5"
        ></v-pagination>
      </template>
    </v-data-table>
  </v-card>
</template>
<script>
import { format } from 'date-fns'
export default {
  name: 'DataTable',
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

  data() {
    return {
      page: 1,
    }
  },
  watch: {
    page() {
      console.log('page', this.page)
      this.onChangePage(this.page)
    },
  },
  methods: {
    getItemTypeByKey(key) {
      return this.dataTypes.find((dt) => dt.id === key)
    },
    getSelectLabel(id, value) {
      return this.dataTypes
        .find((dt) => dt.id === id)
        .options.find((o) => o.value === value).label
    },
    formatDate(dateSrc) {
      return format(new Date(dateSrc), 'dd/MM/yyyy')
    },
    defaultTextFmt(value) {
      if (!value) return ''
      if (value.length > 80) {
        return value.substring(0, 80) + '...'
      }
      return value
    },
  },
  computed: {
    columns() {
      return this.dataTypes.map((item) => ({
        title: item.label,
        key: item.id,
      }))
    },
  },
}
</script>
<style></style>
