import { createApp } from "vue";
import App from "./App.vue";
import { useWalletConnect } from "./walletconnect";
useWalletConnect();
createApp(App).mount("#app");
