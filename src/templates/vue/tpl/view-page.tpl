@begin_module@
@begin_class@
<template>
  <div class="home">
    <v-row class="pa-0 ma-3" align="center" justify="space-between">
      <h1>#className#</h1>
      <v-btn
        v-if="verifyPerm('#className#:createUpdate')"
        @click="addModal.open = true"
        color="primary"
        >ADICIONAR</v-btn
      >
    </v-row>
    <data-filter
      :dataTypes="dataTypes"
      compact
      :onSubmitData="applyFilter"
    ></data-filter>
    <v-row v-if="loadings.fetch">
      <v-col>
        <v-row justify="center" class="ma-12 pa-12">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </v-row>
      </v-col>
    </v-row>
    <data-table
      v-else
      :rows="allRows"
      :loading="dataLoading"
      :dataTypes="dataTypes"
      :onClickRow="onClickRow"
      :currentPage="currentPage"
      :pagesCount="pagesCount"
      :onChangePage="onChangePage"
    ></data-table>
    <edit-modal
      v-if="editModal.open"
      :itemData="editModal.data"
      :dataTypes="dataTypes"
      :onCloseModal="() => (editModal.open = false)"
      v-model="editModal.open"
      :onSubmitData="onEditItem"
      :canDelete="verifyPerm('#className#:delete')"
      :readonly="!verifyPerm('#className#:createUpdate')"
      :onDeleteItem="onDeleteItem"
    ></edit-modal>
    <add-modal
      :dataTypes="dataTypes"
      v-model="addModal.open"
      :onSubmitData="onAddItem"
      :onCloseModal="onCloseAddModal"
    ></add-modal>
  </div>
</template>

<script>
import DataFilter from '@/components/DataFilter.vue'
import DataTable from '@/components/DataTable.vue'
import EditModal from '@/components/EditModal.vue'
import AddModal from '@/components/AddModal.vue'
import generateData from '@/utils/generator'
import {
  create#className#,
  delete#className#,
  update#className#,
  get#className#s,
} from '@/services/#className#-service'

export default {
  name: '#className#sPage',
  components: {
    DataFilter,
    DataTable,
    EditModal,
    AddModal,
  },
  data() {
    return {
      allRows: [],
      dataLoading: false,
      dataTypes: [
        @begin_template_inputs@
        #JsonData#
        @end_template_inputs@
      ],
      currentPage: 1,
      pagesCount: 1,
      filtersData: {},
      editModal: {
        open: false,
        data: [],
      },
      loadings: {
        fetch: false,
      },
      addModal: {
        open: false,
      },
    }
  },
  async created() {
    generateData(this.dataTypes,'#className#')
    this.loadings.fetch = true
    await this.fetchData({})
    this.pagesCount = Math.ceil(this.allRows.length / 10)
    this.applyFilter(1)
  },
  methods: {
    onSubmitData(data) {
      console.log(data)
    },
    verifyPerm(perm) {
      return true
    },
    async onDeleteItem(data) {
      this.editModal.open = false
      this.editModal.data = []
      this.loadings.fetch = true
      await delete#className#(data.id)
      await this.fetchData({})
      this.loadings.fetch = false
    },
    async onEditItem(data) {
      this.editModal.open = false
      this.editModal.data = []
      this.loadings.fetch = true
      await update#className#(data)
      await this.fetchData({})
      this.loadings.fetch = false
    },
    onCloseEditModal() {
      this.editModal.open = false
    },
    async onAddItem(data) {
      this.addModal.open = false
      console.log('AddItem', data)
      this.loadings.fetch = true
      await create#className#(data)
      await this.fetchData({})
      this.loadings.fetch = false
    },
    onCloseAddModal() {
      this.addModal.open = false
    },
    onClickRow(row) {
      this.editModal.open = true
      this.editModal.data = row
    },
    async fetchData(filters) {
      const { data, total } = await get#className#s(filters, this.currentPage, 10)
      this.allRows = data
      console.log(this.allRows, total,'data')
      this.pagesCount = Math.ceil(total / 10)
    },

    async onChangePage(pageNumber) {
      this.currentPage = pageNumber
    },
    async applyFilter(data) {
      this.loadings.fetch = true
      console.log(data)
      await this.fetchData(data)
      this.loadings.fetch = false
    },
  },
}
</script>

<style></style>
@end_class@
@end_module@
