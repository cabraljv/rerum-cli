<template>
  <v-app>
    <!--  <Navigation></Navigation> -->
    <navigation-bar
      v-if="$store.getters['session/isAuthenticated']"
    ></navigation-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
<script setup></script>
<script>
import NavigationBar from '@/components/NavigationBar.vue'
export default {
  name: 'App',
  components: {
    NavigationBar,
  },
  async mounted() {
    await this.$store.dispatch('session/validateToken')
    if (!this.$store.getters['session/isAuthenticated']) {
      this.$router.push({ name: 'Login' })
    }
  },
}
</script>
