<template>
  <v-card class="text-center mx-auto mt-4" dark max-width="750">
    <v-card-text>
      <v-row align="center">
        <v-col>
          <h2 class="white--text">
            Send the code below to a friend (on your network) to have them join
            your game!
          </h2>
          <!-- <p>{{ this.val }}</p> -->
          <v-card
            flat
            color=""
            class="rounded-lg mx-auto d-flex justify-center"
          >
            <v-card-title class="headline">{{ roomCode }}</v-card-title>
          </v-card>
          <h2 class="white--text">
            Or enter a code to join someone else's game
          </h2>
          <div class="d-flex align-center">
            <v-text-field
              class="centered mt-n4 mb-n4"
              max-width="20px"
              v-model="toRoom"
            ></v-text-field>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "LobbyCard",

  // components: {
  // },

  methods: {
    ...mapActions(["increment"]),
  },

  computed: {
    ...mapGetters({ val: "getVal" }),
    roomCode: function() {
      return this.$store.state.roomCode;
    },
  },

  data: () => ({
    toRoom: "",
  }),
};
</script>

<style scoped>
.centered >>> input {
  text-align: center !important;
}
.centered >>> div {
  text-align: center !important;
}
</style>
