<template>
  <button @click="clickDisconnect">disconnect</button>
  <button @click="changeLanguage">change language</button>
  <Widget :config="configLifi" integrator="Demo"></Widget>
</template>
<script setup>
import { ref, markRaw } from "vue";
import { addToken, addChain } from "@lifi/wallet-management";
import { fetchSigner, disconnect, switchNetwork } from "@wagmi/core";
import { useWalletConnect } from "../walletconnect";
import { applyPureReactInVue } from "veaury";
import { LiFiWidget } from "@lifi/widget";
import { ethers } from "ethers";

const Widget = applyPureReactInVue(LiFiWidget);
const { connectors, connectWallet, chains } = useWalletConnect();
const clickDisconnect = async () => {
  await disconnect();
  init();
};
const localeMap = {
  "zh-CN": "zh",
  "en-US": "en",
};
const configLifi = ref();
const lang = ref("en-US");

const changeLanguage = () => {
  lang.value = lang.value == "zh-CN" ? "en-US" : "zh-CN";
  console.log(lang.value);
  init();
};
let Signer = await fetchSigner();

const init = async () => {
  console.log(chains, Signer);
  Signer = await fetchSigner();
  if (!Signer) {
    Signer = new ethers.providers.JsonRpcProvider(
      chains[0].rpcUrls.default.http[0]
    );
    console.log(Signer);
  }
  configLifi.value = {
    variant: "default",
    containerStyle: {
      border: `1px solid rgba(234, 234, 234, 0.4)`,
      borderRadius: "16px",
      marginTop: "80px",
    },
    routePriority: "RECOMMENDED", // 路由速度
    chains: {
      allow: [1, 10, 137, 42161, 43114, 56, 43114, 66],
    },
    walletManagement: {
      connect: async () => {
        console.log(connectors);
        const connector = connectors.find((item) => item.id == "injected");
        await connectWallet(connector);
        const Signer = await fetchSigner();
        console.log(Signer);
        return Signer;
      },
      disconnect: disconnect,
      switchChain: async (chainId) => {
        const dd = await new Promise((resolve, reject) => {
          switchNetwork({
            chainId: chainId,
          })
            .then(async (res) => {
              const Signer = await fetchSigner();
              console.log(Signer);
              resolve(Signer);
            })
            .catch((err) => {
              reject(err);
            });
        });
        console.log(dd);
        return dd;
      },
      addToken: addToken,
      addChain: addChain,
      signer: markRaw(Signer),
    },

    theme: {
      // 配置样式
      palette: {
        primary: { main: "#389aff" },
        secondary: { main: "#5dabfc" },
      },
      shape: {
        borderRadius: 8,
        borderRadiusSecondary: 8,
      },
      typography: {
        fontFamily: "Inter",
      },
    },
    appearance: "dark", // 主题
    disableAppearance: true, // 禁用主题更改
    disableI18n: true,
    languages: {
      default: localeMap[lang.value] || "en",
      allow: ["zh", "en"],
    },
    hiddenUI: ["appearance", "language", "toAddress"],
  };
};
init();
</script>
<style scoped lang="less"></style>
