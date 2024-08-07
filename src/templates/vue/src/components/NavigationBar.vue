<template>
  <v-navigation-drawer permanent>
    <div style="display: flex; flex-direction: column; height: 100%">
      <v-list-item class="pa-3 pl-8" title="Sistema Rerum"></v-list-item>
      <v-divider></v-divider>
      <template v-for="route in routes" :key="route.name">
        <v-list-item
          @click="() => $router.push({ name: route.path })"
          link
          v-if="verifyPerm(route.neededPermission)"
        >
          <v-row class="ma-0 pa-3 align-center">
            <v-list-item-icon>
              <v-icon color="grey-darken-2">{{ route.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content class="ml-3">
              <v-list-item-title color="grey-darken-2">{{
                route.name
              }}</v-list-item-title>
            </v-list-item-content>
          </v-row>
        </v-list-item>
      </template>
      <div style="margin-top: auto">
        <v-col>
          <v-badge
            color="error"
            :content="this.$store.state?.session?.user.role"
            inline
          >
            <span class="pr-2">{{
              this.$store.state?.session?.user.name
            }}</span>
          </v-badge>
          <br />
          <span class="text-caption pl-1">{{
            this.$store.state?.session?.user.email
          }}</span>
          <br />
          <v-btn
            @click="handleLogout"
            class="ml-12"
            variant="plain"
            color="error"
            >logout</v-btn
          >
        </v-col>
      </div>
    </div>
  </v-navigation-drawer>
</template>
<script>
export default {
  name: 'NavigationBar',
  data() {
    return {
      routes: [
        {
          name: 'Users',
          path: 'Users',
          icon: 'mdi-account',
          neededPermission: 'user:read',
        },
        {
          name: 'Roles/Permissões',
          path: 'Roles',
          icon: 'mdi-book-open-page-variant',
          neededPermission: 'role:read',
        },
        {
          name: 'Produtos',
          path: 'Products',
          icon: 'mdi-package-variant-closed',
          neededPermission: 'product:read',
        },
        {
          name: 'Logs Auditoria',
          path: 'Logs',
          icon: 'mdi-file-document',
          neededPermission: 'log:read',
        },
      ],
    }
  },
  methods: {
    verifyPerm(perm) {
      return (
        this.$store.state?.session?.permissions &&
        this.$store.state.session.permissions.includes(perm)
      )
    },
    handleLogout() {
      this.$store.dispatch('session/logout')
      this.$router.push({ name: 'Login' })
    },
  },
}
</script>
<style></style>
